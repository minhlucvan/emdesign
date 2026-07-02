---
name: "MDS: Test Component"
description: Run the full component test suite — render probe, lint, spatial, behavior, and doctor gate. Writes a .test.ts file from the craft-component template and runs vitest. Provides a RED/GREEN verdict.
category: Test
tags: [test, component, vitest, red-green-loop]
---

# MDS: Test Component

Usage: `/mds:test:component <name> [--source <path>]`

Example: `/mds:test:component StatsCard`

## Workflow

1. **Read template** from `skills/test-engineering/test-scenarios/craft-component.ts`
2. **Write test file** to `src/__tests__/<Name>.test.ts`, replacing `<Name>` and `<SourcePath>` with the actual values
3. **Run vitest**: `$ npx vitest run src/__tests__/<Name>.test.ts --reporter=json`
4. **If GREEN** (exit 0) → record evidence, return pass
5. **If RED** (exit non-zero) → read vitest JSON output, identify failing tests, fix source code, re-run
6. Loop until GREEN or max iterations reached

## What Gets Tested

| Test | Primitive | What it catches |
|---|---|---|
| Render probe | `assertRenderProbePasses` | Component doesn't mount, zero DOM nodes |
| Lint | `checkLint` | Off-token colors, raw hex, filler copy, P0 findings |
| Spatial | `checkSpatial` | Overlaps, overflow, gap violations |
| Behavior | `checkBehavior` | Missing click handler, keyboard support, ARIA |
| Doctor gate | `runDoctor` | Composite score below threshold, blocking issues |

## Guardrails

- Never skip lint — off-token values are blocking
- If Storybook is unavailable, skip render probe and spatial, note it
- The doctor gate is the final verdict
- Max 5 RED/GREEN iterations before escalation
