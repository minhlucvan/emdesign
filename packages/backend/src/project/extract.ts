/**
 * Deterministic design-decision extraction + clustering for the
 * "Design System From Existing Project" flow.
 *
 * Reads a project's Tailwind config, CSS custom properties and component
 * source into raw {@link Observation}s (each with `file:line` provenance and an
 * occurrence count), then clusters near-duplicate colors into proposed
 * semantic token roles — each with a confidence score, merged evidence and a
 * `source` of `'extracted' | 'default'`. Required roles with no evidence are
 * filled with documented defaults.
 *
 * Pure and deterministic: no network, no LLM. Agent interpretation happens out
 * of band on top of this structured result.
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

// --- Tunable constants (fixed by the spec) ---------------------------------
/** A proposal at or above this confidence is treated as high-confidence. */
export const HIGH_CONFIDENCE = 0.8;
/** Occurrence count at or above which a single-role value is high-confidence. */
const OCCURRENCE_FLOOR = 3;
/** Max per-channel RGB difference (out of 255) for two colors to be merged. */
const COLOR_MERGE_TOLERANCE = 4;

export type ObservationKind = 'color' | 'font' | 'spacing' | 'radius' | 'shadow';

/** A single raw design value mined from one source file. */
export interface Observation {
  value: string;
  kind: ObservationKind;
  /** Absolute path to the file the value was found in. */
  file: string;
  /** 1-based line number of the (first) occurrence. */
  line: number;
  /** Number of occurrences of this value within `file`. */
  count: number;
  /** Semantic role hint derived from the source (tailwind key / css prop). */
  role?: string;
}

/** One merged source value behind a proposed role. */
export interface Evidence {
  value: string;
  count: number;
}

export type RoleSource = 'extracted' | 'default';

/** A proposed semantic token role with its supporting evidence. */
export interface ProposedRole {
  role: string;
  confidence: number;
  evidence: Evidence[];
  source: RoleSource;
  /** True when the proposal needs human review (low confidence / a default). */
  flagged: boolean;
}

/** A value declared in both the Tailwind config and CSS with differing values. */
export interface Conflict {
  role: string;
  tailwind: { value: string; file: string; line: number };
  css: { value: string; file: string; line: number };
}

export interface ExtractionResult {
  observations: Observation[];
  conflicts: Conflict[];
  proposedRoles: ProposedRole[];
}

/**
 * Required semantic color roles. Any of these without extracted evidence get a
 * documented default proposal so the adoption report can surface the gap.
 */
const REQUIRED_COLOR_ROLES: Record<string, string> = {
  'color-surface': '#0a0a0a',
  'color-accent': '#3b82f6',
  'color-accent-hover': '#2563eb',
  'color-border': '#1a1a1a',
  'color-text': '#fafafa',
};

// --- Small parsing helpers -------------------------------------------------

const HEX_RE = /#[0-9a-fA-F]{3,8}\b/;
const HEX_RE_G = /#[0-9a-fA-F]{3,8}\b/g;

function lineOf(text: string, index: number): number {
  let line = 1;
  for (let i = 0; i < index && i < text.length; i++) {
    if (text[i] === '\n') line++;
  }
  return line;
}

/** Parse a hex color into normalized 0-255 RGB channels. */
function toRgb(hex: string): [number, number, number] | null {
  let h = hex.replace('#', '').toLowerCase();
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (h.length !== 6) return null;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  if ([r, g, b].some((n) => Number.isNaN(n))) return null;
  return [r, g, b];
}

/** True when two colors are within the per-channel merge tolerance. */
function colorsMergeable(a: string, b: string): boolean {
  const ra = toRgb(a);
  const rb = toRgb(b);
  if (!ra || !rb) return a.toLowerCase() === b.toLowerCase();
  return Math.max(
    Math.abs(ra[0] - rb[0]),
    Math.abs(ra[1] - rb[1]),
    Math.abs(ra[2] - rb[2]),
  ) <= COLOR_MERGE_TOLERANCE;
}

// --- Source readers --------------------------------------------------------

/** Tailwind colors keyed by their declared name, for role naming + conflicts. */
interface TailwindColor {
  key: string;
  value: string;
  file: string;
  line: number;
}

