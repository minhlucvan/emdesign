/**
 * `ds import project <path>` — the CLI branch in `cmdDs`.
 *
 * Realizes the `ds-from-existing-project` "CLI command `ds import project` runs
 * the flow" scenarios (Start via CLI) and the `component-adoption` report's
 * dual surface (machine-readable `--json` / human-readable summary), plus the
 * `--gate` exit-code contract: non-zero when validation fails OR any component
 * is needs-manual-fix; zero when all loop-ready and validate passes.
 *
 * The `else if (importSrc === 'project')` branch does not exist yet — this suite
 * is RED until ds.ts lands it.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

import { cmdDs, type DsArgs } from '../ds.js';
import { resolveRepoPaths } from '@emdesign/backend';

const tmps: string[] = [];

function makeWorkspace(): string {
  const ws = fs.mkdtempSync(path.join(os.tmpdir(), 'cli-importproj-ws-'));
  tmps.push(ws);
  fs.writeFileSync(
    path.join(ws, 'emdesign.config.json'),
    JSON.stringify({
      framework: 'react-tailwind',
      storybookUrl: 'http://localhost:6006',
      generatedDir: 'src/generated',
      componentsDir: 'src/components',
      designSystemsDir: 'design-systems',
      screenshotsDir: '__screenshots__',
    }),
  );
  const atelierCode = path.join(ws, 'design-systems', 'atelier', 'code');
  fs.mkdirSync(atelierCode, { recursive: true });
  fs.writeFileSync(path.join(atelierCode, 'Button.tsx'), 'export const Button = () => null;\n');
  fs.writeFileSync(
    path.join(atelierCode, 'Button.stories.tsx'),
    "export default { title: 'Button' };\nexport const Default = {};\n",
  );
  return ws;
}

function makeSourceProject(opts: { component?: string } = {}): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cli-importproj-src-'));
  tmps.push(root);
  fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify({ name: 'sample-app', version: '0.0.0' }));
  fs.writeFileSync(
    path.join(root, 'tailwind.config.js'),
    `module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: { extend: { colors: {
    surface: '#0a0a0a',
    accent: '#3b82f6',
    border: '#1a1a1a',
    text: '#fafafa',
  } } },
};
`,
  );
  const src = path.join(root, 'src');
  fs.mkdirSync(path.join(src, 'components'), { recursive: true });
  fs.writeFileSync(
    path.join(src, 'styles.css'),
    ':root {\n  --color-accent: #3b82f6;\n  --color-surface: #0a0a0a;\n}\n',
  );
  const component =
    opts.component ??
    'export function Card() {\n  return <div className="bg-surface text-accent rounded p-4">Card</div>;\n}\n';
  fs.writeFileSync(path.join(src, 'components', 'Card.tsx'), component);
  return root;
}

/** Sentinel thrown by the mocked process.exit so the test can read the code. */
class ExitSignal extends Error {
  constructor(public code: number | undefined) {
    super(`process.exit(${code})`);
  }
}

let stdout = '';
let stderr = '';
let exitCode: number | undefined;
let stdoutSpy: ReturnType<typeof vi.spyOn>;
let stderrSpy: ReturnType<typeof vi.spyOn>;
let exitSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  stdout = '';
  stderr = '';
  exitCode = undefined;
  stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation((chunk: any) => {
    stdout += String(chunk);
    return true;
  });
  stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation((chunk: any) => {
    stderr += String(chunk);
    return true;
  });
  exitSpy = vi.spyOn(process, 'exit').mockImplementation(((code?: number) => {
    exitCode = code;
    throw new ExitSignal(code);
  }) as never);
});

afterEach(() => {
  stdoutSpy.mockRestore();
  stderrSpy.mockRestore();
  exitSpy.mockRestore();
  for (const d of tmps.splice(0)) {
    try { fs.rmSync(d, { recursive: true, force: true }); } catch { /* ignore */ }
  }
});

/** Run `ds import project <projPath>` with the given flags. */
async function runImportProject(
  ws: string,
  projPath: string,
  flags: { json?: boolean; gate?: boolean; name?: string } = {},
): Promise<void> {
  const paths = resolveRepoPaths(ws);
  const args = ['project', projPath];
  if (flags.name) args.push('--name', flags.name);
  const argv = ['import', ...args];
  const ds: DsArgs = {
    subcommand: 'import',
    args,
    argv,
    json: flags.json,
    gate: flags.gate,
  };
  try {
    await cmdDs(ds, paths, {} as any);
  } catch (e) {
    if (!(e instanceof ExitSignal)) throw e;
  }
}

describe('ds import project — Start via CLI', () => {
  it('runs the workflow, prints stage progress, then a human-readable report (counts + triage list)', async () => {
    const ws = makeWorkspace();
    const proj = makeSourceProject();

    await runImportProject(ws, proj);

    const all = stdout + stderr;
    // Stage progress is printed.
    expect(all).toMatch(/scan/i);
    expect(all).toMatch(/adopt/i);
    expect(all).toMatch(/validate/i);
    // Human-readable adoption summary with counts + the component triage list.
    expect(all).toMatch(/Adoption:/);
    expect(all).toMatch(/loop-ready/);
    expect(all).toMatch(/Card/);
  });
});

describe('ds import project --json', () => {
  it('emits the structured report (per-component status, rebinds, blocking values) on stdout', async () => {
    const ws = makeWorkspace();
    const proj = makeSourceProject();

    await runImportProject(ws, proj, { json: true });

    // stdout must be clean JSON (progress goes to stderr in --json mode).
    const parsed = JSON.parse(stdout);
    const report = parsed.data ?? parsed;
    expect(Array.isArray(report.components)).toBe(true);
    expect(report.components.length).toBeGreaterThan(0);
    const comp = report.components[0];
    expect(comp).toHaveProperty('status');
    expect(comp).toHaveProperty('rebinds');
    expect(comp).toHaveProperty('blockingValues');
  });
});

describe('ds import project --gate', () => {
  it('exits zero when all components are loop-ready and validate passes', async () => {
    const ws = makeWorkspace();
    const proj = makeSourceProject({
      component:
        'export function Card() {\n  return <div className="bg-surface text-accent rounded p-4">Card</div>;\n}\n',
    });

    await runImportProject(ws, proj, { gate: true });

    expect(exitCode === undefined || exitCode === 0).toBe(true);
  });

  it('exits non-zero when a component is needs-manual-fix', async () => {
    const ws = makeWorkspace();
    const proj = makeSourceProject({
      component:
        'export function Card() {\n  return <div className="bg-[#abcdef] rounded p-4">Card</div>;\n}\n',
    });

    await runImportProject(ws, proj, { gate: true });

    expect(exitCode).toBeDefined();
    expect(exitCode).not.toBe(0);
  });
});
