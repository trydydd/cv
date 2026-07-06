# Testing Strategy

## Test Scope

The hosting code and gold-standard resume path need happy-path and sad-path tests. The most important behavior is role routing, gold-resume resolution, gallery configurability, and validation failures.

## Recommended Test Stack

- Vitest for unit tests.
- Playwright for browser-level route tests.
- YAML schema validation tests for configuration.
- Markdown parsing tests for generated resume files.

## Happy-Path Tests

| Area | Test |
|---|---|
| Role selector | `Tech` navigates to the gallery. |
| Role selector | `Everyone` navigates to the gold resume. |
| Gold route | Configured `goldResumeId` resolves to an enabled resume. |
| Gallery | Enabled `showInGallery` resumes appear. |
| Gallery | Disabled resumes are hidden. |
| Resume detail | Markdown renders to HTML. |
| PDF | Gold resume PDF link exists. |

## Sad-Path Tests

| Area | Test |
|---|---|
| Role labels | Labels longer than two words fail validation. |
| Gold config | Missing `goldResumeId` fails validation. |
| Gold config | Disabled gold resume fails validation. |
| Registry | Duplicate resume IDs fail validation. |
| Registry | Missing Markdown path fails validation. |
| Gallery | Empty gallery shows a useful fallback message or fails build intentionally. |
| Routing | Unknown resume ID renders a 404 page. |

## Example Unit Test Cases

```ts
import { describe, expect, it } from 'vitest';
import { resolveRoleTarget } from '../src/lib/routes';

it('routes Everyone to the configured gold resume', () => {
  const result = resolveRoleTarget('everyone', {
    goldResumeId: 'frontier-gold',
    roles: { everyone: { label: 'Everyone', target: 'gold' } },
  });

  expect(result).toEqual('/resume/frontier-gold');
});

it('rejects role labels longer than two words', () => {
  expect(() => validateRoleLabel('Tinkerers and Curious')).toThrow();
});
```

## Example Browser Tests

```ts
import { expect, test } from '@playwright/test';

test('Everyone opens the gold resume', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Everyone' }).click();
  await expect(page).toHaveURL(/\/resume\/frontier-gold/);
});

test('Tech opens the configurable gallery', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Tech' }).click();
  await expect(page).toHaveURL(/\/resumes/);
});
```
