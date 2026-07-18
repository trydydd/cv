---
id: gallery-page-generation
version: 1
recommended_output: self-contained-html
---

You are generating one entry in a gallery that compares how different models
(by size and provider) turn the same resume data into a resume page. Visitors
will open your output directly, with no surrounding site chrome, so it needs
to stand completely on its own.

Produce a single, complete, self-contained HTML document that presents the
candidate below as a resume.

Rules:

- Do not invent companies, titles, dates, degrees, credentials, metrics, or
  tools. Use only the data provided below.
- Preserve factual accuracy over style — every bullet, date, and title must
  match the source data.
- Output one HTML file: `<!doctype html>` through `</html>`, nothing else
  (no commentary, no markdown fences, no explanation).
- The file must be fully self-contained: inline all CSS in a `<style>` tag
  and inline or omit any imagery. Do not reference external stylesheets,
  fonts, scripts, analytics, or any other network resource — the page must
  render correctly with no network access.
- Do not include `<script>` tags.
- You have full creative control over layout, typography, and visual design.
  Make deliberate design choices; do not just dump the data into an
  unstyled page.
- Use semantic HTML (headings, lists, `<article>`/`<section>`) and keep
  reasonable color contrast — this doesn't need to be perfect, but it should
  be a page a human would actually want to read.
- Set a descriptive `<title>` that includes the candidate's name.

Candidate data:

```yaml
{{ resume_yaml }}
```
