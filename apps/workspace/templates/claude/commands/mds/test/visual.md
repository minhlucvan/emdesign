---
name: "MDS: Test Visual"
description: Run visual regression comparison — compare current rendered HTML against a baseline, or compare two HTML documents. Writes a .test.ts file from the visual-regression template and runs vitest.
category: Test
tags: [test, visual, vitest, regression]
---

# MDS: Test Visual

Usage: `/mds:test:visual <name> [--baseline <path>] [--threshold <0-1>]`

Example: `/mds:test:visual StatsCard --baseline __screenshots__/StatsCard/baseline.html`

## Workflow

1. **Select template** — `visual-regression.ts` for component comparison or `overview-vs-preview.ts` for cross-DS comparison
2. **Write test file** to `src/__tests__/visual-<Name>.test.ts`
3. **Run vitest**: `$ npx vitest run src/__tests__/visual-<Name>.test.ts --reporter=json`
4. **If RED** — check if the difference is intended (update baseline) or a regression (fix code)
5. **If GREEN** — visual match confirmed

## What Gets Tested

| Test | Primitive | Threshold |
|---|---|---|
| DOM structure match | `assertDomSnapshotMatches` | Exact match |
| Visual similarity | `checkVisualDiff` | 0.98 (default) |
| Cross-DS token equivalence | `checkDiff` | Exact match |

## Guardrails

- Visual regression requires a baseline; if none exists, first run captures one
- Cross-DS comparison uses lower threshold (0.85)
- Update baseline intentionally, not to hide regressions
