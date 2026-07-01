/**
 * `emdesign visual-diff <sourceA> <sourceB>` — Compare two HTML documents visually.
 *
 * Runs the full three-layer visual diff engine (pixel + structure + CSS) and
 * reports per-region scores, element-level diffs, and an overall similarity
 * percentage. Supports file paths and URLs.
 *
 * Usage:
 *   emdesign visual-diff file.html file2.html
 *   emdesign visual-diff preview.html http://localhost:6006/iframe.html?id=...
 *   emdesign visual-diff a.html b.html --viewport 1280x720 --json
 *   emdesign visual-diff a.html b.html --diff-output diff.png --grid 4x4
 */

import fs from 'node:fs';
import { formatJson, formatError } from '../lib/format.js';

export interface VisualDiffArgs {
  sourceA: string;
  sourceB: string;
  viewport?: string;
  threshold?: number;
  grid?: string;
  diffOutput?: string;
  json?: boolean;
}

// Extra params (paths, store) accepted for CLI compatibility but not used.
export async function cmdVisualDiff(args: VisualDiffArgs, _paths?: any, _store?: any): Promise<void> {
  const { sourceA, sourceB, viewport: vp, threshold, grid, diffOutput, json } = args;

  if (!sourceA || !sourceB) {
    formatError('usage: emdesign visual-diff <sourceA> <sourceB> [--viewport 1280x720] [--threshold 0.2] [--grid 8x8] [--diff-output diff.png] [--json]');
    process.exit(1);
  }

  // Parse viewport
  const viewport = parseViewport(vp);

  // Load HTML content (support file paths and URLs)
  const [htmlA, labelA] = await loadSource(sourceA);
  const [htmlB, labelB] = await loadSource(sourceB);

  // Dynamically import the visual-diff engine
  let visualDiff: typeof import('@emdesign/visual-diff');
  try {
    visualDiff = await import('@emdesign/visual-diff');
  } catch {
    formatError('visual-diff engine not available. Install @emdesign/visual-diff.');
    process.exit(1);
  }

  if (!json) {
    process.stderr.write(`[visual-diff] Comparing:\n  A: ${labelA}\n  B: ${labelB}\n`);
    process.stderr.write(`[visual-diff] Viewport: ${viewport.width}x${viewport.height}\n`);
  }

  // Run comparison
  const result = await visualDiff.compareHtmlDocuments(htmlA, htmlB, {
    viewport,
    threshold: threshold ?? 0.2,
    regionGrid: grid ?? '8x8',
    enableDomFeedback: true,
  });

  // Write diff image if requested
  if (diffOutput && result.pixel.diffPng) {
    fs.writeFileSync(diffOutput, result.pixel.diffPng);
    if (!json) process.stderr.write(`[visual-diff] Diff image written to ${diffOutput}\n`);
  }

  // Output
  if (json) {
    formatJson({
      overallScore: result.overallScore,
      pixel: {
        score: result.pixel.score,
        changedPixels: result.pixel.changedPixels,
        totalPixels: result.pixel.totalPixels,
        severity: result.pixel.severity,
        diffRegions: result.pixel.regions.length,
        diffImage: diffOutput || null,
      },
      structure: {
        score: result.structure.score,
        matchedElements: result.structure.matchedCount,
        missingElements: result.structure.missingElements.length,
        extraElements: result.structure.extraElements.length,
        baselineTotal: result.structure.baselineCount,
        targetTotal: result.structure.targetCount,
      },
      elementDiffs: result.elementDiffs.length,
      feedback: result.feedback.map(f => ({
        selector: f.selector,
        property: f.property,
        expected: f.baselineValue,
        actual: f.actualValue,
        severity: f.severity,
      })),
      regions: result.regions.map(r => ({
        label: r.label,
        diffRatio: r.diffRatio,
        changedPixels: r.changedPixels,
        totalPixels: r.totalPixels,
        hasDomFeedback: r.domFeedback !== null,
      })),
      timestamp: result.timestamp,
    });
  } else {
    const pass = result.overallScore >= 98;
    process.stdout.write(`\n`);
    process.stdout.write(`  OVERALL SCORE:  ${result.overallScore}%  ${pass ? '✅ PASS' : '❌ FAIL'}\n`);
    process.stdout.write(`  ─────────────────────────────────────────\n`);
    process.stdout.write(`  Pixel diff:     ${result.pixel.score.toFixed(1)}%  (${result.pixel.changedPixels.toLocaleString()} / ${result.pixel.totalPixels.toLocaleString()} px)\n`);
    process.stdout.write(`  Structure:      ${result.structure.score.toFixed(1)}%  (${result.structure.matchedCount} matched, ${result.structure.missingElements.length} missing, ${result.structure.extraElements.length} extra)\n`);
    process.stdout.write(`  CSS properties: ${result.elementDiffs.length} differing element(s)\n`);
    if (result.feedback.length > 0) {
      process.stdout.write(`\n  DOM Differences:\n`);
      for (const f of result.feedback.slice(0, 10)) {
        const icon = f.severity === 'high' ? '🔴' : f.severity === 'medium' ? '🟡' : '⚪';
        process.stdout.write(`    ${icon} ${f.selector} → ${f.property}: "${f.baselineValue}" → "${f.actualValue}"\n`);
      }
      if (result.feedback.length > 10) {
        process.stdout.write(`    ... and ${result.feedback.length - 10} more differences\n`);
      }
    }
    process.stdout.write(`\n`);
  }

  if (!pass) process.exit(1);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseViewport(vp?: string): { width: number; height: number } {
  if (!vp) return { width: 1280, height: 720 };
  const m = vp.match(/^(\d+)x(\d+)$/);
  if (!m) return { width: 1280, height: 720 };
  return { width: Math.max(320, parseInt(m[1], 10)), height: Math.max(240, parseInt(m[2], 10)) };
}

async function loadSource(source: string): Promise<[string, string]> {
  // URL
  if (source.startsWith('http://') || source.startsWith('https://')) {
    const resp = await fetch(source);
    if (!resp.ok) throw new Error(`Failed to fetch ${source}: ${resp.status}`);
    return [await resp.text(), source];
  }
  // File path
  return [fs.readFileSync(source, 'utf8'), source];
}
