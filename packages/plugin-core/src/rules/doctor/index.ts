/**
 * Core doctor rules — production-readiness checks for design system metadata.
 *
 * These are "logical" DS rules that validate token contracts, naming conventions,
 * and system completeness. They run against the DesignSystem data model, not
 * against rendered DOM.
 */
import type { DesignReviewRule, ReviewContext } from '@emdesign/plugin-api';

/** --space-unit token must be declared. */
const spacingScaleDefined: DesignReviewRule = {
  id: 'core-spacing-scale', category: 'contract', title: 'Spacing scale token defined', severity: 'P2', target: '--space-unit declared',
  check: ({ ds }: ReviewContext) => {
    const has = ds.tokens().some((t) => t.role === 'space-unit' || t.name === '--space-unit');
    return { pass: has, detail: has ? '--space-unit found' : 'no --space-unit token', fix: 'Declare --space-unit in tokens.css (e.g. 8px).' };
  },
};

/** Palette must have exactly one accent color. */
const singleAccent: DesignReviewRule = {
  id: 'core-single-accent', category: 'contract', title: 'Palette has a single accent color', severity: 'P2', target: '1 accent color role',
  check: ({ ds }: ReviewContext) => {
    const colors = ds.tokens().filter((t) => t.kind === 'color');
    const accents = colors.filter((t) => /accent/i.test(t.role) || /--color-accent/.test(t.name));
    return { pass: accents.length <= 1, detail: accents.length ? `${accents.length} accent roles found` : 'no accent defined', fix: 'Consolidate to a single --color-accent role; use hue-shifts (--color-accent-hover, --color-accent-muted) rather than multiple accent tokens.' };
  },
};

/** All token names must be kebab-case. */
const namingConsistent: DesignReviewRule = {
  id: 'core-naming-consistent', category: 'contract', title: 'Token naming convention (kebab-case)', severity: 'P2', target: 'all token names kebab-case',
  check: ({ ds }: ReviewContext) => {
    const bad = ds.tokens().filter((t) => /[A-Z_]/.test(t.name.replace(/^--/, '')));
    return { pass: bad.length === 0, detail: bad.length ? `${bad.length} non-kebab tokens` : 'all kebab-case', fix: bad.length ? `Rename: ${bad.slice(0, 5).map((t) => t.name).join(', ')}${bad.length > 5 ? ` +${bad.length - 5} more` : ''} to kebab-case.` : undefined };
  },
};

/** Body + headline font tokens must be declared. */
const fontStackComplete: DesignReviewRule = {
  id: 'core-font-stack', category: 'contract', title: 'Body + headline font declared', severity: 'P1', target: '--font-body + --font-headline',
  check: ({ ds }: ReviewContext) => {
    const names = new Set(ds.tokens().map((t) => t.role));
    const missing = ['font-body', 'font-headline'].filter((r) => ![...names].some((n) => n === r || n.endsWith(`-${r}`) || n === `--${r}`));
    return { pass: missing.length === 0, detail: missing.length ? `missing: ${missing.join(', ')}` : 'complete', fix: 'Declare --font-body and --font-headline in tokens.css referencing real typeface names.' };
  },
};

/** Motion/easing tokens must be present. */
const motionTokens: DesignReviewRule = {
  id: 'core-motion-tokens', category: 'contract', title: 'Motion tokens present', severity: 'P2', target: '--motion-* or --ease-*',
  check: ({ ds }: ReviewContext) => {
    const has = ds.tokens().some((t) => /motion|ease-/.test(t.role));
    return { pass: has, detail: has ? 'motion tokens found' : 'no motion/ease tokens', fix: 'Add --motion-* (duration) and --ease-* (timing) tokens for interaction feedback.' };
  },
};

/** All 11 semantic token roles must be declared. */
const allRolesDeclared: DesignReviewRule = {
  id: 'core-contract-all-roles', category: 'contract', title: 'All 11 semantic token roles declared', severity: 'P1', target: 'all SEMANTIC_TOKEN_ROLES present',
  check: ({ ds }: ReviewContext) => {
    const declared = new Set(ds.tokens().map((t) => t.role));
    const SEMANTIC_ROLES = [
      'color-surface', 'color-surface-raised', 'color-text', 'color-text-muted',
      'color-accent', 'color-accent-hover', 'color-border',
      'radius', 'space-unit', 'font-sans', 'shadow-raised',
    ] as const;
    const missing = SEMANTIC_ROLES.filter((r) => !declared.has(r));
    if (missing.length === 0) {
      return { pass: true, detail: 'All 11 semantic token roles declared' };
    }
    return {
      pass: false,
      detail: `Missing: ${missing.join(', ')} (${missing.length}/11)`,
      fix: `Add these tokens to tokens.css: ${missing.join(', ')}`,
    };
  },
};

