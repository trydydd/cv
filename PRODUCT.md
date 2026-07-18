# Product

## Register

brand

## Users

Primary users are hiring managers, recruiters, interviewers, and professional contacts who need a fast, trustworthy read on the resume owner. Secondary users are technical reviewers, tinkerers, and curious peers who want to inspect the multi-model resume experiment, compare variants, and understand how the outputs were produced.

The default visitor context is time-constrained and evaluative: most people should land on the best resume immediately. Technical visitors are self-directed and should be able to browse the full set of generated resume variants, provenance, and formats without slowing down the default audience.

## Product Purpose

Multi-Model Resume Lab publishes multiple resume variants generated from one canonical resume YAML input and one shared prompt, while keeping the public GitHub Pages site deterministic and reviewable. The site should route general viewers directly to a configured gold-standard resume and route technical viewers to a configurable gallery of all variants.

Success means the general path feels effortless and credible, the technical path feels transparent and reproducible, and new resume variants can be added, removed, hidden, or promoted through configuration rather than route-code rewrites.

## Brand Personality

Precise, transparent, ambitious.

The brand should feel like a polished personal portfolio crossed with a reproducible systems lab: confident enough for non-technical viewers, explicit enough for technical reviewers, and restrained enough that the resume remains the hero.

## Anti-references

- Do not make the site feel like a generic beige AI portfolio template.
- Do not bury the default resume behind tooling explanations, model comparisons, or novelty interactions.
- Do not make the technical gallery feel like an uncurated dump of files.
- Do not use dense dashboards, heavy chrome, or developer-tool aesthetics for the general-viewer path.
- Do not imply that CI generates new resume content during deployment; generation is manual and pre-commit.

## Design Principles

1. Route by intent, then disappear: `Resume` gets the gold resume with minimum friction; `Resume Gallery` gets the lab.
2. Trust through provenance: make model, prompt, input, and output metadata visible where it helps decision-making.
3. Configuration over code churn: site behavior should follow YAML registries whenever possible.
4. Resume first, experiment second: technical sophistication should support credibility, not distract from the candidate.
5. Deterministic deployment: publish reviewed static artifacts and keep model access out of validation and Pages deployment.

## Accessibility & Inclusion

Target WCAG 2.2 AA for the published site. The role selector must use semantic controls, keyboard navigation, visible focus states, and labels that are one or two words. Text contrast should meet or exceed AA, PDF links should have descriptive names, generated resume pages should preserve heading hierarchy, and motion should respect `prefers-reduced-motion`.
