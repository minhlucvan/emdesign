import fs from 'node:fs';
import path from 'node:path';
import type { RepoPaths, Store, CollectResult } from '@emdesign/backend';
import {
  resolveDesignSystem,
  lintComponent,
  tokenScore,
  countMustFix,
  renderFindingsForAgent,
  runVisualTest,
  toVisualScore,
  renderSnapshot,
  scoreComponent,
  collectScores,
  recordEvidence,
  effectiveAdapter,
  checkStorybookHealth,
} from '@emdesign/backend';
import { runReactDoctor } from '@emdesign/plugin-react-doctor';
import { formatJson, formatError, gateExit, renderDoctorSummary } from '../lib/format.js';
import { activeDsId } from '../lib/resolve.js';
import type { DoctorResult, DoctorFinding } from '../lib/types.js';

export interface DoctorArgs {
  /** The check kind(s) — first positional arg: lint, visual, snapshot, spatial, charters, react, or comma-separated. Default: all. */
  kind?: string;
  /** Component name — second positional arg. */
  component?: string;
  story?: string;
  theme?: 'light' | 'dark';
  detail?: boolean;
  evidence?: string;
  gate?: boolean;
  json?: boolean;
}

/** Read component source from generated dir, falling back to components dir. */
function readComponentSource(paths: RepoPaths, name: string): string | null {
  const adapter = effectiveAdapter(paths);
  const ext = adapter.fileExt;
  const candidates = [
    path.join(paths.generatedDir, `${name}${ext}`),
    path.join(paths.componentsDir, name, `${name}${ext}`),
  ];
  for (const p of candidates) {
    try { if (fs.existsSync(p)) return fs.readFileSync(p, 'utf8'); } catch { /* ignore */ }
  }
  return null;
}

