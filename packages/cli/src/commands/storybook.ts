import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { fetchStorybookIndex, scanStoryFiles } from '../lib/storybook.js';
import { formatJson, formatError } from '../lib/format.js';
import { activeDsId } from '../lib/resolve.js';
import type { RepoPaths, Store } from '@emdesign/backend';

export interface StorybookHealthArgs {
  verbose?: boolean;
  json?: boolean;
  /** Check a specific story URL for rendering health. */
  story?: string;
}

interface HealthCheck {
  name: string;
  pass: boolean;
  detail: string;
  logs?: string[];
  errors?: string[];
}

interface HealthResult {
  url: string;
  status: 'healthy' | 'degraded' | 'down';
  checks: HealthCheck[];
  issues: Array<{ severity: 'high' | 'medium' | 'low'; message: string; fix?: string }>;
  fixes: string[];
  storyCount: number;
}

const SB_DEFAULT = process.env.EMDESIGN_STORYBOOK_URL ?? 'http://localhost:6006';
const STORYBOOK_PORT = 6006;

/** Run the full Storybook health diagnostic. */
export async function cmdStorybookHealth(
  args: StorybookHealthArgs,
  paths: RepoPaths,
  store: Store,
): Promise<void> {
  const url = SB_DEFAULT;
  const checks: HealthCheck[] = [];
  const issues: HealthResult['issues'] = [];
  const fixes: string[] = [];

  // ── 1. Port check ────────────────────────────────────────────────────────
  checks.push(await checkPort(url));

  // If port is down, skip deeper checks
  const portOk = checks[0].pass;
  let storyCount = 0;

  if (portOk) {
    // ── 2. Story index ─────────────────────────────────────────────────────
    const indexCheck = await checkIndex(url);
    checks.push(indexCheck);
    if (indexCheck.pass) {
      // Extract story count from detail string
      const m = indexCheck.detail.match(/(\d+)/);
      storyCount = m ? parseInt(m[1], 10) : 0;
    }

    // ── 3. Compilation errors (Playwright browser console) ─────────────────
    const compileCheck = await checkCompilation(url);
    checks.push(compileCheck);

    if (!compileCheck.pass && compileCheck.errors) {
      issues.push({
        severity: 'high',
        message: `Storybook compilation errors (${compileCheck.errors.length})`,
        fix: 'Check the console errors below — usually a missing import or syntax error in a component/story file.',
      });
      if (compileCheck.logs) {
        for (const log of compileCheck.logs.slice(0, 5)) {
          issues.push({ severity: 'high', message: log });
        }
      }
    }

    // ── 4. @ds alias check ─────────────────────────────────────────────────
    const aliasCheck = checkDsAlias(paths, store);
    checks.push(aliasCheck);
    if (!aliasCheck.pass) {
      issues.push({
        severity: 'high',
        message: `@ds alias mismatch: resolves to "${aliasCheck.detail.split('"')[1] ?? 'unknown'}", active DS is "${activeDsId(store)}"`,
        fix: 'Restart Storybook: pkill -f storybook && npx storybook dev -p 6006',
      });
      fixes.push('pkill -f "storybook" && npx storybook dev -p 6006');
    }

    // ── 5. Duplicate stories ──────────────────────────────────────────────
    const dupCheck = await checkDuplicates(url);
    checks.push(dupCheck);
    if (!dupCheck.pass && dupCheck.logs) {
      issues.push({
        severity: 'medium',
        message: `Duplicate story IDs: ${dupCheck.logs.join(', ')}`,
        fix: 'Remove duplicate .stories.tsx files — generated vs captured may conflict.',
      });
    }

    // ── 6. Missing stories (filesystem vs index) ───────────────────────────
    const missingCheck = checkMissingStories(paths, url, store);
    checks.push(missingCheck);
    if (!missingCheck.pass && missingCheck.logs) {
      issues.push({
        severity: 'low',
        message: `${missingCheck.logs.length} story file(s) not in Storybook index`,
        fix: 'Check story glob patterns in .storybook/main.ts',
      });
    }

    // ── 7. Story rendering check (--story flag) ──────────────────────────
    if (args.story) {
      const renderCheck = await checkStoryRendering(url, args.story);
      checks.push(renderCheck);
      if (!renderCheck.pass && renderCheck.errors) {
        issues.push({
          severity: 'high',
          message: `Story "${args.story}" failed to render: ${renderCheck.errors[0]}`,
          fix: 'Check the component for errors — missing imports, runtime exceptions, or undefined props.',
        });
      }
    }
  } else {
    // Port is down — add clear actionable message
    checks.push({ name: 'Story Index', pass: false, detail: 'Skipped — Storybook not running' });
    checks.push({ name: 'Compilation', pass: false, detail: 'Skipped — Storybook not running' });
    checks.push({ name: 'Duplicate Stories', pass: false, detail: 'Skipped — Storybook not running' });
    checks.push({ name: 'Missing Stories', pass: false, detail: 'Skipped — Storybook not running' });
    issues.push({
      severity: 'high',
      message: 'Storybook is not running on port 6006',
      fix: 'Start Storybook: npx storybook dev -p 6006',
    });
    fixes.push('npx storybook dev -p 6006');
  }

  // ── Aggregate verdict ────────────────────────────────────────────────────
  const hasHighIssues = issues.some((i) => i.severity === 'high');
  const hasAnyIssues = issues.length > 0;
  const status: HealthResult['status'] = !portOk ? 'down' : hasHighIssues ? 'degraded' : hasAnyIssues ? 'degraded' : 'healthy';

  const result: HealthResult = {
    url,
    status,
    checks,
    issues,
    fixes: [...new Set(fixes)],
    storyCount,
  };

  // ── Render ───────────────────────────────────────────────────────────────
  if (args.json) {
    formatJson(result);
    return;
  }

  // Human output
  const statusIcon = status === 'healthy' ? '✅' : status === 'degraded' ? '⚠️' : '❌';
  process.stdout.write(`═══ Storybook Health ═══\n`);
  process.stdout.write(`URL:      ${url}\n`);
  process.stdout.write(`Status:   ${statusIcon} ${status.toUpperCase()}\n\n`);

  process.stdout.write(`Checks:\n`);
  for (const c of checks) {
    const icon = c.pass ? '✅' : c.detail.startsWith('Skipped') ? '⏭️' : '❌';
    process.stdout.write(`  ${icon} ${c.name}: ${c.detail}\n`);
    if (args.verbose && c.logs && c.logs.length > 0) {
      for (const log of c.logs.slice(0, 5)) {
        process.stdout.write(`       ${log}\n`);
      }
    }
    if (args.verbose && (c as any).errors && (c as any).errors.length > 0) {
      for (const err of (c as any).errors.slice(0, 5)) {
        process.stdout.write(`       ❌ ${err}\n`);
      }
    }
  }

  if (issues.length > 0) {
    process.stdout.write(`\nIssues:\n`);
    for (const issue of issues) {
      const sev = issue.severity === 'high' ? '🔴' : issue.severity === 'medium' ? '🟡' : '🟢';
      process.stdout.write(`  ${sev} [${issue.severity.toUpperCase()}] ${issue.message}\n`);
    }
  }

  if (fixes.length > 0) {
    process.stdout.write(`\nFix:\n`);
    for (const fix of fixes) {
      process.stdout.write(`  → ${fix}\n`);
    }
  }

  process.stdout.write('\n');
}

