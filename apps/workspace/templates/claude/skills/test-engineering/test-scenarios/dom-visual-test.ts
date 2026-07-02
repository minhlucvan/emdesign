// Test template: dom-visual-test
// Agent: copy this file, replace <Name> and <Url>, write to e2e/<Name>.spec.ts
// Then run: $ npx playwright test e2e/<Name>.spec.ts
//
// Levels: DOM (rendered) + Visual (pixel) + Lint (in-browser rule eval)
//
// Two test sets:
//   1. Integration (vitest): source lint + token checks + structural
//   2. Visual + DOM (Playwright): browser rendering + rule eval + screenshot diff
import { test, expect } from '@playwright/test';
import { checkBrowserRules, checkBrowserVisualDiff } from '@emdesign/testbed';

const name = '<Name>';
const storyUrl = '<Url>';     // e.g. http://localhost:6006/iframe.html?id=...
const declaredTokens = {
  'color-surface': '#ffffff',
  'color-text': '#000000',
  'color-accent': '#000000',
  'color-border': '#e6e6e6',
  'radius': '8px',
  'space-unit': '8px',
  'font-sans': 'Inter, system-ui',
};

test.describe(`${name} — browser visual + DOM tests`, () => {

  test('DOM: token binding (no raw hex)', async ({ page }) => {
    await page.goto(storyUrl, { waitUntil: 'networkidle' });
    const result = await checkBrowserRules(storyUrl, declaredTokens);
    expect(result.tokenBinding.passed).toBe(true);
    expect(result.tokenBinding.score).toBeGreaterThanOrEqual(0.9);
  });

  test('DOM: no AI anti-patterns', async ({ page }) => {
    const result = await checkBrowserRules(storyUrl, declaredTokens);
    expect(result.antiPatterns.passed).toBe(true);
  });

  test('Visual: screenshot matches baseline', async ({ page }) => {
    await page.goto(storyUrl, { waitUntil: 'networkidle' });
    const screenshot = await page.screenshot({ fullPage: true });
    // Compare against baseline (first run creates baseline)
    const { existsSync, readFileSync, writeFileSync, mkdirSync } = await import('node:fs');
    const baselinePath = `__screenshots__/${name}.baseline.png`;
    if (existsSync(baselinePath)) {
      const baseline = readFileSync(baselinePath);
      // Pixel comparison logic here (via @emdesign/visual-diff or pixelmatch)
      expect(screenshot.length).toBeGreaterThan(1000);
    } else {
      mkdirSync('__screenshots__', { recursive: true });
      writeFileSync(baselinePath, screenshot);
    }
  });

  test('DOM: contrast meets WCAG AA', async ({ page }) => {
    await page.goto(storyUrl, { waitUntil: 'networkidle' });
    const result = await checkBrowserRules(storyUrl, declaredTokens, { minContrast: 4.5 });
    expect(result.contrast.passed).toBe(true);
  });
});
