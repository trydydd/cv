# Design

## Metadata

- Product: Multi-Model Resume Lab
- Register: brand
- Stage: implemented system — personality rework
- Source: brand rework of the original Impeccable init seed

## Design Intent

A polished personal portfolio with the clarity of a reproducible systems lab — and the warmth of the person who runs it. The visual system should make the gold resume feel authoritative for general viewers, make the model-comparison gallery feel transparent for technical viewers, and leave both remembering a human, not a template.

Physical scene: a sunlit study, not a sterile review room. One excellent printed resume on the desk. Beside it, a well-thumbed lab notebook annotated in plum and ochre ink, a dry note in the margin, a coffee cup just out of frame. Someone clearly lives here.

The failure mode this rework corrects: print-editorial restraint executed so cautiously it reads as clinical. Hairline rules and quiet type are the grammar; they are not the message. The message is a specific person with a specific record and a genuinely interesting experiment.

## Voice

Voice is a first-class part of the design system — most of the sterility a visitor feels is copy, not CSS.

- **Write like a person.** First person where the candidate speaks. Active voice. No system-speak ("resources", "leverage", "utilize") in visitor-facing copy.
- **Specific beats grand.** Name the actual method — the shared prompt, the single source file, the unedited output — instead of "cutting-edge AI-powered generation."
- **No generated-copy tells.** The banned patterns are catalogued below. This matters more here than on most sites: the gallery publishes unedited model output as evidence, so the human-authored chrome around it must not read like more of the same. The universal test: write the sentence you'd actually say out loud to a colleague, even if it comes out longer and less tidy.
- **Dry wit at the edges only, and understated.** The 404 page, the footer colophon, gallery ledes, and empty states are personality moments — but the humor is the deadpan of plain description, not a crafted joke. The resume sheet and all provenance data stay straight-faced; trust is the product.
- **Explain the experiment with pride, not apology.** The gallery is a lab someone enjoys running, not a disclaimer.

### Generated-copy tells (banned in human-authored copy)

Grounded in Wikipedia's [Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing) and speedy-deletion criterion [G15: LLM-generated pages without human review](https://en.wikipedia.org/wiki/Wikipedia:Speedy_deletion#G15._LLM-generated_pages_without_human_review), filtered to what applies to short site copy. Any one of these can occur in honest human writing; what marks copy as generated is density. Edit until none remain.

**Diction**

- Stock AI vocabulary: "delve", "landscape", "tapestry", "testament", "pivotal", "crucial", "meticulous", "intricate", "vibrant", "boasts", "showcases", "underscores", "fostering", "seamless", "robust". If a word wouldn't survive being said across a desk, cut it.
- Copula avoidance: "serves as", "stands as", "functions as", "marks" where "is" would do. The resume *is* a resume.
- Elegant variation — cycling synonyms to dodge repeating a word. Repeat the word; repetition is how humans talk about one thing.

**Sentence shapes**

- Rule-of-three taglines and slogan symmetry ("eleven models, one YAML file, zero hand edits").
- Negative parallelisms: "not just X, but Y", "it isn't X — it's Y".
- Trailing participle analysis that adds no fact: "…, highlighting the importance of reproducibility."
- Formulaic significance framing and wrap-ups: "reflects broader trends", "Despite these challenges…", forward-looking closers that speculate instead of stopping.

**Claims**

- Vague attribution and manufactured consensus: "experts note", "widely regarded", "many consider".
- Adjectives doing the work of facts. State what happened ("the 230M model left out the last ten years"); let the reader supply the judgment.

**Formatting**

- Mechanical boldface on "key terms"; bolded-header bullet lists standing in for prose.
- Title Case headings (site style is sentence case), emoji as bullets or dividers, em-dash chains for rhythm.

**Review hygiene** (the G15 lesson: unreviewed output is grounds for deletion)