function readTailwindConfig(file: string): {
  observations: Observation[];
  colors: TailwindColor[];
} {
  const observations: Observation[] = [];
  const colors: TailwindColor[] = [];
  if (!existsSync(file)) return { observations, colors };
  const text = readFileSync(file, 'utf8');

  // Colors: `key: '#hex'` (skip the `content` array — it has no hex values).
  const colorRe = /([A-Za-z][\w-]*)\s*:\s*['"](#[0-9a-fA-F]{3,8})['"]/g;
  for (let m = colorRe.exec(text); m; m = colorRe.exec(text)) {
    const [, key, value] = m;
    const line = lineOf(text, m.index);
    colors.push({ key, value, file, line });
    observations.push({ value, kind: 'color', file, line, count: 1, role: `color-${key}` });
  }

  // Non-color families: one representative observation each.
  const families: Array<[ObservationKind, RegExp]> = [
    ['font', /fontFamily\s*:/],
    ['spacing', /\bspacing\s*:/],
    ['radius', /borderRadius\s*:/],
    ['shadow', /boxShadow\s*:/],
  ];
  for (const [kind, re] of families) {
    const m = re.exec(text);
    if (!m) continue;
    const line = lineOf(text, m.index);
    // First quoted value after the family declaration documents the sample.
    const tail = text.slice(m.index);
    const valMatch = /['"]([^'"]+)['"]/.exec(tail);
    const value = valMatch ? valMatch[1] : kind;
    observations.push({ value, kind, file, line, count: 1 });
  }

  return { observations, colors };
}

/** A CSS custom property and its resolved (var()-free) value. */
interface CssVar {
  name: string;
  value: string;
  file: string;
  line: number;
}

function readCssVars(file: string): { observations: Observation[]; vars: CssVar[] } {
  const observations: Observation[] = [];
  const vars: CssVar[] = [];
  if (!existsSync(file)) return { observations, vars };
  const text = readFileSync(file, 'utf8');

  const declRe = /(--[A-Za-z][\w-]*)\s*:\s*([^;]+);/g;
  const raw: Array<{ name: string; value: string; line: number }> = [];
  for (let m = declRe.exec(text); m; m = declRe.exec(text)) {
    raw.push({ name: m[1], value: m[2].trim(), line: lineOf(text, m.index) });
  }

  const byName = new Map(raw.map((d) => [d.name, d.value]));
  const resolve = (value: string, depth = 0): string => {
    const v = value.trim();
    const ref = /^var\(\s*(--[A-Za-z][\w-]*)\s*\)$/.exec(v);
    if (ref && depth < 10) {
      const target = byName.get(ref[1]);
      if (target !== undefined) return resolve(target, depth + 1);
    }
    return v;
  };

  for (const d of raw) {
    const resolved = resolve(d.value);
    const kind = classifyCssValue(d.name, resolved);
    vars.push({ name: d.name, value: resolved, file, line: d.line });
    observations.push({
      value: resolved,
      kind,
      file,
      line: d.line,
      count: 1,
      role: cssRoleName(d.name),
    });
  }

  return { observations, vars };
}

function classifyCssValue(name: string, value: string): ObservationKind {
  if (HEX_RE.test(value)) return 'color';
  if (/radius/i.test(name)) return 'radius';
  if (/shadow/i.test(name)) return 'shadow';
  if (/font/i.test(name)) return 'font';
  if (/(rem|px|em)\b/.test(value)) return 'spacing';
  return 'color';
}

/** `--color-accent` -> `color-accent`, `--brand-blue` -> `color-brand-blue`. */
function cssRoleName(name: string): string {
  const bare = name.replace(/^--/, '');
  return bare.startsWith('color-') ? bare : `color-${bare}`;
}

function readComponentSource(file: string): Observation[] {
  if (!existsSync(file)) return [];
  const text = readFileSync(file, 'utf8');
  const agg = new Map<string, { kind: ObservationKind; line: number; count: number }>();

  const bump = (value: string, kind: ObservationKind, line: number) => {
    const key = `${kind}:${value.toLowerCase()}`;
    const cur = agg.get(key);
    if (cur) cur.count++;
    else agg.set(key, { kind, line, count: 1 });
  };

  for (let m = HEX_RE_G.exec(text); m; m = HEX_RE_G.exec(text)) {
    bump(m[0], 'color', lineOf(text, m.index));
  }
  const pxRe = /\b\d+px\b/g;
  for (let m = pxRe.exec(text); m; m = pxRe.exec(text)) {
    bump(m[0], 'spacing', lineOf(text, m.index));
  }

  return [...agg.entries()].map(([key, v]) => ({
    value: key.slice(key.indexOf(':') + 1),
    kind: v.kind,
    file,
    line: v.line,
    count: v.count,
  }));
}

// --- File discovery --------------------------------------------------------

function findComponentFiles(root: string): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir)) {
      if (entry === 'node_modules' || entry.startsWith('.')) continue;
      const full = join(dir, entry);
      const st = statSync(full);
      if (st.isDirectory()) walk(full);
      else if (/\.(tsx|jsx)$/.test(entry)) out.push(full);
    }
  };
  walk(join(root, 'src'));
  return out.sort();
}

function findCssFiles(root: string): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir)) {
      if (entry === 'node_modules' || entry.startsWith('.')) continue;
      const full = join(dir, entry);
      const st = statSync(full);
      if (st.isDirectory()) walk(full);
      else if (/\.css$/.test(entry)) out.push(full);
    }
  };
  walk(root);
  return out.sort();
}