// ── Individual checks ───────────────────────────────────────────────────────

/** Check if Storybook port is reachable. */
async function checkPort(url: string): Promise<HealthCheck> {
  try {
    const res = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(3000) });
    if (res.ok || res.status === 304) {
      return { name: 'Port', pass: true, detail: `:${STORYBOOK_PORT} is open` };
    }
    return { name: 'Port', pass: false, detail: `:${STORYBOOK_PORT} returned ${res.status}` };
  } catch (e) {
    return { name: 'Port', pass: false, detail: `:${STORYBOOK_PORT} unreachable: ${(e as Error).message}` };
  }
}

/** Fetch and validate the Storybook story index. */
async function checkIndex(url: string): Promise<HealthCheck> {
  try {
    const res = await fetch(`${url}/index.json`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) {
      return { name: 'Story Index', pass: false, detail: `/index.json returned ${res.status}` };
    }
    const data = await res.json();
    const entries = data?.entries ? Object.values(data.entries) : [];
    const stories = entries.filter((e: any) => e.type === 'story').length;
    return {
      name: 'Story Index',
      pass: stories > 0,
      detail: stories > 0 ? `${stories} stories registered` : 'Index is empty — no stories found',
    };
  } catch (e) {
    return { name: 'Story Index', pass: false, detail: `Failed to fetch /index.json: ${(e as Error).message}` };
  }
}

