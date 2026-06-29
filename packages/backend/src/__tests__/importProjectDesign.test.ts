/**
 * `importProjectDesign` — the embedded-engine driver behind `ds import project`.
 *
 * Realizes the `ds-from-existing-project` requirement "CLI command `ds import
 * project` runs the flow" (Start via CLI / Invalid project path) and the
 * `component-adoption` "Report is machine-readable and human-readable"
 * requirement. The driver runs the `ds-from-project` workflow
 * (`WorkflowOrchestrator.runFromProject`) one-shot, in-process, returning the
 * adoption report plus a gate verdict, and only registers the system once
 * `validate` passes.
 *
 * `importProjectDesign` does not exist yet — this suite is RED until scaffold.ts
 * lands it.
 */

import { afterEach, describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

import { importProjectDesign, validateDesignSystem } from '../scaffold.js';
import { resolveRepoPaths, readConfig } from '../paths.js';
import type { AdoptionReport } from '../project/report.js';

const tmps: string[] = [];

/** A workspace with emdesign.config.json + a seeded `atelier` base (the
 *  primitive source). Mirrors workflow-from-project's fixture. */
function makeWorkspace(): string {
  const ws = fs.mkdtempSync(path.join(os.tmpdir(), 'importproj-ws-'));
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

/** A source project to reverse-engineer: tailwind config + css vars + a
 *  component. The component body is overridable so a test can force a
 *  loop-ready vs needs-manual-fix outcome. */
function makeSourceProject(opts: { component?: string } = {}): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'importproj-src-'));
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
    `export function Card() {
  return <div className="bg-[#0a0a0a] text-[#3b82f6] border-[#1a1a1a] rounded p-4">Card</div>;
}
`;
  fs.writeFileSync(path.join(src, 'components', 'Card.tsx'), component);
  return root;
}

afterEach(() => {
  for (const d of tmps.splice(0)) {
    try { fs.rmSync(d, { recursive: true, force: true }); } catch { /* ignore */ }
  }
});

describe('importProjectDesign — drives the orchestrator in-process', () => {
  it('runs the workflow, registers the system once validate passes, and returns the adoption report', async () => {
    const ws = makeWorkspace();
    const proj = makeSourceProject();
    const paths = resolveRepoPaths(ws);
    const id = 'imported-proj';

    const result: any = await importProjectDesign(paths, proj, { id });

    // The adoption report is returned (per component-adoption's report shape).
    const report: AdoptionReport = result.report;
    expect(Array.isArray(report.components)).toBe(true);
    expect(report.components.length).toBeGreaterThan(0);

    // System registered only because validate passed.
    expect(result.ok).toBe(true);
    expect(validateDesignSystem(paths, id).ok).toBe(true);
    expect(readConfig(ws).activeDesignSystem).toBe(id);
    expect(fs.existsSync(path.join(paths.designSystemsDir, id))).toBe(true);
  });

  it('honors --name on the registered design system', async () => {
    const ws = makeWorkspace();
    const proj = makeSourceProject();
    const paths = resolveRepoPaths(ws);
    const id = 'named-proj';

    const result: any = await importProjectDesign(paths, proj, { id, name: 'Acme Adopted DS' });
    expect(result.ok).toBe(true);

    const manifest = JSON.parse(
      fs.readFileSync(path.join(paths.designSystemsDir, id, 'manifest.json'), 'utf8'),
    );
    expect(manifest.name).toBe('Acme Adopted DS');
  });

  it('produces a gate verdict — pass when every component is loop-ready, fail when any needs manual fix', async () => {
    // Loop-ready: the component is already token-bound (no off-token values).
    const wsReady = makeWorkspace();
    const projReady = makeSourceProject({
      component:
        'export function Card() {\n  return <div className="bg-surface text-accent rounded p-4">Card</div>;\n}\n',
    });
    const readyVerdict: any = await importProjectDesign(
      resolveRepoPaths(wsReady),
      projReady,
      { id: 'gate-ready' },
    );
    expect(readyVerdict.gate).toBe('pass');
    expect(readyVerdict.report.components.every((c: any) => c.status === 'loop-ready')).toBe(true);

    // needs-manual-fix: an off-token hex that maps to no high-confidence role.
    const wsManual = makeWorkspace();
    const projManual = makeSourceProject({
      component:
        'export function Card() {\n  return <div className="bg-[#abcdef] rounded p-4">Card</div>;\n}\n',
    });
    const manualVerdict: any = await importProjectDesign(
      resolveRepoPaths(wsManual),
      projManual,
      { id: 'gate-manual' },
    );
    expect(manualVerdict.gate).toBe('fail');
    expect(
      manualVerdict.report.components.some((c: any) => c.status === 'needs-manual-fix'),
    ).toBe(true);
  });
});

describe('importProjectDesign — invalid project path', () => {
  it('returns a clear error and creates no design system', async () => {
    const ws = makeWorkspace();
    const paths = resolveRepoPaths(ws);
    const id = 'bad-path';
    const missing = path.join(os.tmpdir(), 'no-such-project-' + Date.now());

    await expect(importProjectDesign(paths, missing, { id })).rejects.toThrow();

    // Nothing registered: no ds dir, config not pointed at the would-be system.
    expect(fs.existsSync(path.join(paths.designSystemsDir, id))).toBe(false);
    expect(readConfig(ws).activeDesignSystem).not.toBe(id);
  });
});
