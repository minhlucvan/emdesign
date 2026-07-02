---
name: test-component
description: Component testing skill. Tests a component across all relevant levels: render probe → lint → states → spatial → behavior → doctor. Use when verifying a component after build or edit. Writes a .test.ts file and runs vitest.
---

# Test Component

Component testing covers 6 levels of the testing pyramid. The agent writes a Vitest test file and drives the RED/GREEN loop until all assertions pass.

## Test Sequence

```
1. Render probe  → does the component mount?    (checkRenderProbe)
2. Lint          → token compliance?             (checkLint)
3. States        → loading/empty/error/disabled?  (checkStates)
4. Spatial       → overlaps, overflow, gaps?      (checkSpatial)
5. Behavior      → click, keyboard, ARIA?         (checkBehavior)
6. Doctor gate   → composite >= threshold?        (runDoctor)
```

## State Expectation Matrix

| Component Type | loading | empty | error | disabled | active | focus |
|---|---|---|---|---|---|---|
| Card / Display | optional | required | required | N/A | optional | N/A |
| Button / Trigger | N/A | N/A | N/A | required | required | required |
| Form Input | optional | N/A | required | required | N/A | required |
| List / Table | required | required | required | N/A | required | required |

## Template

Use `skills/test-engineering/test-scenarios/craft-component.ts` as the starting point.

```typescript
// Write this to src/__tests__/<Name>.test.ts
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import { resolveRepoPaths } from '@emdesign/backend';
import { checkLint, checkSpatial, checkBehavior, runDoctor } from '@emdesign/testbed';

const paths = resolveRepoPaths();
const name = '<Name>';
const sourcePath = '<SourcePath>';

describe(name, () => {
  it('passes lint', () => {
    const source = fs.readFileSync(sourcePath, 'utf8');
    expect(checkLint(source).mustFix).toBe(0);
  });
  it('passes spatial', async () => {
    expect((await checkSpatial(paths, name)).critical).toBe(0);
  });
  it('passes behavior', () => {
    const source = fs.readFileSync(sourcePath, 'utf8');
    expect(checkBehavior(source).ok).toBe(true);
  });
  it('passes doctor gate', async () => {
    const source = fs.readFileSync(sourcePath, 'utf8');
    expect((await runDoctor(paths, name, source)).decision).toBe('ship');
  });
});
```

## Running the Test

```bash
npx vitest run src/__tests__/<Name>.test.ts --reporter=json
```

## Fixing Common Failures

| Test | Common failure | Fix |
|---|---|---|
| Lint | P0 findings (off-token-color, filler-copy) | Replace raw hex with `--color-*` tokens, remove filler text |
| Spatial | Critical overlaps | Adjust padding/margin, fix grid layout |
| Behavior | Missing click handler or ARIA | Add `onClick`, `aria-label`, `role` attributes |
| Doctor gate | composite below threshold | Address all P0/P1 findings first |