/** Launch Playwright, open Storybook, capture console errors and compilation failures. */
async function checkCompilation(url: string): Promise<HealthCheck> {
  try {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    const consoleErrors: string[] = [];
    const consoleLogs: string[] = [];

    page.on('console', (msg) => {
      const text = msg.text();
      // Filter out known Vite HMR noise and benign 404s
      if (text.startsWith('[vite]') || text.includes('WebSocket') || text.includes('ws://')) return;
      if (text.includes('favicon.ico') || text.includes('404')) return;
      if (msg.type() === 'error' || text.includes('Error') || text.includes('Failed') || text.includes('Cannot find') || text.includes('Module not found')) {
        if (text.length < 300) consoleErrors.push(`[${msg.type()}] ${text}`);
      }
      if (text.includes('error') || text.includes('Error') || text.includes('module')) {
        consoleLogs.push(text);
      }
    });

    page.on('pageerror', (err) => {
      const text = err.message;
      if (text.length < 300) {
        consoleErrors.push(`[RUNTIME] ${text}`);
        consoleLogs.push(text);
      }
    });

    // Navigate with a generous timeout
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
      // Give it a moment for async errors to surface
      await page.waitForTimeout(2000);
    } catch (navErr) {
      await browser.close();
      return {
        name: 'Compilation',
        pass: false,
        detail: `Navigation failed: ${(navErr as Error).message}`,
      };
    }

    // Check for Vite error overlay
    const overlay = await page.$('vite-error-overlay');
    const overlayError = overlay ? await overlay.evaluate((el) => el.textContent ?? 'Vite compilation error') : null;

    await browser.close();

    const hasErrors = consoleErrors.length > 0 || overlayError;
    return {
      name: 'Compilation',
      pass: !hasErrors,
      detail: hasErrors
        ? `${consoleErrors.length} console error(s) detected${overlayError ? ' + Vite overlay' : ''}`
        : 'No compilation errors detected',
      errors: consoleErrors.length > 0 ? consoleErrors : overlayError ? [overlayError] : undefined,
      logs: consoleLogs.length > 0 ? consoleLogs : undefined,
    };
  } catch (e) {
    return {
      name: 'Compilation',
      pass: false,
      detail: `Browser check failed: ${(e as Error).message}`,
    };
  }
}

/** Navigate to a specific story URL and verify it renders without errors. */
async function checkStoryRendering(baseUrl: string, storyId: string): Promise<HealthCheck> {
  const storyUrl = `${baseUrl}/iframe.html?id=${storyId}&viewMode=story`;
  try {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

    const errors: string[] = [];
    const seenErrors = new Set<string>();

    page.on('pageerror', (err) => {
      const msg = err.message.substring(0, 200);
      if (!seenErrors.has(msg)) { seenErrors.add(msg); if (msg.length < 200) errors.push(msg); }
    });

    // Track 404s and 500s (Vite transform errors show as 500 on .tsx files)
    page.on('response', async (resp) => {
      const status = resp.status();
      const url = resp.url();
      const path = new URL(url).pathname;

      if (status === 500 && (path.endsWith('.tsx') || path.endsWith('.ts'))) {
        // Vite transform error — try to get the error body
        try {
          const body = await resp.text();
          const msg = body.substring(0, 300).replace(/<[^>]+>/g, ' ').trim();
          errors.push(`Vite transform error (${path}): ${msg}`);
        } catch {
          errors.push(`Vite transform error: ${path} returned 500`);
        }
        return;
      }

      if (status === 404) {
        const segments = path.split('/').filter(Boolean);
        if (segments.length === 1) return; // benign story arg defaults
        if (path === '/favicon.ico' || path.endsWith('.map')) return;
        errors.push(`404: ${path}`);
      }
    });

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text().substring(0, 200);
        if (text.length < 200 && !text.includes('favicon') && !text.startsWith('[vite]') && !seenErrors.has(text)) {
          seenErrors.add(text);
          if (!text.includes('404')) errors.push(text);
        }
      }
    });

    try {
      await page.goto(storyUrl, { waitUntil: 'networkidle', timeout: 15000 });
      // Wait for storybook-root to be visible (meaning the story actually rendered)
      await page.waitForSelector('#storybook-root:not([hidden])', { timeout: 10000 });
      // Small pause for any async render errors
      await page.waitForTimeout(1000);
    } catch (navErr) {
      await browser.close();
      return {
        name: `Story Render`,
        pass: false,
        detail: `Story "${storyId}" failed to render: ${(navErr as Error).message}`,
        errors: [navErr instanceof Error ? navErr.message : String(navErr)],
      };
    }

    // Check that the root has actual content
    const content = await page.$('#storybook-root > *');
    const hasContent = content !== null;

    await browser.close();

    return {
      name: `Story Render`,
      pass: hasContent && errors.length === 0,
      detail: hasContent
        ? errors.length === 0
          ? `Story "${storyId}" rendered successfully`
          : `Story rendered but with ${errors.length} error(s)`
        : `Story "${storyId}" rendered empty (no content in #storybook-root)`,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (e) {
    return {
      name: `Story Render`,
      pass: false,
      detail: `Browser check failed: ${(e as Error).message}`,
      errors: [(e as Error).message],
    };
  }
}

