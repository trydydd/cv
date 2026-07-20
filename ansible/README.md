# Gallery batch generation

Automates what was previously a manual, hands-on loop: start a model on the
vLLM host, wait for it to come up, generate its gallery page, tear it down,
repeat for the next model. One model is loaded at a time — this targets a
single-GPU inference box.

## One-time setup

1. **SSH alias.** Add a `vllm-host` entry to `~/.ssh/config` pointing at the
   inference box, with a dedicated key. See the main repo README for the
   exact commands (`ssh-keygen`, `ssh-copy-id`). Verify with:
   ```bash
   ssh vllm-host echo connected
   ```
2. **Ansible**, installed locally (`pip install --user ansible`, or already
   present — check with `ansible --version`).
3. The [spark-vllm-docker](https://github.com/eugr/spark-vllm-docker) recipe
   project checked out on the inference host at
   `/home/sevro/workspace/spark-vllm-docker` (path is set in
   `generate-gallery.yml` as `recipe_dir` — update it there if it moves).
4. This repo's Node dependencies installed locally (`npm install` at the repo
   root) — the actual generation step (`scripts/generate-gallery-page.mjs`)
   always runs on your machine, not the inference host, since that's where
   the repo and `config/resumes.yaml` live.

## Running

```bash
cd ansible
ansible-playbook generate-gallery.yml
```

Runs every model listed in `models.yml` in order.

**Run a subset** (comma-separated resume ids):
```bash
ansible-playbook generate-gallery.yml -e limit_models=qwen3-5-9b,gpt-oss-20b
```

**Dry run** (validates connectivity and task flow without starting any
container or writing any files):
```bash
ansible-playbook generate-gallery.yml --check --diff
```

## Adding a model

Add an entry to `models.yml`:

```yaml
  - resume_id: my-new-model      # becomes config/resumes.yaml id + /gallery/my-new-model/
    recipe: my-recipe-name        # filename in spark-vllm-docker/recipes/, without .yaml
    label: "My New Model"         # gallery card title
    tier: local
```

No playbook changes needed. The recipe must already exist in
`spark-vllm-docker/recipes/` on the inference host.

### Per-model sampling overrides (optional)

`generate_one.yml` forwards these fields to
`scripts/generate-gallery-page.mjs` only when present, so leave them out to
use the server's own defaults (discovered per-request via the vLLM
`/v1/chat/completions/render` endpoint):

```yaml
  - resume_id: my-thinking-model
    recipe: my-recipe-name
    label: "My Thinking Model"
    tier: local
    max_tokens: none        # or an integer cap
    temperature: 0.2
    top_k: 80
    repetition_penalty: 1.05
```

- `max_tokens: none` maps to `--max-tokens none`, which tells the script to
  send **no** `max_tokens` at all (as opposed to omitting the field, which
  falls back to the script's own default cap of 8000). Use this for
  reasoning/"thinking" models — their own docs typically warn that capping
  `max_tokens` truncates the chain-of-thought before final content is
  produced, since reasoning tokens count against the same budget.
- `temperature` / `top_k` / `repetition_penalty` override the server's
  resolved defaults. Set these when a model's card documents recommended
  sampling parameters that differ from what the server applies by default
  (checked via the `/render` endpoint, logged at the top of each run).

### Models that aren't spark-vllm-docker recipes

Some models are served by their own bespoke install/serve scripts rather
than a `spark-vllm-docker` recipe (e.g. `qwen3-5-122b`, served via
[Entrpi/qwen3.5-122B-A10B-on-spark](https://github.com/Entrpi/qwen3.5-122B-A10B-on-spark)
— a custom Docker image + vLLM runtime patches for DFlash speculative
decoding on DGX Spark hardware). For these:

- Still add an entry to `models.yml` with `recipe: null`, for roster
  visibility — the playbook can't drive the start/stop cycle for it.
- Start/stop the server by hand per that project's own instructions, then
  run `scripts/generate-gallery-page.mjs` directly (see below) instead of
  the playbook.
- Before running any such third-party install script, read through it (and
  any patches it applies) — these pull unverified Docker images and model
  weights from arbitrary sources, so confirm there's no networking,
  subprocess/eval, or file access outside the expected model/vLLM paths
  before executing.

## Generating a single page by hand

Equivalent to what the playbook does per-model, useful when a server is
already running (manually, or via a non-recipe install script):

```bash
node scripts/generate-gallery-page.mjs <resume-id> \
  --server http://192.168.0.214:8000 \
  --label "My Model" \
  --tier local \
  [--max-tokens 8000|none] [--temperature N] [--top-k N] [--repetition-penalty N] \
  [--timeout 1200000]
```

Defaults: `--max-tokens 8000`, `--timeout 300000` (raise this for slow
backends — some genuinely take 9+ minutes to generate on this hardware).
`--temperature` / `--top-k` / `--repetition-penalty` are omitted from the
request entirely unless passed, letting the server apply its own resolved
defaults.

## What each cycle does

1. Refuses to start if a `vllm_node` container is already running (stale
   state from a previous failed run — stop it manually first).
2. `./run-recipe.sh <recipe> --solo -d` on the inference host — daemon mode,
   returns immediately once the container is launched; the model continues
   loading in the background.
3. Polls `http://192.168.0.214:8000/v1/models` from *your* machine every 20s
   for up to ~25 minutes, waiting for the server to report ready.
4. Runs `node scripts/generate-gallery-page.mjs <resume-id> --server ... --label ... --tier local`
   locally — this is the same script used for manual one-off generation. It
   discovers the loaded model, sends `inputs/resume.yaml` + `inputs/prompt.md`,
   writes `public/gallery/<id>/index.html` with the provenance badge
   injected, and upserts the entry in `config/resumes.yaml`.
5. Stops the container (`docker stop vllm_node`) — always runs, even if
   generation failed, so the GPU is freed for the next model.

If one model's generation fails (timeout, malformed output, etc.), the
failure is logged and the playbook moves on to the next model rather than
aborting the whole batch.

## After a batch run

`models.yml` deliberately omits `description` — it's a read of what a given
run actually produced (layout, tone), which can only be judged after seeing
the output. Do a short review pass afterward:

```bash
npm run build && npx astro preview
```

Check each new page, then update its `description` field directly in
`config/resumes.yaml`, matching the pattern of the existing entries.

Finally, per this repo's `CLAUDE.md`: **never hand-edit anything under
`public/gallery/`.** If a page needs to change, re-run this playbook for
that one model (`-e limit_models=<id>`) or delete the entry.
