/**
 * Core layout rules — rendered checks against DOM structure and positioning.
 *
 * Rules validate that layout follows design-system conventions: no negative
 * margins, appropriate flex/grid usage, reasonable nesting depth, and
 * proper centering methods.
 */
import type { RenderedReviewRule, RenderedReviewContext } from '@emdesign/plugin-api';
import { parsePx } from '../../helpers/index.js';

// ---- negative margins ----
const negativeMarginRule: RenderedReviewRule = {
  id: 'core-layout-negative-margin',
  category: 'layout',
  title: 'No negative margins — use gap/spacing instead',
  severity: 'P2',
  target: '0 negative margins',
  check: ({ renders }: RenderedReviewContext) => {
    const bad: string[] = [];
    for (const snap of renders) {
      for (const n of snap.nodes) {
        for (const edge of ['marginTop', 'marginRight', 'marginBottom', 'marginLeft'] as const) {
          const raw = n.styles[edge];
          const px = parsePx(raw);
          if (px < 0) {
            bad.push(`${n.selector} ${edge}=${raw}`);
          }
        }
      }
    }
    const top = bad.slice(0, 10);
    return {
      pass: bad.length === 0,
      detail: bad.length ? `${bad.length} negative margin(s)` : 'no negative margins',
      fix: top.length ? `Use gap, padding, or space-* utilities instead of negative margins: ${top.join('; ')}` : undefined,
    };
  },
};

// ---- flex vs grid ----
const flexVsGridRule: RenderedReviewRule = {
  id: 'core-layout-flex-vs-grid',
  category: 'layout',
  title: 'Use flex for 1D layouts, grid for 2D layouts',
  severity: 'P2',
  target: 'no misuse of grid for single-row',
  check: ({ renders }: RenderedReviewContext) => {
    const bad: string[] = [];
    for (const snap of renders) {
      for (const n of snap.nodes) {
        if (n.styles.display === 'grid') {
          // Check if children are all in a single row (heuristic: similar y positions)
          const children = snap.nodes.filter((c) => c.parentSelector === n.selector);
          if (children.length > 1) {
            const yPositions = new Set(children.map((c) => Math.round(c.box.y)));
            if (yPositions.size <= 1 && children.length > 2) {
              bad.push(`${n.selector} uses grid for single-row layout (${children.length} children in 1 row)`);
            }
          }
        }
        if (n.styles.display === 'flex') {
          // Check if children wrap into multiple rows (suggesting grid might be better)
          const children = snap.nodes.filter((c) => c.parentSelector === n.selector);
          if (children.length > 1) {
            const yPositions = new Set(children.map((c) => Math.round(c.box.y)));
            if (yPositions.size > 1) {
              // Multiple rows in flex — could be intentional wrapping, but flag if >2 rows
              if (yPositions.size > 2) {
                bad.push(`${n.selector} wraps ${children.length} children into ${yPositions.size} rows — consider grid`);
              }
            }
          }
        }
      }
    }
    const top = bad.slice(0, 10);
    return {
      pass: bad.length === 0,
      detail: bad.length ? `${bad.length} layout model suggestions` : 'layout models appropriate',
      fix: top.length ? `Use CSS Grid for 2D layouts, Flexbox for 1D: ${top.join('; ')}` : undefined,
    };
  },
};

// ---- container nesting depth ----
const containerNestingRule: RenderedReviewRule = {
  id: 'core-layout-container-nesting',
  category: 'layout',
  title: 'Avoid excessive container nesting',
  severity: 'P2',
  target: '≤5 levels deep',
  check: ({ renders }: RenderedReviewContext) => {
    const bad: string[] = [];
    for (const snap of renders) {
      // Build nesting depth map
      const depth = new Map<string, number>();
      for (const n of snap.nodes) {
        if (n.parentSelector) {
          depth.set(n.selector, (depth.get(n.parentSelector) ?? 0) + 1);
        } else {
          depth.set(n.selector, 1);
        }
      }
      for (const [sel, d] of depth) {
        if (d > 5) {
          bad.push(`${sel} at depth ${d} — try to flatten`);
        }
      }
    }
    const top = bad.slice(0, 10);
    return {
      pass: bad.length === 0,
      detail: bad.length ? `${bad.length} deeply nested element(s)` : 'nesting depths reasonable',
      fix: top.length ? `Flatten component structure: ${top.join('; ')}. Consider extracting sub-components.` : undefined,
    };
  },
};

// ---- centering method ----
const centeringMethodRule: RenderedReviewRule = {
  id: 'core-layout-centering-method',
  category: 'layout',
  title: 'Use flexbox/grid for centering',
  severity: 'P2',
  target: 'no margin:auto centering hacks',
  check: ({ renders }: RenderedReviewContext) => {
    const bad: string[] = [];
    for (const snap of renders) {
      for (const n of snap.nodes) {
        // Check for margin:auto pattern (both left and right margins are auto-equal)
        const ml = parsePx(n.styles.marginLeft);
        const mr = parsePx(n.styles.marginRight);
        if (ml > 0 && mr > 0 && Math.abs(ml - mr) < 1) {
          // Both margins set to same value — likely margin:auto or margin:0 auto
          // Check if parent uses a centering method
          if (n.parentSelector) {
            const parent = snap.nodes.find((p) => p.selector === n.parentSelector);
            if (parent && parent.styles.display !== 'flex' && parent.styles.display !== 'grid') {
              bad.push(`${n.selector} uses margin centering (ml=${ml}px, mr=${mr}px)`);
            }
          }
        }
      }
    }
    const top = bad.slice(0, 10);
    return {
      pass: bad.length === 0,
      detail: bad.length ? `${bad.length} margin-based centering(s)` : 'centering uses flex/grid',
      fix: top.length ? `Use flexbox (justify-center items-center) or grid (place-items-center): ${top.join('; ')}` : undefined,
    };
  },
};

export const CORE_LAYOUT_RULES: RenderedReviewRule[] = [
  negativeMarginRule,
  flexVsGridRule,
  containerNestingRule,
  centeringMethodRule,
];
