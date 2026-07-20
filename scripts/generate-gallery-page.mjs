#!/usr/bin/env node
// Manual, deterministic gallery-page generation: sends inputs/resume.yaml +
// inputs/prompt.md to whatever model is currently hosted on the inference
// server, saves the result as a self-contained static page, and registers
// it in config/resumes.yaml. Not run in CI — generation is a manual
// pre-commit step (docs/deployment.md), same as PDF generation.
//
// The model and provider used in the injected provenance badge are always
// read live from the server's /v1/models response, never from the model's
// own HTML output or from a value hardcoded ahead of time — so relabeling
// requires nothing more than pointing this script at a different loaded
// model and rerunning it.
//
// Usage:
//   node scripts/generate-gallery-page.mjs <resume-id> [options]
//
// Options:
//   --server <url>        Inference server base URL (default: http://192.168.0.214:8000)
//   --model-id <id>        Pick a specific hosted model id if more than one is served
//   --label <text>         Gallery card title (default: discovered model name)
//   --description <text>   Gallery card description
//   --tier <tier>           frontier | hosted | local | baseline (default: local)
//   --provider <text>      Overrides the discovered provider label
//   --temperature <number>  Omitted by default — the server/model's own default sampling applies
//   --top-k <number>        Omitted by default (vLLM extension, not part of the OpenAI schema)
//   --repetition-penalty <number>  Omitted by default (vLLM extension)
//   --max-tokens <number|none>  (default: 8000). Pass "none" to omit
//                           max_tokens entirely — required by some
//                           reasoning/"thinking" models, which document that
//                           capping it truncates the reasoning chain before
//                           final content is produced.
//   --timeout <ms>          Generation request timeout (default: 1200000 — some
//                           models/backends generate well under 10 tok/s on this
//                           hardware; a full ~2.3K-token prompt + ~4K-token
//                           response has been measured taking ~9 minutes)

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import YAML from 'yaml';
import { discoverHostedModel, generateChatCompletion, resolveSamplingParams } from './lib/model-server.mjs';
import { injectProvenanceBadge } from './lib/provenance-badge.mjs';

const root = process.cwd();

function parseArgs(argv) {
  const [id, ...rest] = argv;
  if (!id || id.startsWith('--')) {
    console.error('Usage: node scripts/generate-gallery-page.mjs <resume-id> [options]');
    process.exit(1);
  }
  const options = {
    server: 'http://192.168.0.214:8000',
    tier: 'local',
    maxTokens: 8000,
    timeout: 1_200_000,
  };
  const flagMap = {
    '--server': (v) => (options.server = v),
    '--model-id': (v) => (options.modelId = v),
    '--label': (v) => (options.label = v),
    '--description': (v) => (options.description = v),
    '--tier': (v) => (options.tier = v),
    '--provider': (v) => (options.provider = v),
    '--temperature': (v) => (options.temperature = Number(v)),
    '--top-k': (v) => (options.topK = Number(v)),
    '--repetition-penalty': (v) => (options.repetitionPenalty = Number(v)),
    '--max-tokens': (v) => (options.maxTokens = v.toLowerCase() === 'none' ? null : Number(v)),
    '--timeout': (v) => (options.timeout = Number(v)),
  };
  for (let i = 0; i < rest.length; i += 2) {
    const flag = rest[i];
    const value = rest[i + 1];
    const setter = flagMap[flag];
    if (!setter || value === undefined) {
      console.error(`Unknown or incomplete option: ${flag}`);
      process.exit(1);
    }
    setter(value);
  }
  return { id, options };
}

function readPromptTemplate() {
  const raw = fs.readFileSync(path.join(root, 'inputs/prompt.md'), 'utf8');
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error('inputs/prompt.md is missing the expected frontmatter block.');
  const frontmatter = YAML.parse(match[1]);
  return { version: frontmatter.version ?? 1, body: match[2].trim() };
}

function stripCodeFences(text) {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```[a-zA-Z]*\n([\s\S]*?)\n```$/);
  return fenced ? fenced[1].trim() : trimmed;
}

