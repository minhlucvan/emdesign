/**
 * Workflow — in-memory + disk-persisted workflow store for design-system creation.
 * Sessions are saved to .emdesign/workflows/<sessionId>.json on every mutation.
 */

import fs from 'node:fs';
import path from 'node:path';
import { resolveRepoPaths, ensureDir, setActiveDesignSystem } from './paths.js';
import { parseDeclaredTokens } from './designContext.js';
import { baseTokensCss, scaffoldPrimitives, validateDesignSystem, manifestJson } from './scaffold.js';
import { buildAndSave } from './graph.js';
import { extractProject, type ExtractionResult } from './project/extract.js';
import { adoptProject } from './project/adopt.js';
import type { AdoptionReport } from './project/report.js';

export type StageStatus = 'pending' | 'running' | 'done' | 'error' | 'cancelled';

export interface WorkflowStage {
  name: string;
  status: StageStatus;
  progress: number; // 0–100
  error?: string;
}

export type SessionStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface WorkflowSession {
  sessionId: string;
  status: SessionStatus;
  stages: WorkflowStage[];
  startedAt: string;
  error?: string;
  cancelled?: boolean;
  /** Rolling buffer of agent text output (most recent entries). Updated by import-awesome handler. */
  agentOutput?: Array<{ text: string; timestamp: number }>;
}

/** Resolve the workflows persistence directory under .emdesign/. */
function workflowsDir(root?: string): string {
  const base = root || (resolveRepoPaths().root);
  return path.join(base, '.emdesign', 'workflows');
}

/**
 * Disk-persisted workflow progress store — keyed by session ID.
 * Every mutation is synced to .emdesign/workflows/<sessionId>.json.
 */
export class WorkflowStore {
  private sessions = new Map<string, WorkflowSession>();
  private persistRoot: string;

  constructor(root?: string) {
    this.persistRoot = workflowsDir(root);
    ensureDir(this.persistRoot);
    this.loadAll(); // load any persisted sessions from disk
  }

  create(id: string, stages: WorkflowStage[]): WorkflowSession {
    const session: WorkflowSession = {
      sessionId: id,
      status: 'running',
      stages: stages.map(s => ({ ...s })),
      startedAt: new Date().toISOString(),
    };
    this.sessions.set(id, session);
    this.save(id);
    return session;
  }

  updateStage(
    id: string, name: string, status: StageStatus,
    progress: number, error?: string,
    extra?: { agentOutput?: Array<{ text: string; timestamp: number }> },
  ): void {
    const session = this.sessions.get(id);
    if (!session) return;
    const stage = session.stages.find(s => s.name === name);
    if (stage) {
      stage.status = status;
      stage.progress = progress;
      if (error !== undefined) stage.error = error;
    }
    // Merge extra agent output if provided
    if (extra?.agentOutput) {
      if (!session.agentOutput) session.agentOutput = [];
      session.agentOutput.push(...extra.agentOutput);
      if (session.agentOutput.length > 200) session.agentOutput = session.agentOutput.slice(-200);
    }
    // Update overall session status
    if (status === 'error') session.status = 'failed';
    else if (session.stages.every(s => s.status === 'done')) session.status = 'completed';
    this.save(id);
  }

  pushAgentOutput(id: string, text: string, timestamp: number): void {
    const session = this.sessions.get(id);
    if (!session) return;
    if (!session.agentOutput) session.agentOutput = [];
    session.agentOutput.push({ text, timestamp });
    if (session.agentOutput.length > 200) session.agentOutput = session.agentOutput.slice(-200);
    this.save(id);
  }

  get(id: string): WorkflowSession | undefined {
    return this.sessions.get(id);
  }

  cancel(id: string): void {
    const session = this.sessions.get(id);
    if (!session) return;
    session.status = 'cancelled';
    session.cancelled = true;
    for (const stage of session.stages) {
      if (stage.status === 'pending' || stage.status === 'running') {
        stage.status = 'cancelled';
      }
    }
    this.save(id);
  }

  // ── Persistence ────────────────────────────────────────────────

  private filePath(id: string): string {
    return path.join(this.persistRoot, `${id}.json`);
  }

  /**
   * Persist a session to disk immediately. Safe to call after direct mutations.
   * Returns true if written, false if session missing.
   */
  save(id: string): boolean {
    try {
      const session = this.sessions.get(id);
      if (session) {
        fs.writeFileSync(this.filePath(id), JSON.stringify(session, null, 2));
        return true;
      }
    } catch { /* best-effort persist */ }
    return false;
  }

