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
  { modelId, prompt, temperature = 0.3, maxTokens = 8000, timeoutMs = 300_000 },
) {
  return new Promise((resolve, reject) => {
    const url = new URL('/v1/chat/completions', baseUrl);
    const payload = JSON.stringify({
      model: modelId,
      messages: [{ role: 'user', content: prompt }],
      temperature,
      max_tokens: maxTokens,
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

async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}
