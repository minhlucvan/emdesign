import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

// SUT — does not exist yet at the RED step. Importing `adoptProject` and the
// `AdoptionReport` type is what makes this suite fail until `adopt.ts` +
// `report.ts` land in the GREEN step.
import { adoptProject } from './adopt.js';
import type { AdoptionReport } from './report.js';
import type { ProposedRole } from './extract.js';

// ---------------------------------------------------------------------------
// Proposed roles (normally produced by unit 01's extractProject). Hand-built
// here so the rebind decisions are fully deterministic:
//   color-surface  high-conf, single candidate for #ffffff  -> bg-surface
//   color-accent   high-conf, single candidate for #3b82f6  -> text-accent
//   color-extra-1  LOW-conf  (0.4) sole candidate for #ff0000 -> NOT rebound
//   color-deep-a   high-conf candidate for #0a0a0a  ┐ two high-conf candidates
//   color-deep-b   high-conf candidate for #0a0a0a  ┘ -> ambiguous, NOT rebound
// ---------------------------------------------------------------------------
const PROPOSED_ROLES: ProposedRole[] = [
  { role: 'color-surface', confidence: 0.9, evidence: [{ value: '#ffffff', count: 5 }], source: 'extracted', flagged: false },
  { role: 'color-accent', confidence: 0.9, evidence: [{ value: '#3b82f6', count: 4 }], source: 'extracted', flagged: false },
  { role: 'color-extra-1', confidence: 0.4, evidence: [{ value: '#ff0000', count: 1 }], source: 'extracted', flagged: true },
  { role: 'color-deep-a', confidence: 0.9, evidence: [{ value: '#0a0a0a', count: 3 }], source: 'extracted', flagged: false },
  { role: 'color-deep-b', confidence: 0.9, evidence: [{ value: '#0a0a0a', count: 3 }], source: 'extracted', flagged: false },
];

const DECLARED_TOKENS = PROPOSED_ROLES.map((r) => r.role);

// Card: every hardcoded value is a single high-confidence candidate → fully
// rebindable → loop-ready. No existing story → one is generated.
const CARD_SRC = `export function Card() {
  return <div className="bg-[#ffffff] text-[#3b82f6] rounded p-4">Card</div>;
}
`;

// Badge: #ff0000 maps only to a LOW-confidence role → not rebound → blocking.
// Ships with an existing story → no story is generated for it.
const BADGE_SRC = `export function Badge() {
  return <span className="bg-[#ff0000] px-2">Badge</span>;
}
`;
const BADGE_STORY = `import { Badge } from './Badge';
export default { title: 'Badge', component: Badge };
export const Default = {};
`;

// Panel: #0a0a0a maps to TWO high-confidence candidates → ambiguous → not
// rebound → blocking with both candidate roles listed.
const PANEL_SRC = `export function Panel() {
  return <section className="border-[#0a0a0a] p-6">Panel</section>;
}
`;

function makeProject(): string {
  const dir = mkdtempSync(join(tmpdir(), 'adopt-proj-'));
  const comps = join(dir, 'src', 'components');
  mkdirSync(comps, { recursive: true });
  writeFileSync(join(comps, 'Card.tsx'), CARD_SRC);
  writeFileSync(join(comps, 'Badge.tsx'), BADGE_SRC);
  writeFileSync(join(comps, 'Badge.stories.tsx'), BADGE_STORY);
  writeFileSync(join(comps, 'Panel.tsx'), PANEL_SRC);
  return dir;
}

function makeComponentsDir(): string {
  return mkdtempSync(join(tmpdir(), 'adopt-dest-'));
}

/** Recursively collect every file under `dir` matching `pred`. */
function walk(dir: string, pred: (f: string) => boolean): string[] {
  const out: string[] = [];
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full, pred));
    else if (pred(full)) out.push(full);
  }
  return out;
}

const byName = (report: AdoptionReport, name: string) =>
  report.components.find((c) => c.name === name);

// ---------------------------------------------------------------------------