  private loadAll(): void {
    try {
      const files = fs.readdirSync(this.persistRoot).filter(f => f.endsWith('.json'));
      for (const file of files) {
        try {
          const data = JSON.parse(fs.readFileSync(path.join(this.persistRoot, file), 'utf8')) as WorkflowSession;
          this.sessions.set(data.sessionId, data);
        } catch { /* skip corrupt files */ }
      }
    } catch { /* no persisted workflows yet */ }
  }
}

export interface WorkflowOrchestratorOptions {
  timeout?: number; // ms, default 120_000
}

export interface RunFromPromptInput {
  prompt: string;
  name?: string;
  id?: string;
}

export interface RunFromDesignMdInput {
  content: string;
  name?: string;
  id?: string;
  /** Workspace root the new design system is written into (defaults to cwd). */
  workspaceRoot?: string;
}

export interface RunFromProjectInput {
  /** Absolute path to the source project to reverse-engineer. */
  projectPath: string;
  /** Workspace root the new design system is written into (defaults to cwd). */
  workspaceRoot?: string;
  name?: string;
  id?: string;
}

export interface RunResult {
  sessionId: string;
  completed: boolean;
  artifacts?: Record<string, string>;
  /** The adoption report (ds-from-project flow). */
  report?: AdoptionReport;
  /** Human-readable notes: documented defaults + DESIGN.md/code divergences. */
  notes?: string[];
  /** The stage that failed, when `completed` is false. */
  failedStage?: string;
  /** The failure reason, when `completed` is false. */
  error?: string;
}

/** Ordered stages of the ds-from-project workflow. */
const PROJECT_STAGE_NAMES = [
  'scan',
  'extract',
  'synthesize DESIGN.md',
  'tokens',
  'build-skill',
  'taste',
  'primitives',
  'adopt',
  'graph',
  'validate',
] as const;

/** Parse `--role: #hex` color declarations out of a DESIGN.md body. */
function parseDesignMdTokens(md: string): Map<string, string> {
  const out = new Map<string, string>();
  const re = /--([\w-]+)\s*:\s*(#[0-9a-fA-F]{3,8})\b/g;
  for (let m = re.exec(md); m; m = re.exec(md)) out.set(m[1], m[2]);
  return out;
}

/** Synthesize a minimal DESIGN.md from extracted evidence (no canonical present). */
function synthesizeDesignMd(name: string, extraction: ExtractionResult): string {
  const colorLines = extraction.proposedRoles
    .filter((r) => r.role.startsWith('color-'))
    .map((r) => `- \`--${r.role}\`: ${r.evidence[0]?.value ?? ''}${r.source === 'default' ? ' (documented default)' : ''}`)
    .join('\n');
  return `---
name: ${name}
category: Adopted
surface: web
---

# ${name}

Synthesized from the design decisions found in an existing project.

## 2. Color
${colorLines}
`;
}

/** Build a complete tokens.css from the neutral base, applying role overrides. */
function buildProjectTokensCss(overrides: Map<string, string>): string {
  let css = baseTokensCss();
  for (const [role, value] of overrides) {
    const re = new RegExp(`(--${role}\\s*:\\s*)[^;]+;`);
    if (re.test(css)) css = css.replace(re, `$1${value};`);
    else css = css.replace(/\n\}/, `\n  --${role}: ${value};\n}`);
  }
  return css;
}

/** Parse CSS variable values from a tokens.css string into a Map<name, value>. */
function parseTokensCssMap(css: string): Map<string, string> {
  const map = new Map<string, string>();
  for (const m of css.matchAll(/--([a-z0-9-]+)\s*:\s*([^;]+);/gi)) {
    map.set(m[1], m[2].trim());
  }
  return map;
}

