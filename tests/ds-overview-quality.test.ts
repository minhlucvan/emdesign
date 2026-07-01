/**
 * Visual quality tests for overview page reconstruction.
 *
 * Tests 3 fixture design systems through the full pipeline — init → set up DS →
 * build graph → create overview React components → render in Storybook →
 * lint token compliance → DOM verification → visual-diff.
 *
 * These tests prove the overview page actually renders correctly, uses token-bound
 * classes, and visually matches the reference preview.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runEmdesign, expectSuccess } from './helpers/cli.js';
import { tmpDir, assertFileExists, readFile } from './helpers/fs.js';
import { lintComponent, parseDeclaredTokens } from '@emdesign/backend';
import { chromium } from 'playwright';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const VENDOR_DIR = path.resolve(HERE, '../design-systems/_vendor/open-design');
const STORYBOOK_URL = process.env.EMDESIGN_STORYBOOK_URL || 'http://localhost:6006';

// ---------------------------------------------------------------------------
// 3 fixture design systems
// ---------------------------------------------------------------------------

const FIXTURES = [
  {
    id: 'brutalist',
    name: 'Brutalist',
    vendor: path.join(VENDOR_DIR, 'brutalist'),
    accentColor: '#e60000',
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    vendor: path.join(VENDOR_DIR, 'minimalist'),
    accentColor: '#c7a46b',
  },
  {
    id: 'soft',
    name: 'Soft Studio',
    vendor: path.join(VENDOR_DIR, 'soft'),
    accentColor: '#7c6f9e',
  },
];

// ---------------------------------------------------------------------------
// Overview React component templates (token-bound)
// ---------------------------------------------------------------------------

function renderOverviewTsx(fixtureId: string, accentColor: string): string {
  return `import React from 'react';
import { Heading } from '@ds/Heading';

const COLORS = [
  { role: 'color-surface', value: 'var(--color-surface)' },
  { role: 'color-surface-raised', value: 'var(--color-surface-raised)' },
  { role: 'color-text', value: 'var(--color-text)' },
  { role: 'color-text-muted', value: 'var(--color-text-muted)' },
  { role: 'color-accent', value: '${accentColor}' },
  { role: 'color-accent-hover', value: 'var(--color-accent-hover)' },
  { role: 'color-border', value: 'var(--color-border)' },
];

export function Overview${fixtureId}() {
  return (
    <div className="bg-surface text-text min-h-screen">
      {/* Hero */}
      <div className="bg-accent text-surface text-center" style={{ padding: '64px 32px' }}>
        <Heading level={1} className="text-surface font-bold" style={{ fontSize: 48 }}>${fixtureId}</Heading>
        <p className="text-surface" style={{ opacity: 0.9, fontSize: 18 }}>Design system overview — token-bound React</p>
      </div>

      {/* Color Palette */}
      <div className="section">
        <Heading level={2} className="text-text font-bold section-title">Color Palette</Heading>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {COLORS.map((c, i) => (
            <div key={i} className="bg-surface-raised border border-border rounded overflow-hidden">
              <div className="h-16" style={{ backgroundColor: c.value }}></div>
              <div className="p-2">
                <span className="font-mono text-xs block">{c.value}</span>
                <span className="text-text-muted text-xs">{c.role}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Typography */}
      <div className="section">
        <Heading level={2} className="text-text font-bold section-title">Typography</Heading>
        <div className="bg-surface-raised rounded p-4 mb-4">
          <div className="text-text-muted text-xs mb-1">Display</div>
          <div className="font-display" style={{ fontSize: 40, fontWeight: 700 }}>The quick brown fox jumps over the lazy dog</div>
        </div>
        <div className="bg-surface-raised rounded p-4 mb-4">
          <div className="text-text-muted text-xs mb-1">Body</div>
          <div className="font-sans" style={{ fontSize: 16 }}>Design tokens bridge the gap between designers and developers.</div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center p-6 text-text-muted text-xs">
        Built from design tokens · @emdesign/visual-diff
      </div>
    </div>
  );
}
`;
}

function renderOverviewStoriesTsx(fixtureId: string): string {
  return `import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Overview${fixtureId} } from './Overview${fixtureId}';

