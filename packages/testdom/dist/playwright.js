/**
 * @emdesign/testdom/playwright — Playwright integration helpers.
 *
 * Clean, minimal API for running design rule evaluation in Playwright tests.
 *
 * Usage:
 * ```typescript
 * import { test, expect } from '@playwright/test';
 * import { evaluatePage } from '@emdesign/testdom/playwright';
 *
 * test('component meets design rules', async ({ page }) => {
 *   const report = await evaluatePage(page, tokens);
 *   expect(report.tokenBinding.passed).toBe(true);
 *   expect(report.antiPatterns.score).toBeGreaterThan(0.9);
 *   console.log(report.summary); // human-readable feedback
 * });
 * ```
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
// ── Clean API ─────────────────────────────────────────────────────
const TESTDOM_BUNDLE_CACHE = null;
function loadTestdomBundle() {
    const here = fileURLToPath(new URL('.', import.meta.url));
    // Walk up from dist/ to node_modules/@emdesign/testdom/dist/
    const bundlePath = resolve(here, '..', 'dist', 'index.js');
    return readFileSync(bundlePath, 'utf8');
}
/**
 * Navigate the current Playwright page, inject @emdesign/testdom,
 * evaluate all design rules against the rendered DOM.
 *
 * @param page - Playwright Page instance (already navigated or about to navigate)
 * @param tokens - Design system token map (name → value)
 * @param opts  - Optional: url to navigate to, spacingScale, minContrast
 * @returns Structured report with rule results + human-readable summary
 *
 * @example
 * ```ts
 * const report = await evaluatePage(page, tokens);
 * expect(report.tokenBinding.passed).toBe(true);
 * ```
 */
export async function evaluatePage(page, tokens, opts = {}) {
    // Navigate if URL provided
    if (opts.url) {
        await page.goto(opts.url, { waitUntil: 'networkidle', timeout: 30000 });
    }
    // Ensure we're on a page
    try {
        await page.evaluate('1');
    }
    catch {
        throw new Error('evaluatePage() requires a navigated page. Pass `url` or navigate before calling.');
    }
    // Inject testdom bundle
    const bundle = loadTestdomBundle();
    await page.addScriptTag({ content: bundle });
    // Evaluate rules in-browser
    const input = {
        declaredTokens: tokens,
        spacingScale: opts.spacingScale,
        minContrast: opts.minContrast,
    };
    const result = await page.evaluate((inp) => window.__emdesign.evaluateRules(inp), input);
    // Generate summary
    const summary = generateSummary(result);
    return { ...result, summary };
}
// ── Summary Generator ─────────────────────────────────────────────
function generateSummary(result) {
    const lines = [];
    const checks = [
        ['tokenBinding', 'Token Binding', result.tokenBinding],
        ['antiPatterns', 'Anti-Patterns', result.antiPatterns],
        ['spacing', 'Spacing', result.spacing],
        ['contrast', 'Contrast', result.contrast],
    ];
    let totalViolations = 0;
    for (const [, label, data] of checks) {
        totalViolations += data.violations.length;
        const icon = data.passed ? '✅' : '❌';
        const score = (data.score * 100).toFixed(0);
        lines.push(`${icon} ${label}: ${data.violations.length} violation(s) — score ${score}%`);
        for (const v of data.violations) {
            const sev = v.severity === 'error' ? '🔴' : '🟡';
            lines.push(`  ${sev} ${v.selector} (${v.tag})`);
            lines.push(`     ${v.expected}`);
            lines.push(`     Got: ${v.actual}`);
            if (v.fix)
                lines.push(`     💡 ${v.fix}`);
        }
    }
    const verdict = totalViolations === 0 ? '✅ All checks passed' : `❌ ${totalViolations} violation(s) found`;
    lines.push('───');
    lines.push(verdict);
    return lines.join('\n');
}
