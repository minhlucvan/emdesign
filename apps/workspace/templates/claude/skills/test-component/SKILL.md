---
name: test-component
description: Component testing skill. Tests a component across all relevant levels: render probe → lint → states → spatial → behavior → doctor. Use when verifying a component after build or edit. Writes a .test.ts file and runs vitest.
---

# Test Component

Component testing covers 6 levels of the testing pyramid + browser-level DOM validation.
The agent writes BOTH a source-level test file AND a browser-level test file, then drives
the RED/GREEN loop until all assertions pass.

## Test Sequence

```
Source-level (vitest + @emdesign/testbed):
1. Render probe  → does the component mount?    (checkRenderProbe)
2. Lint          → token compliance?             (checkLint)
3. States        → loading/empty/error/disabled?  (checkStates)
4. Spatial       → overlaps, overflow, gaps?      (checkSpatial)
5. Behavior      → click, keyboard, ARIA?         (checkBehavior)
6. Doctor gate   → composite >= threshold?        (runDoctor)

Browser-level (@storybook/experimental-addon-test + @emdesign/testdom):
7. Token binding → rendered DOM uses CSS vars, not raw hex
8. Anti-patterns → no AI gradients, emoji icons, accent overuse
9. Contrast      → WCAG AA minimum (4.5:1)
10. Spacing      → margins/padding match design system scale
```

## State Expectation Matrix

| Component Type | loading | empty | error | disabled | active | focus |
|---|---|---|---|---|---|---|
| Card / Display | optional | required | required | N/A | optional | N/A |
| Button / Trigger | N/A | N/A | N/A | required | required | required |
| Form Input | optional | N/A | required | required | N/A | required |
| List / Table | required | required | required | N/A | required | required |

## Templates

### Source-level test (vitest)
Use `skills/test-engineering/test-scenarios/craft-component.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import { resolveRepoPaths } from '@emdesign/backend';
import { checkLint, checkSpatial, checkBehavior, runDoctor } from '@emdesign/testbed';

describe('<Name>', () => {
  it('passes lint', () => {
    const source = fs.readFileSync('<SourcePath>', 'utf8');
    expect(checkLint(source).mustFix).toBe(0);
  });
  it('passes spatial', async () => {
    expect((await checkSpatial(paths, name)).critical).toBe(0);
  });
  it('passes behavior', () => {
    const source = fs.readFileSync('<SourcePath>', 'utf8');
    expect(checkBehavior(source).ok).toBe(true);
  });
  it('passes doctor gate', async () => {
    const source = fs.readFileSync('<SourcePath>', 'utf8');
    expect((await runDoctor(paths, name, source)).decision).toBe('ship');
  });
});
```

### Browser-level test (Playwright on rendered story)
Write to `src/__tests__/<Name>.browser.test.ts`:
```typescript
import { test, expect } from '@storybook/experimental-addon-test';
import { evaluatePage } from '@emdesign/testdom/playwright';

const tokens = { /* declare from tokens.css */ };

test.describe('<Name> — rendered DOM validation', () => {
  test('token binding: no raw hex in rendered output', async ({ page }) => {
    await test.story();
    const report = await evaluatePage(page, tokens);
    expect(report.tokenBinding.passed).toBe(true);
  });
  test('no AI anti-patterns in rendered output', async ({ page }) => {
    await test.story();
    const report = await evaluatePage(page, tokens);
    expect(report.antiPatterns.score).toBeGreaterThan(0.9);
  });
  test('spacing aligns with system scale', async ({ page }) => {
    await test.story();
    const report = await evaluatePage(page, tokens, {
      spacingScale: ['4px','8px','12px','16px','24px','32px','48px','64px']
    });
    expect(report.spacing.score).toBeGreaterThan(0.8);
  });
  test('contrast meets WCAG AA minimum', async ({ page }) => {
    await test.story();
    const report = await evaluatePage(page, tokens, { minContrast: 4.5 });
    expect(report.contrast.passed).toBe(true);
  });
});
```

## RED/GREEN Loop

1. **RED:** Write BOTH test files, run `npx vitest run` — both must FAIL
2. **GREEN:** Implement component, re-run — both must PASS
3. If browser test fails, read `report.summary` for actionable fix suggestions
4. Repeat until both source-level and browser-level tests pass

## Running the Tests

```bash
# Source-level
npx vitest run src/__tests__/<Name>.test.ts --reporter=json
# Browser-level (requires Storybook running)
npx vitest run src/__tests__/<Name>.browser.test.ts --reporter=json
```

## Fixing Common Failures

| Test | Common failure | Fix |
|---|---|---|
| Lint | P0 findings (off-token-color, filler-copy) | Replace raw hex with `--color-*` tokens, remove filler text |
| Spatial | Critical overlaps | Adjust padding/margin, fix grid layout |
| Behavior | Missing click handler or ARIA | Add `onClick`, `aria-label`, `role` attributes |
| Doctor gate | composite below threshold | Address all P0/P1 findings first |
| Token binding (browser) | Raw hex in rendered DOM | Use CSS variables, check evaluatePage() report for nearest token |
| Anti-patterns (browser) | AI gradients, emoji icons | Replace with system tokens, use SVG icons |
| Contrast (browser) | WCAG AA failure | Darken text or lighten background per report details |
| Spacing (browser) | Off-scale padding/margin | Use design system spacing scale values |
