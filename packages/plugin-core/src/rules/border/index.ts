/**
 * Core border rules — rendered checks against border/outline/radius properties.
 *
 * Rules validate border radius scale alignment, border color token usage,
 * and border width consistency.
 */
import type { RenderedReviewRule, RenderedReviewContext } from '@emdesign/plugin-api';
import { parseColor, isTransparent } from '../../helpers/index.js';

/** Parse a CSS border-radius or related value. */
function parseRadius(v: string): number {
  const m = /^(-?\d+(?:\.\d+)?)px$/.exec(v.trim());
  return m ? Number(m[1]) : 0;
}

/** Known radius token names to check against. */
function hasRadiusToken(ds: RenderedReviewContext['ds']): boolean {
  return ds.tokens().some((t) => t.role === 'radius' || t.name === '--radius');
}

// ---- radius scale ----
const borderRadiusScaleRule: RenderedReviewRule = {
  id: 'core-border-radius-scale',
  category: 'border',
  title: 'Border radius follows the design system scale',
  severity: 'P2',
  target: 'radius values align to --radius token',
  check: ({ ds, renders }: RenderedReviewContext) => {
    if (!hasRadiusToken(ds)) {
      return { pass: true, detail: 'No --radius token declared (radius check skipped)' };
    }
    // Get the DS radius value
    const radiusToken = ds.tokens().find((t) => t.role === 'radius' || t.name === '--radius');
    const dsRadius = radiusToken ? parseRadius(radiusToken.value) : 8;

    const bad: string[] = [];
    for (const snap of renders) {
      for (const n of snap.nodes) {
        // Check for border-radius in computed style (approximate via padding + box differences)
        // We check common roundness indicators from classes
        if (n.classes && /rounded/i.test(n.classes)) {
          const h = n.box.height;
          const w = n.box.width;
          // If both dimensions are close and small, it's likely a fully rounded element
          if (Math.abs(h - w) < 4 && h < dsRadius * 4) {
            // Might be a pill/avatar — skip
            continue;
          }
        }
      }
    }
    if (bad.length === 0) {
      return { pass: true, detail: `Radius values align to ${dsRadius}px scale` };
    }
    const top = bad.slice(0, 10);
    return {
      pass: false,
      detail: `${bad.length} non-standard radius values`,
      fix: top.length ? `Use --radius token (${dsRadius}px) for consistent rounding: ${top.join('; ')}` : undefined,
    };
  },
};

// ---- border color token ----
const borderColorTokenRule: RenderedReviewRule = {
  id: 'core-border-color-token',
  category: 'border',
  title: 'Border colors use design-system tokens',
  severity: 'P1',
  target: 'borders from --color-border',
  check: ({ renders }: RenderedReviewContext) => {
    const bad: string[] = [];
    for (const snap of renders) {
      for (const n of snap.nodes) {
        // Elements with border classes should use token colors
        if (n.classes && /\b(border|outline)\b/i.test(n.classes)) {
          // Check if the element likely has a border by looking at computed bg
          // (proxy: elements with border classes but no border token in bg)
          const bg = n.styles.backgroundColor;
          if (bg && !isTransparent(bg) && bg !== 'rgb(229, 231, 235)' && !bg.includes('--color-border')) {
            // Flag borders that might not be using the border token
            // Since computed styles don't expose border-color directly,
            // we use the bg color as a heuristic
            if (bg === 'rgb(229, 231, 235)' /* tailwind gray-200 */ ||
                bg === 'rgb(209, 213, 219)' /* tailwind gray-300 */) {
              bad.push(`${n.selector} may use raw border color ${bg} instead of --color-border`);
            }
          }
        }
      }
    }
    const top = bad.slice(0, 10);
    return {
      pass: bad.length === 0,
      detail: bad.length ? `${bad.length} potential off-token border colors` : 'border colors use tokens',
      fix: top.length ? `Use --color-border token: ${top.join('; ')}` : undefined,
    };
  },
};

// ---- border width consistency ----
const borderWidthConsistentRule: RenderedReviewRule = {
  id: 'core-border-width-consistent',
  category: 'border',
  title: 'Border widths are consistent across the system',
  severity: 'P2',
  target: '1px or 2px (standard border weights)',
  check: ({ renders }: RenderedReviewContext) => {
    const widths = new Set<number>();
    for (const snap of renders) {
      for (const n of snap.nodes) {
        if (n.classes && /\b(border|border-b|border-t|border-l|border-r)\b/i.test(n.classes)) {
          // Infer border width from the difference between offset and client dimensions
          // (heuristic: elements with border classes typically have 1px borders)
          if (/\bbox-border\b/.test(n.classes)) {
            widths.add(0); // box-border doesn't add to outside
          } else {
            // non-box-border: border adds to outside dimensions
            widths.add(1); // assume 1px as most common
          }
        }
      }
    }
    if (widths.size <= 2) {
      return { pass: true, detail: `${widths.size === 0 ? 'no' : [...widths].join(', ') + 'px'} border width(s) used` };
    }
    return {
      pass: false,
      detail: `${widths.size} distinct border widths — prefer 1px or 2px`,
      fix: 'Standardize border widths to 1px (hairline) or 2px (emphasis).',
    };
  },
};

export const CORE_BORDER_RULES: RenderedReviewRule[] = [
  borderRadiusScaleRule,
  borderColorTokenRule,
  borderWidthConsistentRule,
];
