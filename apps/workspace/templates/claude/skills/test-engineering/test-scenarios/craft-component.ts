// Test template: craft-component
// Agent: copy this file, replace <Name> and <SourcePath>, write to src/__tests__/<Name>.test.ts
// Then run: $ npx vitest run src/__tests__/<Name>.test.ts --reporter=json
//
// ALSO generate a browser-level test at src/__tests__/<Name>.browser.test.ts using:
//   import { test, expect } from '@storybook/experimental-addon-test';
//   import { evaluatePage } from '@emdesign/testdom/playwright';
//
// Levels: DOM (render probe) + Lint + Component (states, spatial, behavior) + Gate (doctor)
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import { resolveRepoPaths } from '@emdesign/backend';
import { checkLint, checkSpatial, checkBehavior, assertRenderProbePasses, runDoctor } from '@emdesign/testbed';

const paths = resolveRepoPaths();
const name = '<Name>';
const sourcePath = '<SourcePath>'; // e.g. src/generated/<Name>.tsx

describe(`${name} component`, () => {
  // Level 1: Render probe — does the component mount?
  it('renders with DOM nodes', async () => {
    const result = await assertRenderProbePasses(paths, name);
    expect(result.domNodes).toBeGreaterThan(0);
  });

  // Level 2: Lint — token compliance, no P0 findings, no AI anti-patterns
  it('passes lint (zero P0 findings)', () => {
    const source = fs.existsSync(sourcePath) ? fs.readFileSync(sourcePath, 'utf8') : '';
    const result = checkLint(source);
    // mustFix == 0 means: no raw hex, no filler copy, no AI-purple gradients,
    // no emoji icons, no invented metrics, no accent overuse, no non-deterministic code
    expect(result.mustFix).toBe(0);
    // Check for anti-pattern warnings (P1 findings)
    const warnings = result.findings.filter(f => f.severity === 'P1');
    expect(warnings.length).toBeLessThanOrEqual(2); // max 2 warnings allowed
  });

  // Level 4: Spatial — no critical geometry issues
  it('passes spatial audit (zero critical)', async () => {
    const result = await checkSpatial(paths, name);
    expect(result.critical).toBe(0);
  });

  // Level 6: Behavior — click, keyboard, ARIA, form submit
  it('has proper interaction patterns', () => {
    const source = fs.existsSync(sourcePath) ? fs.readFileSync(sourcePath, 'utf8') : '';
    const result = checkBehavior(source);
    expect(result.ok).toBe(true);
    // Additional behavioral checks:
    // - Interactive elements must have onClick, onKeyDown, or role
    // - Forms must have onSubmit handling
    // - ARIA labels on icon-only elements
  });

  // Level 7: Doctor gate — composite ship decision
  it('passes doctor gate', async () => {
    const source = fs.existsSync(sourcePath) ? fs.readFileSync(sourcePath, 'utf8') : '';
    const result = await runDoctor(paths, name, source);
    expect(result.decision).toBe('ship');
    expect(result.score).toBeGreaterThanOrEqual(0.8);
  });
});
