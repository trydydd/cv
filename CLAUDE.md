# Multi-Model Resume Lab — project instructions

## Model-authored gallery pages are off-limits

**Never edit anything under `public/gallery/`.** Every page in that directory was authored end-to-end by the model named in its provenance badge, from the shared source YAML and prompt. The entire point of the gallery is to show each model's unmodified output — hand-editing the HTML/CSS/JS, "fixing" styling, reformatting, or applying site-wide design passes to these files would falsify the experiment.

This applies to all improvement work: design critiques, styling passes, accessibility sweeps, refactors, and lint/detector remediation must scope to the hosting site only (landing page, gallery ledger, gold resume path) and exclude `public/gallery/` entirely.

The only legitimate ways gallery content changes:
- Regenerating a page from scratch via `scripts/generate-gallery-page.mjs` (which injects the site-controlled provenance badge at generation time).
- Deleting a variant entirely (with its entry in `config/resumes.yaml`).