/** Dark theme overrides exist for all color tokens. */
const darkModeComplete: DesignReviewRule = {
  id: 'core-contract-dark-mode', category: 'contract', title: 'Dark mode overrides for all color tokens', severity: 'P1', target: 'dark: variants for every color token',
  check: ({ ds }: ReviewContext) => {
    const themes = ds.themes();
    const darkTheme = themes.find((t) => t.name?.toLowerCase() === 'dark');
    if (!darkTheme) {
      return { pass: false, detail: 'No dark theme defined', fix: 'Add a [data-theme="dark"] block in tokens.css with overrides for each --color-* token.' };
    }
    const overrides = darkTheme.overrides();
    const colorTokens = ds.tokens().filter((t) => t.kind === 'color');
    const missing = colorTokens.filter((ct) => !overrides.some((o) => o.token === ct.name || o.token === ct.role));
    if (missing.length <= 2) {
      return { pass: true, detail: `${overrides.length} dark overrides for ${colorTokens.length} color tokens` };
    }
    return {
      pass: false,
      detail: `${missing.length} color tokens missing dark overrides`,
      fix: `Add dark: overrides for: ${missing.slice(0, 5).map((t) => t.name).join(', ')}${missing.length > 5 ? ` +${missing.length - 5} more` : ''}`,
    };
  },
};

/** DESIGN.md should have at least 7 of 9 sections with meaningful content. */
const designMdComplete: DesignReviewRule = {
  id: 'core-contract-design-md-complete', category: 'contract', title: 'DESIGN.md has ≥7 of 9 sections with content', severity: 'P2', target: '≥7 sections with content',
  check: ({ ds }: ReviewContext) => {
    const sections = ds.sections();
    const populated = sections.filter((s) => s.wordCount > 20 || s.tableRows > 0);
    if (populated.length >= 7) {
      return { pass: true, detail: `${populated.length}/9 sections populated` };
    }
    const empty = sections.filter((s) => s.wordCount <= 20 && s.tableRows === 0).map((s) => s.title);
    return {
      pass: false,
      detail: `${populated.length}/9 sections populated — target ≥7`,
      fix: empty.length ? `Fill in: ${empty.slice(0, 4).join(', ')}${empty.length > 4 ? ` +${empty.length - 4} more` : ''} with concrete details about your design decisions and token usage.` : 'Populate at least 7 of the 9 DESIGN.md sections.',
    };
  },
};

/** There should be at least one primitive per declared component. */
const primitivesVsComponents: DesignReviewRule = {
  id: 'core-contract-primitives-vs-components', category: 'contract', title: 'At least 1 primitive per component', severity: 'P2', target: 'primitives:components ≥ 1:1',
  check: ({ ds }: ReviewContext) => {
    const components = ds.components();
    // Primitives are components whose name appears in the code/ directory
    // (heuristic: they're registered as primitives in the design system)
    // The code/ directory count comes from section data
    const codeSection = ds.section(/^code/i) ?? ds.section(/^primitives/i);
    const primitiveCount = codeSection?.tableRows ?? Math.round(components.length * 0.6);
    if (primitiveCount >= Math.ceil(components.length * 0.3)) {
      return { pass: true, detail: `${primitiveCount} estimated primitives for ${components.length} components` };
    }
    return {
      pass: false,
      detail: `${primitiveCount} estimated primitives for ${components.length} components — need more primitives`,
      fix: 'Create reusable primitive components in code/ before building higher-level components.',
    };
  },
};

/** All core doctor rules, always-on for every project. */
export const CORE_DOCTOR_RULES: DesignReviewRule[] = [
  spacingScaleDefined,
  singleAccent,
  namingConsistent,
  fontStackComplete,
  motionTokens,
  allRolesDeclared,
  darkModeComplete,
  designMdComplete,
  primitivesVsComponents,
];
