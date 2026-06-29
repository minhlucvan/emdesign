/**
 * Component adoption for the "Design System From Existing Project" flow.
 *
 * Brings an existing project's components under emdesign management:
 *  - places each discovered component under the standardized `componentsDir`
 *    (idempotently — re-running does not duplicate or rewrite unchanged files),
 *  - rebinds hardcoded values to inferred semantic token roles ONLY when the
 *    mapping is unambiguous (exactly one candidate role at `confidence >= 0.8`),
 *    leaving every other value untouched and flagged,
 *  - generates a CSF story for any component that lacks one,
 *  - derives per-component readiness from the real consistency lint, and
 *  - assembles the canonical {@link AdoptionReport}.
 *
 * Pure with respect to the source project: it only ever reads from
 * `projectRoot` and writes under `componentsDir`.
 */
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { basename, join } from 'node:path';

import { countMustFix, lintComponent } from '../lint/index.js';
import type { ProposedRole } from './extract.js';
import {
  buildAdoptionReport,
  type AdoptedComponent,
  type AdoptionReport,
  type BlockingValue,
  type ComponentChange,
  type Rebind,
} from './report.js';

/** A proposal at or above this confidence is eligible for an automatic rebind. */
const HIGH_CONFIDENCE = 0.8;

export interface AdoptOptions {
  /** Root of the source project to adopt from (never mutated). */
  projectRoot: string;
  /** Standardized destination directory for managed components. */
  componentsDir: string;
  /** Proposed token roles (from extraction) used to decide rebinds. */
  proposedRoles: ProposedRole[];
  /** Declared token roles — enables the off-token-color readiness check. */
  declaredTokens: string[];
}

// --- Small helpers ---------------------------------------------------------

const HEX_RE_G = /#[0-9a-fA-F]{3,8}\b/g;
/** Arbitrary-value Tailwind utility carrying a raw hex, e.g. `bg-[#ffffff]`. */
const UTIL_HEX_RE = /([a-zA-Z][\w-]*)-\[(#[0-9a-fA-F]{3,8})\]/g;

function lineOf(text: string, index: number): number {
  let line = 1;
  for (let i = 0; i < index && i < text.length; i++) {
    if (text[i] === '\n') line++;
  }
  return line;
}

/** Normalize a hex to lowercase 6-digit form for value comparison. */
function normHex(hex: string): string {
  let h = hex.replace('#', '').toLowerCase();
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  return `#${h}`;
}

/** Component name from a source path; undefined for stories/tests. */
function componentName(file: string): string | undefined {
  const name = basename(file).replace(/\.(tsx|jsx)$/, '');
  if (/\.(stories|test|spec)$/.test(name)) return undefined;
  return name;
}

/** Discover adoptable component files under `<root>/src` (excludes stories/tests). */
function findComponents(root: string): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir)) {
      if (entry === 'node_modules' || entry.startsWith('.')) continue;
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) walk(full);
      else if (/\.(tsx|jsx)$/.test(entry) && componentName(full)) out.push(full);
    }
  };
  walk(join(root, 'src'));
  return out.sort();
}

/** High-confidence candidate roles whose evidence matches `hex`. */
function candidateRoles(hex: string, roles: ProposedRole[]): string[] {
  const target = normHex(hex);
  return roles
    .filter(
      (r) =>
        r.confidence >= HIGH_CONFIDENCE &&
        r.evidence.some((e) => normHex(e.value) === target),
    )
    .map((r) => r.role);
}

/** A generated CSF story for a component lacking one (deterministic). */
function generateStory(name: string): string {
  return (
    `import { ${name} } from './${name}';\n\n` +
    `export default { title: '${name}', component: ${name} };\n\n` +
    `export const Default = {};\n`
  );
}

/** Write `content` to `path`, reporting whether it was created/updated/unchanged. */
function writeIfChanged(path: string, content: string): ComponentChange {
  if (!existsSync(path)) {
    writeFileSync(path, content);
    return 'created';
  }
  if (readFileSync(path, 'utf8') === content) return 'unchanged';
  writeFileSync(path, content);
  return 'updated';
}

