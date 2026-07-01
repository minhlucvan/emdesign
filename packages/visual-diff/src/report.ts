/**
 * Visual-diff report generation — structured fix instructions + HTML report.
 *
 * Takes a diff result and produces:
 *   1. Structured fix instructions (actionable per-element diffs for the agent)
 *   2. An HTML report page showing baseline vs actual vs diff, with annotations
 */

import type { HtmlDiffResult, DomElementDiff } from './types.js';

// ---------------------------------------------------------------------------
// Structured fix instructions
// ---------------------------------------------------------------------------

export interface FixInstruction {
  /** Which section/element to fix (e.g. "Hero section at y=0-400"). */
  target: string;
  /** Priority: high = must fix, medium = should fix, low = nice to have. */
  priority: 'high' | 'medium' | 'low';
  /** What property to change (e.g. "background-color", "font-size"). */
  property: string;
  /** The correct value from the baseline. */
  expectedValue: string;
  /** The current wrong value. */
  actualValue: string;
  /** CSS selector to the element. */
  selector: string;
  /** Human-readable description. */
  description: string;
}

/**
 * Convert DOM-level diffs into structured fix instructions for the agent.
 * Groups by severity, deduplicates by selector+property.
 */
export function generateFixInstructions(
  result: HtmlDiffResult,
  sectionLabel?: string,
): FixInstruction[] {
  const instructions: FixInstruction[] = [];
  const seen = new Set<string>();

  // From DOM feedback
  for (const f of result.feedback) {
    const key = `${f.selector}:${f.property}`;
    if (seen.has(key)) continue;
    seen.add(key);

    instructions.push({
      target: sectionLabel || `viewport region at ${f.box.x},${f.box.y}`,
      priority: f.severity,
      property: propertyToDescription(f.property),
      expectedValue: f.baselineValue,
      actualValue: f.actualValue,
      selector: f.selector,
      description: `${f.selector}: ${propertyToDescription(f.property)} should be "${f.baselineValue}", got "${f.actualValue}"`,
    });
  }

  // From structure diff
  if (result.structure.missingElements.length > 0) {
    instructions.push({
      target: sectionLabel || 'full page',
      priority: 'high',
      property: 'exists',
      expectedValue: 'present',
      actualValue: 'missing',
      selector: result.structure.missingElements[0].selector,
      description: `${result.structure.missingElements.length} element(s) missing from the overview that exist in the preview`,
    });
  }

  return instructions.sort((a, b) => {
    const rank = { high: 0, medium: 1, low: 2 };
    return rank[a.priority] - rank[b.priority];
  });
}

/**
 * Generate an HTML report page showing side-by-side comparison with
 * the diff overlay image embedded as base64.
 */
