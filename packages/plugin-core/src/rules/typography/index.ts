/**
 * Core typography rules — rendered checks against computed font/text properties.
 *
 * Rules validate line-height ratios, font family consistency, weight scale
 * adherence, and maximum font sizes. They run against render-probe DOM snapshots.
 */
import type { RenderedReviewRule, RenderedReviewContext } from '@emdesign/plugin-api';
import { parsePx } from '../../helpers/index.js';

/** Known safe line-height ranges: body ≥1.4, heading ≥1.2 */
const BODY_MIN_LINE_HEIGHT = 1.4;
const HEADING_MIN_LINE_HEIGHT = 1.2;

/** Maximum reasonable font sizes. */
const MAX_HEADING_SIZE = 48;
const MAX_DISPLAY_SIZE = 96;

/** Tags that indicate heading-level text. */
const HEADING_TAGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);

// ---- line-height ratio ----
const lineHeightRatioRule: RenderedReviewRule = {
  id: 'core-type-line-height-ratio',
  category: 'typography',
  title: 'Line-height meets minimum readability ratios',
  severity: 'P2',
  target: '≥1.4 (body), ≥1.2 (headings)',
  check: ({ renders }: RenderedReviewContext) => {
    const bad: string[] = [];
    for (const snap of renders) {
      for (const n of snap.nodes) {
        const lh = n.styles.lineHeight;
        if (!lh || lh === 'normal') continue;
        const lhNum = parseFloat(lh);
        if (Number.isNaN(lhNum)) continue;
        const minLH = HEADING_TAGS.has(n.tag) ? HEADING_MIN_LINE_HEIGHT : BODY_MIN_LINE_HEIGHT;
        if (lhNum < minLH) {
          bad.push(`${n.selector} line-height ${lhNum} < ${minLH}${HEADING_TAGS.has(n.tag) ? ' (heading)' : ''}`);
        }
      }
    }
    const top = bad.slice(0, 10);
    return {
      pass: bad.length === 0,
      detail: bad.length ? `${bad.length} insufficient line-heights` : 'all line-heights adequate',
      fix: top.length ? `Set line-height ≥${BODY_MIN_LINE_HEIGHT} (body) or ≥${HEADING_MIN_LINE_HEIGHT} (headings): ${top.join('; ')}` : undefined,
    };
  },
};

// ---- font-family consistency ----
const fontFamilyConsistentRule: RenderedReviewRule = {
  id: 'core-type-family-consistent',
  category: 'typography',
  title: 'Font families use the design system stacks',
  severity: 'P1',
  target: 'all font-family from DS-declared stacks',
  check: ({ renders }: RenderedReviewContext) => {
    const bad: string[] = [];
    for (const snap of renders) {
      for (const n of snap.nodes) {
        const ff = n.styles.fontFamily?.toLowerCase() ?? '';
        // Skip elements without text
        if (!n.text.trim()) continue;
        // Check for system font stacks that aren't DS-declared
        if (ff.includes('times new roman') || ff.includes('georgia') || ff.includes('impact')) {
          bad.push(`${n.selector} uses non-DS font "${n.styles.fontFamily}"`);
        }
      }
    }
    const top = bad.slice(0, 10);
    return {
      pass: bad.length === 0,
      detail: bad.length ? `${bad.length} off-stack font families` : 'all fonts use DS stacks',
      fix: top.length ? `Use --font-sans, --font-display, or --font-mono tokens: ${top.join('; ')}` : undefined,
    };
  },
};

// ---- font-weight consistency ----
const fontWeightConsistentRule: RenderedReviewRule = {
  id: 'core-type-weight-consistent',
  category: 'typography',
  title: 'Font weights use the design system weight scale',
  severity: 'P2',
  target: 'weights in {400, 500, 600, 700, 800, 900}',
  check: ({ renders }: RenderedReviewContext) => {
    const knownWeights = new Set([100, 200, 300, 400, 500, 600, 700, 800, 900]);
    const bad: string[] = [];
    for (const snap of renders) {
      for (const n of snap.nodes) {
        const w = n.styles.fontWeight;
        if (!w) continue;
        const wNum = parseInt(w);
        if (Number.isNaN(wNum)) continue;
        if (!knownWeights.has(wNum)) {
          bad.push(`${n.selector} weight ${wNum} not in standard scale`);
        }
      }
    }
    const top = bad.slice(0, 10);
    return {
      pass: bad.length === 0,
      detail: bad.length ? `${bad.length} non-standard font weights` : 'all weights in scale',
      fix: top.length ? `Use standard weights (400/500/600/700/800/900): ${top.join('; ')}` : undefined,
    };
  },
};

// ---- max font size ----
const maxFontSizeRule: RenderedReviewRule = {
  id: 'core-type-max-font-size',
  category: 'typography',
  title: 'Font sizes stay within reasonable bounds',
  severity: 'P2',
  target: `≤${MAX_HEADING_SIZE}px (heading), ≤${MAX_DISPLAY_SIZE}px (display)`,
  check: ({ renders }: RenderedReviewContext) => {
    const bad: string[] = [];
    for (const snap of renders) {
      for (const n of snap.nodes) {
        const fs = parsePx(n.styles.fontSize);
        if (fs === 0) continue;
        const maxSize = HEADING_TAGS.has(n.tag) ? MAX_HEADING_SIZE : MAX_DISPLAY_SIZE;
        if (fs > maxSize) {
          bad.push(`${n.selector} font-size ${fs}px exceeds ${maxSize}px max`);
        }
      }
    }
    const top = bad.slice(0, 10);
    return {
      pass: bad.length === 0,
      detail: bad.length ? `${bad.length} oversized fonts` : 'all font sizes within bounds',
      fix: top.length ? `Reduce font size to ≤${MAX_HEADING_SIZE}px (headings) or ≤${MAX_DISPLAY_SIZE}px (display): ${top.join('; ')}` : undefined,
    };
  },
};

export const CORE_TYPOGRAPHY_RULES: RenderedReviewRule[] = [
  lineHeightRatioRule,
  fontFamilyConsistentRule,
  fontWeightConsistentRule,
  maxFontSizeRule,
];
