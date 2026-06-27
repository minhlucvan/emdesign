import type { CliResponse, CliError } from './types.js';

/**
 * Write JSON to stdout and optionally a human summary to stderr.
 * Use for all `--json` output.
 */
export function formatJson<T>(data: T, opts?: {
  took?: number;
  warnings?: string[];
  gate?: 'pass' | 'fail';
}): void {
  const resp: CliResponse<T> = {
    ok: true,
    data,
    meta: undefined,
  };
  if (opts?.took !== undefined || opts?.warnings || opts?.gate) {
    resp.meta = {};
    if (opts.took !== undefined) resp.meta.took = opts.took;
    if (opts.warnings) resp.meta.warnings = opts.warnings;
    if (opts.gate) resp.meta.gate = opts.gate;
  }
  process.stdout.write(JSON.stringify(resp, null, 2) + '\n');
}

/**
 * Write an error response as JSON and return a non-zero exit.
 * Caller should `process.exit(1)` after this.
 */
export function formatError(error: string, opts?: { took?: number }): void {
  const resp: CliError = { ok: false, error, meta: undefined };
  if (opts?.took !== undefined) resp.meta = { took: opts.took };
  process.stdout.write(JSON.stringify(resp, null, 2) + '\n');
}

/**
 * Gate exit — call after producing a result with `--gate` set.
 * Exits 0 if pass, 1 if fail.
 */
export function gateExit(decision: 'ship' | 'revise' | 'continue' | string): void {
  if (decision === 'ship') {
    process.exit(0);
  }
  process.exit(1);
}

/**
 * Human-readable summary for doctor results (written to stderr).
 */
export function renderDoctorSummary(result: {
  component: string;
  decision: string;
  composite: number;
  mustFix: number;
  kinds: string[];
  scores: Record<string, number>;
}): string {
  const lines: string[] = [
    `\n═══ emdesign doctor: ${result.component} ═══`,
    `Decision: ${result.decision === 'ship' ? '✅ SHIP' : '❌ ' + result.decision.toUpperCase()}`,
    `Composite: ${result.composite.toFixed(3)}`,
    `Must-fix: ${result.mustFix}`,
    `Kinds checked: ${result.kinds.join(', ')}`,
    '── Scores ──',
  ];
  for (const [k, v] of Object.entries(result.scores)) {
    if (v !== undefined) lines.push(`  ${k}: ${v.toFixed(3)}`);
  }
  lines.push(`═══════════════════════════════════════\n`);
  return lines.join('\n');
}