- No chatbot residue: no "Here is…", "As an AI…", knowledge-cutoff hedges, or unfilled placeholders ("[Birth Date]").
- Every link, date, hash, and identifier in published copy is verified by a human before it ships. Provenance data with a dead link or wrong hash reads as unreviewed generation and forfeits exactly the trust the lab exists to earn.
- Nothing human-authored ships without a human having read it aloud once. That is the review.

Register examples (illustrative, not literal strings to paste):

- Colophon: "Set in Besley and Atkinson Hyperlegible. The gallery pages are shown exactly as the models returned them — I haven't edited the HTML."
- 404: "There's no page at this address. The resume is probably what you were after."
- Gallery lede: "Each model got the same resume data and the same prompt. What you see is its unedited output, so the differences between pages are the models' own."

## Color

OKLCH custom properties, light theme. Plum-tinted paper with sheet-white document surfaces; deep plum as the brand ink — used generously, not rationed. One secondary annotation ink (ochre) for editorial marks.

```css
:root {
  --paper: oklch(0.972 0.007 340);   /* plum-tinted paper background */
  --sheet: oklch(0.995 0.002 340);   /* document white */
  --ink: oklch(0.23 0.022 340);      /* body text */
  --ink-muted: oklch(0.44 0.024 340);
  --plum: oklch(0.42 0.165 340);     /* brand ink: links, labels, brave display moments */
  --plum-deep: oklch(0.3 0.11 340);  /* hover/pressed, display headlines on paper */
  --marginalia: oklch(0.5 0.105 75); /* ochre annotation ink: asides, margin notes, № marks */
  --hairline: oklch(0.85 0.018 340);
  --rule: oklch(0.23 0.022 340);     /* structural rules (letterhead, ledger head) */
  --wash: oklch(0.945 0.014 340);
  --focus: oklch(0.55 0.19 340);
}
```

Color strategy:

- Plum is the brand's ink, not an accent to be hoarded. Plum display headlines, thick plum rules at key structural moments, and plum selection color are all encouraged. What stays off the table: plum backgrounds behind body text, gradients, and saturated washes.
- Ochre (`--marginalia`) is strictly an annotation voice — margin asides, specimen numbers, editorial marks. It never labels status or tier (color alone must not carry meaning) and must meet 4.5:1 against its background when used for text; darken it before shrinking it.
- The resume sheet remains near-monochrome so the document reads as print. Warmth on the resume page lives in the chrome around the sheet, not on it.

## Typography

Three voices, each with a job:

```css
:root {
  --font-display: 'Besley Variable', 'Besley', Georgia, serif;
  --font-text: 'Atkinson Hyperlegible', ui-sans-serif, system-ui, sans-serif;
  --font-mono: 'JetBrains Mono Variable', 'JetBrains Mono', ui-monospace, monospace;
}
```

- **Besley** (Clarendon serif, self-hosted via Fontsource) is the personality. Display, headings, brand mark, ledger titles — and italic for asides and margin notes. Set it bravely: large sizes, tight leading, real weight contrast. A Clarendon at 14px is wasted; at 72px it has opinions.
- **Atkinson Hyperlegible** carries interface and body text. Friendly by design; don't fight it with tracking tricks.
- **JetBrains Mono is provenance, not decor.** Hashes, model IDs, parameters, timestamps. The all-caps mono kicker is a provenance device — it should mark data, not serve as the default label style for every heading on the site. Where a section label wants character instead of chrome, prefer Besley italic in ochre or plum over uppercase mono.

Guidelines:

- Cap prose at 65–75 characters per line; `text-wrap: balance` on headings, `pretty` on prose.
- Fluid display scale (`clamp()`); caption/data/small sizes fixed.
- Italic Besley asides are the house style for warmth: one short line, muted or ochre, never stacked into paragraphs.

## Editorial Devices

The devices that carry personality without breaking the print grammar:

