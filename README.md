# Multi-Model Resume Lab

This repository is the source and documentation hub for a GitHub Pages project that publishes multiple resume variants generated from one canonical resume input and one shared prompt. The live site is intentionally separate from this repository README: the site landing page routes viewers to the right resume experience, while this README explains how the repository is organized.

## Project Intent

The project compares resume outputs generated with the same source data and prompt across a spectrum of model/tooling configurations:

- Frontier hosted models for the site shell and gold-standard resume.
- Hosted open-weight models for strong non-frontier comparisons.
- Local offline small language models for VRAM-constrained generation.
- A deterministic baseline for regression checks.

All variants use the same platform, source resume, prompt template, validation rules, and publishing pipeline.

## Site Visitor Flow

The GitHub Pages site starts with a role selector, not this README.

```mermaid
flowchart TD
    A[Site Home] --> B{Viewer Role}
    B -->|Everyone| C[Gold Resume]
    B -->|Tech| D[Resume Gallery]
    D --> E[Variant Detail]
    E --> F[Markdown]
    E --> G[PDF]
```

The two role buttons must use short labels:

- `Tech`
- `Everyone`

`Everyone` goes directly to the configured gold-standard resume. `Tech` opens a configurable gallery of all resume variants.

## Documentation

Dense project documentation lives in `docs/`:

- [Architecture](docs/architecture.md)
- [Configuration](docs/configuration.md)
- [Prompt and Resume Inputs](docs/prompt-and-inputs.md)
- [Testing Strategy](docs/testing.md)
- [Deployment](docs/deployment.md)

## Recommended Implementation Stack

- TypeScript for orchestration and validation.
- Astro for the GitHub Pages static site.
- Tailwind CSS for responsive and print styling.
- YAML for site routing, resume registry, model matrix, and gold-standard selection.
- Markdown as the canonical LLM resume output.
- HTML and PDF as rendered publication formats.

## Repository Shape

```text
.
├── README.md
├── docs/
├── inputs/
│   ├── resume.yaml
│   └── prompt.md
├── config/
│   ├── site.yaml
│   ├── resumes.yaml
│   └── models.yaml
├── src/
│   ├── pages/
│   ├── components/
│   ├── layouts/
│   └── lib/
├── scripts/
├── generated/
└── .github/workflows/
```

## Core Guarantees

- Adding or removing a resume should be a YAML-only registry change when assets already exist.
- The site shell and gold-standard resume are generated or refined by a frontier model, with their provenance recorded.
- The `Everyone` path has happy-path and sad-path tests.
- The role-selector landing page has happy-path and sad-path tests.
- Model runners are loosely coupled from rendering, routing, validation, and deployment.
