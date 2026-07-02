// Test template: craft-sections
// Agent: copy this file, replace <Name> and <HtmlPath>, write to src/__tests__/<Name>-sections.test.ts
// Then run: $ npx vitest run src/__tests__/<Name>-sections.test.ts --reporter=json
//
// Levels: Page (structure, sections, navigation)
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import { checkPage, assertPageHasSections, assertHasPageStructure } from '@emdesign/testing';

const name = '<Name>';
const htmlPath = '<HtmlPath>'; // e.g. rendered page HTML file

describe(`${name} sections`, () => {
  const html = fs.existsSync(htmlPath) ? fs.readFileSync(htmlPath, 'utf8') : '';

  it('has page structure (header, main, footer)', () => {
    expect(() => assertHasPageStructure(html)).not.toThrow();
  });

  it('has all required sections', () => {
    const sections = [
      { role: 'banner' },
      { role: 'main' },
      { role: 'contentinfo' },
    ];
    expect(() => assertPageHasSections(html, sections)).not.toThrow();
  });

  it('returns passing page check', () => {
    const result = checkPage(html, { html, tokens: [], classes: [], textContent: '' });
    expect(result.ok).toBe(true);
  });
});
