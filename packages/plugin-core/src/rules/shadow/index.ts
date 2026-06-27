/**
 * Core shadow/elevation rules — doctor-level checks against token declarations.
 *
 * Rules validate that shadow tokens exist, an elevation scale is defined,
 * and shadow colors reference token colors rather than raw hex values.
 * These are doctor rules (logical checks against the DesignSystem model),
 * not rendered rules — no DOM snapshot needed.
 */
import type { DesignReviewRule, ReviewContext } from '@emdesign/plugin-api';

// ---- shadow tokens declared ----
const shadowTokenDeclaredRule: DesignReviewRule = {
  id: 'core-shadow-token-declared',
  category: 'contract',
  title: 'Shadow elevation tokens declared',
  severity: 'P2',
  target: '--shadow-raised and --shadow-overlay declared',
  check: ({ ds }: ReviewContext) => {
    const tokens = ds.tokens();
    const hasRaised = tokens.some((t) => t.role === 'shadow-raised' || t.name === '--shadow-raised');
    const hasOverlay = tokens.some((t) => t.role.includes('shadow-overlay') || t.name === '--shadow-overlay');
    const count = tokens.filter((t) => t.kind === 'shadow' || t.role.startsWith('shadow-')).length;
    const missing: string[] = [];
    if (!hasRaised) missing.push('--shadow-raised');
    if (!hasOverlay) missing.push('--shadow-overlay');
    if (missing.length === 0) {
      return { pass: true, detail: `${count} shadow token(s) declared` };
    }
    return {
      pass: false,
      detail: `Missing: ${missing.join(', ')}`,
      fix: `Declare shadow tokens: ${missing.join(', ')} in tokens.css (e.g. box-shadow values).`,
    };
  },
};

// ---- elevation scale ----
const elevationScaleRule: DesignReviewRule = {
  id: 'core-shadow-elevation-scale',
  category: 'contract',
  title: 'At least 2 elevation levels defined',
  severity: 'P2',
  target: '≥2 elevation levels (raised + overlay)',
  check: ({ ds }: ReviewContext) => {
    const shadowTokens = ds.tokens().filter((t) => t.kind === 'shadow' || t.role.startsWith('shadow-'));
    if (shadowTokens.length >= 2) {
      const names = shadowTokens.map((t) => t.name).join(', ');
      return { pass: true, detail: `${shadowTokens.length} levels: ${names}` };
    }
    return {
      pass: false,
      detail: `${shadowTokens.length} elevation level(s) — need at least 2`,
      fix: 'Add at least --shadow-raised (subtle) and --shadow-overlay (prominent). Ensure each level is visually distinct.',
    };
  },
};

// ---- shadow color uses tokens ----
const shadowColorTokenRule: DesignReviewRule = {
  id: 'core-shadow-color-role',
  category: 'contract',
  title: 'Shadow colors reference color tokens',
  severity: 'P2',
  target: 'shadow definitions use --color-* tokens',
  check: ({ ds }: ReviewContext) => {
    const shadowTokens = ds.tokens().filter((t) => t.kind === 'shadow' || t.role.startsWith('shadow-'));
    const bad: string[] = [];
    for (const t of shadowTokens) {
      const val = t.value.toLowerCase();
      // Check for raw hex colors in shadow values (e.g. "0 1px 3px #000000")
      const hexMatch = val.match(/#[0-9a-f]{3,8}/g);
      if (hexMatch) {
        bad.push(`${t.name} uses raw hex ${hexMatch.join(', ')}`);
      }
    }
    if (bad.length === 0) {
      return { pass: true, detail: `${shadowTokens.length} shadow(s) use token colors` };
    }
    const top = bad.slice(0, 10);
    return {
      pass: false,
      detail: `${bad.length} shadow(s) with raw colors`,
      fix: `Use var(--color-*) tokens in shadow definitions: ${top.join('; ')}`,
    };
  },
};

export const CORE_SHADOW_RULES: DesignReviewRule[] = [
  shadowTokenDeclaredRule,
  elevationScaleRule,
  shadowColorTokenRule,
];
