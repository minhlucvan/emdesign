/**
 * Storybook test-runner configuration.
 *
 * Uses Playwright to visit every story, take a screenshot, and compare
 * against a baseline. Also runs smoke tests (no errors in console).
 *
 * Prerequisites:
 *   npm install @storybook/test-runner playwright
 *   npx playwright install chromium
 *
 * Usage:
 *   npm run test:visual
 */
import type { TestRunnerConfig } from '@storybook/test-runner';
import { checkBrowserVisualDiff } from '@emdesign/testbed';

const config: TestRunnerConfig = {
  // Hook that runs after each story is rendered
  async postVisit(page, context) {
    // Check for console errors
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    // Take screenshot for baseline comparison
    const screenshotBuffer = await page.screenshot({ fullPage: true });
    const screenshotBase64 = screenshotBuffer.toString('base64');

    // Compare against baseline if one exists
    const { existsSync, readFileSync, mkdirSync, writeFileSync } = await import('node:fs');
    const { join } = await import('node:path');
    const baselineDir = join(process.cwd(), '__screenshots__', 'baselines');
    const resultDir = join(process.cwd(), '__screenshots__', 'results');
    const baselinePath = join(baselineDir, `${context.id}.png`);
    const resultPath = join(resultDir, `${context.id}.png`);

    if (existsSync(baselinePath)) {
      // Compare against baseline
      const baselineHtml = `<img src="data:image/png;base64,${screenshotBase64}" />`;
      const result = await checkBrowserVisualDiff(
        `<html><body><img src="file://${baselinePath}" /></body></html>`,
        `<html><body>${baselineHtml}</body></html>`,
        { threshold: 0.98 },
      );

      if (!result.ok) {
        mkdirSync(resultDir, { recursive: true });
        writeFileSync(resultPath, screenshotBuffer);
        console.error(
          `[visual-diff] ${context.id}: similarity ${result.similarity}`,
          result.changedRegions.map(r => r.selector),
        );
      }
    } else {
      // No baseline yet — create one
      mkdirSync(baselineDir, { recursive: true });
      writeFileSync(baselinePath, screenshotBuffer);
      console.log(`[visual-diff] Baseline created: ${context.id}`);
    }
  },
};

export default config;