- **Specimen numbering.** Ledger rows carry folio-style numbers (№ 01, № 02 …) in Besley — the gallery is a numbered specimen book, not a file listing.
- **Margin asides.** Short italic Besley notes in ochre or muted ink beside or beneath structural elements — one plain, specific observation whose humor, if any, comes from the fact itself ("the 230M model left out the last ten years").
- **Footnote provenance.** Metadata rendered like a well-set footnote or colophon block: precise, compact, typographically considered.
- **Colophon footer.** The footer is a colophon written like a person — typefaces, method, source link — and is a sanctioned wit location.
- **Ink structure.** Thick top rules for structural boundaries (letterhead, ledger head), hairlines within. Rules are the furniture; keep them.

Kitsch boundary: no faux-handwriting fonts, no paper textures/grain, no skeuomorphic coffee stains, no rotated "sticky notes." The scene is evoked typographically, never illustrated literally.

## Layout

Two primary modes, unchanged:

1. General-viewer mode: direct, warm, resume-forward.
2. Technical mode: gallery, comparison, provenance, downloads.

Patterns:

- **Home: a title page with a voice.** Kicker, name at full display scale, a lede that sounds like the candidate, then a table-of-contents. One margin aside is welcome; a wall of uppercase mono labels is not.
- **Gold resume: the sheet on the desk.** Clean document layout on `--sheet`, minimal chrome, obvious PDF download. The sheet itself stays straight-faced.
- **Gallery: a specimen ledger, not a manifest.** Numbered hairline-ruled rows, Besley titles, model metadata visible but subordinate. Row descriptions are written copy with a point of view, not generated boilerplate.
- **Resume detail: document first, lab record second.** Resume content leads; the metadata panel reads as a well-set lab record beside it.

## Components

- `SiteNav`: letterhead — brand mark in Besley over a structural rule.
- `RoleSelector`: the table of contents; two clear intents (`Resume`, `Resume Gallery`), entry titles in Besley with human descriptions.
- `ResumeDocument`: the printed sheet; near-monochrome, print-faithful, straight-faced.
- `ResumeCard` / ledger row: numbered specimen entry with title, one-line description with a point of view, and compact provenance.
- `MetadataPanel`: the lab record — footnote-register provenance, download action, jump links.
- `SiteFooter`: the colophon; a personality moment.

## Interaction

- `Resume` should feel immediate and primary; `Resume Gallery` should promise exploration.
- Hover states may be livelier than the current whisper: underline draws, arrow nudges, plum ink-in on titles — 120–160ms, ease-out, ink-like. Nothing floats, bounces, or parallaxes.
- Keyboard-visible focus states via `--focus` on all controls.
- No decorative motion on the resume sheet itself.
- Respect `prefers-reduced-motion` globally.

## Accessibility

Personality is never purchased at accessibility's expense.

- Target WCAG 2.2 AA. Body text ≥ 4.5:1; ochre annotation text must also clear 4.5:1 — darken it before shrinking it.
- Semantic headings and landmarks; italic asides remain real text, not images.
- Never rely on color alone for model tier or validation status.
- Descriptive names on PDF/download links.
- Wit never obstructs function: the 404 joke sits above a working way home.

## Anti-references

- The generic beige AI portfolio template.
- Pill buttons, badge chips, identical card grids, gradient washes.
- Dense dashboards or developer-tool chrome on the general-viewer path.
- **Sterile lab minimalism**: every label small-caps mono, every sentence passive, restraint mistaken for rigor. This is the failure mode this rework exists to correct.
- Kitsch in the other direction: handwriting fonts, paper grain, literal skeuomorphism.

## Implementation Notes

- Stack: TypeScript, Astro, vanilla CSS custom properties in `src/styles/global.css` (no Tailwind), YAML configuration, static output.
- Route behavior stays driven by `config/site.yaml` and `config/resumes.yaml`; visitor-facing copy that wants personality should live in config/content, not be hard-coded where YAML already owns it.
- **`public/gallery/` is off-limits to all design work.** Model-authored pages are the experiment's evidence; restyling them falsifies it. Every pass under this document scopes to the hosting site only (landing, ledger, gold resume path, 404, footer).
- Manual model generation stays separate from validation and deployment.