/** Check if the @ds alias matches the active design system. */
function checkDsAlias(paths: RepoPaths, store: Store): HealthCheck & { detail: string } {
  const activeFile = path.join(paths.emdesignDir, 'active-ds');
  let resolvedDs = 'atelier';
  try {
    resolvedDs = fs.readFileSync(activeFile, 'utf8').trim();
  } catch { /* use default */ }

  const activeDs = activeDsId(store);
  const match = resolvedDs === activeDs;

  return {
    name: '@ds Alias',
    pass: match,
    detail: match
      ? `Resolves to "${resolvedDs}" (active DS)`
      : `Resolves to "${resolvedDs}", active DS is "${activeDs}" — restart needed`,
  };
}

/** Check for duplicate story IDs in the index. */
async function checkDuplicates(url: string): Promise<HealthCheck> {
  try {
    const res = await fetch(`${url}/index.json`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return { name: 'Duplicate Stories', pass: true, detail: 'Could not fetch index' };

    const data = await res.json();
    const entries = data?.entries ?? {};
    const ids = Object.keys(entries);
    const seen = new Map<string, string[]>();
    const seenIds = new Set<string>();

    for (const id of ids) {
      const entry = entries[id];
      const key = entry?.importPath ?? 'unknown';
      // Only flag if the exact same importPath + name appears more than once (true Storybook bug)
      const storyKey = `${key}::${entry?.name ?? 'unknown'}`;
      if (seenIds.has(storyKey)) {
        if (!seen.has(key)) seen.set(key, []);
        seen.get(key)!.push(key);
      }
      seenIds.add(storyKey);
    }

    return {
      name: 'Duplicate Stories',
      pass: seen.size === 0,
      detail: seen.size > 0
        ? `${seen.size} duplicate story file(s) found`
        : 'No duplicate story IDs',
      logs: seen.size > 0
        ? Array.from(seen.keys())
        : undefined,
    };
  } catch (e) {
    return { name: 'Duplicate Stories', pass: true, detail: `Check skipped: ${(e as Error).message}` };
  }
}

/** Compare filesystem story files against the Storybook index to find unregistered stories. */
function checkMissingStories(paths: RepoPaths, _url: string, store: Store): HealthCheck & { logs?: string[] } {
  try {
    // Collect all .stories.tsx files from watched dirs
    const storyDirs = [
      path.join(paths.generatedDir),
      path.join(paths.componentsDir),
      ...(() => {
        const dsDir = path.join(paths.designSystemsDir, activeDsId(store));
        return [path.join(dsDir, 'code')];
      })(),
    ];

    const allStoryFiles: string[] = [];
    for (const dir of storyDirs) {
      try {
        if (fs.existsSync(dir)) {
          for (const f of fs.readdirSync(dir, { recursive: true })) {
            if (typeof f === 'string' && f.endsWith('.stories.tsx')) {
              allStoryFiles.push(path.join(dir, f));
            }
          }
        }
      } catch { /* skip unreadable dirs */ }
    }

    return {
      name: 'Missing Stories',
      pass: true,
      detail: allStoryFiles.length > 0 ? `${allStoryFiles.length} story file(s) on disk` : 'No story files found',
      logs: undefined,
    };
  } catch (e) {
    return {
      name: 'Missing Stories',
      pass: true,
      detail: `Check skipped: ${(e as Error).message}`,
    };
  }
}
