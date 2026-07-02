// Test template: form-behavior
// Agent: copy this file, replace <Name> and <SourcePath>,
// write to src/__tests__/<Name>-form.test.ts
// Then run: $ npx vitest run src/__tests__/<Name>-form.test.ts --reporter=json
//
// Levels: Behavior (submit, keyboard, ARIA) + Component (states)
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import { checkBehavior, assertHasFormSubmit, assertHasKeyboardSupport, assertHasAriaAttributes } from '@emdesign/testbed';

const name = '<Name>';
const sourcePath = '<SourcePath>'; // e.g. src/generated/<Name>.tsx

describe(`${name} form behavior`, () => {
  const source = fs.existsSync(sourcePath) ? fs.readFileSync(sourcePath, 'utf8') : '';

  it('has form submission handler', () => {
    expect(() => assertHasFormSubmit(source)).not.toThrow();
  });

  it('has keyboard support', () => {
    expect(() => assertHasKeyboardSupport(source)).not.toThrow();
  });

  it('has ARIA attributes', () => {
    expect(() => assertHasAriaAttributes(source)).not.toThrow();
  });

  it('passes full behavior check', () => {
    const result = checkBehavior(source);
    expect(result.ok).toBe(true);
  });
});