function findTailwindConfig(root: string): string | undefined {
  for (const name of ['tailwind.config.js', 'tailwind.config.ts', 'tailwind.config.cjs', 'tailwind.config.mjs']) {
    const full = join(root, name);
    if (existsSync(full)) return full;
  }
  return undefined;
}

// --- Clustering ------------------------------------------------------------

interface Cluster {
  values: Map<string, { count: number; role?: string }>;
}

function clusterColors(colorObs: Observation[]): Cluster[] {
  // Aggregate total count + preferred role per unique hex (deterministic order).
  const byHex = new Map<string, { count: number; role?: string }>();
  for (const o of colorObs) {
    const hex = o.value.toLowerCase();
    const cur = byHex.get(hex);
    if (cur) {
      cur.count += o.count;
      if (!cur.role && o.role) cur.role = o.role;
    } else {
      byHex.set(hex, { count: o.count, role: o.role });
    }
  }

  const clusters: Cluster[] = [];
  for (const [hex, info] of byHex) {
    const target = clusters.find((c) =>
      [...c.values.keys()].some((member) => colorsMergeable(member, hex)),
    );
    if (target) target.values.set(hex, info);
    else clusters.push({ values: new Map([[hex, info]]) });
  }
  return clusters;
}

function confidenceFor(totalCount: number, roleCount: number): number {
  if (roleCount > 1) return 0.4; // ambiguous: maps to multiple roles
  return totalCount >= OCCURRENCE_FLOOR ? 0.9 : 0.4;
}

function buildProposedRoles(colorObs: Observation[]): ProposedRole[] {
  const clusters = clusterColors(colorObs);
  const used = new Set<string>();
  let generic = 0;

  const uniqueRole = (preferred: string): string => {
    let name = preferred;
    let i = 2;
    while (used.has(name)) name = `${preferred}-${i++}`;
    used.add(name);
    return name;
  };

  const roles: ProposedRole[] = [];
  for (const cluster of clusters) {
    const entries = [...cluster.values.entries()];
    // Prefer a tailwind/css-derived role name; otherwise a stable generic one.
    const named = entries.find(([, v]) => v.role)?.[1].role;
    const role = uniqueRole(named ?? `color-extra-${++generic}`);
    const evidence: Evidence[] = entries.map(([value, v]) => ({ value, count: v.count }));
    const totalCount = evidence.reduce((s, e) => s + e.count, 0);
    const distinctRoles = new Set(entries.map(([, v]) => v.role).filter(Boolean)).size;
    const confidence = confidenceFor(totalCount, distinctRoles);
    roles.push({
      role,
      confidence,
      evidence,
      source: 'extracted',
      flagged: confidence < HIGH_CONFIDENCE,
    });
  }
  return roles;
}

function fillRequiredDefaults(roles: ProposedRole[]): ProposedRole[] {
  const present = new Set(roles.map((r) => r.role));
  const out = [...roles];
  for (const [role, defaultValue] of Object.entries(REQUIRED_COLOR_ROLES)) {
    if (present.has(role)) continue;
    out.push({
      role,
      confidence: 0,
      evidence: [{ value: defaultValue, count: 0 }],
      source: 'default',
      flagged: true,
    });
  }
  return out;
}

// --- Conflict detection ----------------------------------------------------

function detectConflicts(colors: TailwindColor[], vars: CssVar[]): Conflict[] {
  const conflicts: Conflict[] = [];
  for (const v of vars) {
    if (!HEX_RE.test(v.value)) continue;
    const role = cssRoleName(v.name); // e.g. color-accent
    const key = role.replace(/^color-/, ''); // accent
    const tw = colors.find((c) => c.key === key);
    if (tw && tw.value.toLowerCase() !== v.value.toLowerCase()) {
      conflicts.push({
        role,
        tailwind: { value: tw.value, file: tw.file, line: tw.line },
        css: { value: v.value, file: v.file, line: v.line },
      });
    }
  }
  return conflicts;
}

// --- Entry point -----------------------------------------------------------

/**
 * Mine design decisions from a project at `projectRoot` and cluster them into
 * proposed semantic token roles. Deterministic; safe to call repeatedly.
 */
export function extractProject(projectRoot: string): ExtractionResult {
  const observations: Observation[] = [];

  const twPath = findTailwindConfig(projectRoot);
  const tw = twPath ? readTailwindConfig(twPath) : { observations: [], colors: [] };
  observations.push(...tw.observations);

  const cssVars: CssVar[] = [];
  for (const cssFile of findCssFiles(projectRoot)) {
    const css = readCssVars(cssFile);
    observations.push(...css.observations);
    cssVars.push(...css.vars);
  }

  for (const compFile of findComponentFiles(projectRoot)) {
    observations.push(...readComponentSource(compFile));
  }

  const conflicts = detectConflicts(tw.colors, cssVars);

  const colorObs = observations.filter((o) => o.kind === 'color');
  const proposedRoles = fillRequiredDefaults(buildProposedRoles(colorObs));

  return { observations, conflicts, proposedRoles };
}