export function generateHtmlReport(
  result: HtmlDiffResult,
  baselineLabel: string,
  actualLabel: string,
  diffPngBase64?: string,
): string {
  const regions = result.regions
    .filter(r => r.diffRatio > 0.01)
    .map(r => `<tr>
      <td>${r.label}</td>
      <td>${(r.diffRatio * 100).toFixed(1)}%</td>
      <td>${r.changedPixels.toLocaleString()} / ${r.totalPixels.toLocaleString()}</td>
      <td>${r.domFeedback ? r.domFeedback.summary : '—'}</td>
    </tr>`).join('\n');

  const fixes = generateFixInstructions(result).slice(0, 15).map(f => `<tr>
    <td><span class="badge badge-${f.priority}">${f.priority}</span></td>
    <td><code>${f.selector}</code></td>
    <td>${f.property}</td>
    <td><code style="background:#e6ffe6">${escapeHtml(f.expectedValue)}</code></td>
    <td><code style="background:#ffe6e6">${escapeHtml(f.actualValue)}</code></td>
  </tr>`).join('\n');

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><title>Visual Diff Report</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:system-ui,sans-serif;background:#f5f5f5;color:#111;padding:32px;max-width:1200px;margin:0 auto}
h1{font-size:28px;font-weight:700;margin-bottom:8px}
h2{font-size:20px;font-weight:600;margin:24px 0 12px;padding-bottom:6px;border-bottom:2px solid #ddd}
.score{font-size:48px;font-weight:800;margin:16px 0}
.score.pass{color:#15803d}
.score.fail{color:#b91c1c}
.metrics{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;margin:16px 0}
.metric{background:#fff;border-radius:8px;padding:16px;border:1px solid #e5e5e5}
.metric-value{font-size:24px;font-weight:700}
.metric-label{font-size:12px;color:#666;margin-top:4px}
.diff-image{max-width:100%;border:1px solid #ddd;border-radius:8px}
table{width:100%;border-collapse:collapse;font-size:13px;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e5e5e5}
th,td{padding:8px 12px;text-align:left;border-bottom:1px solid #e5e5e5}
th{background:#f9f9f9;font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:.03em}
.badge{padding:2px 6px;border-radius:3px;font-size:10px;font-weight:600;text-transform:uppercase}
.badge-high{background:#fecaca;color:#991b1b}
.badge-medium{background:#fef3c7;color:#92400e}
.badge-low{background:#e0e7ff;color:#3730a3}
code{font-size:12px;padding:1px 4px;border-radius:3px;word-break:break-all}
.labels{display:flex;gap:16px;margin:16px 0;font-size:14px;color:#666}
</style></head><body>
<h1>Visual Diff Report</h1>
<p>${baselineLabel} vs ${actualLabel}</p>

<div class="score ${result.overallScore >= 98 ? 'pass' : 'fail'}">
  ${result.overallScore.toFixed(1)}% ${result.overallScore >= 98 ? '✅' : '❌'}
</div>

<div class="labels">
  <span>Baseline: ${baselineLabel}</span>
  <span>Actual: ${actualLabel}</span>
  <span>Viewport: ${result.viewport.width}×${result.viewport.height}</span>
</div>

${diffPngBase64 ? `<img class="diff-image" src="data:image/png;base64,${diffPngBase64}" alt="Diff overlay">` : ''}

<h2>Results</h2>
<div class="metrics">
  <div class="metric"><div class="metric-value">${result.pixel.score.toFixed(1)}%</div><div class="metric-label">Pixel Similarity</div></div>
  <div class="metric"><div class="metric-value">${result.structure.score.toFixed(1)}%</div><div class="metric-label">Structure Match</div></div>
  <div class="metric"><div class="metric-value">${result.structure.matchedCount}</div><div class="metric-label">Matched Elements</div></div>
  <div class="metric"><div class="metric-value">${result.pixel.changedPixels.toLocaleString()}</div><div class="metric-label">Changed Pixels</div></div>
  <div class="metric"><div class="metric-value">${result.pixel.severity.critical.toLocaleString()}</div><div class="metric-label">Critical Pixels</div></div>
  <div class="metric"><div class="metric-value">${result.feedback.length}</div><div class="metric-label">DOM Differences</div></div>
</div>

${regions ? `<h2>Per-Region Breakdown</h2>
<table><thead><tr><th>Region</th><th>Diff %</th><th>Pixels</th><th>Feedback</th></tr></thead><tbody>${regions}</tbody></table>` : ''}

${fixes ? `<h2>Fix Instructions</h2>
<table><thead><tr><th>Priority</th><th>Element</th><th>Property</th><th>Expected</th><th>Actual</th></tr></thead><tbody>${fixes}</tbody></table>` : ''}

<p style="margin-top:32px;font-size:11px;color:#999">Generated by @emdesign/visual-diff · ${new Date().toISOString()}</p>
</body></html>`;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function propertyToDescription(prop: string): string {
  const map: Record<string, string> = {
    backgroundColor: 'background color',
    color: 'text color',
    fontSize: 'font size',
    fontFamily: 'font family',
    fontWeight: 'font weight',
    lineHeight: 'line height',
    paddingTop: 'top padding',
    paddingLeft: 'left padding',
    paddingRight: 'right padding',
    paddingBottom: 'bottom padding',
    marginTop: 'top margin',
    marginLeft: 'left margin',
    width: 'width',
    height: 'height',
    display: 'display mode',
    borderRadius: 'border radius',
    borderTopWidth: 'top border width',
    borderBottomWidth: 'bottom border width',
    gap: 'gap',
    textAlign: 'text alignment',
    textContent: 'text content',
    exists: 'element presence',
    tagName: 'element type',
  };
  return map[prop] || prop.replace(/([A-Z])/g, ' $1').toLowerCase().trim();
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
