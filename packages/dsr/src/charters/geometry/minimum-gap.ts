/**
 * Framework Charter: geometry/minimum-gap
 *
 * "As adjacent sibling elements, I want at least a minimum visual gap between
 *  my edge and my sibling's edge, so the composition breathes."
 *
 * Layer: dom
 * Category: geometry
 *
 * Flags sibling pairs whose edges are within a configurable tolerance —
 * i.e., they're touching or nearly touching without an explicit gap.
 *
 * This catches the common layout issue where a brand and nav links are flush
 * because the outer flex container lacks `gap-*` or `space-x-*`, even though
 * the elements don't technically overlap.
 *
 * Intentionally-stacked elements (position: absolute | fixed | sticky) are skipped.
 * Child elements of a flex container with `gap` set are also skipped (gap already
 * handles spacing).
 *
 * Provides structured findings with:
 *  - Both element selectors
 *  - Distance between them in px (0 = flush)
 *  - Whether the parent has a gap set
 *  - Remediation: add a gap or margin
 */
import type { ElementCharter, EcDomContext, EcFinding, EcDomNode } from '../charter.js';

/** Elements whose edges are this close or closer are flagged (px). */
const MIN_GAP_PX = 8;

/** Maximum findings per run. */
const MAX_FINDINGS = 20;

/** Directions siblings can be adjacent. */
type Adjacency = 'right' | 'left' | 'bottom' | 'top';

interface GapMetric {
  elA: EcDomNode;
  elB: EcDomNode;
  /** How B relates to A positionally. */
  adjacency: Adjacency;
  /** Distance between the two edges in px (0 = flush, negative = overlap). */
  gap: number;
  /** Whether the parent element has a CSS gap set. */
  parentHasGap: boolean;
}

function isStacked(n: EcDomNode): boolean {
  const p = n.node.styles.position;
  return p === 'absolute' || p === 'fixed' || p === 'sticky';
}

/** Check if a CSS gap value is set and usable. */
function hasGap(styles: EcDomNode['node']['styles']): boolean {
  const g = styles.gap?.trim();
  return !!g && g !== 'normal' && g !== '0px';
}

/** Compute the horizontal gap between two sibling elements (negative = overlap). */
function horizontalGap(a: EcDomNode, b: EcDomNode): number {
  // Assume a is left of b
  if (a.node.box.x <= b.node.box.x) {
    return b.node.box.x - (a.node.box.x + a.node.box.width);
  }
  return a.node.box.x - (b.node.box.x + b.node.box.width);
}

/** Compute the vertical gap between two sibling elements (negative = overlap). */
function verticalGap(a: EcDomNode, b: EcDomNode): number {
  if (a.node.box.y <= b.node.box.y) {
    return b.node.box.y - (a.node.box.y + a.node.box.height);
  }
  return a.node.box.y - (b.node.box.y + b.node.box.height);
}

export const minimumGap: ElementCharter = {
  name: 'geometry/minimum-gap',
  description:
    'As adjacent sibling elements, I want at least ' + MIN_GAP_PX + 'px between my edge and my sibling so the composition breathes.',
  severity: 'P2',
  matcher: { type: 'dom-selector', selector: '*' },
  run(ctx: EcDomContext): EcFinding[] {
    const findings: EcFinding[] = [];
    const seen = new Set<string>();

    for (const el of ctx.matchedElements) {
      if (isStacked(el)) continue;
      if (findings.length >= MAX_FINDINGS) break;

      // Skip SVG children (icon paths, designed to be flush)
      const t = el.node.tag?.toLowerCase() ?? '';
      if (['svg', 'path', 'circle', 'line', 'rect'].includes(t)) continue;
      // Skip table cells (touch by HTML spec)
      if (['td', 'th', 'tr', 'thead', 'tbody', 'table'].includes(t)) continue;

      const parentGap = el.parent ? hasGap(el.parent.node.styles) : false;

      for (const sib of el.siblings) {
        if (isStacked(sib)) continue;
        const st = sib.node.tag?.toLowerCase() ?? '';
        if (['svg', 'path', 'circle', 'line', 'rect'].includes(st)) continue;
        if (['td', 'th', 'tr', 'thead', 'tbody', 'table'].includes(st)) continue;
        // Skip pairs with border separator (borders create visual separation)
        const sibClass = sib.node.classes ?? '';
        if (sibClass.includes('border-') || sibClass.includes('border')) continue;
        const key = [el.node.selector, sib.node.selector].sort().join(' ⨯ ');
        if (seen.has(key)) continue;

        // Check horizontal adjacency
        const hGap = horizontalGap(el, sib);
        if (hGap >= 0 && hGap < MIN_GAP_PX) {
          // Determine the direction
          const leftEl = el.node.box.x <= sib.node.box.x ? el : sib;
          const rightEl = el.node.box.x <= sib.node.box.x ? sib : el;
          const adj: Adjacency = 'right';
          seen.add(key);

          findings.push({
            id: `geometry/minimum-gap/${key}`,
            severity: parentGap ? 'P2' : 'P1',
            message:
              `"${leftEl.node.selector}" and "${rightEl.node.selector}" are only ${Math.round(hGap)}px apart ` +
              `(minimum ${MIN_GAP_PX}px). ` +
              `Left: {x:${Math.round(leftEl.node.box.x)}, w:${Math.round(leftEl.node.box.width)}}. ` +
              `Right: {x:${Math.round(rightEl.node.box.x)}, w:${Math.round(rightEl.node.box.width)}}. ` +
              (parentGap
                ? 'Parent already has a gap — consider using it to separate these items.'
                : 'Parent has no gap between flex/grid children.'),
            target: leftEl.node.selector,
            remediation:
              parentGap
                ? `Add margin-right: ${MIN_GAP_PX - hGap}px to "${leftEl.node.selector}" or "${rightEl.node.selector}".`
                : `Add a gap to the parent container or add margin-right/left. ` +
                  `Currently ${hGap}px — target ≥${MIN_GAP_PX}px.`,
          });
          continue;
        }

        // Check vertical adjacency
        const vGap = verticalGap(el, sib);
        if (vGap >= 0 && vGap < MIN_GAP_PX) {
          const topEl = el.node.box.y <= sib.node.box.y ? el : sib;
          const bottomEl = el.node.box.y <= sib.node.box.y ? sib : el;
          seen.add(key);

          findings.push({
            id: `geometry/minimum-gap/${key}`,
            severity: parentGap ? 'P2' : 'P1',
            message:
              `"${topEl.node.selector}" and "${bottomEl.node.selector}" are only ${Math.round(vGap)}px apart vertically ` +
              `(minimum ${MIN_GAP_PX}px). ` +
              (parentGap
                ? 'Parent has a gap — items may need individual margins.'
                : 'Parent has no gap.'),
            target: topEl.node.selector,
            remediation:
              `Add margin-bottom: ${MIN_GAP_PX - vGap}px to "${topEl.node.selector}" ` +
              `or margin-top to "${bottomEl.node.selector}".`,
          });
        }
      }
    }

    return findings;
  },
};

export default minimumGap;