/** Combine the file + story outcomes into a single component-level change. */
function combineChange(file: ComponentChange, story: ComponentChange): ComponentChange {
  if (file === 'unchanged' && story === 'unchanged') return 'unchanged';
  if (file === 'created') return 'created';
  return 'updated';
}

// --- Core ------------------------------------------------------------------

/** Compute the rebinds + the rebound source for one component. */
function rebindSource(source: string, roles: ProposedRole[]): { rebound: string; rebinds: Rebind[] } {
  const rebinds: Rebind[] = [];
  const replacements = new Map<string, string>(); // before-utility -> after-utility

  for (let m = UTIL_HEX_RE.exec(source); m; m = UTIL_HEX_RE.exec(source)) {
    const [full, prefix, hex] = m;
    if (replacements.has(full)) continue; // already decided for this utility
    const candidates = candidateRoles(hex, roles);
    if (candidates.length !== 1) continue; // ambiguous / low-conf → leave for manual fix
    const role = candidates[0];
    const after = `${prefix}-${role.replace(/^color-/, '')}`;
    replacements.set(full, after);
    rebinds.push({ before: full, after, role, value: hex, line: lineOf(source, m.index) });
  }

  let rebound = source;
  for (const [before, after] of replacements) rebound = rebound.split(before).join(after);
  return { rebound, rebinds };
}

/** Every raw hex remaining in the placed source becomes a blocking value. */
function blockingValuesOf(rebound: string, placedPath: string, roles: ProposedRole[]): BlockingValue[] {
  const out: BlockingValue[] = [];
  const seen = new Set<string>();
  for (let m = HEX_RE_G.exec(rebound); m; m = HEX_RE_G.exec(rebound)) {
    const value = m[0];
    const line = lineOf(rebound, m.index);
    const key = `${value.toLowerCase()}:${line}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ value, file: placedPath, line, candidates: candidateRoles(value, roles) });
  }
  return out;
}

/** Adopt every component in `projectRoot` into `componentsDir`, returning the report. */
export function adoptProject(opts: AdoptOptions): AdoptionReport {
  const { projectRoot, componentsDir, proposedRoles, declaredTokens } = opts;
  const components: AdoptedComponent[] = [];

  for (const sourceFile of findComponents(projectRoot)) {
    const name = componentName(sourceFile)!;
    const source = readFileSync(sourceFile, 'utf8');
    const { rebound, rebinds } = rebindSource(source, proposedRoles);

    const placedDir = join(componentsDir, name);
    mkdirSync(placedDir, { recursive: true });
    const placedPath = join(placedDir, `${name}.tsx`);
    const fileChange = writeIfChanged(placedPath, rebound);

    // Story: copy an existing sibling story, or generate one when absent.
    const srcStory = sourceFile.replace(/\.(tsx|jsx)$/, '.stories.$1');
    const hasStory = existsSync(srcStory);
    const storyGenerated = !hasStory;
    const storyContent = hasStory ? readFileSync(srcStory, 'utf8') : generateStory(name);
    const storyPath = join(placedDir, `${name}.stories.tsx`);
    const storyChange = writeIfChanged(storyPath, storyContent);

    // Readiness from the real lint: no must-fix (P0) and no off-token color.
    const findings = lintComponent(rebound, { declaredTokens });
    const offToken = findings.some((f) => f.id === 'off-token-color');
    const status = countMustFix(findings) === 0 && !offToken ? 'loop-ready' : 'needs-manual-fix';

    const blockingValues = blockingValuesOf(rebound, placedPath, proposedRoles);

    const declLine = source.search(new RegExp(`\\b${name}\\b`));
    components.push({
      name,
      placedPath,
      storyPath,
      storyGenerated,
      status,
      change: combineChange(fileChange, storyChange),
      rebinds,
      blockingValues,
      graph: { file: placedPath, line: declLine >= 0 ? lineOf(source, declLine) : 1 },
    });
  }

  return buildAdoptionReport(components);
}
