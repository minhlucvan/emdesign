// Test template: responsive
// Agent: copy this file, replace <HtmlPath> and <ViewportWidths>,
// write to src/__tests__/responsive-<Name>.test.ts
// Then run: $ npx vitest run src/__tests__/responsive-<Name>.test.ts --reporter=json
//
// Levels: Page (responsive meta) + Visual (viewport-specific diffs)
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import { assertHasResponsiveMeta } from '@emdesign/testing';

const htmlPath = '<HtmlPath>';         // rendered page HTML

describe('responsive layout', () => {
  const html = fs.existsSync(htmlPath) ? fs.readFileSync(htmlPath, 'utf8') : '';

  it('has responsive viewport meta', () => {
    expect(() => assertHasResponsiveMeta(html)).not.toThrow();
  });

  it('contains media queries or responsive classes', () => {
    const hasMediaQuery = html.includes('@media');
    const hasResponsiveClasses = /(sm:|md:|lg:|xl:|grid-cols-|flex-col|flex-wrap)/.test(html);
    expect(hasMediaQuery || hasResponsiveClasses).toBe(true);
  });
});
