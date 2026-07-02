// Test template: craft-page
// Agent: copy this file, replace <Name> and <HtmlPath>, write to src/__tests__/<Name>-page.test.ts
// Then run: $ npx vitest run src/__tests__/<Name>-page.test.ts --reporter=json
//
// Levels: Page (structure, navigation, responsive, tokens) + Visual (similarity)
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import { checkPage, assertHasPageStructure, assertHasNavigation, assertHasResponsiveMeta, checkVisualDiff } from '@emdesign/testing';

const name = '<Name>';
const htmlPath = '<HtmlPath>';       // rendered page HTML
const baselinePath = '<BaselinePath>'; // baseline HTML for visual comparison

describe(`${name} page`, () => {
  const html = fs.existsSync(htmlPath) ? fs.readFileSync(htmlPath, 'utf8') : '';

  it('has page structure (header, main, footer)', () => {
    expect(() => assertHasPageStructure(html)).not.toThrow();
  });

  it('has navigation elements', () => {
    expect(() => assertHasNavigation(html)).not.toThrow();
  });

  it('has responsive support', () => {
    expect(() => assertHasResponsiveMeta(html)).not.toThrow();
  });

  it('returns passing page check', () => {
    const result = checkPage(html, { html, tokens: [], classes: [], textContent: '' });
    expect(result.ok).toBe(true);
  });

  it('matches baseline visually', async () => {
    const baseline = fs.existsSync(baselinePath) ? fs.readFileSync(baselinePath, 'utf8') : '';
    if (baseline) {
      const result = await checkVisualDiff(baseline, html);
      expect(result.similarity).toBeGreaterThanOrEqual(0.95);
    }
  });
});