function upsertRegistryEntry(entry) {
  const registryPath = path.join(root, 'config/resumes.yaml');
  const registry = YAML.parse(fs.readFileSync(registryPath, 'utf8'));
  const idx = registry.resumes.findIndex((r) => r.id === entry.id);
  if (idx >= 0) {
    registry.resumes[idx] = { ...registry.resumes[idx], ...entry };
  } else {
    registry.resumes.push(entry);
  }
  fs.writeFileSync(registryPath, YAML.stringify(registry, { lineWidth: 0 }));
}

async function main() {
  const { id, options } = parseArgs(process.argv.slice(2));

  console.log(`Discovering hosted model at ${options.server}...`);
  const hosted = await discoverHostedModel(options.server, { modelId: options.modelId });
  console.log(`Using model: ${hosted.name} (id: ${hosted.id}, owned_by: ${hosted.ownedBy ?? 'unknown'})`);

  const resumeYaml = fs.readFileSync(path.join(root, 'inputs/resume.yaml'), 'utf8');
  const { version: promptVersion, body: promptBody } = readPromptTemplate();
  const prompt = promptBody.replace('{{ resume_yaml }}', resumeYaml.trim());

  console.log('Resolving effective sampling parameters...');
  const { params: samplingParams, effectiveMaxTokens, promptTokenCount, clamped } = await resolveSamplingParams(
    options.server,
    {
      modelId: hosted.id,
      prompt,
      temperature: options.temperature,
      topK: options.topK,
      repetitionPenalty: options.repetitionPenalty,
      maxTokens: options.maxTokens,
    },
  );
  console.log(`Sampling: ${JSON.stringify(samplingParams)}`);
  if (clamped) {
    console.log(
      `Note: requested --max-tokens ${options.maxTokens} exceeds this model's remaining context ` +
        `(prompt is ${promptTokenCount} tokens); using ${effectiveMaxTokens} instead.`,
    );
  }
  if (typeof effectiveMaxTokens === 'number' && effectiveMaxTokens < 512) {
    throw new Error(
      `Only ${effectiveMaxTokens} tokens remain for the response after a ${promptTokenCount}-token prompt — ` +
        `this model's context window is too small to fit inputs/resume.yaml + inputs/prompt.md and produce a full page.`,
    );
  }

  console.log('Requesting generation (this can take a while for larger models)...');
  const rawOutput = await generateChatCompletion(options.server, {
    modelId: hosted.id,
    prompt,
    temperature: options.temperature,
    topK: options.topK,
    repetitionPenalty: options.repetitionPenalty,
    maxTokens: effectiveMaxTokens,
    timeoutMs: options.timeout,
  });

  const html = stripCodeFences(rawOutput);
  if (!/^<!doctype html/i.test(html) && !/^<html/i.test(html)) {
    throw new Error(
      `Model output does not look like a full HTML document. First 200 chars:\n${html.slice(0, 200)}`,
    );
  }

  const provider = options.provider ?? (hosted.ownedBy ? `Self-hosted (${hosted.ownedBy})` : 'Self-hosted');
  const labeled = injectProvenanceBadge(html, { provider, model: hosted.name });

  const outputDir = path.join(root, 'public/gallery', id);
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, 'index.html'), labeled);
  console.log(`Wrote public/gallery/${id}/index.html`);

  const resumeHash = crypto.createHash('sha256').update(labeled).digest('hex').slice(0, 12);

  upsertRegistryEntry({
    id,
    label: options.label ?? hosted.name,
    description: options.description ?? `Generated by ${hosted.name}, self-hosted via ${options.server}.`,
    tier: options.tier,
    provider,
    model: hosted.name,
    enabled: true,
    showInGallery: true,
    isGoldCandidate: false,
    generatedAt: new Date().toISOString(),
    promptVersion,
    resumeHash,
    samplingParams,
    pageUrl: `/cv/gallery/${id}/`,
  });
  console.log(`Updated config/resumes.yaml with id "${id}".`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
