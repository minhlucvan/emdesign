// Test template: overview-vs-preview
// Agent: copy this file, replace <DsId>, <DsIdRef>, <OverviewHtml>, <PreviewHtml>,
// write to src/__tests__/overview-<DsId>.test.ts
// Then run: $ npx vitest run src/__tests__/overview-<DsId>.test.ts --reporter=json
//
// Levels: Visual (token equivalence, HTML similarity)
// Use when comparing an imported design system's reference preview HTML
// against the reconstructed React overview page.
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import { resolveRepoPaths } from '@emdesign/backend';
import { checkDiff, checkVisualDiff } from '@emdesign/testing';

const paths = resolveRepoPaths();
const dsId = '<DsId>';           // imported/current design system
const dsIdRef = '<DsIdRef>';     // reference design system
const overviewHtmlPath = '<OverviewHtmlPath>';
const previewHtmlPath = '<PreviewHtmlPath>';

describe(`${dsId} overview vs preview`, () => {
  it('token declarations are equivalent', () => {
    const result = checkDiff(paths, dsId, dsIdRef);
    expect(result.ok).toBe(true);
  });

  it('overview HTML matches preview HTML structurally', async () => {
    const overview = fs.existsSync(overviewHtmlPath) ? fs.readFileSync(overviewHtmlPath, 'utf8') : '';
    const preview = fs.existsSync(previewHtmlPath) ? fs.readFileSync(previewHtmlPath, 'utf8') : '';
    if (overview && preview) {
      const result = await checkVisualDiff(preview, overview);
      expect(result.similarity).toBeGreaterThanOrEqual(0.85);
    }
  });
});
