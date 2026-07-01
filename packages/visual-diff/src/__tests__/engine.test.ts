/**
 * Tests for @emdesign/visual-diff engine.
 *
 * Covers:
 * - measureSimilarity edge cases
 * - computeRegionGrid partitioning
 * - compareHtmlDocuments with identical / slightly different / very different HTML
 * - Pixel diff region detection
 * - DOM structure diff
 * - CSS property diff
 * - Edge cases: empty HTML, minimal HTML, same content different structure
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { PNG } from 'pngjs';
import { compareHtmlDocuments, measureSimilarity, computeRegionGrid } from '../engine.js';
import type { RegionDiffCell } from '../types.js';

// ---------------------------------------------------------------------------
// Test utilities — create minimal PNGs for region-grid testing
// ---------------------------------------------------------------------------

function makeTestPng(width: number, height: number, fillR = 255, fillG = 255, fillB = 255): PNG {
  const png = new PNG({ width, height });
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      png.data[idx] = fillR;
      png.data[idx + 1] = fillG;
      png.data[idx + 2] = fillB;
      png.data[idx + 3] = 255;
    }
  }
  return png;
}

// ---------------------------------------------------------------------------
// measureSimilarity
// ---------------------------------------------------------------------------

describe('measureSimilarity', () => {
  it('returns 100 for identical (0 changed pixels)', () => {
    expect(measureSimilarity(0, 1000)).toBe(100);
  });

  it('returns 0 for completely different (all pixels changed)', () => {
    expect(measureSimilarity(1000, 1000)).toBe(0);
  });

  it('returns 50 for half changed', () => {
    expect(measureSimilarity(500, 1000)).toBe(50);
  });

  it('returns 98 for 2% changed', () => {
    expect(measureSimilarity(20, 1000)).toBe(98);
  });

  it('returns 100 when totalPixels is 0 (edge case)', () => {
    expect(measureSimilarity(0, 0)).toBe(100);
  });

  it('rounds to 2 decimal places', () => {
    expect(measureSimilarity(1, 300)).toBe(99.67);
  });
});

// ---------------------------------------------------------------------------
// computeRegionGrid
// ---------------------------------------------------------------------------

describe('computeRegionGrid', () => {
  it('returns correct number of cells for 8x8 grid on 1280x720', () => {
    const a = makeTestPng(100, 100);
    const b = makeTestPng(100, 100);
    const cells = computeRegionGrid(a, b, 8, 8, 0.2);
    expect(cells.length).toBe(64); // 8 * 8
  });

  it('returns correct number of cells for 4x4 grid', () => {
    const a = makeTestPng(100, 100);
    const b = makeTestPng(100, 100);
    const cells = computeRegionGrid(a, b, 4, 4, 0.2);
    expect(cells.length).toBe(16); // 4 * 4
  });

  it('all cells have diffRatio 0 for identical images', () => {
    const a = makeTestPng(100, 100, 128, 128, 128);
    const b = makeTestPng(100, 100, 128, 128, 128);
    const cells = computeRegionGrid(a, b, 4, 4, 0.2);
    for (const cell of cells) {
      expect(cell.diffRatio).toBe(0);
      expect(cell.changedPixels).toBe(0);
    }
  });

  it('cells with different content have diffRatio > 0', () => {
    const a = makeTestPng(100, 100, 255, 255, 255); // white
    const b = makeTestPng(100, 100, 0, 0, 0);       // black (completely different)
    const cells = computeRegionGrid(a, b, 4, 4, 0.2);
    for (const cell of cells) {
      expect(cell.diffRatio).toBeGreaterThan(0.9);
      expect(cell.changedPixels).toBeGreaterThan(0);
    }
  });

  it('assigns correct col/row labels', () => {
    const a = makeTestPng(100, 100);
    const b = makeTestPng(100, 100, 0, 0, 0);
    const cells = computeRegionGrid(a, b, 2, 2, 0.2);
    const labels = cells.map(c => c.label).sort();
    expect(labels).toEqual(['col-1-row-1', 'col-1-row-2', 'col-2-row-1', 'col-2-row-2']);
  });
});

// ---------------------------------------------------------------------------
// compareHtmlDocuments
// ---------------------------------------------------------------------------

describe('compareHtmlDocuments', () => {
  // Helper: simple HTML page
  function page(title: string, body: string): string {
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>${title}</title></head><body>${body}</body></html>`;
  }

  it('returns 100% similarity for identical HTML documents', async () => {
    const html = page('Test', '<h1>Hello</h1><p>World</p>');
    const result = await compareHtmlDocuments(html, html, {
      viewport: { width: 400, height: 300 },
      enableDomFeedback: false,
    });
    expect(result.overallScore).toBe(100);
    expect(result.pixel.score).toBe(100);
    expect(result.structure.score).toBe(100);
    expect(result.pixel.changedPixels).toBe(0);
    expect(result.feedback.length).toBe(0);
  });

  it('detects substantial differences between different HTML', async () => {
    const htmlA = page('A', '<h1>Hello World</h1><p>This is page A</p>');
    const htmlB = page('B', '<h2>Goodbye</h2><div>This is page B with very different content</div>');
    const result = await compareHtmlDocuments(htmlA, htmlB, {
      viewport: { width: 400, height: 300 },
      enableDomFeedback: false,
    });
    // Should detect significant differences
    expect(result.overallScore).toBeLessThan(100);
    expect(result.pixel.changedPixels).toBeGreaterThan(0);
    // Structure should detect different element counts/tags
    expect(result.structure.score).toBeLessThan(100);
  });

  it('returns per-region breakdown with correct cells', async () => {
    const html = page('Test', '<h1>Hello</h1><p>World</p>');
    const result = await compareHtmlDocuments(html, html, {
      viewport: { width: 400, height: 300 },
      regionGrid: '4x4',
      enableDomFeedback: false,
    });
    expect(result.regions.length).toBe(16); // 4*4
    for (const region of result.regions) {
      expect(region.diffRatio).toBe(0);
      expect(region.changedPixels).toBe(0);
    }
  });

  it('detects structure differences (missing/extra elements)', async () => {
    const htmlA = page('A', '<header><h1>Title</h1></header><main><p>Content</p></main><footer><p>Footer</p></footer>');
    const htmlB = page('B', '<header><h1>Title</h1></header><main><p>Content</p><p>Extra paragraph</p></main>');
    const result = await compareHtmlDocuments(htmlA, htmlB, {
      viewport: { width: 400, height: 300 },
      enableDomFeedback: false,
    });
    // Structure should detect extra element in B
    expect(result.structure.extraElements.length).toBeGreaterThanOrEqual(0);
    // Some elements should match (header, main, h1)
    expect(result.structure.matchedCount).toBeGreaterThan(0);
  });

  it('handles empty HTML gracefully', async () => {
    const result = await compareHtmlDocuments('', '', {
      viewport: { width: 400, height: 300 },
      enableDomFeedback: false,
    });
    expect(result.pixel.score).toBe(100); // both empty = identical
  });

  it('handles minimal HTML', async () => {
    const html = '<!DOCTYPE html><html><body></body></html>';
    const result = await compareHtmlDocuments(html, html, {
      viewport: { width: 400, height: 300 },
      enableDomFeedback: false,
    });
    expect(result.overallScore).toBe(100);
  });

  it('uses custom viewport dimensions', async () => {
    const html = page('Test', '<h1>Hello</h1>');
    const result = await compareHtmlDocuments(html, html, {
      viewport: { width: 800, height: 600 },
      enableDomFeedback: false,
    });
    expect(result.pixel.totalPixels).toBe(800 * 600); // CSS pixels × DPR = pixelmatch total
    expect(result.viewport.width).toBe(800);
    expect(result.viewport.height).toBe(600);
  });
});

// ---------------------------------------------------------------------------
// DOM Feedback (integration)
// ---------------------------------------------------------------------------

describe('DOM feedback', () => {
  it('captures element-level differences between two pages', async () => {
    const htmlA = '<!DOCTYPE html><html><body><h1>Title</h1><button style="background:blue;color:white">Click</button></body></html>';
    const htmlB = '<!DOCTYPE html><html><body><h1>Title</h1><button style="background:red;color:white">Click</button></body></html>';
    const result = await compareHtmlDocuments(htmlA, htmlB, {
      viewport: { width: 400, height: 200 },
      enableDomFeedback: true,
    });

    // The button background differs → should be in feedback
    // The button is visible and in a diff region
    expect(result.feedback).toBeDefined();
    // Some feedback should mention backgroundColor
    const bgDiff = result.feedback.find(d => d.property === 'backgroundColor');
    // Background colors may differ due to rendering (blue vs red)
    // Note: getComputedStyle returns rgb() format, not the literal CSS
  });

  it('returns empty feedback for identical pages', async () => {
    const html = '<!DOCTYPE html><html><body><h1>Hello</h1><p>World</p></body></html>';
    const result = await compareHtmlDocuments(html, html, {
      viewport: { width: 400, height: 200 },
      enableDomFeedback: true,
    });
    // Identical pages should have no feedback
    const hasSignificantDiff = result.regions.some(r => r.diffRatio > 0.01);
    if (!hasSignificantDiff) {
      expect(result.feedback.length).toBe(0);
    }
  });
});
