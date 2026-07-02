import type { TestRunnerConfig } from '@storybook/test-runner';

const config: TestRunnerConfig = {
  async postVisit(page, context) {
    // Check for console errors
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    // Take screenshot
    const { mkdirSync, writeFileSync } = await import('node:fs');
    const { join } = await import('node:path');
    const shotsDir = join(process.cwd(), '__screenshots__');
    mkdirSync(shotsDir, { recursive: true });
    const shot = await page.screenshot({ fullPage: true });
    writeFileSync(join(shotsDir, `${context.id}.png`), shot);
  },
};

export default config;