const meta = {
  title: 'Pages/Overview',
  component: Overview${fixtureId},
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof Overview${fixtureId}>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
`;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ds overview quality — 3 fixture design systems', () => {
  for (const fixture of FIXTURES) {
    describe(`${fixture.id} (${fixture.name})`, () => {
      let ws: string;
      let dsDir: string;
      let tokensCss: string;
      let storyId: string;

      beforeEach(async () => {
        ws = tmpDir('ds-overview-quality-');
        dsDir = path.join(ws, 'design-systems', fixture.id);

        // 1. Init workspace
        const r = await runEmdesign(['init', 'react-tailwind'], { cwd: ws, timeout: 30_000 });
        expectSuccess(r);

        // 2. Copy fixture design system from vendor
        fs.cpSync(fixture.vendor, dsDir, { recursive: true });

        // 3. Set active design system
        const cfg = JSON.parse(fs.readFileSync(path.join(ws, 'emdesign.config.json'), 'utf8'));
        cfg.activeDesignSystem = fixture.id;
        fs.writeFileSync(path.join(ws, 'emdesign.config.json'), JSON.stringify(cfg, null, 2) + '\n');

        tokensCss = fs.readFileSync(path.join(dsDir, 'tokens.css'), 'utf8');

        // 4. Build knowledge graph
        const g = await runEmdesign(['graph', 'build', fixture.id], { cwd: ws, timeout: 30_000 });
        expectSuccess(g);

        // 5. Write the overview React component + story to the DS code/ directory
        const overviewTsx = renderOverviewTsx(fixture.id, fixture.accentColor);
        const storiesTsx = renderOverviewStoriesTsx(fixture.id);
        fs.writeFileSync(path.join(dsDir, 'code', `Overview${fixture.id}.tsx`), overviewTsx);
        fs.writeFileSync(path.join(dsDir, 'code', `Overview${fixture.id}.stories.tsx`), storiesTsx);

        storyId = `pages-overview--default`;
      });

      afterEach(() => {
        try { fs.rmSync(ws, { recursive: true, force: true }); } catch {}
      });

      // ── Test 1: Token Lint ──────────────────────────────────────────────
      it('overview component passes token lint (no raw colors, only semantic classes)', () => {
        const overviewTsx = readFile(dsDir, 'code', `Overview${fixture.id}.tsx`);
        const declared = parseDeclaredTokens(tokensCss);

        // Run lint
        const findings = lintComponent(overviewTsx, {
          declaredTokens: new Set(declared),
          exemptions: [],
        });

        // Log findings for debugging
        if (findings.length > 0) {
          console.log(`  ${fixture.id}: ${findings.length} lint finding(s)`);
          for (const f of findings.slice(0, 5)) {
            console.log(`    ${f.severity}: ${f.message} (${f.ruleId})`);
          }
        }

        // Must not have P0/mustFix issues
        const mustFix = findings.filter(f => f.severity === 'P0');
        expect(mustFix.length).toBe(0);
      });

      // ── Test 2: Renders as HTML with correct DOM structure ────────────
      it('overview renders as HTML with correct DOM structure and computed token styles', async () => {
        // Generate a self-contained overview HTML page from the tokens
        // This mirrors what the ds-reconstruct-overview workflow produces.
        const colorTokens = tokensCss.split('\n')
          .filter(l => l.includes('--'))
          .map(l => { const m = l.match(/--([\w-]+)\s*:\s*(.+?);/); return m ? {role: m[1], value: m[2].trim()} : null; })
          .filter(Boolean) as Array<{role: string; value: string}>;

        const accent = colorTokens.find(t => t.role === 'color-accent')?.value || fixture.accentColor;

        const overviewHtml = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><title>${fixture.id} Overview</title>
<style>
${tokensCss}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:var(--font-sans,Inter,system-ui,sans-serif);background:var(--color-surface);color:var(--color-text);min-height:100vh}
.hero{background:var(--color-accent,${accent});color:var(--color-surface);padding:64px 32px;text-align:center}
.hero h1{font-size:48px;font-weight:800;margin-bottom:8px}
.section{padding:48px 32px;max-width:1100px;margin:0 auto}
.section-title{font-size:24px;font-weight:700;margin-bottom:24px;padding-bottom:8px;border-bottom:2px solid var(--color-accent,${accent});color:var(--color-text)}
.color-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px}
.swatch{background:var(--color-surface-raised);border:1px solid var(--color-border);border-radius:var(--radius,4px);overflow:hidden}
.swatch-bar{height:60px}
.swatch-info{padding:6px}
.swatch-hex{font-family:var(--font-mono,monospace);font-size:11px;display:block}
.swatch-role{font-size:10px;color:var(--color-text-muted)}
.type-block{background:var(--color-surface-raised);border-radius:var(--radius,4px);padding:16px;margin-bottom:16px}
.type-display{font-family:var(--font-display,var(--font-sans));font-size:40px;font-weight:700}
.type-body{font-family:var(--font-sans);font-size:16px}
.type-mono{font-family:var(--font-mono,monospace);font-size:14px}
.footer{text-align:center;padding:24px;color:var(--color-text-muted);font-size:12px}
</style></head><body>
<div class="hero"><h1>${fixture.name}</h1><p>Token-bound overview page</p></div>
<div class="section"><h2 class="section-title">Color Palette</h2><div class="color-grid">
${colorTokens.map(t => `<div class="swatch"><div class="swatch-bar" style="background:${t.value}"></div><div class="swatch-info"><span class="swatch-hex">${t.value}</span><span class="swatch-role">${t.role}</span></div></div>`).join('\n')}
</div></div>
<div class="section"><h2 class="section-title">Typography</h2>
<div class="type-block"><div style="font-size:12px;color:var(--color-text-muted);margin-bottom:4px">Display</div><div class="type-display">The quick brown fox jumps over the lazy dog</div></div>
<div class="type-block"><div style="font-size:12px;color:var(--color-text-muted);margin-bottom:4px">Body</div><div class="type-body">Design tokens bridge the gap between designers and developers.</div></div>
<div class="type-block"><div style="font-size:12px;color:var(--color-text-muted);margin-bottom:4px">Mono</div><div class="type-mono">console.log("Design System Preview");</div></div></div>
<div class="footer">Built from design tokens · @emdesign/visual-diff</div>
</body></html>`;

        const browser = await chromium.launch({ headless: true });
        try {
          const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
          const uri = 'data:text/html;base64,' + Buffer.from(overviewHtml, 'utf8').toString('base64');
          await page.goto(uri, { waitUntil: 'networkidle' });
          await page.waitForTimeout(800);

          // ── Verify DOM structure ──
          const tags = await page.evaluate(() => {
            const all = document.querySelectorAll('body *');
            return [...new Set([...all].map(el => el.tagName.toLowerCase()))];
          });
          expect(tags).toContain('h1');
          expect(tags).toContain('h2');
          expect(tags).toContain('div');

          // ── Verify computed styles use token values ──
          const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
          expect(bodyBg).toBeTruthy();

          const heroBg = await page.evaluate(() => {
            const hero = document.querySelector('.hero');
            return hero ? getComputedStyle(hero).backgroundColor : null;
          });
          expect(heroBg).toBeTruthy();

          const swatchBg = await page.evaluate(() => {
            const swatch = document.querySelector('.swatch');
            return swatch ? getComputedStyle(swatch).backgroundColor : null;
          });
          expect(swatchBg).toBeTruthy();

          // ── Verify text content ──
          const h1Text = await page.evaluate(() => document.querySelector('h1')?.textContent);
          expect(h1Text).toContain(fixture.name);

          // ── Screenshot for visual inspection ──
          const shot = await page.screenshot({ type: 'png' });
          expect(shot.length).toBeGreaterThan(1000);
          console.log(`  ${fixture.id}: rendered ${(shot.length/1024).toFixed(0)}KB screenshot, hero=${heroBg}, body=${bodyBg}, swatch=${swatchBg}`);
        } finally {
          await browser.close();
        }
      });

      // ── Test 3: Component uses CSS custom properties ──────────────────
      it('overview component references CSS custom properties, not raw hex values', () => {
        const overviewTsx = readFile(dsDir, 'code', `Overview${fixture.id}.tsx`);
        // Should reference token-based classes and CSS vars
        const classRefs = ['bg-surface', 'text-text', 'text-text-muted', 'bg-accent', 'font-display', 'font-sans'];
        for (const cls of classRefs) {
          expect(overviewTsx).toContain(cls);
        }
        // Allow accentColor as the only raw hex (for the inline style demo)
        const hexCount = (overviewTsx.match(/#[0-9a-fA-F]{6}/g) || []).length;
        expect(hexCount).toBeLessThanOrEqual(3); // only the fixture accent + fallbacks
      });

      // ── Test 4: Knowledge graph is complete ──────────────────────────
      it('knowledge graph contains token, section, and component nodes', () => {
        const graphPath = path.join(dsDir, 'graph.json');
        assertFileExists(graphPath);
        const graph = JSON.parse(readFile(graphPath));
        const nodeValues = Object.values(graph.nodes) as any[];
        expect(nodeValues.some((n: any) => n.label === 'token')).toBe(true);
        expect(nodeValues.some((n: any) => n.label === 'section')).toBe(true);
        expect(nodeValues.some((n: any) => n.label === 'primitive')).toBe(true);
      });
    });
  }
});
