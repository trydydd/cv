#!/usr/bin/env node
// Manual, deterministic PDF generation: renders a built resume page with
// Chromium's print pipeline and saves it as the committed PDF asset.
// Not run in CI — resume publication is a manual pre-commit step (docs/deployment.md).
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const PORT = 4321;
const BASE = `http://localhost:${PORT}/cv`;

const targets = process.argv.slice(2);
if (targets.length === 0) {
  console.error('Usage: node scripts/generate-resume-pdf.mjs <resume-id> [output-path] [...more pairs]');
  process.exit(1);
}

const server = spawn('npx', ['astro', 'preview', '--port', String(PORT)], {
  stdio: 'pipe',
  detached: true,
});

async function waitForServer() {
  for (let i = 0; i < 60; i += 1) {
    try {
      const res = await fetch(`${BASE}/resumes/`);
      if (res.ok) return;
    } catch {
      // not up yet
    }
    await sleep(500);
  }
  throw new Error('astro preview did not become ready in time');
}

try {
  await waitForServer();
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.emulateMedia({ media: 'print' });

  for (let i = 0; i < targets.length; i += 2) {
    const id = targets[i];
    const outputPath = targets[i + 1] ?? `public/resumes/${id}.pdf`;
    await page.goto(`${BASE}/resume/${id}/`, { waitUntil: 'networkidle' });
    await page.pdf({
      path: outputPath,
      format: 'Letter',
      printBackground: false,
      margin: { top: '0.6in', bottom: '0.6in', left: '0.7in', right: '0.7in' },
    });
    console.log(`Wrote ${outputPath}`);
  }

  await browser.close();
} finally {
  // negative pid kills the whole detached process group (npx + its astro preview child)
  try {
    process.kill(-server.pid, 'SIGKILL');
  } catch {
    server.kill();
  }
}
