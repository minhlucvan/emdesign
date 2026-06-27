import type { RepoPaths, Store } from '@emdesign/backend';
import {
  captureComponent,
  captureWithBaseline,
  effectiveAdapter,
  toStoryId,
  ensureDir,
} from '@emdesign/backend';
import { formatJson, formatError } from '../lib/format.js';

export interface CaptureArgs {
  component: string;
  baseline?: boolean;
  json?: boolean;
}

export async function cmdCapture(args: CaptureArgs, paths: RepoPaths): Promise<void> {
  const name = args.component;
  if (!name) {
    formatError('capture requires a component name');
    process.exit(1);
  }

  if (args.baseline) {
    const result = await captureWithBaseline(paths, name);
    if (args.json) {
      formatJson({
        component: name,
        path: result.componentDir,
        baseline: result.baselinePath ?? '(no baseline — no story)',
      });
    } else {
      process.stderr.write(`Captured ${name} → ${result.componentDir}\n`);
      if (result.baselinePath) {
        process.stderr.write(`Baseline: ${result.baselinePath}\n`);
      }
    }
  } else {
    const out = await captureComponent(paths, name);
    if (args.json) {
      formatJson({ component: name, path: out });
    } else {
      process.stderr.write(`Captured ${name} → ${out}\n`);
    }
  }
}

export async function cmdCaptureBaseline(args: CaptureArgs, paths: RepoPaths): Promise<void> {
  const name = args.component;
  if (!name) {
    formatError('capture-baseline requires a component name');
    process.exit(1);
  }

  const a = effectiveAdapter(paths);
  const safe = name.replace(/[^A-Za-z0-9]/g, '');
  const pascal = safe[0].toUpperCase() + safe.slice(1);

  ensureDir(paths.screenshotsDir);
  const baselinePath = `${paths.screenshotsDir}/${pascal}.baseline.png`;

  const { chromium } = await import('playwright');
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ deviceScaleFactor: 2 });
    const storyId = toStoryId(pascal, 'default', 'components');
    const url = `${process.env.EMDESIGN_STORYBOOK_URL ?? 'http://localhost:6006'}/iframe.html?id=${storyId}&viewMode=story`;
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForSelector('#storybook-root', { timeout: 10_000 });
    await page.locator('#storybook-root').screenshot({ path: baselinePath });
  } finally {
    await browser.close();
  }

  if (args.json) {
    formatJson({ component: name, baseline: baselinePath });
  } else {
    process.stderr.write(`Baseline seeded for ${name} → ${baselinePath}\n`);
  }
}
