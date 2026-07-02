---
name: test-visual
description: Visual regression testing skill. Compares HTML documents across pixel, structure, and computed CSS layers. Use when verifying a component change didn't break appearance, comparing overview pages to reference preview HTML, or validating cross-DS equivalence. Writes a .test.ts file and runs vitest.
---

# Test Visual

Visual testing compares two HTML documents across three layers: pixel (via Playwright), DOM structure, and computed CSS. The `@emdesign/visual-diff` engine powers the comparison — pure JS for structure, Playwright for full pixel rendering.

## Primitives

| Function | Async? | What it does |
|---|---|---|
| `checkVisualDiff(htmlA, htmlB)` | Yes | Compare two HTML strings, return similarity (0-1) + changed regions |
| `assertVisualSimilarity(htmlA, htmlB, threshold)` | Yes | Throw if similarity < threshold (default 0.98) |
| `assertDomSnapshotMatches(actual, expected)` | No | Throw if pretty-printed DOM structure differs |
| `checkDiff(paths, id1, id2)` | No | Compare token declarations between two design systems |

## Template

Use `skills/test-engineering/test-scenarios/visual-regression.ts` for before/after comparison.

## Threshold Guidance

| Context | Threshold | Rationale |
|---|---|---|
| HTML structural comparison | 0.95 | Structure may shift slightly across render contexts |
| Pixel comparison (same browser) | 0.98 | Minimal variance expected |
| Cross-DS comparison | 0.85 | Different systems have different visual output |
| CI gate | 0.98 | Strict — prevents any unintended change |

## Cross-DS Overview vs Preview

When importing a design system, compare the generated React overview page against the original reference preview:

```
Template: skills/test-engineering/test-scenarios/overview-vs-preview.ts
1. checkDiff(paths, 'imported-ds', 'referenced-ds')  — token equivalence
2. checkVisualDiff(previewHtml, overviewHtml)         — visual similarity (threshold 0.85)
```

## Running

```bash
npx vitest run src/__tests__/visual-<Name>.test.ts --reporter=json
```
