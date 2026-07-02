---
name: "MDS: Test Page"
description: Run page/screen structure tests — assert layout landmarks, section presence, responsive meta, navigation, and token binding. Writes a .test.ts file from the craft-page template and runs vitest.
category: Test
tags: [test, page, vitest, layout]
---

# MDS: Test Page

Usage: `/mds:test:page <name> [--html <path>] [--sections <json>]`

Example: `/mds:test:page DashboardPage`

## Workflow

1. **Read template** from `skills/test-engineering/test-scenarios/craft-page.ts`
2. **Write test file** to `src/__tests__/<Name>-page.test.ts`
3. **Run vitest**: `$ npx vitest run src/__tests__/<Name>-page.test.ts --reporter=json`
4. **If RED** — fix page structure (add missing landmarks, sections)
5. **If GREEN** — page structure verified

## What Gets Tested

| Test | Primitive | What it catches |
|---|---|---|
| Page structure | `assertHasPageStructure` | Missing header, main, or footer |
| Navigation | `assertHasNavigation` | No nav element or links |
| Responsive meta | `assertHasResponsiveMeta` | No viewport meta or media queries |
| Composite | `checkPage` | Overall page health score |
| Visual match | `checkVisualDiff` | Visual drift from baseline |

## Guardrails

- Page testing requires the page to be renderable (SSR or Storybook)
- Missing sections are reported with their expected role/selector
- Token binding violations are blocking (P0)
