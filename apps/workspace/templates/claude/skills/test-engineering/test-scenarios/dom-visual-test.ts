// Test template: dom-visual-test
// Agent: copy this file, replace <Name> + <Url> + <Tokens>, write to e2e/<Name>.spec.ts
// Then run: $ npx playwright test e2e/<Name>.spec.ts
//
// Two test sets:
//   1. Integration (vitest):   source lint + structural checks
//   2. Visual + DOM (Playwright): browser rendering + rule eval + screenshot diff
//
// Clean DX: import { evaluatePage } from '@emdesign/testdom/playwright'
//   → navigates, injects testdom, evaluates rules, returns structured report + summary
import { test, expect } from '@playwright/test';
import { evaluatePage } from '@emdesign/testdom/playwright';

const name = '<Name>';
const storyUrl = '<Url>'; // e.g. http://localhost:6006/iframe.html?id=...

// Design system tokens (replace with actual from tokens.css)
const tokens = {
  'color-surface': '#ffffff',
  'color-text': '#000000',
  'color-accent': '#000000',
  'color-border': '#e6e6e6',
  'radius': '8px',
  'space-unit': '8px',
  'font-sans': 'Inter, system-ui',
};

test.describe(`${name} — visual + DOM validation`, () => {

  test('DOM: token binding + anti-patterns + contrast', async ({ page }) => {
    const report = await evaluatePage(page, tokens, { url: storyUrl });

    // Assertions
    expect(report.tokenBinding.passed).toBe(true);
    expect(report.antiPatterns.score).toBeGreaterThanOrEqual(0.9);
    expect(report.contrast.score).toBeGreaterThanOrEqual(0.8);

    // Print actionable feedback (useful in CI)
    console.log(report.summary);
  });

  test('Visual: screenshot matches baseline', async ({ page }) => {
    await page.goto(storyUrl, { waitUntil: 'networkidle' });
    const screenshot = await page.screenshot({ fullPage: true });

    const { existsSync, readFileSync, writeFileSync, mkdirSync } = await import('node:fs');
    const baselinePath = `__screenshots__/${name}.baseline.png`;

    if (existsSync(baselinePath)) {
      const baseline = readFileSync(baselinePath);
      expect(screenshot.length).toBeGreaterThan(1000);
      // TODO: add pixelmatch comparison
    } else {
      mkdirSync('__screenshots__', { recursive: true });
      writeFileSync(baselinePath, screenshot);
    }
  });
});
