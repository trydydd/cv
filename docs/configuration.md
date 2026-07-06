# Configuration

## Goals

Configuration should make the site flexible enough to add, remove, hide, or promote resumes without editing route components.

## `config/site.yaml`

`site.yaml` owns public site behavior.

```yaml
site:
  title: Resume Lab
  baseUrl: https://example.github.io/cv

roles:
  tech:
    label: Tech
    description: Compare all generated versions.
    target: gallery
  everyone:
    label: Everyone
    description: View the recommended resume.
    target: gold

goldResumeId: frontier-gold
```

Validation rules:

- Role labels must be one or two words.
- `roles.tech.target` must resolve to the gallery route.
- `roles.everyone.target` must resolve to the gold route.
- `goldResumeId` must exist in `config/resumes.yaml`.
- The gold resume must be enabled.

## `config/resumes.yaml`

`resumes.yaml` owns the visible resume inventory.

```yaml
resumes:
  - id: frontier-gold
    label: Gold Standard
    description: Frontier-authored default resume for general viewers.
    tier: frontier
    enabled: true
    showInGallery: true
    isGoldCandidate: true
    markdownPath: generated/markdown/frontier-gold.md
    pdfPath: resumes/frontier-gold.pdf
    metadataPath: generated/metadata/frontier-gold.json

  - id: local-small
    label: Local Small
    description: Offline low-VRAM small-model variant.
    tier: local
    enabled: true
    showInGallery: true
    isGoldCandidate: false
    markdownPath: generated/markdown/local-small.md
    pdfPath: resumes/local-small.pdf
    metadataPath: generated/metadata/local-small.json
```

Validation rules:

- IDs must be unique.
- Enabled resumes must have readable Markdown output.
- Gallery resumes must have short labels.
- PDF paths must be generated for published resumes.
- Disabled resumes should not appear in the gallery.

## `config/models.yaml`

`models.yaml` owns generation settings.

```yaml
models:
  - id: frontier-gold
    provider: openai
    tier: frontier
    model: gpt-5.5
    temperature: 0.3
    outputResumeId: frontier-gold

  - id: local-small
    provider: ollama
    tier: local
    model: qwen2.5:3b-instruct-q4_K_M
    temperature: 0.3
    vramProfile: 4gb
    outputResumeId: local-small
```

Model configs should not define site routes directly. They should only declare generation behavior and the resume output they produce.
