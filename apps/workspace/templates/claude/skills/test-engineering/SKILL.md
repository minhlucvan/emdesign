---
name: test-engineering
description: Master testing skill for emdesign. Defines the 7-level testing pyramid (DOM, Lint, Visual, Component, Page, Behavior, Gate), the RED/GREEN agent loop with vitest, and scenario-based testing strategies. Use at the START of any testing task to select the right scenario template, write a .test.ts file, and drive vitest to GREEN.
---

# Test Engineering

The emdesign testing system has two stacks:

## Stack 1: Integration tests (source-level)
Agents write **Vitest `.test.ts` files** that import `@emdesign/testbed` primitives, then run `npx vitest run <file>` to get RED (fail) or GREEN (pass). Source-code checks only — no browser needed.

## Stack 2: Visual + DOM tests (browser-level)
Agents write **`.test.ts` files** using `@storybook/experimental-addon-test` + `@emdesign/testdom`.
`@storybook/experimental-addon-test` renders each story in a real headless Playwright browser.
`@emdesign/testdom` evaluates design rules (token binding, anti-patterns, spacing, contrast) against
the rendered DOM. Run with `npx vitest run` — the addon handles browser lifecycle automatically.

```typescript
import { test, expect } from '@storybook/experimental-addon-test';
import { evaluatePage } from '@emdesign/testdom/playwright';

test('token binding', async ({ page }) => {
  await test.story();                            // renders story in Playwright
  const report = await evaluatePage(page, tokens); // evaluates design rules
  expect(report.tokenBinding.passed).toBe(true);
  console.log(report.summary);                   // actionable feedback
});
```

## The 7-Level Testing Pyramid

```
Level 7: GATE     (doctor, audit, grade)          ← composite ship decision
Level 6: BEHAVIOR (click, keyboard, ARIA, form)    ← interaction patterns
Level 5: PAGE     (structure, sections, responsive) ← page composition
Level 4: COMPONENT(states, spatial, charters)      ← component completeness
Level 3: VISUAL   (visual diff, DOM snapshot)      ← visual regression
Level 2: LINT     (token compliance, P0 findings)  ← code correctness
Level 1: DOM      (render probe, mounting)         ← basic rendering
```

| Level | Primitives | What it catches |
|---|---|---|
| 1 DOM | `checkRenderProbe`, `renderComponent` | Mount failure, zero DOM nodes, SSR mismatch |
| 2 Lint | `checkLint`, `assertNoP0Findings`, `checkTokenReferences` | Off-token colors, raw hex, filler copy |
| 3 Visual | `checkVisualDiff`, `assertVisualSimilarity`, `assertDomSnapshotMatches` | Visual regressions, DOM structure drift |
| 4 Component | `checkSpatial`, `checkBehavior`, `checkStates`, `checkCharters` | Overlaps, missing states, geometry violations |
| 5 Page | `checkPage`, `assertPageHasSections`, `assertHasPageStructure`, `assertHasResponsiveMeta` | Missing landmarks, broken layout |
| 6 Behavior | `assertHasClickHandler`, `assertHasKeyboardSupport`, `assertHasFormSubmit` | Non-interactive UI, missing a11y |
| 7 Gate | `runDoctor`, `checkAudit`, `checkGrade` | Composite ship/revise decision |

## The RED/GREEN Loop

Every component should have BOTH a source-level test and a browser-level test.

### Source-level test (vitest + @emdesign/testbed)

```
1. SELECT scenario template from test-scenarios/<scenario>.ts
2. COPY to src/__tests__/<Name>.test.ts, replace <Name> and <SourcePath>
3. RUN: $ npx vitest run src/__tests__/<Name>.test.ts --reporter=json
4. CHECK exit code:
   - Exit 0    → GREEN: all assertions pass
   - Exit != 0 → RED: read vitest output for failed test names
5. If RED:
   a. Read which tests failed (from vitest JSON output)
   b. Fix the source code (e.g., add tokens, fix overlaps, add ARIA)
   c. Re-run vitest (go to step 3)
6. If GREEN: done — record evidence
```

### Browser-level test (@storybook/experimental-addon-test + @emdesign/testdom/playwright)

```
1. GENERATE src/__tests__/<Name>.browser.test.ts using dom-visual-test.ts template
2. RUN: $ npx vitest run src/__tests__/<Name>.browser.test.ts --reporter=json
   (Storybook must be running on :6006)
3. CHECK exit code and evaluation report:
   - Exit 0 + report.tokenBinding.passed  → GREEN
   - Exit != 0 or any check failed         → RED — read report.summary for details
4. If RED:
   a. Read evaluatePage() report.summary — it gives actionable fix suggestions
   b. Fix the rendered output (CSS vars, spacing, contrast, anti-patterns)
   c. Re-run (go to step 2)
5. If GREEN: done — component passes both source and browser validation
```

### Why Vitest (not CLI commands)

- Standard output format (`vitest --reporter=json` produces structured test results)
- Full parallel execution, watch mode, UI mode
- Test files are normal TypeScript — developers can run them too
- `expect()` + `@emdesign/testbed` `assert*()` functions throw on failure = natural RED signal
- No custom parsers needed

## Scenario Templates

All templates live at `skills/test-engineering/test-scenarios/`. Each is a `.ts` file with `<Name>` and `<SourcePath>` placeholders:

| Template | File | Levels | Imported primitives |
|---|---|---|---|
| Craft component | `craft-component.ts` | 1, 2, 4, 6, 7 | `checkLint`, `checkSpatial`, `checkBehavior`, `runDoctor` |
| Craft sections | `craft-sections.ts` | 5 | `checkPage`, `assertPageHasSections` |
| Craft page | `craft-page.ts` | 5, 3 | `checkPage`, `assertHasNavigation`, `checkVisualDiff` |
| Responsive | `responsive.ts` | 5 | `assertHasResponsiveMeta` |
| Visual regression | `visual-regression.ts` | 3 | `checkVisualDiff`, `assertDomSnapshotMatches` |
| Overview vs preview | `overview-vs-preview.ts` | 3 | `checkDiff`, `checkVisualDiff` |
| Form behavior | `form-behavior.ts` | 6, 4 | `checkBehavior`, `assertHasFormSubmit` |

### How to use a template

```bash
# 1. Copy the template
cp skills/test-engineering/test-scenarios/craft-component.ts src/__tests__/StatsCard.test.ts

# 2. Edit placeholders
#    Replace <Name> with StatsCard
#    Replace <SourcePath> with src/generated/StatsCard.tsx

# 3. Run vitest
npx vitest run src/__tests__/StatsCard.test.ts --reporter=json
```

## Interpreting Test Results

- Vitest exit code 0 = all tests pass = GREEN
- Vitest exit code 1 = one or more tests failed = RED
- Use `--reporter=json` for machine-parseable output
- Failed assertions produce `AssertionError` messages with the reason

## Writing Custom Test Files

Import from `@emdesign/testbed`:

```typescript
import { describe, it, expect } from 'vitest';
import { checkLint, checkSpatial, checkBehavior, runDoctor } from '@emdesign/testbed';

it('checks lint', () => {
  const result = checkLint(source);
  expect(result.mustFix).toBe(0);
});

it('checks spatial', async () => {
  const result = await checkSpatial(paths, name);
  expect(result.critical).toBe(0);
});
```

## Guardrails

- Every RED must be investigated and fixed before GREEN is declared
- Skipped levels must be documented (e.g., "no Storybook available — skipping render probe")
- Evidence: save vitest JSON output as test evidence
- The doctor gate is the final authority for ship decisions
