# Design

## Metadata

- Product: Multi-Model Resume Lab
- Register: brand
- Stage: pre-implementation design seed
- Source: Impeccable init

## Design Intent

A polished personal portfolio with the clarity of a reproducible systems lab. The visual system should make the gold resume feel authoritative for general viewers and make the model-comparison gallery feel transparent for technical viewers.

Physical scene: a bright review room with one excellent printed resume on the table and a precise lab notebook beside it.

## Color

Use OKLCH custom properties. Keep the surface mostly pure white so the resume content remains crisp, and use a deep rose/plum primary as a distinctive but controlled signal for the lab identity.

```css
:root {
  --color-bg: oklch(1.000 0.000 0);
  --color-surface: oklch(0.972 0.004 340);
  --color-ink: oklch(0.180 0.018 285);
  --color-muted: oklch(0.445 0.022 285);
  --color-primary: oklch(0.500 0.200 340);
  --color-primary-ink: oklch(0.990 0.000 0);
  --color-accent: oklch(0.570 0.145 255);
  --color-accent-ink: oklch(0.990 0.000 0);
  --color-border: oklch(0.900 0.008 285);
  --color-focus: oklch(0.640 0.180 340);
}
```

Color strategy: restrained with a strong primary accent. The resume should not become a saturated campaign page; the brand color should appear in routing controls, selected states, metadata badges, and key links.

## Typography

Use a precise, slightly technical sans-serif for interface and resume chrome, with an optional sturdy editorial serif only for the largest landing-page headline if it improves distinction. Avoid treating monospace as the whole brand; reserve it for metadata.

Recommended stack:

```css
:root {
  --font-sans: Atkinson Hyperlegible, ui-sans-serif, system-ui, sans-serif;
  --font-serif: "Source Serif 4", Georgia, serif;
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, monospace;
}
```

Guidelines:

- Cap prose at 65-75 characters per line.
- Use `text-wrap: balance` for landing-page headings.
- Keep resume content scannable with conventional section headings.
- Reserve monospace for model IDs, hashes, metadata, and file paths.

## Layout

The site has two primary modes:

1. General-viewer mode: direct, calm, resume-forward.
2. Technical mode: gallery, comparison, provenance, and downloads.

Recommended layout patterns:

- Home: centered role selector with two short choices, `Tech` and `Everyone`.
- Gold resume: clean document layout, minimal surrounding chrome, obvious PDF download.
- Tech gallery: filterable or grouped list of resume variants by tier, with model metadata visible but not overwhelming.
- Resume detail: resume content first, metadata and provenance secondary.

## Components

- `RoleSelector`: semantic two-option control or dropdown; labels are `Tech` and `Everyone`.
- `ResumeShell`: printable resume page with HTML and PDF affordances.
- `ResumeCard`: compact card/list row for gallery variants.
- `ModelBadge`: small tier/provider/model marker.
- `MetadataPanel`: provenance, prompt version, resume hash, model settings, and generated timestamp.
- `ValidationNotice`: friendly sad-path output for missing or invalid configuration when build-time failure is not preferred.

## Interaction

- The `Everyone` action should feel immediate and primary.
- The `Tech` action should clearly promise comparison and exploration.
- All controls need keyboard-visible focus states using `--color-focus`.
- Avoid decorative motion on the resume itself; subtle transitions are acceptable on role selection, gallery filtering, and metadata disclosure.
- Respect `prefers-reduced-motion`.

## Accessibility

- Target WCAG 2.2 AA.
- Body text should meet at least 4.5:1 contrast; critical resume text should aim higher.
- Use semantic headings and landmarks.
- Ensure PDF/download links are descriptive.
- Do not rely on color alone for model tier or validation status.

## Implementation Notes

- Use TypeScript, Astro, Tailwind CSS, YAML configuration, Markdown resume outputs, HTML pages, and PDF exports.
- Keep route behavior driven by `config/site.yaml` and `config/resumes.yaml`.
- Keep manual model generation separate from validation and deployment.
- Treat this DESIGN.md as a seed until the real site implementation exists; rerun design documentation once tokens, components, and pages are committed.
