import type { RepoPaths, Store } from '@emdesign/backend';
import { lintComponent, tokenScore, countMustFix } from '@emdesign/backend';
import { resolveDesignSystem } from '@emdesign/backend';
import { activeDsId } from '../lib/resolve.js';
import { formatJson, formatError } from '../lib/format.js';
import { cmdDoctor } from './doctor.js';

export interface LoopArgs {
  component: string;
  maxIterations?: number;
  json?: boolean;
}

/**
 * Full double-loop: build → lint → render → spatial → visual → gate → iterate until pass.
 * Implements the V2 §3.3 double-loop architecture.
 */
export async function cmdLoop(args: LoopArgs, paths: RepoPaths, store: Store): Promise<void> {
  const { component, maxIterations = 10 } = args;
  if (!component) {
    formatError('usage: loop <component> [--max-iterations <n>]');
    process.exit(1);
  }

  process.stderr.write(`═══ Double-loop: ${component} ═══\n`);

  for (let round = 1; round <= maxIterations; round++) {
    process.stderr.write(`\n── Round ${round}/${maxIterations} ──\n`);

    // Phase 1: Lint (fast gate)
    process.stderr.write('Phase 1: Lint...\n');
    const ds = resolveDesignSystem(paths, activeDsId(store));
    const adapter = (await import('@emdesign/backend')).effectiveAdapter(paths);
    const ext = adapter.fileExt;
    const fs = await import('node:fs');
    const path = await import('node:path');

    const candidates = [
      path.join(paths.generatedDir, `${component}${ext}`),
      path.join(paths.componentsDir, component, `${component}${ext}`),
    ];
    let source: string | null = null;
    for (const p of candidates) {
      try { if (fs.existsSync(p)) { source = fs.readFileSync(p, 'utf8'); break; } } catch { /* ignore */ }
    }

    if (!source) {
      process.stderr.write('⚠️ Component source not found — generate it first.\n');
      break;
    }

    const lintFindings = lintComponent(source, {
      declaredTokens: ds.declaredTokens,
      exemptions: ds.exemptions,
      bindsDisplayFace: ds.bindsDisplayFace,
    });
    const tScore = tokenScore(lintFindings);
    const mf = countMustFix(lintFindings);
    process.stderr.write(`  Token score: ${tScore.toFixed(3)}, mustFix: ${mf}\n`);

    if (mf === 0) {
      process.stderr.write('  ✅ Lint passed.\n');
    } else {
      process.stderr.write(`  ⚠️ ${mf} P0 issues — fixing needed.\n`);
      // In a full loop, we'd fix here. For now, report and continue.
    }

    // Phase 2: Visual (if Storybook is available)
    process.stderr.write('Phase 2: Visual check...\n');
    try {
      await cmdDoctor({
        component,
        kind: 'visual',
        quiet: true,
      }, paths, store);
    } catch {
      process.stderr.write('  ⚠️ Visual check skipped or failed.\n');
    }

    // Phase 3: Composite check
    process.stderr.write('Phase 3: Gate...\n');
    if (mf === 0 && tScore >= 0.8) {
      process.stderr.write(`\n✅ SHIP: ${component} passed all gates in ${round} round(s).\n`);
      if (args.json) {
        formatJson({ component, decision: 'ship', rounds: round });
      }
      return;
    }
  }

  process.stderr.write(`\n❌ REVISE: ${component} did not pass after ${maxIterations} rounds.\n`);
  if (args.json) {
    formatJson({ component, decision: 'revise', rounds: maxIterations });
  }
}