/** Generate a design-language build skill from a design system's DESIGN.md + tokens.css. */
function generateBuildSkill(name: string, dsDir: string): string {
  const designMd = fs.readFileSync(path.join(dsDir, 'DESIGN.md'), 'utf8');
  const tokensCssContent = fs.readFileSync(path.join(dsDir, 'tokens.css'), 'utf8');
  const tokenMap = parseTokensCssMap(tokensCssContent);

  // Build token roles table for core semantic roles
  const tokenRows: string[] = [];
  const tokenOrder = [
    'color-surface', 'color-surface-raised', 'color-text', 'color-text-muted',
    'color-accent', 'color-accent-hover', 'color-border',
    'radius', 'space-unit', 'font-sans', 'shadow-raised',
  ];
  for (const role of tokenOrder) {
    const value = tokenMap.get(role);
    if (!value) continue;
    const cssClass = role.startsWith('color-')
      ? role.replace('color-', '').replace(/-/g, '-')
      : role;
    const tailwindMap: Record<string, string> = {
      'color-surface': 'bg-surface',
      'color-surface-raised': 'bg-surface-raised',
      'color-text': 'text-text',
      'color-text-muted': 'text-text-muted',
      'color-accent': 'text-accent / bg-accent / border-accent',
      'color-accent-hover': 'hover:bg-accent-hover / hover:text-accent-hover',
      'color-border': 'border-border',
      'radius': 'rounded',
      'space-unit': '(Tailwind p-2 / gap-2 = 8px)',
      'font-sans': 'font-[var(--font-sans)]',
      'shadow-raised': 'shadow-[var(--shadow-raised)]',
    };
    const twClass = tailwindMap[role] ?? `[var(--${role})]`;
    const usage: Record<string, string> = {
      'color-surface': 'Page and section backgrounds',
      'color-surface-raised': 'Cards, inputs, dropdowns, raised blocks',
      'color-text': 'Primary ink for body copy, headings, button labels',
      'color-text-muted': 'Secondary metadata, captions, placeholders',
      'color-accent': 'The one decisive call-to-action, link emphasis, or focus indicator',
      'color-accent-hover': 'Hover and active state on accent-colored elements',
      'color-border': 'Hairline rules, card outlines, input borders, dividers',
      'radius': 'Default component corner rounding',
      'space-unit': 'Base spacing reference — all spacing derives from this unit',
      'font-sans': 'Body and UI text font family',
      'shadow-raised': 'The soft elevated shadow for cards and raised surfaces',
    };
    tokenRows.push(
      `| \`${role}\` | \`${twClass}\` | \`var(--${role})\` | ${usage[role] ?? '—'} (\`${value}\`) |`,
    );
  }

  const tokenTable = `| Role | Tailwind Class | CSS Variable | Usage |
|------|----------------|--------------|-------|
${tokenRows.join('\n')}`;

  return `# ${name} Build Skill

${name} is a design system generated by analyzing an existing project. Every component
must reference the semantic token roles via Tailwind utility classes that map to \`:root\`
custom properties in \`tokens.css\`. No raw hex, no hardcoded spacing, no off-system fonts.

## Token Roles

All semantic token roles are the non-negotiable primitives of this design system.
They are registered in \`tokens.css\` as \`:root\` custom properties.

${tokenTable}

**Usage notes:**
- Use \`text-text\` for all primary foreground copy; \`text-text-muted\` to de-emphasize.
- Apply borders via the \`border border-border\` shorthand for a 1px hairline.
- The accent is precious: never exceed two accent-colored elements on a single screen.
- The \`rounded\` class maps to \`--radius\`. Use \`rounded-[var(--radius-sm)]\` for small radius.

## Type Scale

Refer to the DESIGN.md Typography section for the full type scale. As a general rule:
- Display and heading levels use the display font family.
- Body, caption, and UI text use the sans font family.
- Never hardcode font sizes — reference the DESIGN.md type tokens.

## Spacing Scale

Base unit: \`--space-unit\` (\`${tokenMap.get('space-unit') ?? '8px'}\`).
Every spacing value should be a multiple of the base unit. Never invent intermediate values.

Use Tailwind's spacing scale where it aligns: \`p-2\` (8px), \`p-4\` (16px), \`p-6\` (24px), \`p-8\` (32px).
For custom values, use the \`p-[var(--space-<n>)]\` syntax.

## Radius & Depth

- Default radius: \`rounded\` → \`var(--radius)\` (\`${tokenMap.get('radius') ?? '6px'}\`)
- Small radius: \`rounded-[var(--radius-sm)]\`
- Pill radius: \`rounded-[var(--radius-pill)]\` (9999px)
- Shadow: \`shadow-[var(--shadow-raised)]\` is the only shadow in the system.

## Motion

Refer to DESIGN.md Motion section. Default tokens:
- Fast: \`--motion-fast\` (120ms) — hover/focus transitions
- Base: \`--motion-base\` (220ms) — entrance animations
- Ease: \`--ease-standard\` — default easing

## Component Patterns

Primitives live in \`code/\` and are imported via \`@ds/<Name>\`. Compose from these
rather than re-authoring styles from scratch. Refer to the DESIGN.md Components section
for detailed component specs.

## Anti-Patterns

**DO NOT:**
- Use raw hex colors — always reference semantic roles via Tailwind classes.
- Hardcode spacing outside the approved scale.
- Use the display font for body text or the sans font for headings.
- Exceed two accent-colored elements per screen.
- Use gradient backgrounds, heavy drop-shadows, or glow effects.
- Use emoji as icons, invented metrics, or filler copy.
- Use \`focus:ring\` or Tailwind's default ring utilities — use the focus-visible pattern.
- Use motion on borders, opacity, transforms, or position — only color transitions.

## Reuse vs Author

If a primitive exists at \`@ds/<Name>\`, import it. Never re-author. Check the \`code/\`
directory for available primitives before creating new ones.
`;
}