describe('adoptProject', () => {
  let projectRoot: string;
  let componentsDir: string;
  let report: AdoptionReport;
  const tmps: string[] = [];

  beforeAll(() => {
    projectRoot = makeProject();
    componentsDir = makeComponentsDir();
    tmps.push(projectRoot, componentsDir);
    report = adoptProject({ projectRoot, componentsDir, proposedRoles: PROPOSED_ROLES, declaredTokens: DECLARED_TOKENS });
  });

  afterAll(() => {
    for (const d of tmps) rmSync(d, { recursive: true, force: true });
  });

  describe('Components are placed and registered', () => {
    it('places every discovered component under componentsDir', () => {
      for (const name of ['Card', 'Badge', 'Panel']) {
        const comp = byName(report, name);
        expect(comp, name).toBeDefined();
        expect(existsSync(comp!.placedPath)).toBe(true);
        expect(comp!.placedPath).toContain(componentsDir);
      }
      // Story files are not adopted as components.
      expect(byName(report, 'Badge.stories')).toBeUndefined();
    });

    it('generates a CSF story for a component lacking one, and not for one that has it', () => {
      const card = byName(report, 'Card')!;
      expect(card.storyGenerated).toBe(true);
      expect(existsSync(card.storyPath!)).toBe(true);
      const story = readFileSync(card.storyPath!, 'utf8');
      expect(story).toContain('export default');
      expect(story).toContain('Card');

      const badge = byName(report, 'Badge')!;
      expect(badge.storyGenerated).toBe(false);
    });

    it('records a graph entry with file:line provenance for each component', () => {
      const card = byName(report, 'Card')!;
      expect(card.graph.file).toContain('Card');
      expect(card.graph.line).toBeGreaterThan(0);
    });

    it('never mutates the source project', () => {
      const src = readFileSync(join(projectRoot, 'src', 'components', 'Card.tsx'), 'utf8');
      expect(src).toBe(CARD_SRC);
      expect(src).toContain('#ffffff');
    });
  });

  describe('Adoption is idempotent', () => {
    it('does not duplicate placed files and marks components unchanged on re-run', () => {
      const root = makeProject();
      const dest = makeComponentsDir();
      tmps.push(root, dest);

      const first = adoptProject({ projectRoot: root, componentsDir: dest, proposedRoles: PROPOSED_ROLES, declaredTokens: DECLARED_TOKENS });
      const filesAfterFirst = walk(dest, (f) => f.endsWith('.tsx')).sort();

      const second = adoptProject({ projectRoot: root, componentsDir: dest, proposedRoles: PROPOSED_ROLES, declaredTokens: DECLARED_TOKENS });
      const filesAfterSecond = walk(dest, (f) => f.endsWith('.tsx')).sort();

      // No new/duplicate files produced by the second run.
      expect(filesAfterSecond).toEqual(filesAfterFirst);

      // First run created/updated; second run is a no-op.
      for (const c of first.components) {
        expect(c.change).not.toBe('unchanged');
      }
      for (const c of second.components) {
        expect(c.change).toBe('unchanged');
      }
    });
  });

  describe('Unambiguous value is rebound', () => {
    it('rewrites a single high-confidence candidate to its semantic role with before/after + provenance', () => {
      const card = byName(report, 'Card')!;

      const bg = card.rebinds.find((r) => r.before.includes('#ffffff'));
      expect(bg, 'bg rebind').toBeDefined();
      expect(bg!.after).toBe('bg-surface');
      expect(bg!.role).toBe('color-surface');
      expect(bg!.after).not.toContain('#');
      expect(bg!.line).toBeGreaterThan(0);

      const text = card.rebinds.find((r) => r.before.includes('#3b82f6'));
      expect(text, 'text rebind').toBeDefined();
      expect(text!.after).toBe('text-accent');
      expect(text!.role).toBe('color-accent');

      // The placed source reflects the rewrite — no raw hex remains.
      const placed = readFileSync(card.placedPath, 'utf8');
      expect(placed).toContain('bg-surface');
      expect(placed).toContain('text-accent');
      expect(placed).not.toContain('#ffffff');
      expect(placed).not.toContain('#3b82f6');
    });
  });

  describe('Ambiguous value is left for manual fix', () => {
    it('does not rebind a value with more than one high-confidence candidate', () => {
      const panel = byName(report, 'Panel')!;
      expect(panel.rebinds.some((r) => r.before.includes('#0a0a0a'))).toBe(false);

      const blocking = panel.blockingValues.find((b) => b.value.toLowerCase() === '#0a0a0a');
      expect(blocking, 'blocking #0a0a0a').toBeDefined();
      expect(blocking!.candidates.length).toBe(2);
      expect(blocking!.candidates).toContain('color-deep-a');
      expect(blocking!.candidates).toContain('color-deep-b');
      expect(blocking!.line).toBeGreaterThan(0);

      // The raw hex survives in the placed source.
      expect(readFileSync(panel.placedPath, 'utf8')).toContain('#0a0a0a');
    });

    it('does not rebind a value whose only candidate is below the 0.8 threshold', () => {
      const badge = byName(report, 'Badge')!;
      expect(badge.rebinds.some((r) => r.before.includes('#ff0000'))).toBe(false);

      const blocking = badge.blockingValues.find((b) => b.value.toLowerCase() === '#ff0000');
      expect(blocking, 'blocking #ff0000').toBeDefined();
      expect(blocking!.line).toBeGreaterThan(0);
      expect(readFileSync(badge.placedPath, 'utf8')).toContain('#ff0000');
    });
  });

  describe('Report classifies components', () => {
    it('marks fully-rebound components loop-ready with no off-token values', () => {
      const card = byName(report, 'Card')!;
      expect(card.status).toBe('loop-ready');
      expect(card.blockingValues).toEqual([]);
    });

    it('marks components with remaining off-token values needs-manual-fix and lists each blocking value + location', () => {
      for (const name of ['Badge', 'Panel']) {
        const comp = byName(report, name)!;
        expect(comp.status, name).toBe('needs-manual-fix');
        expect(comp.blockingValues.length).toBeGreaterThan(0);
        for (const b of comp.blockingValues) {
          expect(b.value).toMatch(/^#/);
          expect(b.file).toContain(name);
          expect(b.line).toBeGreaterThan(0);
        }
      }
    });

    it('classifies every component as loop-ready or needs-manual-fix', () => {
      expect(report.components.length).toBe(3);
      for (const c of report.components) {
        expect(['loop-ready', 'needs-manual-fix']).toContain(c.status);
      }
    });
  });

  describe('Report is machine-readable', () => {
    it('exposes a JSON-serializable structure with per-component status, rebinds and blocking values', () => {
      const round = JSON.parse(JSON.stringify(report)) as AdoptionReport;
      expect(Array.isArray(round.components)).toBe(true);
      for (const c of round.components) {
        expect(typeof c.name).toBe('string');
        expect(typeof c.status).toBe('string');
        expect(Array.isArray(c.rebinds)).toBe(true);
        expect(Array.isArray(c.blockingValues)).toBe(true);
      }
      // The rebind/blocking detail survives serialization.
      const card = round.components.find((c) => c.name === 'Card')!;
      expect(card.rebinds.length).toBe(2);
      expect(card.rebinds[0]).toHaveProperty('before');
      expect(card.rebinds[0]).toHaveProperty('after');
    });
  });
});
