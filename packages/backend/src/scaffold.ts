import fs from 'node:fs';
import path from 'node:path';
import { ensureDir, normalizeDsRef, type RepoPaths } from './paths.js';
import { parseDeclaredTokens, resolveDesignSystem } from './designContext.js';
import { buildAndSave } from './graph.js';
import { SEMANTIC_TOKEN_ROLES } from '@emdesign/dsr';

/** Design-system scaffolding — the create/validate engine behind the Design System flow. */

export type CreateMode = 'blank' | 'brief' | 'import' | 'extract';

/** A 9-section DESIGN.md skeleton (per docs/spec.md) the author then fills in. */
export function designMdSkeleton(id: string, name: string): string {
  return `---
name: ${name}
category: Custom
surface: web
description: TODO one-line summary (≤240 chars) — the vibe of ${name}.
version: 0.1.0
---

# ${name}
> Category: Custom
> Surface: web

TODO: a one-paragraph summary of the system's vibe.

## 1. Visual Theme & Atmosphere
TODO: the felt experience + foundational palette (exact values).

## 2. Color
TODO: every role with exact hex (surfaces, text tiers, accent + hover, border, status).

## 3. Typography
TODO: a full type-scale table (role · family · size · weight · line-height · letter-spacing).

## 4. Spacing
TODO: base unit + scale.

## 5. Layout & Composition
TODO: grid, container width, section rhythm, whitespace philosophy.

## 6. Components
TODO: per-component specs with states (button, card, input, badge…).

## 7. Motion & Interaction
TODO: durations, easings, what animates and what must not.

## 8. Voice & Brand
TODO: tone, copy rules, what the brand is not.

## 9. Anti-patterns
TODO: hard Do/Don't guardrails (these map to consistency-lint rules).

## 10. Tokens
See \`tokens.css\` for the machine contract.
`;
}

/** A neutral base tokens.css declaring every required role (the author re-colors it). */
export function baseTokensCss(): string {
  return `/* base token contract — declares every required role. Re-value for your brand. */
:root {
  --color-surface: #ffffff;
  --color-surface-raised: #f7f7f8;
  --color-text: #18181b;
  --color-text-muted: #6b7280;
  --color-accent: #2563eb;
  --color-accent-hover: #1d4ed8;
  --color-border: #e5e7eb;
  --color-success: #15803d;
  --color-warn: #b45309;
  --color-danger: #b91c1c;

  --font-display: "Inter", system-ui, sans-serif;
  --font-sans: "Inter", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;

  --radius: 8px;
  --radius-sm: 5px;
  --radius-pill: 999px;
  --space-unit: 8px;
  --shadow-raised: 0 1px 2px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.05);
  --focus-ring: 0 0 0 3px rgba(37,99,235,0.28);

  --motion-fast: 120ms;
  --motion-base: 220ms;
  --ease-standard: cubic-bezier(0.2, 0, 0, 1);

  --container-max: 1180px;
  --section-y: 96px;
}
`;
}

/** Provenance for a base derived from an upstream corpus (e.g. open-design). */
export interface DesignSystemSource {
  type: string;
  skill: string;
  upstream?: string;
  license?: string;
}

export interface ManifestOpts {
  category?: string;
  description?: string;
  surface?: string;
  /** Lint rules this look opts into / out of (e.g. brutalist exempts caps-no-tracking). */
  craft?: { applies?: string[]; exemptions?: string[] };
  /** Set for vendored bases; stripped on import so the clone is the user's own system. */
  source?: DesignSystemSource;
  files?: Record<string, string>;
}

const DEFAULT_CRAFT_APPLIES = ['off-token-color', 'ai-default-indigo', 'accent-overuse', 'token-self-check'];

export function manifestJson(id: string, name: string, opts: ManifestOpts = {}): string {
  const manifest: Record<string, unknown> = {
    schemaVersion: 'od-design-system-project/v1',
    id,
    name,
    category: opts.category ?? 'Custom',
    description: opts.description ?? `${name} design system.`,
    files: opts.files ?? { design: 'DESIGN.md', tokens: 'tokens.css', components: 'components.html' },
    craft: { applies: opts.craft?.applies ?? DEFAULT_CRAFT_APPLIES, exemptions: opts.craft?.exemptions ?? [] },
  };
  if (opts.surface) manifest.surface = opts.surface;
  if (opts.source) manifest.source = opts.source;
  return JSON.stringify(manifest, null, 2) + '\n';
}

function dsDir(paths: RepoPaths, id: string): string {
  return path.join(paths.designSystemsDir, ...normalizeDsRef(id).split('/'));
}

