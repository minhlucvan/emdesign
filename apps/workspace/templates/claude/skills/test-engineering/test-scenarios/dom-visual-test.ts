// Test template: dom-visual-test
// Agent: copy this file, replace <Name> + <Tokens>, write to src/__tests__/<Name>.test.ts
// Then run: $ npx vitest run src/__tests__/<Name>.test.ts --reporter=json
//
// Uses @storybook/experimental-addon-test to render stories in a real browser
// + @emdesign/testdom/playwright to evaluate design rules on the rendered DOM.
//
// Storybook renders the story in headless Playwright → we inject testdom →
// evaluate token binding, anti-patterns, spacing, contrast → get structured report.
import { test, expect } from '@storybook/experimental-addon-test';
import { evaluatePage } from '@emdesign/testdom/playwright';

const name = '<Name>';
const tokens = { /* <TokenMap> — declare from tokens.css */ };

test.describe(`${name} — design rule validation`, () => {

  test('renders with correct token binding (no raw hex)', async ({ page }) => {
    await test.story(); // renders the current story in a real browser
    const report = await evaluatePage(page, tokens);
    expect(report.tokenBinding.passed).toBe(true);
    if (!report.tokenBinding.passed) console.log(report.summary);
  });

  test('has no AI anti-patterns', async ({ page }) => {
    await test.story();
    const report = await evaluatePage(page, tokens);
    expect(report.antiPatterns.score).toBeGreaterThanOrEqual(0.9);
    if (report.antiPatterns.violations.length) console.log(report.summary);
  });

  test('meets WCAG contrast minimum', async ({ page }) => {
    await test.story();
    const report = await evaluatePage(page, tokens, { minContrast: 4.5 });
    expect(report.contrast.passed).toBe(true);
    if (!report.contrast.passed) console.log(report.summary);
  });

  test('spacing aligns with design system scale', async ({ page }) => {
    await test.story();
    const report = await evaluatePage(page, tokens, {
      spacingScale: ['4px', '8px', '12px', '16px', '24px', '32px', '48px', '64px'],
    });
    expect(report.spacing.score).toBeGreaterThanOrEqual(0.8);
    if (report.spacing.violations.length) console.log(report.summary);
  });
});
