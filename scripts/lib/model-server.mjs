// Thin client for an OpenAI-compatible inference server (e.g. vLLM's
// `--served-model-name` API). Model identity is always discovered live via
// /v1/models rather than hardcoded, since only one model is usually loaded
// on the box at a time and it changes between generation runs.

import http from 'node:http';
import https from 'node:https';

export async function discoverHostedModel(baseUrl, { modelId, timeoutMs = 10_000 } = {}) {
  const res = await fetchWithTimeout(`${baseUrl}/v1/models`, {}, timeoutMs);
  if (!res.ok) {
    throw new Error(`GET /v1/models failed: ${res.status} ${res.statusText}`);
  }
  const body = await res.json();
  const models = body.data ?? [];
  if (models.length === 0) {
    throw new Error(`${baseUrl}/v1/models returned no hosted models.`);
  }

  const chosen = modelId ? models.find((m) => m.id === modelId) : models[0];
  if (!chosen) {
    const available = models.map((m) => m.id).join(', ');
    throw new Error(`Model id "${modelId}" not found. Available: ${available}`);
  }
  if (!modelId && models.length > 1) {
    const available = models.map((m) => m.id).join(', ');
    throw new Error(`Multiple models are hosted (${available}). Pass --model-id to pick one.`);
  }

  return {
    id: chosen.id,
    // vLLM exposes the underlying checkpoint path/name as `root`, which is
    // usually more legible than a short served-model alias like "red".
    name: chosen.root || chosen.id,
    ownedBy: chosen.owned_by,
  };
}

// Uses node:http/https directly rather than fetch: Node's built-in fetch
// (undici) enforces a hardcoded ~5 minute headers/body timeout regardless of
// any AbortController, which is too short for larger models to finish a
// full-page completion. Raw http.request has no such ceiling — only the
// idle-socket timeout we set explicitly below.
export function generateChatCompletion(
  baseUrl,
  { modelId, prompt, temperature, topK, repetitionPenalty, maxTokens, timeoutMs = 300_000 },
) {
  return new Promise((resolve, reject) => {
    const url = new URL('/v1/chat/completions', baseUrl);
    const payload = JSON.stringify({
      model: modelId,
      messages: [{ role: 'user', content: prompt }],
      // All omitted unless explicitly passed, so the server/model's own
      // defaults apply rather than a value forced by this client. Some
      // reasoning/"thinking" models explicitly document that max_tokens
      // must be left unset — capping it truncates the reasoning chain
      // before final content is ever produced. top_k and repetition_penalty
      // aren't part of the OpenAI schema but are vLLM extensions accepted
      // as extra top-level request fields.
      ...(temperature !== undefined ? { temperature } : {}),
      ...(topK !== undefined ? { top_k: topK } : {}),
      ...(repetitionPenalty !== undefined ? { repetition_penalty: repetitionPenalty } : {}),
      ...(maxTokens !== undefined ? { max_tokens: maxTokens } : {}),
    });
    const client = url.protocol === 'https:' ? https : http;

    const req = client.request(
      url,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'content-length': Buffer.byteLength(payload),
        },
        timeout: timeoutMs,
      },
      (res) => {
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          const data = Buffer.concat(chunks).toString('utf8');
          if ((res.statusCode ?? 0) < 200 || (res.statusCode ?? 0) >= 300) {
            reject(new Error(`POST /v1/chat/completions failed: ${res.statusCode} ${res.statusMessage} — ${data.slice(0, 500)}`));
            return;
          }
          try {
            const body = JSON.parse(data);
            const content = body.choices?.[0]?.message?.content;
            if (!content) {
              reject(new Error(`No completion content in response: ${data.slice(0, 500)}`));
              return;
            }
            resolve(content);
          } catch (err) {
            reject(new Error(`Failed to parse response JSON: ${err.message}`));
          }
        });
      },
    );

    req.on('timeout', () => req.destroy(new Error(`Request idle for over ${timeoutMs}ms, aborting.`)));
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

// Resolves the exact sampling parameters the server will actually use for a
// given request — including values that fall through to the server's own
// defaults when the client omits them (see scripts/generate-gallery-page.mjs
// header) — by asking vLLM's /render endpoint, which builds the request
// without running the model. This is the source of truth: the model's
// generation_config.json (if any), config.json, and vLLM's library defaults
// are all resolved server-side, so there is no reliable way to know the
// effective values from the client alone.
const SAMPLING_KEYS = [
  'temperature',
  'top_p',
  'top_k',
  'min_p',
  'repetition_penalty',
  'presence_penalty',
  'frequency_penalty',
  'seed',
];

// Also resolves the true max_tokens ceiling for this request rather than
// trusting a fixed default: /render, when max_tokens is omitted, computes
// max_model_len minus the actual prompt token count and returns that — the
// same accounting vLLM uses to accept or reject the real request. Models
// with a short context window (e.g. an 8K-context small model receiving a
// large resume+prompt) would otherwise 400 on generation with no client-side
// warning. Requesting more than that ceiling is clamped down to it.
export async function resolveSamplingParams(
  baseUrl,
  { modelId, prompt, temperature, topK, repetitionPenalty, maxTokens, timeoutMs = 30_000 },
) {
  const url = new URL('/v1/chat/completions/render', baseUrl);
  const payload = {
    model: modelId,
    messages: [{ role: 'user', content: prompt }],
    ...(temperature !== undefined ? { temperature } : {}),
    ...(topK !== undefined ? { top_k: topK } : {}),
    ...(repetitionPenalty !== undefined ? { repetition_penalty: repetitionPenalty } : {}),
  };
  const res = await fetchWithTimeout(
    url,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    },
    timeoutMs,
  );
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`POST /v1/chat/completions/render failed: ${res.status} ${res.statusText} — ${detail.slice(0, 500)}`);
  }
  const body = await res.json();
  const resolved = body.sampling_params ?? {};
  const captured = {};
  for (const key of SAMPLING_KEYS) {
    if (resolved[key] !== undefined && resolved[key] !== null) captured[key] = resolved[key];
  }

  const availableMaxTokens = resolved.max_tokens;
  const promptTokenCount = Array.isArray(body.token_ids) ? body.token_ids.length : undefined;
  // maxTokens === null means the caller explicitly wants no cap at all (some
  // reasoning models require this) — omit max_tokens from the real request
  // entirely rather than substituting the server-computed ceiling.
  const effectiveMaxTokens =
    maxTokens === null
      ? undefined
      : typeof availableMaxTokens === 'number'
        ? maxTokens !== undefined
          ? Math.min(maxTokens, availableMaxTokens)
          : availableMaxTokens
        : maxTokens;
  const clamped = maxTokens !== null && typeof availableMaxTokens === 'number' && maxTokens !== undefined && maxTokens > availableMaxTokens;

  return { params: captured, effectiveMaxTokens, promptTokenCount, clamped };
}

async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}
