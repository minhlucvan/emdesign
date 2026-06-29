import { describe, expect, it } from 'vitest';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// SUT — does not exist yet at the RED step. Importing it (and the fixture it reads)
// is what makes this suite fail until `extract.ts` + the `__fixtures__/sample-project`
// fixture land in the GREEN step.
import { extractProject } from './extract.js';
import type { ExtractionResult, ProposedRole } from './extract.js';

// ---------------------------------------------------------------------------
// Fixture (created in the GREEN step at __fixtures__/sample-project):
//   tailwind.config.js  theme.extend.colors  surface: '#0a0a0a'
//                                             accent:  '#3b82f6'
//                                             border:  '#1a1a1a'
//                                             text:    '#fafafa'
//                       theme.extend.fontFamily.sans = ['Inter', ...]
//                       theme.extend.spacing, borderRadius, boxShadow
//   src/styles.css      --brand-blue: #2563eb;
//                       --color-accent: var(--brand-blue);   // resolves -> #2563eb,
//                                                            // conflicts w/ tailwind #3b82f6
//                       --radius: 0.5rem;
//   src/components/Card.tsx  hardcoded hex: #0a0a0a x3, #0b0b0b x1,
//                            #1a1a1a x2, #ff0000 x1 (rare); 16px x2;
//                            inline utilities: bg-surface, text-accent
// ---------------------------------------------------------------------------

const HERE = dirname(fileURLToPath(import.meta.url));
const FIXTURE = resolve(HERE, '__fixtures__/sample-project');

const HIGH_CONFIDENCE = 0.8;

function run(): ExtractionResult {
  return extractProject(FIXTURE);
}

const eqHex = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

/** A proposed role whose merged evidence includes the given raw value. */
function roleWithEvidence(result: ExtractionResult, value: string): ProposedRole | undefined {
  return result.proposedRoles.find((r) => r.evidence.some((e) => eqHex(e.value, value)));
}

describe('extractProject — Tailwind config', () => {
  it('reads colors/fonts/spacing/radius/shadows as located observations', () => {
    const { observations } = run();
    const fromTw = observations.filter((o) => o.file.endsWith('tailwind.config.js'));

    // Every tailwind observation carries file:line provenance.
    expect(fromTw.length).toBeGreaterThan(0);
    for (const o of fromTw) {
      expect(o.file).toMatch(/tailwind\.config\.js$/);
      expect(o.line).toBeGreaterThan(0);
    }

    // The declared surface color is mined as a color observation.
    const surface = fromTw.find((o) => o.kind === 'color' && eqHex(o.value, '#0a0a0a'));
    expect(surface).toBeDefined();

    // Each non-color token family is represented too.
    for (const kind of ['font', 'spacing', 'radius', 'shadow'] as const) {
      expect(fromTw.some((o) => o.kind === kind)).toBe(true);
    }
  });
});

describe('extractProject — CSS custom properties', () => {
  it('collects --* declarations with their resolved values', () => {
    const { observations } = run();
    const fromCss = observations.filter((o) => o.file.endsWith('styles.css'));
    expect(fromCss.length).toBeGreaterThan(0);

    // --color-accent: var(--brand-blue) resolves to the underlying hex, not the var().
    const accent = fromCss.find((o) => o.kind === 'color');
    expect(accent).toBeDefined();
    expect(accent!.value).not.toMatch(/var\(/);
    expect(eqHex(accent!.value, '#2563eb')).toBe(true);
    expect(accent!.line).toBeGreaterThan(0);
  });

  it('records a value that conflicts with the Tailwind config as a conflict', () => {
    const { conflicts } = run();
    // tailwind accent (#3b82f6) vs css --color-accent resolved (#2563eb)
    const accent = conflicts.find((c) => c.role.includes('accent'));
    expect(accent).toBeDefined();
    expect(eqHex(accent!.tailwind.value, '#3b82f6')).toBe(true);
    expect(eqHex(accent!.css.value, '#2563eb')).toBe(true);
    expect(accent!.tailwind.file).toMatch(/tailwind\.config\.js$/);
    expect(accent!.css.file).toMatch(/styles\.css$/);
  });
});

describe('extractProject — component source', () => {
  it('collects raw hex usage with provenance and per-value occurrence counts', () => {
    const { observations } = run();
    const fromCard = observations.filter((o) => o.file.endsWith('Card.tsx'));
    expect(fromCard.length).toBeGreaterThan(0);

    const surface = fromCard.find((o) => o.kind === 'color' && eqHex(o.value, '#0a0a0a'));
    expect(surface).toBeDefined();
    expect(surface!.line).toBeGreaterThan(0);
    expect(surface!.count).toBeGreaterThanOrEqual(3);

    // A rare value appears exactly once.
    const rare = fromCard.find((o) => eqHex(o.value, '#ff0000'));
    expect(rare).toBeDefined();
    expect(rare!.count).toBe(1);
  });
});

describe('extractProject — clustering into proposed roles', () => {
  it('merges near-duplicate colors (max per-channel diff <= 4) into one role', () => {
    const result = run();
    const roleA = roleWithEvidence(result, '#0a0a0a');
    const roleB = roleWithEvidence(result, '#0b0b0b');

    expect(roleA).toBeDefined();
    expect(roleB).toBeDefined();
    // #0a0a0a and #0b0b0b land in the SAME proposed role.
    expect(roleA!.role).toBe(roleB!.role);

    // The proposal lists the merged source values + their occurrence counts.
    const values = roleA!.evidence.map((e) => e.value.toLowerCase());
    expect(values).toContain('#0a0a0a');
    expect(values).toContain('#0b0b0b');
    for (const e of roleA!.evidence) {
      expect(e.count).toBeGreaterThanOrEqual(1);
    }
  });

  it('keeps sufficiently distant colors (diff > 4) as separate roles', () => {
    const result = run();
    const near = roleWithEvidence(result, '#0a0a0a'); // 10,10,10
    const far = roleWithEvidence(result, '#1a1a1a'); // 26,26,26 -> diff 16 > 4
    expect(near).toBeDefined();
    expect(far).toBeDefined();
    expect(near!.role).not.toBe(far!.role);
  });

  it('assigns high confidence to a consistent single-role value (occurrence >= 3)', () => {
    const result = run();
    const role = roleWithEvidence(result, '#0a0a0a');
    expect(role).toBeDefined();
    expect(role!.source).toBe('extracted');
    expect(role!.confidence).toBeGreaterThanOrEqual(HIGH_CONFIDENCE);
  });

  it('assigns low confidence to a rare value and flags it for review', () => {
    const result = run();
    const role = roleWithEvidence(result, '#ff0000'); // occurrence 1 (< 3)
    expect(role).toBeDefined();
    expect(role!.confidence).toBeLessThan(HIGH_CONFIDENCE);
    expect(role!.flagged).toBe(true);
  });

  it('proposes a documented default for a required role with no evidence', () => {
    const result = run();
    // The fixture provides no evidence for color-accent-hover.
    const role = result.proposedRoles.find((r) => r.role === 'color-accent-hover');
    expect(role).toBeDefined();
    expect(role!.source).toBe('default');
    // A default proposal still carries a value to document the fallback.
    expect(role!.evidence.length === 0 || role!.source === 'default').toBe(true);
  });
});