/** Generate a taste profile skill from a design system's DESIGN.md. */
function generateTasteSkill(name: string, dsDir: string): string {
  const designMd = fs.readFileSync(path.join(dsDir, 'DESIGN.md'), 'utf8');
  // Extract design characteristics from the DESIGN.md frontmatter and first section
  const frontmatterName = designMd.match(/^name:\s*(.+)$/m)?.[1]?.trim() ?? name;
  const description = designMd.match(/^description:\s*(.+)$/m)?.[1]?.trim() ?? '';
  const category = designMd.match(/^category:\s*(.+)$/m)?.[1]?.trim() ?? '';
  const visualTheme = designMd.match(/###\s*1\.\s*Visual Theme[^#]*/i)?.[0] ?? '';

  // Extract a heuristic brand fingerprint from the first paragraph of Visual Theme
  const themeLines = visualTheme.split('\n').filter(l => l.trim().length > 0 && !l.startsWith('#'));
  let fingerprint = description;
  if (themeLines.length > 1) {
    const found = themeLines.slice(1).find(l => l.trim().length > 20)?.trim();
    if (found) fingerprint = found;
  }
  if (!fingerprint) {
    fingerprint = `${frontmatterName} — a ${category ? category.toLowerCase() + ' ' : ''}design system generated from an existing project.`;
  }

  return `---
name: ${name}-taste
description: Taste profile for ${name}
dials:
  DESIGN_VARIANCE: 5
  MOTION_INTENSITY: 5
  VISUAL_DENSITY: 5
---
# ${name} Taste Profile

**Brand fingerprint:** ${fingerprint}

**Visual characteristics:** Generated from an existing project's design decisions.
Token roles, spacing scale, and visual language are defined in the DESIGN.md and tokens.css.

**Anti-patterns:** Avoid raw hex colors, hardcoded spacing outside the approved scale,
and off-token values. Every component must reference semantic token roles.
`;
}

/**
 * Multi-stage workflow orchestrator for design-system generation.
 */
export class WorkflowOrchestrator {
  private store: WorkflowStore;
  private options: Required<WorkflowOrchestratorOptions>;
  private timeouts = new Map<string, NodeJS.Timeout>();
  /** Adoption reports produced by ds-from-project runs, keyed by session id. */
  private reports = new Map<string, AdoptionReport>();

  constructor(storeOrOptions?: WorkflowStore | WorkflowOrchestratorOptions, options?: WorkflowOrchestratorOptions) {
    if (storeOrOptions instanceof WorkflowStore) {
      this.store = storeOrOptions;
      this.options = { timeout: options?.timeout ?? 120_000 };
    } else {
      this.store = new WorkflowStore();
      this.options = { timeout: (storeOrOptions as WorkflowOrchestratorOptions)?.timeout ?? 120_000 };
    }
  }

  /** Run the create-from-prompt workflow stages. */
  async runFromPrompt(input: RunFromPromptInput): Promise<RunResult> {
    const sessionId = input.id ?? `wf_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const stages: WorkflowStage[] = [
      { name: 'analyze', status: 'pending', progress: 0 },
      { name: 'generate-design-md', status: 'pending', progress: 0 },
      { name: 'generate-tokens', status: 'pending', progress: 0 },
      { name: 'scaffold-primitives', status: 'pending', progress: 0 },
      { name: 'build-graph', status: 'pending', progress: 0 },
      { name: 'validate', status: 'pending', progress: 0 },
    ];

    this.store.create(sessionId, stages);

    // Set timeout
    this.setTimeout(sessionId);

    // Check for immediate timeout
    if (this.options.timeout === 0) {
      this.store.updateStage(sessionId, 'analyze', 'error', 0, 'Workflow timeout');
      const session = this.store.get(sessionId);
      if (session) {
        session.status = 'failed';
        session.error = 'Workflow timeout';
      }
      this.clearTimeout(sessionId);
      return { sessionId, completed: false };
    }

    try {
      // Execute each stage sequentially
      await this.runStage(sessionId, 'analyze', 10);
      await this.runStage(sessionId, 'generate-design-md', 30);
      await this.runStage(sessionId, 'generate-tokens', 50);
      await this.runStage(sessionId, 'scaffold-primitives', 70);
      await this.runStage(sessionId, 'build-graph', 85);
      await this.runStage(sessionId, 'validate', 100);

      this.store.updateStage(sessionId, 'validate', 'done', 100);
      const session = this.store.get(sessionId);
      if (session) session.status = 'completed';
      this.clearTimeout(sessionId);

      return {
        sessionId,
        completed: true,
        artifacts: {
          'DESIGN.md': 'Generated from analysis',
          'tokens.css': 'Generated from DESIGN.md',
        },
      };
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e);
      this.store.updateStage(sessionId, 'analyze', 'error', 0, errMsg);
      const session = this.store.get(sessionId);
      if (session) session.status = 'failed';
      this.clearTimeout(sessionId);
      return { sessionId, completed: false };
    }
  }

  /** Run the create-from-design-md workflow stages. */
  async runFromDesignMd(input: RunFromDesignMdInput): Promise<RunResult> {
    const sessionId = input.id ?? `wf_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const workspaceRoot = input.workspaceRoot ?? process.cwd();
    const paths = resolveRepoPaths(workspaceRoot);
    const id = input.id ?? `ds_${Date.now()}`;
    const name = input.name ?? id;
    const dir = path.join(paths.designSystemsDir, id);
    const artifacts: Record<string, string> = {};

    const stages: WorkflowStage[] = [
      { name: 'parse', status: 'pending', progress: 0 },
      { name: 'extract-tokens', status: 'pending', progress: 0 },
      { name: 'generate-tokens-css', status: 'pending', progress: 0 },
      { name: 'build-skill', status: 'pending', progress: 0 },
      { name: 'taste', status: 'pending', progress: 0 },
      { name: 'scaffold-primitives', status: 'pending', progress: 0 },
      { name: 'build-graph', status: 'pending', progress: 0 },
      { name: 'validate', status: 'pending', progress: 0 },
    ];

    this.store.create(sessionId, stages);

    if (this.options.timeout === 0) {
      this.store.updateStage(sessionId, 'parse', 'error', 0, 'Workflow timed out');
      const session = this.store.get(sessionId);
      if (session) session.status = 'failed';
      return { sessionId, completed: false };
    }

    let tokensCss = '';

    try {
      await this.runStage(sessionId, 'parse', 10, () => {
        ensureDir(dir);
        fs.writeFileSync(path.join(dir, 'DESIGN.md'), input.content);
        artifacts['DESIGN.md'] = input.content;
      });

      await this.runStage(sessionId, 'extract-tokens', 25, () => {
        // Parse token declarations from DESIGN.md frontmatter
        const fmMatch = input.content.match(/^---\n([\s\S]*?)\n---/);
        if (fmMatch) {
          const yaml = fmMatch[1];
          const lines: string[] = [];
          const colorsMatch = yaml.match(/colors:[\s\S]*?(?=\n\w|$)/);
          if (colorsMatch) {
            for (const m of colorsMatch[0].matchAll(/^\s{2}([\w-]+):\s*"(#[0-9a-fA-F]+)"/gm)) {
              lines.push(`  --color-${m[1].replace(/_/g, '-')}: ${m[2]};`);
            }
          }
          if (lines.length > 0) artifacts['extracted-tokens'] = `${lines.length} tokens extracted`;
        }
      });

      await this.runStage(sessionId, 'generate-tokens-css', 45, () => {
        // Generate tokens.css from base + override with DESIGN.md values
        const overrides = new Map<string, string>();
        const fmMatch = input.content.match(/^---\n([\s\S]*?)\n---/);
        if (fmMatch) {
          const yaml = fmMatch[1];
          const colorsMatch = yaml.match(/colors:[\s\S]*?(?=\n\w|$)/);
          if (colorsMatch) {
            for (const m of colorsMatch[0].matchAll(/^\s{2}([\w-]+):\s*"(#[0-9a-fA-F]+)"/gm)) {
              overrides.set(m[1].replace(/_/g, '-'), m[2]);
            }
          }
        }
        tokensCss = buildProjectTokensCss(overrides);
        fs.writeFileSync(path.join(dir, 'tokens.css'), tokensCss);
        artifacts['tokens.css'] = tokensCss;
      });

      await this.runStage(sessionId, 'build-skill', 60, () => {
        const buildSkill = generateBuildSkill(name, dir);
        const skillsDir = path.join(dir, 'skills', 'build');
        fs.mkdirSync(skillsDir, { recursive: true });
        fs.writeFileSync(path.join(skillsDir, 'SKILL.md'), buildSkill);
        artifacts['skills/build/SKILL.md'] = 'generated';
      });

      await this.runStage(sessionId, 'taste', 68, () => {
        const tasteSkill = generateTasteSkill(name, dir);
        const tasteDir = path.join(dir, 'skills', 'taste');
        fs.mkdirSync(tasteDir, { recursive: true });
        fs.writeFileSync(path.join(tasteDir, 'SKILL.md'), tasteSkill);
        artifacts['skills/taste/SKILL.md'] = 'generated';
      });

      await this.runStage(sessionId, 'scaffold-primitives', 78, () => {
        scaffoldPrimitives(paths, id, 'atelier');
      });

      await this.runStage(sessionId, 'build-graph', 90, () => {
        buildAndSave(paths, id);
      });

      await this.runStage(sessionId, 'validate', 100, () => {
        const v = validateDesignSystem(paths, id);
        if (!v.ok) throw new Error(`Design system validation failed: ${v.note}`);
      });

      // Register after validate passes
      fs.writeFileSync(
        path.join(dir, 'manifest.json'),
        manifestJson(id, name, {
          category: 'Imported',
          description: `Imported from awesome-design-md.`,
          source: { type: 'awesome', upstream: `https://github.com/voltagent/awesome-design-md` },
        }),
      );
      setActiveDesignSystem(paths.root, id);

      const session = this.store.get(sessionId);
      if (session) session.status = 'completed';

      return { sessionId, completed: true, artifacts };
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e);
      const current = stages.find(s => s.status === 'running')?.name ?? 'parse';
      this.store.updateStage(sessionId, current, 'error', 0, errMsg);
      const session = this.store.get(sessionId);
      if (session) {
        session.status = 'failed';
        session.error = errMsg;
      }
      try { fs.rmSync(dir, { recursive: true, force: true }); } catch { /* nothing to clean */ }
      return { sessionId, completed: false, failedStage: current, error: errMsg };
    }
  }

  // Overload runStage to accept an optional fn parameter
  private async runStage(sessionId: string, name: string, progress: number, fn?: () => void | Promise<void>): Promise<void> {
    const session = this.store.get(sessionId);
    if (!session || session.cancelled || session.status === 'cancelled') {
      throw new Error('Workflow cancelled');
    }
    if (session.status === 'failed') {
      throw new Error(session.error || 'Workflow failed');
    }
    this.store.updateStage(sessionId, name, 'running', Math.max(0, progress - 5));
    if (fn) await fn();
    this.store.updateStage(sessionId, name, 'done', progress);
  }

  /**
   * Run the ds-from-project workflow: scan → extract → synthesize DESIGN.md →
   * tokens → primitives → adopt → graph → validate. Streams per-stage progress
   * into the store. Registers the system in `emdesign.config.json` (and writes a
   * `source.type: "project"` manifest) ONLY after `validate` passes; on any
   * stage failure it stops and registers nothing (removing any partial dir).
   */
  async runFromProject(sessionId: string, input: RunFromProjectInput): Promise<RunResult> {
    const stages: WorkflowStage[] = PROJECT_STAGE_NAMES.map((name) => ({
      name,
      status: 'pending' as StageStatus,
      progress: 0,
    }));
    this.store.create(sessionId, stages);

    const workspaceRoot = input.workspaceRoot ?? process.cwd();
    const paths = resolveRepoPaths(workspaceRoot);
    const id = input.id ?? `proj_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const name = input.name ?? id;
    const dir = path.join(paths.designSystemsDir, id);

    const notes: string[] = [];
    const artifacts: Record<string, string> = {};
    let report: AdoptionReport | undefined;
    let extraction: ExtractionResult | undefined;
    let designMd = '';
    let canonical = false;
    let tokensCss = '';
    let currentStage: (typeof PROJECT_STAGE_NAMES)[number] = 'scan';

    const stage = async (
      n: (typeof PROJECT_STAGE_NAMES)[number],
      progress: number,
      fn: () => void | Promise<void>,
    ): Promise<void> => {
      currentStage = n;
      this.store.updateStage(sessionId, n, 'running', Math.max(0, progress - 5));
      await fn();
      this.store.updateStage(sessionId, n, 'done', progress);
    };

    try {
      await stage('scan', 5, () => {
        if (!fs.existsSync(input.projectPath) || !fs.statSync(input.projectPath).isDirectory()) {
          throw new Error(`Project path not found or not a directory: ${input.projectPath}`);
        }
      });

      await stage('extract', 15, () => {
        extraction = extractProject(input.projectPath);
      });

      await stage('synthesize DESIGN.md', 30, () => {
        const existing = path.join(input.projectPath, 'DESIGN.md');
        if (fs.existsSync(existing)) {
          designMd = fs.readFileSync(existing, 'utf8');
          canonical = true;
        } else {
          designMd = synthesizeDesignMd(name, extraction!);
        }
        artifacts['DESIGN.md'] = designMd;
        ensureDir(dir);
        fs.writeFileSync(path.join(dir, 'DESIGN.md'), designMd);
      });

      await stage('tokens', 45, () => {
        const overrides = new Map<string, string>();
        for (const r of extraction!.proposedRoles) {
          if (r.source === 'extracted' && r.evidence.length) {
            overrides.set(r.role, r.evidence[0].value);
          } else if (r.source === 'default') {
            notes.push(
              `--${r.role} could not be confidently inferred; using documented default ${r.evidence[0]?.value}.`,
            );
          }
        }
        if (canonical) {
          // The existing DESIGN.md is canonical: its values win and divergences are recorded.
          for (const [role, val] of parseDesignMdTokens(designMd)) {
            const codeVal = overrides.get(role);
            if (codeVal && codeVal.toLowerCase() !== val.toLowerCase()) {
              notes.push(`--${role}: DESIGN.md value ${val} overrides / diverges from code value ${codeVal}.`);
            }
            overrides.set(role, val);
          }
        }
        tokensCss = buildProjectTokensCss(overrides);
        artifacts['tokens.css'] = tokensCss;
        fs.writeFileSync(path.join(dir, 'tokens.css'), tokensCss);
      });

      await stage('build-skill', 52, () => {
        const buildSkill = generateBuildSkill(name, dir);
        const skillsDir = path.join(dir, 'skills', 'build');
        fs.mkdirSync(skillsDir, { recursive: true });
        fs.writeFileSync(path.join(skillsDir, 'SKILL.md'), buildSkill);
        artifacts['skills/build/SKILL.md'] = 'generated';
      });

      await stage('taste', 58, () => {
        const tasteSkill = generateTasteSkill(name, dir);
        const tasteDir = path.join(dir, 'skills', 'taste');
        fs.mkdirSync(tasteDir, { recursive: true });
        fs.writeFileSync(path.join(tasteDir, 'SKILL.md'), tasteSkill);
        artifacts['skills/taste/SKILL.md'] = 'generated';
      });

      await stage('primitives', 68, () => {
        scaffoldPrimitives(paths, id, 'atelier');
      });

      await stage('adopt', 82, () => {
        report = adoptProject({
          projectRoot: input.projectPath,
          componentsDir: paths.componentsDir,
          proposedRoles: extraction!.proposedRoles,
          declaredTokens: parseDeclaredTokens(tokensCss),
        });
      });

      await stage('graph', 92, () => {
        buildAndSave(paths, id);
      });

      await stage('validate', 100, () => {
        const v = validateDesignSystem(paths, id);
        if (!v.ok) throw new Error(`Design system validation failed: ${v.note}`);
      });

      // Register ONLY after validate passes: write the project-sourced manifest and
      // point the workspace config at the new system.
      fs.writeFileSync(
        path.join(dir, 'manifest.json'),
        manifestJson(id, name, {
          category: 'Adopted',
          description: `Adopted from an existing project (${input.projectPath}).`,
          source: { type: 'project', skill: 'ds-from-project', upstream: input.projectPath },
        }),
      );
      setActiveDesignSystem(paths.root, id);

      if (report) this.reports.set(sessionId, report);
      const session = this.store.get(sessionId);
      if (session) session.status = 'completed';

      return { sessionId, completed: true, artifacts, report, notes };
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e);
      this.store.updateStage(sessionId, currentStage, 'error', 0, errMsg);
      const session = this.store.get(sessionId);
      if (session) {
        session.status = 'failed';
        session.error = errMsg;
      }
      // Register nothing on failure: drop any partial system directory.
      try { fs.rmSync(dir, { recursive: true, force: true }); } catch { /* nothing to clean */ }
      return { sessionId, completed: false, failedStage: currentStage, error: errMsg, notes };
    }
  }

  /** The adoption report for a completed ds-from-project session, if any. */
  getReport(sessionId: string): AdoptionReport | undefined {
    return this.reports.get(sessionId);
  }

  /** Cancel a running workflow. */
  async cancel(sessionId: string): Promise<void> {
    this.store.cancel(sessionId);
    this.clearTimeout(sessionId);
  }

  /** Get the underlying session data. */
  getSession(sessionId: string): WorkflowSession | undefined {
    return this.store.get(sessionId);
  }

  /** Expose the underlying store for SSE streaming. */
  getStore(): WorkflowStore {
    return this.store;
  }

  private setTimeout(sessionId: string): void {
    const timer = setTimeout(() => {
      const session = this.store.get(sessionId);
      if (session && session.status === 'running') {
        session.status = 'failed';
        session.error = 'Workflow timed out';
      }
    }, this.options.timeout);
    this.timeouts.set(sessionId, timer);
  }

  private clearTimeout(sessionId: string): void {
    const timer = this.timeouts.get(sessionId);
    if (timer) {
      clearTimeout(timer);
      this.timeouts.delete(sessionId);
    }
  }
}

/**
 * Session queue — manages background workflow execution with concurrency limiting.
 * Sessions are queued and processed in FIFO order. Only `maxConcurrent` sessions
 * run at any given time.
 */
export class SessionQueue {
  private queue: string[] = [];
  private running = new Set<string>();
  private store: WorkflowStore;
  private runner: (sessionId: string, metadata?: Record<string, unknown>) => Promise<void>;
  private maxConcurrent: number;
  // Separate metadata store so runner doesn't need to find it on the session
  private metaMap = new Map<string, Record<string, unknown>>();

  constructor(opts: {
    store: WorkflowStore;
    /** Async function that processes a session (e.g. WorkflowOrchestrator.runFromDesignMd). */
    runner: (sessionId: string, metadata?: Record<string, unknown>) => Promise<void>;
    /** Max concurrent sessions (default: 3). */
    maxConcurrent?: number;
  }) {
    this.store = opts.store;
    this.runner = opts.runner;
    this.maxConcurrent = opts.maxConcurrent ?? 3;
  }

  /** Enqueue a session for background processing. */
  enqueue(sessionId: string, metadata?: Record<string, unknown>): void {
    const session = this.store.get(sessionId);
    if (!session) return;
    if (metadata) this.metaMap.set(sessionId, metadata);
    session.status = 'queued';
    this.queue.push(sessionId);
    this.drain();
  }

  /** Number of currently running sessions. */
  get runningCount(): number { return this.running.size; }

  /** Number of queued (not yet running) sessions. */
  get queuedCount(): number { return this.queue.length; }

  /** Total active sessions (queued + running). */
  get activeCount(): number { return this.queue.length + this.running.size; }

  private drain(): void {
    while (this.running.size < this.maxConcurrent && this.queue.length > 0) {
      const sessionId = this.queue.shift()!;
      this.running.add(sessionId);
      this.process(sessionId);
    }
  }

  private async process(sessionId: string): Promise<void> {
    const session = this.store.get(sessionId);
    if (!session) { this.running.delete(sessionId); return; }

    session.status = 'running';

    // Set a journal entry so the frontend can see it transitioned from queued→running
    const startedAt = new Date().toISOString();
    session.startedAt = startedAt;

    try {
      const metadata = this.metaMap.get(sessionId);
      await this.runner(sessionId, metadata);
      // runner updates the store — just confirm terminal state
      const s = this.store.get(sessionId);
      if (s && s.status === 'running') s.status = 'completed';
    } catch (e) {
      const s = this.store.get(sessionId);
      if (s) {
        s.status = 'failed';
        s.error = e instanceof Error ? e.message : String(e);
      }
    } finally {
      this.running.delete(sessionId);
      this.drain(); // process next queued session
    }
  }

  /** Cancel a queued or running session. */
  cancel(sessionId: string): void {
    // Remove from queue if pending
    const qIdx = this.queue.indexOf(sessionId);
    if (qIdx >= 0) {
      this.queue.splice(qIdx, 1);
      const session = this.store.get(sessionId);
      if (session) { session.status = 'cancelled'; session.cancelled = true; }
      return;
    }
    // Cancel running session via the store
    this.store.cancel(sessionId);
  }
}