function copyDir(src: string, dest: string): void {
  if (!fs.existsSync(src)) return;
  ensureDir(dest);
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, e.name);
    const d = path.join(dest, e.name);
    if (e.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

/** After cloning a base, set the manifest's id/name to the new system and drop vendor provenance. */
function reidImportedManifest(manifestFile: string, id: string, name: string): void {
  if (!fs.existsSync(manifestFile)) return;
  try {
    const m = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
    m.id = id;
    m.name = name;
    delete m.source;
    fs.writeFileSync(manifestFile, JSON.stringify(m, null, 2) + '\n');
  } catch {
    /* leave a non-JSON manifest untouched */
  }
}

/** Copy the base primitive set from a reference design system's code/ (default the seeded 'atelier'). */
export function scaffoldPrimitives(paths: RepoPaths, id: string, from = 'atelier'): boolean {
  const src = path.join(dsDir(paths, from), 'code');
  const dest = path.join(dsDir(paths, id), 'code');
  if (!fs.existsSync(src) || fs.existsSync(dest)) return false;
  copyDir(src, dest);
  return true;
}

export interface CreateResult {
  id: string;
  dir: string;
  mode: CreateMode;
  wrote: string[];
  primitivesFrom?: string;
  note?: string;
}

/**
 * Create a design system. `blank` writes a skeleton; `import` clones an existing/seeded system; `brief`
 * and `extract` scaffold blank, then the author fills the DESIGN.md (via the design-system-author skill).
 */
export function createDesignSystem(
  paths: RepoPaths,
  opts: { id: string; name?: string; mode?: CreateMode; from?: string; description?: string },
): CreateResult {
  const { id } = opts;
  const name = opts.name ?? id;
  const mode = opts.mode ?? 'blank';
  const dir = dsDir(paths, id);
  if (fs.existsSync(dir)) throw new Error(`Design system '${id}' already exists at ${dir}`);
  ensureDir(dir);
  const wrote: string[] = [];

  if (mode === 'import') {
    const from = opts.from;
    if (!from) throw new Error('import mode requires `from` (a design-system id or base ref to clone, e.g. open-design/brutalist).');
    const fromDir = dsDir(paths, from);
    if (!fs.existsSync(fromDir)) throw new Error(`Cannot import: design system '${from}' not found.`);
    copyDir(fromDir, dir);
    // Re-id the clone and drop the vendor provenance — it is now the user's own system to evolve.
    reidImportedManifest(path.join(dir, 'manifest.json'), id, name);
    // Re-title the cloned Showcase story so its story id can't collide with the base / other systems.
    try {
      const showcase = path.join(dir, 'code', 'Showcase.stories.tsx');
      if (fs.existsSync(showcase)) {
        const display = name ?? id.replace(/(^|-)([a-z])/g, (_, sep, ch) => (sep ? ' ' : '') + ch.toUpperCase());
        fs.writeFileSync(showcase, fs.readFileSync(showcase, 'utf8').replace(/title:\s*['"][^'"]*['"]/, `title: 'Design System/${display}'`));
      }
    } catch { /* no showcase to retitle */ }
    // Defer-no-hooks: run the existing post-create processing inline (graph index + token-contract check).
    let graphRebuilt = false;
    try { buildAndSave(paths, id); graphRebuilt = true; } catch { /* may need authoring first */ }
    const v = validateDesignSystem(paths, id);
    const note =
      `Cloned from '${from}'. ${graphRebuilt ? 'Graph built; ' : ''}` +
      `${v.ok ? 'token contract OK' : `validation: ${v.note}`}. Edit DESIGN.md/tokens to differentiate.`;
    return { id, dir, mode, wrote: [dir], primitivesFrom: from, note };
  }

  // blank / brief / extract → skeleton, then authored by the agent.
  fs.writeFileSync(path.join(dir, 'DESIGN.md'), designMdSkeleton(id, name));
  fs.writeFileSync(path.join(dir, 'tokens.css'), baseTokensCss());
  fs.writeFileSync(path.join(dir, 'manifest.json'), manifestJson(id, name, { description: opts.description }));
  wrote.push(`${dir}/DESIGN.md`, `${dir}/tokens.css`, `${dir}/manifest.json`);
  const primitivesFrom = scaffoldPrimitives(paths, id, opts.from ?? 'atelier') ? (opts.from ?? 'atelier') : undefined;
  const note =
    mode === 'blank'
      ? 'Fill in the DESIGN.md sections + re-value tokens.css.'
      : 'Skeleton ready — author the DESIGN.md (design-system-author skill) from the brief/reference, then validate.';
  return { id, dir, mode, wrote, primitivesFrom, note };
}

export type TokenCategory = 'color' | 'type' | 'spacing' | 'size' | 'shadow' | 'radius' | 'font' | 'other';

export interface TokenInfo {
  name: string;
  value: string;
  category: TokenCategory;
}

export interface CompileResult {
  id: string;
  tokens: TokenInfo[];
  categories: Partial<Record<TokenCategory, TokenInfo[]>>;
  files: {
    tokensTs: string;
    typesTs: string;
    tokensCss: string;
  };
  note: string;
}

/** Categorize a token name into a group. */
function tokenCategory(name: string): TokenCategory {
  if (/^color-/i.test(name) || /-(bg|text|border|accent|surface|fg)$/i.test(name)) return 'color';
  if (/^(space|gap|m[trblxy]?|p[trblxy]?)/i.test(name)) return 'spacing';
  if (/^(text|font|type|heading|body|caps)/i.test(name)) return 'type';
  if (/^(size|w-|h-|min-|max-)/i.test(name)) return 'size';
  if (/^(shadow|elevation)/i.test(name)) return 'shadow';
  if (/^(radius|rounded|corner)/i.test(name)) return 'radius';
  if (/^(font|family|face)/i.test(name)) return 'font';
  return 'other';
}

/**
 * Compile a design system's tokens into TypeScript types and compiled CSS.
 */
export function compileDesignSystem(paths: RepoPaths, id: string): CompileResult {
  const tokensCss = (() => {
    try { return fs.readFileSync(path.join(dsDir(paths, id), 'tokens.css'), 'utf8'); } catch { return ''; }
  })();
  const raw = parseDeclaredTokens(tokensCss);
  const tokens: TokenInfo[] = raw.map(name => {
    // Extract value — crude regex on the CSS
    const valMatch = tokensCss.match(new RegExp(`--${escapeRegex(name)}\\s*:\\s*([^;]+)`));
    return { name, value: valMatch ? valMatch[1].trim() : '', category: tokenCategory(name) };
  });

  const categories: Partial<Record<TokenCategory, TokenInfo[]>> = {};
  for (const t of tokens) {
    if (!categories[t.category]) categories[t.category] = [];
    categories[t.category]!.push(t);
  }

  // Generate TypeScript tokens file
  const lines = tokens.map(t => `  ${camelCase(t.name)}: '--${t.name}' as const,`);
  const tokensTs = `// Auto-generated by emdesign ds compile. Do not edit.\n// Source: design-systems/${id}/tokens.css\n\nexport const Token = {\n${lines.join('\n')}\n} as const;\n\nexport type TokenKey = keyof typeof Token;\nexport type TokenValue = (typeof Token)[keyof typeof Token];\n`;

  // Generate types file
  const catTypes = Object.entries(categories).map(([cat, toks]) =>
    `export type ${pascalCase(cat)}Token = ${toks!.map(t => `'--${t.name}'`).join(' | ')};`
  ).join('\n');
  const catConsts = Object.entries(categories).map(([cat, toks]) =>
    `export const ${camelCase(cat)}Tokens = [${toks!.map(t => `'--${t.name}' as const`).join(', ')}] as const;\n${catTypes}`
  ).join('\n\n');
  const typesTs = `// Auto-generated by emdesign ds compile. Do not edit.\n\n${catConsts}\n`;

  const note = `Compiled ${tokens.length} tokens across ${Object.keys(categories).length} categories.`;
  return { id, tokens, categories, files: { tokensTs, typesTs, tokensCss }, note };
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function camelCase(s: string): string {
  return s.replace(/[-_]([a-z])/g, (_, c) => c.toUpperCase()).replace(/^./, c => c.toLowerCase());
}

function pascalCase(s: string): string {
  const cc = camelCase(s);
  return cc[0].toUpperCase() + cc.slice(1);
}

/** Export a design system as a consumable npm package. */
export function exportDesignSystem(paths: RepoPaths, id: string, outDir?: string): { id: string; outDir: string; files: string[]; note: string } {
  const dest = outDir ?? path.join(dsDir(paths, id), 'dist');
  const compiled = compileDesignSystem(paths, id);
  ensureDir(dest);

  const written: string[] = [];
  fs.writeFileSync(path.join(dest, 'tokens.ts'), compiled.files.tokensTs);
  written.push('tokens.ts');
  fs.writeFileSync(path.join(dest, 'types.ts'), compiled.files.typesTs);
  written.push('types.ts');
  fs.writeFileSync(path.join(dest, 'tokens.css'), compiled.files.tokensCss);
  written.push('tokens.css');

  // Write a minimal package.json
  const pkg = { name: `@design-system/${id}`, version: '0.1.0', type: 'module', main: 'tokens.ts', types: 'types.ts' };
  fs.writeFileSync(path.join(dest, 'package.json'), JSON.stringify(pkg, null, 2) + '\n');
  written.push('package.json');

  return { id, outDir: dest, files: written, note: `Exported to ${dest}: ${written.join(', ')}` };
}

export interface ValidateResult {
  id: string;
  ok: boolean;
  declared: number;
  missingRoles: string[];
  note: string;
}

/** Token-contract self-check: every required role declared in tokens.css. */
export function validateDesignSystem(paths: RepoPaths, id: string): ValidateResult {
  const tokensCss = (() => {
    try { return fs.readFileSync(path.join(dsDir(paths, id), 'tokens.css'), 'utf8'); } catch { return ''; }
  })();
  const declared = new Set(parseDeclaredTokens(tokensCss));
  const missingRoles = SEMANTIC_TOKEN_ROLES.filter((r) => !declared.has(r));
  const ok = tokensCss.length > 0 && missingRoles.length === 0;
  return {
    id,
    ok,
    declared: declared.size,
    missingRoles,
    note: ok ? 'Token contract complete.' : missingRoles.length ? `Missing roles: ${missingRoles.join(', ')}` : 'No tokens.css found.',
  };
}

export interface UpdateResult {
  id: string;
  name?: string;
  description?: string;
  graphRebuilt: boolean;
  validated: boolean;
  note: string;
}

/**
 * Update an existing design system's metadata (name, description), re-validate
 * the token contract, and rebuild the knowledge graph.
 */
export function updateDesignSystem(
  paths: RepoPaths,
  id: string,
  opts: { name?: string; description?: string },
): UpdateResult {
  const dir = dsDir(paths, id);
  if (!fs.existsSync(dir)) throw new Error(`Design system '${id}' not found at ${dir}`);
  const manifestFile = path.join(dir, 'manifest.json');
  if (fs.existsSync(manifestFile)) {
    try {
      const m = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
      if (opts.name) { m.name = opts.name; m.description = opts.description ?? m.description; }
      else if (opts.description) m.description = opts.description;
      fs.writeFileSync(manifestFile, JSON.stringify(m, null, 2) + '\n');
    } catch { /* non-JSON manifest, skip */ }
  }
  let graphRebuilt = false;
  try { buildAndSave(paths, id); graphRebuilt = true; } catch { /* graph may fail for incomplete DS */ }
  const v = validateDesignSystem(paths, id);
  return {
    id,
    name: opts.name,
    description: opts.description,
    graphRebuilt,
    validated: v.ok,
    note: `Updated. ${graphRebuilt ? 'Graph rebuilt. ' : ''}${v.ok ? 'Token contract OK.' : v.note}`,
  };
}

export interface DiffResult {
  id1: string;
  id2: string;
  onlyIn1: string[];
  onlyIn2: string[];
  shared: number;
  note: string;
}

/**
 * Compare two design systems: which tokens are declared in one but not the other.
 */
export function diffDesignSystems(paths: RepoPaths, id1: string, id2: string): DiffResult {
  const v1 = validateDesignSystem(paths, id1);
  const v2 = validateDesignSystem(paths, id2);
  const tokens1 = new Set(parseDeclaredTokens(readTokensCss(paths, id1)));
  const tokens2 = new Set(parseDeclaredTokens(readTokensCss(paths, id2)));
  const onlyIn1 = [...tokens1].filter(t => !tokens2.has(t));
  const onlyIn2 = [...tokens2].filter(t => !tokens1.has(t));
  const shared = [...tokens1].filter(t => tokens2.has(t)).length;
  const set1 = [...tokens1].length;
  const set2 = [...tokens2].length;
  return {
    id1, id2,
    onlyIn1, onlyIn2, shared,
    note: `${id1}: ${set1} tokens, ${id2}: ${set2} tokens, ${shared} shared. ` +
      `${onlyIn1.length} only in ${id1}, ${onlyIn2.length} only in ${id2}.`,
  };
}

function readTokensCss(paths: RepoPaths, id: string): string {
  try { return fs.readFileSync(path.join(dsDir(paths, id), 'tokens.css'), 'utf8'); } catch { return ''; }
}

export interface ApplyResult {
  id: string;
  wired: string[];
  graphRebuilt: boolean;
  note: string;
}

/**
 * Select a design system and rewire the workspace: rebind the tokens.css import + the `@ds` marker and
 * rebuild the graph. Shared by the MCP `apply_design_system` tool and the CLI `ds use`.
 */
export function applyDesignSystem(paths: RepoPaths, id: string): ApplyResult {
  resolveDesignSystem(paths, id); // throws if missing
  const wired: string[] = [];

  const cssFile = path.join(paths.studioDir, 'src', 'active-design-system.css');
  const rel = path.relative(path.dirname(cssFile), path.join(dsDir(paths, id), 'tokens.css')).split(path.sep).join('/');
  ensureDir(path.dirname(cssFile));
  fs.writeFileSync(cssFile, `/* active design system */\n@import "${rel}";\n`);
  wired.push(cssFile);

  ensureDir(paths.emdesignDir);
  fs.writeFileSync(path.join(paths.emdesignDir, 'active-ds'), id);
  wired.push(path.join(paths.emdesignDir, 'active-ds'));

  let graphRebuilt = false;
  try { buildAndSave(paths, id); graphRebuilt = true; } catch { /* may be mid-authoring */ }

  return { id, wired, graphRebuilt, note: 'Restart Storybook to repoint the @ds alias (tokens hot-reload).' };
}

export interface DesignSystemBase {
  /** The bare folder name under _vendor/open-design/. */
  id: string;
  /** The clone source to pass as `from` (e.g. open-design/brutalist). */
  ref: string;
  name: string;
  category?: string;
  surface?: string;
  description?: string;
  source?: DesignSystemSource;
}

/** The dir holding vendored, ready-to-clone bases (e.g. converted open-design systems). */
const VENDOR_BASES_DIR = path.join('_vendor', 'open-design');

/**
 * List the prebuilt bases available as `import` sources — vendored design systems under
 * design-systems/_vendor/open-design/. Prefers the generated catalog.json index, falling back to a
 * filesystem scan. These are intentionally excluded from listDesignSystems (the active-system list).
 */
export function listBases(paths: RepoPaths): DesignSystemBase[] {
  const basesDir = path.join(paths.designSystemsDir, VENDOR_BASES_DIR);
  // Fast path: the catalog index written by the converter.
  const catalogFile = path.join(basesDir, 'catalog.json');
  try {
    const catalog = JSON.parse(fs.readFileSync(catalogFile, 'utf8'));
    if (Array.isArray(catalog?.bases)) return catalog.bases as DesignSystemBase[];
  } catch {
    /* no catalog yet — scan */
  }
  try {
    return fs
      .readdirSync(basesDir, { withFileTypes: true })
      .filter((e) => e.isDirectory() && fs.existsSync(path.join(basesDir, e.name, 'DESIGN.md')))
      .map((e) => baseFromDir(basesDir, e.name))
      .sort((a, b) => a.id.localeCompare(b.id));
  } catch {
    return [];
  }
}

function baseFromDir(basesDir: string, id: string): DesignSystemBase {
  const dir = path.join(basesDir, id);
  let manifest: any = {};
  try { manifest = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8')); } catch { /* none */ }
  const md = (() => { try { return fs.readFileSync(path.join(dir, 'DESIGN.md'), 'utf8'); } catch { return ''; } })();
  return {
    id,
    ref: `open-design/${id}`,
    name: manifest.name ?? md.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? id,
    category: manifest.category,
    surface: manifest.surface,
    description: manifest.description,
    source: manifest.source,
  };
}

/** List available design systems (folders under designSystemsDir with a DESIGN.md). */
export function listDesignSystems(paths: RepoPaths): Array<{ id: string; name: string }> {
  try {
    return fs
      .readdirSync(paths.designSystemsDir, { withFileTypes: true })
      .filter((e) => e.isDirectory() && !e.name.startsWith('_') && fs.existsSync(path.join(paths.designSystemsDir, e.name, 'DESIGN.md')))
      .map((e) => {
        const md = fs.readFileSync(path.join(paths.designSystemsDir, e.name, 'DESIGN.md'), 'utf8');
        return { id: e.name, name: md.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? e.name };
      });
  } catch {
    return [];
  }
}

/** Get distinct base categories with counts. */
export function listBaseCategories(paths: RepoPaths): Array<{ name: string; count: number }> {
  const bases = listBases(paths);
  const map = new Map<string, number>();
  for (const b of bases) {
    const cat = b.category ?? 'Uncategorized';
    map.set(cat, (map.get(cat) ?? 0) + 1);
  }
  return Array.from(map.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
}

export interface BaseDetail extends DesignSystemBase {
  hasPreview: boolean;
  tokens: Array<{ role: string; kind: string; value: string }>;
  fonts: { display?: string; body?: string; mono?: string };
  accentColor: string;
}

/** Get full detail for a base (tokens, fonts, accent color, preview availability). */
export function baseDetail(paths: RepoPaths, id: string): BaseDetail | null {
  const basesDir = path.join(paths.designSystemsDir, VENDOR_BASES_DIR, id);
  if (!fs.existsSync(path.join(basesDir, 'DESIGN.md'))) return null;

  const base = baseFromDir(path.join(paths.designSystemsDir, VENDOR_BASES_DIR), id);
  const tokensCss = (() => { try { return fs.readFileSync(path.join(basesDir, 'tokens.css'), 'utf8'); } catch { return ''; } })();

  const tokens: BaseDetail['tokens'] = [];
  const fontRoles: { display?: string; body?: string; mono?: string } = {};
  let accentColor = '';

  for (const line of tokensCss.split('\n')) {
    const m = line.match(/^\s*--([\w-]+):\s*(.+?);/);
    if (!m) continue;
    const role = m[1]!;
    const value = m[2]!.trim();
    if (role.startsWith('color-')) {
      tokens.push({ role, kind: 'color', value });
      if (role === 'color-accent') accentColor = value;
    } else if (role.startsWith('font-')) {
      tokens.push({ role, kind: 'typography', value });
      if (role === 'font-display') fontRoles.display = value;
      else if (role === 'font-sans') fontRoles.body = value;
      else if (role === 'font-mono') fontRoles.mono = value;
    } else if (role.startsWith('radius') || role.startsWith('space-') || role.startsWith('shadow-')) {
      tokens.push({ role, kind: 'shape', value });
    } else if (role.startsWith('motion-') || role.startsWith('ease-')) {
      tokens.push({ role, kind: 'motion', value });
    } else if (role.startsWith('container-') || role.startsWith('section-')) {
      tokens.push({ role, kind: 'layout', value });
    }
  }

  return { ...base, hasPreview: fs.existsSync(path.join(basesDir, 'reference-example.html')), tokens, fonts: fontRoles, accentColor };
}

/** Read the reference-example.html for a base, optionally injecting CSS overrides. */
export function basePreviewHtml(
  paths: RepoPaths, id: string,
  cssOverrides?: Record<string, string>,
): string | null {
  const htmlFile = path.join(paths.designSystemsDir, VENDOR_BASES_DIR, id, 'reference-example.html');
  if (!fs.existsSync(htmlFile)) return null;
  let html = fs.readFileSync(htmlFile, 'utf8');
  if (cssOverrides && Object.keys(cssOverrides).length > 0) {
    const css = Object.entries(cssOverrides).map(([k, v]) => `  --${k}: ${v};`).join('\n');
    html = html.replace('</head>', `\n<style id="emdesign-overrides">\n:root {\n${css}\n}\n</style>\n</head>`);
  }
  return html;
}

/** Customize a base: clone + modify tokens. */
export function customizeDesignSystem(
  paths: RepoPaths,
  opts: { baseRef: string; id: string; name: string; customizations: { accentColor?: string; headlineFont?: string; bodyFont?: string; surfaceColor?: string; roundness?: string; spacing?: number } },
) {
  const createResult = createDesignSystem(paths, { id: opts.id, name: opts.name, mode: 'import', from: opts.baseRef });
  const tokensFile = path.join(dsDir(paths, opts.id), 'tokens.css');
  if (fs.existsSync(tokensFile)) {
    let css = fs.readFileSync(tokensFile, 'utf8');
    const c = opts.customizations;
    if (c.accentColor) { css = css.replace(/(--color-accent-hover:\s*).+?;/g, '$1#1d4ed8;'); css = css.replace(/(--color-accent:\s*).+?;/g, `$1${c.accentColor};`); }
    if (c.surfaceColor) { css = css.replace(/(--color-surface:\s*).+?;/g, `$1${c.surfaceColor};`); css = css.replace(/(--color-surface-raised:\s*).+?;/g, `$1${c.surfaceColor};`); }
    if (c.headlineFont) css = css.replace(/(--font-display:\s*).+?;/g, `$1"${c.headlineFont}", system-ui, sans-serif;`);
    if (c.bodyFont) css = css.replace(/(--font-sans:\s*).+?;/g, `$1"${c.bodyFont}", system-ui, sans-serif;`);
    if (c.roundness) css = css.replace(/(--radius:\s*).+?;/g, `$1${c.roundness};`);
    if (c.spacing) css = css.replace(/(--space-unit:\s*).+?;/g, `$1${c.spacing}px;`);
    fs.writeFileSync(tokensFile, css);
  }
  return createResult;
}

// ═══════════════════════════════════════════════════════════════════════
// V3: Registry / Search / Import
// ═══════════════════════════════════════════════════════════════════════

const AWESOME_DESIGN_MD_REPO = 'https://raw.githubusercontent.com/voltagent/awesome-design-md/main';

export interface RegistrySystem {
  id: string;
  name: string;
  category: string;
  description: string;
  source: string;
  completeness: 'full' | 'design-md-only' | 'minimal';
  tokens: number;
  primitives: string[];
}

/** Build a searchable catalog from vendor bases + awesome-design-md (remote). */
export async function searchDesignSystems(query?: string, opts?: { limit?: number; source?: string }): Promise<RegistrySystem[]> {
  const results: RegistrySystem[] = [];

  // 1. Local vendor bases
  const vendorDir = path.join(process.cwd(), 'design-systems', '_vendor', 'open-design');
  if (fs.existsSync(vendorDir)) {
    for (const entry of fs.readdirSync(vendorDir, { withFileTypes: true })) {
      if (!entry.isDirectory() || entry.name === 'catalog.json') continue;
      const manifestFile = path.join(vendorDir, entry.name, 'manifest.json');
      let name = entry.name, description = '', category = '';
      if (fs.existsSync(manifestFile)) {
        try {
          const m = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
          name = m.name ?? entry.name;
          description = m.description ?? '';
          category = m.category ?? '';
        } catch { /* ignore */ }
      }
      results.push({
        id: entry.name, name, category, description,
        source: `vendor/${entry.name}`, completeness: 'full',
        tokens: countTokensIn(path.join(vendorDir, entry.name)),
        primitives: listPrimitivesIn(path.join(vendorDir, entry.name)),
      });
    }
  }

  // 2. Remote awesome-design-md (fetch index)
  try {
    const resp = await fetch(`${AWESOME_DESIGN_MD_REPO}/README.md`);
    if (resp.ok) {
      const readme = await resp.text();
      // Parse brand entries from README table — each row has a brand name and link
      const brandRegex = /\| \[(\w[\w\s.-]+)\]\(https:\/\/github\.com\/voltagent\/awesome-design-md\/tree\/main\/([\w.-]+)\)/g;
      const seen = new Set<string>();
      let match;
      while ((match = brandRegex.exec(readme)) !== null) {
        const brand = match[1].trim();
        const dirName = match[2].trim();
        if (seen.has(dirName)) continue;
        seen.add(dirName);
        results.push({
          id: dirName, name: brand, category: 'Brand',
          description: `${brand} design system from awesome-design-md`,
          source: `awesome/${dirName}`, completeness: 'design-md-only',
          tokens: 0, primitives: [],
        });
      }
    }
  } catch { /* GitHub API unavailable */ }

  // 3. Local installed systems
  const localDir = path.join(process.cwd(), 'design-systems');
  if (fs.existsSync(localDir)) {
    for (const entry of fs.readdirSync(localDir, { withFileTypes: true })) {
      if (!entry.isDirectory() || entry.name.startsWith('_')) continue;
      const manifestFile = path.join(localDir, entry.name, 'manifest.json');
      if (!fs.existsSync(manifestFile)) continue;
      try {
        const m = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
        results.push({
          id: entry.name, name: m.name ?? entry.name,
          category: m.category ?? 'Custom',
          description: m.description ?? '',
          source: `local/${entry.name}`, completeness: 'full',
          tokens: countTokensIn(path.join(localDir, entry.name)),
          primitives: listPrimitivesIn(path.join(localDir, entry.name)),
        });
      } catch { /* skip */ }
    }
  }

  // Filter by query
  const q = query?.toLowerCase();
  const filtered = q
    ? results.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q)
      )
    : results;

  return filtered.slice(0, opts?.limit ?? 50);
}

function countTokensIn(dir: string): number {
  try {
    const css = fs.readFileSync(path.join(dir, 'tokens.css'), 'utf8');
    return parseDeclaredTokens(css).length;
  } catch { return 0; }
}

function listPrimitivesIn(dir: string): string[] {
  const codeDir = path.join(dir, 'code');
  if (!fs.existsSync(codeDir)) return [];
  return fs.readdirSync(codeDir)
    .filter(f => f.endsWith('.tsx') && !f.includes('.stories'))
    .map(f => f.replace('.tsx', ''));
}

/** Import a design system from awesome-design-md by brand name. */
export async function importAwesomeDesign(paths: RepoPaths, brand: string, opts?: { name?: string }): Promise<{ id: string; note: string }> {
  const id = (opts?.name ?? brand).toLowerCase().replace(/[^a-z0-9-]/g, '-');
  const dir = path.join(paths.designSystemsDir, id);
  if (fs.existsSync(dir)) throw new Error(`Design system '${id}' already exists at ${dir}`);
  ensureDir(dir);

  // Fetch DESIGN.md from awesome-design-md
  const designMdUrl = `${AWESOME_DESIGN_MD_REPO}/${brand}/DESIGN.md`;
  const resp = await fetch(designMdUrl);
  if (!resp.ok) throw new Error(`Brand '${brand}' not found in awesome-design-md (${resp.status})`);
  const designMd = await resp.text();
  fs.writeFileSync(path.join(dir, 'DESIGN.md'), designMd);

  // Parse YAML frontmatter for tokens
  const frontmatter = parseYamlFrontmatter(designMd);
  const tokensCss = frontmatterToTokensCss(frontmatter);
  fs.writeFileSync(path.join(dir, 'tokens.css'), tokensCss);

  // Create manifest with source attribution
  const manifest = {
    schemaVersion: 'od-design-system-project/v1',
    id,
    name: opts?.name ?? brand,
    category: frontmatter.category ?? 'Brand',
    description: `Imported from awesome-design-md/${brand}. ${frontmatter.description ?? ''}`,
    source: { type: 'awesome-design-md', brand, url: designMdUrl },
    files: { design: 'DESIGN.md', tokens: 'tokens.css', components: 'code/' },
    craft: { applies: ['off-token-color', 'accent-overuse'], exemptions: [] },
    stats: { tokens: parseDeclaredTokens(tokensCss).length, primitives: 0 },
  };
  fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');

  // Scaffold default primitives from atelier
  try { scaffoldPrimitives(paths, id, 'atelier'); } catch { /* optional */ }

  const tokens = parseDeclaredTokens(tokensCss).length;
  return { id, note: `Imported '${brand}' as '${id}': ${tokens} tokens, primitives scaffolded.` };
}

function parseYamlFrontmatter(md: string): Record<string, any> {
  const result: Record<string, any> = {};
  const match = md.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return result;
  const yaml = match[1];
  for (const line of yaml.split('\n')) {
    const kv = line.match(/^\s*(\w+):\s*(.+)/);
    if (kv) {
      let val: any = kv[2].trim();
      // Handle arrays
      if (val.startsWith('[')) { try { val = JSON.parse(val); } catch { /* keep string */ } }
      // Handle nested objects
      if (val.startsWith('{')) { try { val = JSON.parse(val); } catch { /* keep string */ } }
      result[kv[1]] = val;
    }
  }
  return result;
}

function frontmatterToTokensCss(fm: Record<string, any>): string {
  const colors = typeof fm.colors === 'object' ? fm.colors : {};
  const typography = typeof fm.typography === 'object' ? fm.typography : {};
  const spacing = typeof fm.spacing === 'object' ? fm.spacing : {};

  const lines: string[] = [':root {', '  /* Colors */'];
  // Map common frontmatter keys to CSS variables
  const colorMap: Record<string, string> = {
    primary: '--color-accent', background: '--color-surface', text: '--color-text',
    secondary: '--color-accent-secondary', surface: '--color-surface-raised',
    border: '--color-border', success: '--color-success', warning: '--color-warning',
    danger: '--color-danger', info: '--color-info',
  };
  for (const [key, varName] of Object.entries(colorMap)) {
    if (colors[key]) lines.push(`  ${varName}: ${colors[key]};`);
  }
  // Also add any custom color keys directly
  for (const [key, val] of Object.entries(colors)) {
    if (!colorMap[key]) lines.push(`  --color-${key}: ${val};`);
  }

  lines.push('', '  /* Typography */');
  if (typography.heading || typography.sans || fm.font?.heading) {
    const hFont = typography.heading || fm.font?.heading || 'Inter';
    lines.push(`  --font-display: "${hFont}", system-ui, sans-serif;`);
    lines.push(`  --font-sans: "${typography.sans || fm.font?.body || hFont}", system-ui, sans-serif;`);
    if (fm.font?.mono) lines.push(`  --font-mono: "${fm.font.mono}", monospace;`);
  } else {
    lines.push('  --font-display: "Inter", system-ui, sans-serif;');
    lines.push('  --font-sans: "Inter", system-ui, sans-serif;');
  }

  lines.push('', '  /* Spacing */');
  const space = spacing.unit || fm.spacing || 8;
  lines.push(`  --space-unit: ${space}px;`);
  lines.push('  --radius: 8px;');

  lines.push('', '  /* Shadows */');
  lines.push('  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);');
  lines.push('  --shadow-md: 0 4px 6px rgba(0,0,0,0.07);');
  lines.push('}');
  return lines.join('\n');
}

/** Import a design system from a git repo. */
export async function importGitDesign(paths: RepoPaths, url: string, opts?: { ref?: string; path?: string; name?: string }): Promise<{ id: string; dir: string; note: string }> {
  const id = opts?.name ?? path.basename(url.replace(/\.git$/, '')).toLowerCase().replace(/[^a-z0-9-]/g, '-');
  const dir = path.join(paths.designSystemsDir, id);
  if (fs.existsSync(dir)) throw new Error(`Design system '${id}' already exists at ${dir}`);

  const tmpDir = `/tmp/emdesign-import-${Date.now()}`;
  const ref = opts?.ref ?? 'main';
  const subPath = opts?.path ?? '';

  try {
    // Shallow clone
    const { execSync } = await import('node:child_process');
    execSync(`git clone --depth 1 --branch ${ref} ${url} ${tmpDir} 2>/dev/null`, { stdio: 'pipe', timeout: 30_000 });
    const src = path.join(tmpDir, subPath);
    if (!fs.existsSync(src)) throw new Error(`Path '${subPath}' not found in cloned repo`);

    // Copy to design systems
    ensureDir(dir);
    if (fs.existsSync(path.join(src, 'DESIGN.md'))) fs.writeFileSync(path.join(dir, 'DESIGN.md'), fs.readFileSync(path.join(src, 'DESIGN.md'), 'utf8'));
    if (fs.existsSync(path.join(src, 'tokens.css'))) fs.writeFileSync(path.join(dir, 'tokens.css'), fs.readFileSync(path.join(src, 'tokens.css'), 'utf8'));
    if (fs.existsSync(path.join(src, 'manifest.json'))) {
      fs.writeFileSync(path.join(dir, 'manifest.json'), fs.readFileSync(path.join(src, 'manifest.json'), 'utf8'));
    } else {
      const tokens = fs.existsSync(path.join(dir, 'tokens.css')) ? parseDeclaredTokens(fs.readFileSync(path.join(dir, 'tokens.css'), 'utf8')).length : 0;
      fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify({
        schemaVersion: 'od-design-system-project/v1', id, name: opts?.name ?? id, category: 'Imported',
        description: `Imported from ${url}`, source: { type: 'git', url, ref },
        files: { design: 'DESIGN.md', tokens: 'tokens.css', components: 'code/' },
        craft: { applies: ['off-token-color', 'accent-overuse'], exemptions: [] },
        stats: { tokens, primitives: 0 },
      }, null, 2) + '\n');
    }

    // Scaffold primitives
    try { scaffoldPrimitives(paths, id, 'atelier'); } catch { /* optional */ }

    return { id, dir, note: `Imported from ${url} as '${id}'` };
  } finally {
    // Cleanup
    try { const { execSync } = await import('node:child_process'); execSync(`rm -rf ${tmpDir}`); } catch { /* ignore */ }
  }
}

// ═══════════════════════════════════════════════════════════════════════
// V3: Design System Info
// ═══════════════════════════════════════════════════════════════════════

export interface DsInfo {
  id: string;
  name: string;
  version?: string;
  category: string;
  description: string;
  source?: string;
  tokens: number;
  missingRoles: string[];
  primitives: string[];
  preset?: string;
  exemptions: string[];
  blueprints: string[];
  lintRules: number;
}

export function getDesignSystemInfo(paths: RepoPaths, id: string): DsInfo {
  const dir = path.join(process.cwd(), 'design-systems', ...normalizeDsRef(id).split('/'));
  let name = id, version = '0.1.0', category = 'Custom', description = '';
  let preset = 'editorial', exemptions: string[] = [];

  const manifestFile = path.join(dir, 'manifest.json');
  if (fs.existsSync(manifestFile)) {
    try {
      const m = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
      name = m.name ?? id; version = m.version; category = m.category ?? category;
      description = m.description ?? ''; preset = m.craft?.preset ?? preset;
      exemptions = m.craft?.exemptions ?? [];
    } catch { /* ignore */ }
  }

  const tokensCss = (() => { try { return fs.readFileSync(path.join(dir, 'tokens.css'), 'utf8'); } catch { return ''; } })();
  const tokens = parseDeclaredTokens(tokensCss);
  const missingRoles = SEMANTIC_TOKEN_ROLES.filter(r => !tokens.includes(r));

  const codeDir = path.join(dir, 'code');
  const primitives = fs.existsSync(codeDir) ? fs.readdirSync(codeDir).filter(f => f.endsWith('.tsx') && !f.includes('.stories')).map(f => f.replace('.tsx', '')) : [];

  const blueprintDir = path.join(dir, 'blueprints');
  const blueprints = fs.existsSync(blueprintDir) ? fs.readdirSync(blueprintDir) : [];

  return {
    id, name, version, category, description, tokens: tokens.length,
    missingRoles, primitives, preset, exemptions, blueprints, lintRules: 12,
  };
}

// ═══════════════════════════════════════════════════════════════════════
// V3: Lint Rule Management
// ═══════════════════════════════════════════════════════════════════════

export const LINT_RULE_PRESETS: Record<string, { applies: string[]; exemptions: string[] }> = {
  editorial: {
    applies: ['off-token-color', 'accent-overuse', 'filler-copy', 'sans-display'],
    exemptions: [],
  },
  product: {
    applies: ['off-token-color', 'accent-overuse', 'emoji-icon', 'invented-metric', 'external-image'],
    exemptions: [],
  },
  fintech: {
    applies: ['off-token-color', 'accent-overuse', 'strict-contrast', 'mono-data-values', 'no-decorative-accent'],
    exemptions: [],
  },
  minimal: {
    applies: ['off-token-color', 'filler-copy', 'strict-spacing'],
    exemptions: ['accent-overuse', 'external-image'],
  },
  brutalist: {
    applies: ['off-token-color', 'filler-copy'],
    exemptions: ['accent-overuse', 'no-focus-ring'],
  },
  'a11y-strict': {
    applies: ['off-token-color', 'accent-overuse', 'contrast-min-7-1', 'focus-visible-required', 'emoji-icon'],
    exemptions: [],
  },
};

export function getLintRules(paths: RepoPaths, id: string): { id: string; preset: string; applies: string[]; exemptions: string[] } {
  const dir = path.join(process.cwd(), 'design-systems', ...normalizeDsRef(id).split('/'));
  const manifestFile = path.join(dir, 'manifest.json');
  let preset = 'editorial', applies = LINT_RULE_PRESETS.editorial.applies, exemptions: string[] = [];
  if (fs.existsSync(manifestFile)) {
    try {
      const m = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
      preset = m.craft?.preset ?? preset;
      applies = m.craft?.applies ?? applies;
      exemptions = m.craft?.exemptions ?? [];
    } catch { /* ignore */ }
  }
  return { id, preset, applies, exemptions };
}

export function setLintRule(paths: RepoPaths, id: string, rule: string, severity: string): { id: string; rule: string; severity: string; note: string } {
  const dir = path.join(process.cwd(), 'design-systems', ...normalizeDsRef(id).split('/'));
  const manifestFile = path.join(dir, 'manifest.json');
  if (!fs.existsSync(manifestFile)) throw new Error(`No manifest for ${id}`);
  const m = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
  if (!m.craft) m.craft = { applies: [], exemptions: [] };
  if (severity === 'off') {
    m.craft.exemptions = [...(m.craft.exemptions ?? []), rule];
    m.craft.applies = (m.craft.applies ?? []).filter((r: string) => r !== rule);
  } else {
    m.craft.exemptions = (m.craft.exemptions ?? []).filter((r: string) => r !== rule);
    if (!m.craft.applies.includes(rule)) m.craft.applies.push(rule);
  }
  fs.writeFileSync(manifestFile, JSON.stringify(m, null, 2) + '\n');
  return { id, rule, severity, note: `Rule '${rule}' set to ${severity}` };
}

export function applyLintPreset(paths: RepoPaths, id: string, preset: string): { id: string; preset: string; applies: string[]; exemptions: string[]; note: string } {
  const config = LINT_RULE_PRESETS[preset];
  if (!config) throw new Error(`Unknown preset '${preset}'. Available: ${Object.keys(LINT_RULE_PRESETS).join(', ')}`);
  const dir = path.join(process.cwd(), 'design-systems', ...normalizeDsRef(id).split('/'));
  const manifestFile = path.join(dir, 'manifest.json');
  if (!fs.existsSync(manifestFile)) throw new Error(`No manifest for ${id}`);
  const m = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
  m.craft = { ...(m.craft ?? {}), preset, applies: config.applies, exemptions: config.exemptions };
  fs.writeFileSync(manifestFile, JSON.stringify(m, null, 2) + '\n');
  return { id, preset, applies: config.applies, exemptions: config.exemptions, note: `Applied '${preset}' preset: ${config.applies.length} rules, ${config.exemptions.length} exemptions` };
}

// ═══════════════════════════════════════════════════════════════════════
// V3: Blocks / Primitives Registry
// ═══════════════════════════════════════════════════════════════════════

export interface BlockInfo {
  id: string;
  variants: string;
  states: string;
  tokens: string[];
}

const BUILT_IN_BLOCKS: Record<string, BlockInfo> = {
  Button: { id: 'Button', variants: 'primary,secondary,ghost,danger', states: 'hover,active,focus,disabled,loading', tokens: ['--color-accent', '--color-text', '--radius'] },
  Card: { id: 'Card', variants: 'default,interactive,elevated', states: 'hover,selected', tokens: ['--color-surface-raised', '--color-border', '--radius'] },
  Input: { id: 'Input', variants: 'text,search,number', states: 'focus,error,disabled', tokens: ['--color-border', '--color-text', '--radius'] },
  Select: { id: 'Select', variants: 'default,multiple', states: 'focus,error,disabled', tokens: ['--color-border', '--color-text'] },
  Badge: { id: 'Badge', variants: 'neutral,accent,success,warn,danger', states: '', tokens: ['--color-accent', '--color-success', '--color-warning', '--color-danger'] },
  Heading: { id: 'Heading', variants: 'h1-h6,page-title,section-title', states: '', tokens: ['--font-display', '--color-text'] },
  Text: { id: 'Text', variants: 'body,body-sm,label,code,mono', states: '', tokens: ['--font-sans', '--color-text'] },
  Stack: { id: 'Stack', variants: 'row,col', states: '', tokens: ['--space-unit'] },
  Grid: { id: 'Grid', variants: 'auto-fill,fixed,columns', states: '', tokens: ['--space-unit'] },
  Table: { id: 'Table', variants: 'default,dense,striped', states: '', tokens: ['--color-border', '--color-surface'] },
  Tabs: { id: 'Tabs', variants: 'underline,pills,segments', states: 'active,hover,disabled', tokens: ['--color-accent', '--color-border'] },
  Modal: { id: 'Modal', variants: 'default,fullscreen,side-panel', states: 'open,closing', tokens: ['--color-surface-raised', '--color-text'] },
  Toast: { id: 'Toast', variants: 'success,warn,danger,info', states: 'enter,exit', tokens: ['--color-success', '--color-warning', '--color-danger', '--color-info'] },
  Tooltip: { id: 'Tooltip', variants: 'top,bottom,left,right', states: 'visible,hidden', tokens: ['--color-text'] },
  Avatar: { id: 'Avatar', variants: 'image,initials,icon', states: '', tokens: ['--color-accent'] },
  Spinner: { id: 'Spinner', variants: 'default,page,inline', states: '', tokens: ['--color-accent'] },
  Skeleton: { id: 'Skeleton', variants: 'text,card,avatar,table', states: '', tokens: ['--color-surface'] },
  Divider: { id: 'Divider', variants: 'horizontal,vertical', states: '', tokens: ['--color-border'] },
  Dropdown: { id: 'Dropdown', variants: 'click,hover', states: 'open,closing', tokens: ['--color-surface-raised', '--color-border'] },
  Pagination: { id: 'Pagination', variants: 'default,compact,simple', states: 'active,disabled', tokens: ['--color-accent'] },
  Progress: { id: 'Progress', variants: 'determinate,indeterminate', states: '', tokens: ['--color-accent', '--color-surface'] },
  Switch: { id: 'Switch', variants: 'default', states: 'checked,disabled', tokens: ['--color-accent', '--color-surface'] },
  Checkbox: { id: 'Checkbox', variants: 'default', states: 'checked,disabled', tokens: ['--color-accent', '--color-border'] },
  Radio: { id: 'Radio', variants: 'default', states: 'checked,disabled', tokens: ['--color-accent'] },
  Textarea: { id: 'Textarea', variants: 'default', states: 'focus,error,disabled', tokens: ['--color-border', '--radius'] },
  FormField: { id: 'FormField', variants: 'wrapper', states: '', tokens: ['--color-text', '--color-border'] },
  Breadcrumb: { id: 'Breadcrumb', variants: 'default,collapsed', states: '', tokens: ['--color-text'] },
};

export function listBlocks(tags?: string): BlockInfo[] {
  let blocks = Object.values(BUILT_IN_BLOCKS);
  if (tags) {
    const tagSet = new Set(tags.split(',').map(t => t.trim().toLowerCase()));
    blocks = blocks.filter(b => {
      const id = b.id.toLowerCase();
      if (tagSet.has('form') && ['input','select','textarea','checkbox','radio','switch','formfield'].includes(id)) return true;
      if (tagSet.has('data') && ['table','pagination','progress','breadcrumb'].includes(id)) return true;
      if (tagSet.has('navigation') && ['tabs','dropdown','breadcrumb','pagination'].includes(id)) return true;
      if (tagSet.has('feedback') && ['toast','tooltip','modal','spinner','skeleton'].includes(id)) return true;
      if (tagSet.has('layout') && ['stack','grid','divider','card'].includes(id)) return true;
      return false;
    });
  }
  return blocks;
}

export function scaffoldBlocks(paths: RepoPaths, id: string, blockNames: string[]): { id: string; blocks: string[]; note: string } {
  const fromDir = path.join(paths.designSystemsDir, '_vendor', 'open-design', 'atelier', 'code');
  const toDir = path.join(paths.designSystemsDir, ...normalizeDsRef(id).split('/'), 'code');
  const scaffolded: string[] = [];

  for (const name of blockNames) {
    const block = BUILT_IN_BLOCKS[name];
    if (!block) continue;
    // Try to copy from atelier primitives
    const src = path.join(fromDir, `${name}.tsx`);
    if (fs.existsSync(src)) {
      ensureDir(toDir);
      fs.writeFileSync(path.join(toDir, `${name}.tsx`), fs.readFileSync(src, 'utf8'));
      scaffolded.push(name);
    }
  }

  return { id, blocks: scaffolded, note: `Scaffolded ${scaffolded.length}/${blockNames.length} blocks` };
}

// ═══════════════════════════════════════════════════════════════════════
// V3: Blueprints
// ═══════════════════════════════════════════════════════════════════════

export interface BlueprintInfo {
  id: string;
  name: string;
  description: string;
  composes: string[];
  props: string;
  category: string;
}

const BUILT_IN_BLUEPRINTS: BlueprintInfo[] = [
  { id: 'stat-card', name: 'Stat Card', description: 'Metric display: label, value, optional trend', composes: ['Card', 'Heading', 'Text', 'Badge'], props: 'label:string, value:string, trend:up|down|neutral?', category: 'data' },
  { id: 'data-table', name: 'Data Table', description: 'Sortable table with pagination', composes: ['Table', 'Pagination', 'Badge'], props: 'columns, rows, sortable, page, totalPages', category: 'data' },
  { id: 'data-filters', name: 'Data Filters', description: 'Filter bar with inputs and button', composes: ['Input', 'Select', 'Button', 'Stack'], props: 'filters, onApply, onReset', category: 'form' },
  { id: 'form-section', name: 'Form Section', description: 'Form group with fields', composes: ['FormField', 'Input', 'Select', 'Textarea', 'Stack'], props: 'fields, onSubmit', category: 'form' },
  { id: 'page-header', name: 'Page Header', description: 'Page title with breadcrumb and actions', composes: ['Heading', 'Breadcrumb', 'Button', 'Stack'], props: 'title, breadcrumbs, actions', category: 'navigation' },
  { id: 'sidebar-nav', name: 'Sidebar Navigation', description: 'Side nav with links and user section', composes: ['Stack', 'Text', 'Badge', 'Avatar'], props: 'items, user', category: 'navigation' },
  { id: 'modal-form', name: 'Modal Form', description: 'Dialog with form fields', composes: ['Modal', 'FormField', 'Input', 'Button'], props: 'title, fields, onSave, onCancel', category: 'form' },
  { id: 'toast-container', name: 'Toast Container', description: 'Notification area with stacked toasts', composes: ['Stack', 'Toast'], props: 'toasts, onDismiss', category: 'feedback' },
  { id: 'tabs-with-content', name: 'Tabs with Content', description: 'Tabbed interface with content panels', composes: ['Tabs', 'Stack', 'Card'], props: 'tabs, activeTab, onChange', category: 'navigation' },
  { id: 'card-grid', name: 'Card Grid', description: 'Responsive card layout', composes: ['Grid', 'Card', 'Heading'], props: 'cards, columns', category: 'layout' },
  { id: 'search-results', name: 'Search Results', description: 'Search UI with results table', composes: ['Input', 'Table', 'Pagination'], props: 'query, results, page, total', category: 'data' },
  { id: 'settings-page', name: 'Settings Page', description: 'Settings UI with tabs and switches', composes: ['Tabs', 'FormField', 'Switch', 'Stack'], props: 'sections', category: 'form' },
  { id: 'activity-feed', name: 'Activity Feed', description: 'Stream of activity items', composes: ['Stack', 'Card', 'Text', 'Badge', 'Avatar'], props: 'activities', category: 'data' },
  { id: 'chart-card', name: 'Chart Card', description: 'Chart container with header and tabs', composes: ['Card', 'Heading', 'Tabs', 'Stack'], props: 'title, tabs, chart', category: 'data' },
];

export function listBlueprints(category?: string): BlueprintInfo[] {
  if (!category) return BUILT_IN_BLUEPRINTS;
  return BUILT_IN_BLUEPRINTS.filter(b => b.category === category);
}

export function applyBlueprint(paths: RepoPaths, blueprintId: string, targetName: string, opts?: { dir?: string }): { name: string; blueprint: string; file: string; composes: string[]; note: string } {
  const blueprint = BUILT_IN_BLUEPRINTS.find(b => b.id === blueprintId);
  if (!blueprint) throw new Error(`Blueprint '${blueprintId}' not found. Available: ${BUILT_IN_BLUEPRINTS.map(b => b.id).join(', ')}`);
  const outDir = opts?.dir ?? path.join(process.cwd(), 'src', 'generated');

  // Generate component source from blueprint
  const imports = blueprint.composes.map(c => `import { ${c} } from "@ds/${c}";`).join('\n');
  const renders = blueprint.composes.map(c => `      <${c} />`).join('\n');
  const source = `import React from "react";
${imports}

export interface ${targetName}Props {
  className?: string;
}

export function ${targetName}({ className }: ${targetName}Props) {
  return (
    <div className={className}>
    ${renders}
    </div>
  );
}
`;
  ensureDir(outDir);
  const ext = '.tsx';
  const file = path.join(outDir, `${targetName}${ext}`);
  fs.writeFileSync(file, source);

  return { name: targetName, blueprint: blueprintId, file, composes: blueprint.composes, note: `Applied '${blueprintId}' blueprint → ${targetName} (${blueprint.composes.length} primitives)` };
}
