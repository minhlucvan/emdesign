// Test template: craft-component
// Agent: copy this file, replace <Name> and <SourcePath>, write to src/__tests__/<Name>.test.ts
// Then run: $ npx vitest run src/__tests__/<Name>.test.ts --reporter=json
//
// Levels: DOM (render probe) + Lint + Component (states, spatial, behavior) + Gate (doctor)
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import { resolveRepoPaths } from '@emdesign/backend';
import { checkLint, checkSpatial, checkBehavior, assertRenderProbePasses, runDoctor } from '@emdesign/testing';

const paths = resolveRepoPaths();
const name = '<Name>';
const sourcePath = '<SourcePath>'; // e.g. src/generated/<Name>.tsx

describe(`${name} component`, () => {
  // Level 1: Render probe — does the component mount?
  it('renders with DOM nodes', async () => {
    const result = await assertRenderProbePasses(paths, name);
    expect(result.domNodes).toBeGreaterThan(0);
  });

  // Level 2: Lint — token compliance, no P0 findings
  it('passes lint (zero P0 findings)', () => {
    const source = fs.existsSync(sourcePath) ? fs.readFileSync(sourcePath, 'utf8') : '';
    const result = checkLint(source);
    expect(result.mustFix).toBe(0);
  });

  // Level 4: Spatial — no critical geometry issues
  it('passes spatial audit (zero critical)', async () => {
    const result = await checkSpatial(paths, name);
    expect(result.critical).toBe(0);
  });

  // Level 6: Behavior — click, keyboard, ARIA
  it('has proper interaction patterns', () => {
    const source = fs.existsSync(sourcePath) ? fs.readFileSync(sourcePath, 'utf8') : '';
    const result = checkBehavior(source);
    expect(result.ok).toBe(true);
  });

  // Level 7: Doctor gate — composite ship decision
  it('passes doctor gate', async () => {
    const source = fs.existsSync(sourcePath) ? fs.readFileSync(sourcePath, 'utf8') : '';
    const result = await runDoctor(paths, name, source);
    expect(result.decision).toBe('ship');
  });
});
