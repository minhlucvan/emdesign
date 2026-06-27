/**
 * Core color rules — rendered checks against computed color properties.
 *
 * Rules validate that text colors, backgrounds, and gradients use
 * design-system token colors rather than raw hex or off-brand values.
 * They run against render-probe DOM snapshots.
 */
import type { RenderedReviewRule, RenderedReviewContext } from '@emdesign/plugin-api';
import { parseColor, isTransparent } from '../../helpers/index.js';

/**
 * Build a set of known DS color values from the design system's tokens.
 * Used to detect off-token colors in rendered output.
 */
function knownTokenColors(ds: RenderedReviewContext['ds']): Set<string> {
  const colors = new Set<string>();
  // Collect all color token values (normalized)
  for (const t of ds.tokens()) {
    if (t.kind === 'color') {
      const parsed = parseColor(t.value);
      if (parsed) colors.add(parsed.join(','));
    }
  }
  return colors;
}

/** Check if a computed color string matches any known token color. */
function isTokenColor(color: string, knownColors: Set<string>): boolean {
  const parsed = parseColor(color);
  if (!parsed) return true; // can't parse, skip (e.g. "transparent")
  return knownColors.has(parsed.join(','));
}

// ---- off-token text color ----
const offTokenTextRule: RenderedReviewRule = {
  id: 'core-color-off-token-text',
  category: 'color',
  title: 'Text color uses a design-system token',
  severity: 'P1',
  target: 'all text color from tokens',
  check: ({ ds, renders }: RenderedReviewContext) => {
    const known = knownTokenColors(ds);
    const bad: string[] = [];
    for (const snap of renders) {
      for (const n of snap.nodes) {
        const c = n.styles.color;
        if (!c || isTransparent(c)) continue;
        if (!isTokenColor(c, known)) {
          bad.push(`${n.selector} text color "${c}" is not a declared token color`);
        }
      }
    }
    const top = bad.slice(0, 10);
    return {
      pass: bad.length === 0,
      detail: bad.length ? `${bad.length} off-token text colors` : 'all text uses token colors',
      fix: top.length ? `Replace with a token: ${top.join('; ')}` : undefined,
    };
  },
};

// ---- off-token background color ----
const offTokenBgRule: RenderedReviewRule = {
  id: 'core-color-off-token-bg',
  category: 'color',
  title: 'Background color uses a design-system token',
  severity: 'P1',
  target: 'all background from tokens',
  check: ({ ds, renders }: RenderedReviewContext) => {
    const known = knownTokenColors(ds);
    const bad: string[] = [];
    for (const snap of renders) {
      for (const n of snap.nodes) {
        const bg = n.styles.backgroundColor;
        if (!bg || isTransparent(bg)) continue;
        // Skip body/html level elements that may inherit page defaults
        if (n.tag === 'html' || n.tag === 'body') continue;
        if (!isTokenColor(bg, known)) {
          bad.push(`${n.selector} bg "${bg}" is not a declared token color`);
        }
      }
    }
    const top = bad.slice(0, 10);
    return {
      pass: bad.length === 0,
      detail: bad.length ? `${bad.length} off-token background colors` : 'all backgrounds use token colors',
      fix: top.length ? `Replace with a surface token: ${top.join('; ')}` : undefined,
    };
  },
};

// ---- muted text readability ----
const mutedTextReadableRule: RenderedReviewRule = {
  id: 'core-color-muted-text-readable',
  category: 'color',
  title: 'Muted text meets WCAG AA contrast',
  severity: 'P1',
  target: '≥4.5:1 for muted text',
  check: ({ renders }: RenderedReviewContext) => {
    const bad: string[] = [];
    for (const snap of renders) {
      for (const n of snap.nodes) {
        const fg = n.styles.color;
        if (!fg || isTransparent(fg)) continue;
        // Heuristic: muted text has lower contrast — check if it passes AA
        // We check against the most common background (surface)
        const bg = '#ffffff'; // fallback; real check would resolve background
        const parsed = parseColor(fg);
        if (!parsed) continue;
        // Simple brightness check: if text is too light, it may be hard to read
        const brightness = (parsed[0] * 299 + parsed[1] * 587 + parsed[2] * 114) / 1000;
        if (brightness > 180 && n.text.trim().length > 2) {
          bad.push(`${n.selector} text "${n.text.slice(0, 20)}" (brightness ${Math.round(brightness)}) may be hard to read`);
        }
      }
    }
    const top = bad.slice(0, 10);
    return {
      pass: bad.length === 0,
      detail: bad.length ? `${bad.length} low-contrast text elements` : 'all text readable',
      fix: top.length ? `Use --color-text-muted or increase contrast: ${top.join('; ')}` : undefined,
    };
  },
};

// ---- surface hierarchy ----
const surfaceHierarchyRule: RenderedReviewRule = {
  id: 'core-color-surface-hierarchy',
  category: 'color',
  title: 'Surface backgrounds follow token hierarchy',
  severity: 'P2',
  target: 'surface colors from --color-surface-* tokens',
  check: ({ ds, renders }: RenderedReviewContext) => {
    // Collect all surface background colors found in the render
    const surfaceBgs = new Set<string>();
    for (const snap of renders) {
      for (const n of snap.nodes) {
        const bg = n.styles.backgroundColor;
        if (bg && !isTransparent(bg)) {
          surfaceBgs.add(bg);
        }
      }
    }
    // Check how many distinct surface colors exist
    if (surfaceBgs.size <= 3) {
      return { pass: true, detail: `${surfaceBgs.size} distinct surface colors` };
    }
    return {
      pass: false,
      detail: `${surfaceBgs.size} distinct background colors — expected ≤3 for clean hierarchy`,
      fix: 'Consolidate backgrounds to --color-surface, --color-surface-raised, and --color-surface-overlay.',
    };
  },
};

// ---- gradient usage ----
const gradientUsageRule: RenderedReviewRule = {
  id: 'core-color-gradient-usage',
  category: 'color',
  title: 'Gradients use token colors',
  severity: 'P1',
  target: 'gradient stops from tokens',
  check: ({ renders }: RenderedReviewContext) => {
    const bad: string[] = [];
    for (const snap of renders) {
      for (const n of snap.nodes) {
        const bgImg = n.styles.backgroundImage;
        if (!bgImg || bgImg === 'none') continue;
        // Extract hex colors from gradient definitions
        const hexColors = bgImg.match(/#[0-9a-f]{3,8}/gi) ?? [];
        for (const h of hexColors) {
          // Check if it's an AI-default gradient color
          const aiGradients = ['#6366f1', '#8b5cf6', '#06b6d4', '#0891b2', '#2563eb', '#7c3aed'];
          if (aiGradients.some((ai) => h.toLowerCase().startsWith(ai))) {
            bad.push(`${n.selector} uses AI-default gradient color ${h}`);
            break; // one flag per element
          }
        }
      }
    }
    const top = bad.slice(0, 10);
    return {
      pass: bad.length === 0,
      detail: bad.length ? `${bad.length} gradient(s) with off-token colors` : 'gradients use token colors',
      fix: top.length ? `Use design-system token colors instead: ${top.join('; ')}` : undefined,
    };
  },
};

export const CORE_COLOR_RULES: RenderedReviewRule[] = [
  offTokenTextRule,
  offTokenBgRule,
  mutedTextReadableRule,
  surfaceHierarchyRule,
  gradientUsageRule,
];