export async function cmdDoctor(args: DoctorArgs, paths: RepoPaths, store: Store): Promise<void> {
  const start = Date.now();
  const name = args.component;
  if (!name) {
    formatError('doctor requires a component name');
    process.exit(1);
  }

  const kinds = parseKinds(args.kind ?? 'all');
  const ds = resolveDesignSystem(paths, activeDsId(store));
  const source = readComponentSource(paths, name);

  const findings: DoctorFinding[] = [];
  const scores: Record<string, number> = {};
  let mustFix = 0;
  let composite = 0;
  let decision: 'ship' | 'revise' | 'continue' = 'revise';

  // ── Lint ───────────────────────────────────────────────────────────────
  if (kinds.includes('lint') && source) {
    try {
      const lintFindings = lintComponent(source, {
        declaredTokens: ds.declaredTokens,
        exemptions: ds.exemptions,
        bindsDisplayFace: ds.bindsDisplayFace,
      });
      const tScore = tokenScore(lintFindings);
      const mf = countMustFix(lintFindings);
      scores.tokens = tScore;
      mustFix += mf;

      for (const f of lintFindings) {
        findings.push({
          kind: 'lint',
          severity: f.severity as 'P0' | 'P1' | 'P2',
          message: f.message,
          target: f.target,
          remediation: f.remediation,
        });
      }
    } catch (e) {
      findings.push({ kind: 'lint', severity: 'P2', message: `Lint failed: ${(e as Error).message}` });
    }
  }

  // ── Visual ─────────────────────────────────────────────────────────────
  if (kinds.includes('visual')) {
    try {
      // Health check first
      const storybookUrl = paths.storybookUrl || process.env.EMDESIGN_STORYBOOK_URL || 'http://localhost:6006';
      const healthError = await checkStorybookHealth(storybookUrl);
      if (healthError) {
        findings.push({ kind: 'visual', severity: 'P1', message: `Storybook not reachable: ${healthError}`, remediation: 'Start Storybook on :6006' });
        scores.visual = 0;
      } else {
        const diff = await runVisualTest(paths, name);
        scores.visual = toVisualScore(diff.status);
        findings.push({
          kind: 'visual',
          severity: diff.status === 'changed' ? 'P0' : 'P2',
          message: `Visual test: ${diff.status}${diff.changedPixels ? ` (${diff.changedPixels} changed pixels)` : ''}`,
          remediation: diff.status === 'changed' ? 'Review the diff screenshot and adjust styling.' : undefined,
        });
      }
    } catch (e) {
      findings.push({ kind: 'visual', severity: 'P1', message: `Visual test failed: ${(e as Error).message}`, remediation: 'Ensure Storybook is running and the component story exists.' });
      scores.visual = 0;
    }
  }

  // ── Snapshot ───────────────────────────────────────────────────────────
  if (kinds.includes('snapshot')) {
    try {
      const snapshots = await renderSnapshot(paths, name, {
        story: args.story ?? 'default',
        themes: args.theme ? [args.theme] : ['light'],
      });
      findings.push({
        kind: 'snapshot',
        severity: 'P2',
        message: `Render snapshot: ${snapshots.length} theme(s), ${snapshots[0]?.nodes?.length ?? 0} DOM nodes`,
        remediation: undefined,
      });
    } catch (e) {
      findings.push({ kind: 'snapshot', severity: 'P1', message: `Snapshot failed: ${(e as Error).message}` });
    }
  }

  // ── Spatial ────────────────────────────────────────────────────────────
  if (kinds.includes('spatial')) {
    try {
      // Spatial audit is optionally available from @emdesign/backend
      const spa = await import('@emdesign/backend');
      if (typeof (spa as any).spatialAudit === 'function') {
        const audit = await (spa as any).spatialAudit(paths, name, {
          story: args.story ?? 'default',
          themes: args.theme ? [args.theme] : ['light'],
        });
        scores.spatial = audit.score;
        for (const f of audit.findings) {
          findings.push({
            kind: 'spatial',
            severity: f.isCritical ? 'P0' : 'P1',
            message: f.message,
            target: f.target,
            remediation: f.remediation,
          });
        }
        if (audit.critical > 0) mustFix += audit.critical;
      } else {
        findings.push({ kind: 'spatial', severity: 'P2', message: 'Spatial audit not available in this build' });
      }
    } catch (e) {
      findings.push({ kind: 'spatial', severity: 'P2', message: `Spatial audit not available: ${(e as Error).message}` });
    }
  }

  // ── Charters ───────────────────────────────────────────────────────────
  if (kinds.includes('charters')) {
    try {
      const adapter = effectiveAdapter(paths);
      const storyFile = path.join(paths.generatedDir, `${name}${adapter.storyExt}`);
      if (fs.existsSync(storyFile)) {
        const storyCount = fs.readFileSync(storyFile, 'utf8').split('export const ').length - 1;
        findings.push({
          kind: 'charters',
          severity: 'P2',
          message: `Story file found: ${storyCount} story export(s)`,
          target: storyFile,
        });
      } else {
        findings.push({
          kind: 'charters',
          severity: 'P2',
          message: 'No story file found — charters not evaluated',
          remediation: 'Create a CSF story file with charters to enable charter evaluation.',
        });
      }
    } catch (e) {
      findings.push({ kind: 'charters', severity: 'P2', message: `Charter check error: ${(e as Error).message}` });
    }
  }

  // ── React doctor ───────────────────────────────────────────────────────
  if (kinds.includes('react') && source) {
    try {
      const scan = await runReactDoctor({ directory: paths.generatedDir, component: name });
      scores.react = scan.score ?? 1;
      for (const f of scan.findings) {
        findings.push({
          kind: 'react',
          severity: f.severity === 'P0' ? 'P0' : f.severity === 'P1' ? 'P1' : 'P2',
          message: f.message,
          target: f.location,
          remediation: f.remediation,
        });
      }
      if (scan.findings.filter((f: any) => f.severity === 'P0').length > 0) {
        // P0 react findings are mustFix items
      }
    } catch (e) {
      findings.push({ kind: 'react', severity: 'P2', message: `React doctor failed: ${(e as Error).message}` });
    }
  }

  // ── Composite gate ─────────────────────────────────────────────────────
  try {
    const gateResult = scoreComponent(paths, {
      scores,
      mustFix,
      threshold: 0.8,
      component: name,
    });
    composite = gateResult.composite;
    decision = gateResult.decision;
  } catch {
    // If gate fails (e.g., no scores collected), treat as revise
    composite = 0;
    decision = 'revise';
  }

  // ── Evidence ───────────────────────────────────────────────────────────
  if (args.evidence) {
    try {
      const evidencePath = recordEvidence(paths, args.evidence, {
        round: 1,
        scores,
        mustFix,
        composite,
        decision,
      }, name);
      findings.push({ kind: 'evidence', severity: 'P2', message: `Evidence saved: ${evidencePath}` });
    } catch (e) {
      findings.push({ kind: 'evidence', severity: 'P2', message: `Evidence save failed: ${(e as Error).message}` });
    }
  }

  // ── Output ─────────────────────────────────────────────────────────────
  const result: DoctorResult = {
    component: name,
    kinds,
    scores,
    composite,
    mustFix,
    decision,
    findings,
  };

  const elapsed = Date.now() - start;

  if (args.json) {
    formatJson(result, {
      took: elapsed,
      gate: args.gate ? (decision === 'ship' ? 'pass' : 'fail') : undefined,
    });
  } else {
    process.stderr.write(renderDoctorSummary(result));
    // Print findings if --detail
    if (args.detail && findings.length > 0) {
      process.stderr.write('── Findings ──\n');
      for (const f of findings) {
        process.stderr.write(`  [${f.kind}/${f.severity}] ${f.message}${f.target ? ` (${f.target})` : ''}\n`);
        if (f.remediation) process.stderr.write(`    → ${f.remediation}\n`);
      }
      process.stderr.write('\n');
    }
    formatJson(result, { took: elapsed });
  }

  // ── Gate exit ──────────────────────────────────────────────────────────
  if (args.gate) {
    gateExit(decision);
  }
}

/** Parse the --kind flag into an array of kinds. */
function parseKinds(kind: string): string[] {
  const all = ['lint', 'visual', 'snapshot', 'spatial', 'charters', 'react'];
  if (kind === 'all') return all;
  return kind.split(',').filter(k => all.includes(k));
}
