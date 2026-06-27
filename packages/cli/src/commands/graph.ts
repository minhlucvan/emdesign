import type { RepoPaths, Store } from '@emdesign/backend';
import { buildAndSave, loadOrBuild, overlayGenerated } from '@emdesign/backend';
import { findAffected, whereToFix, consistencyBrief, getContext, query } from '@emdesign/graph';
import { formatJson, formatError } from '../lib/format.js';
import { activeDsId } from '../lib/resolve.js';

export interface GraphArgs {
  subcommand: string;
  args: string[];
  argv: string[];
  json?: boolean;
}

function graphWithCurrent(paths: RepoPaths, store: Store, id: string) {
  const g = loadOrBuild(paths, id);
  const current = store.get().currentComponent;
  if (current) {
    try { overlayGenerated(g, paths, id, current); } catch { /* not parseable */ }
  }
  return g;
}

/**
 * Extract positional arguments from argv by skipping flags and their values.
 * e.g. ['atelier', '--json'] → ['atelier']
 *      ['--label', 'token', '--json'] → []
 *      ['HeroSection', 'off-token'] → ['HeroSection', 'off-token']
 */
function positionalArgs(argv: string[]): string[] {
  return argv.filter((a, i) => !a.startsWith('--') && (i === 0 || !argv[i - 1].startsWith('--')));
}

export async function cmdGraph(g: GraphArgs, paths: RepoPaths, store: Store): Promise<void> {
  const pos = positionalArgs(g.args);
  const dsId = activeDsId(store);

  switch (g.subcommand) {
    case 'build': {
      const id = pos[0] ?? dsId;
      const graph = buildAndSave(paths, id);
      const stats = graph.stats();
      if (g.json) {
        formatJson(stats);
      } else {
        process.stdout.write(`Graph rebuilt: ${JSON.stringify(stats)}\n`);
      }
      break;
    }

    case 'where-to-fix': {
      const [artifact, finding] = pos;
      if (!artifact || !finding) {
        formatError('usage: emdesign graph where-to-fix <artifact> <finding>');
        process.exit(1);
      }
      const graph = graphWithCurrent(paths, store, dsId);
      const result = whereToFix(graph, `art/${artifact}`, finding);
      out(result ?? `No '${finding}' violation on art/${artifact}.`, g.json);
      break;
    }

    case 'impact': {
      const node = pos[0];
      if (!node) {
        formatError('usage: emdesign graph impact <node>');
        process.exit(1);
      }
      const graph = graphWithCurrent(paths, store, dsId);
      out(findAffected(graph, node), g.json);
      break;
    }

    case 'context': {
      const node = pos[0];
      if (!node) {
        formatError('usage: emdesign graph context <node>');
        process.exit(1);
      }
      const graph = graphWithCurrent(paths, store, dsId);
      const ctx = getContext(graph, node);
      out(ctx ?? `Node not found: ${node}`, g.json);
      break;
    }

    case 'guidance': {
      const name = pos[0] ?? 'Component';
      const intentIdx = g.argv.indexOf('--intent');
      const intent = intentIdx >= 0 ? g.argv[intentIdx + 1] : undefined;
      const graph = graphWithCurrent(paths, store, dsId);
      out(consistencyBrief(graph, { name, intent }), g.json);
      break;
    }

    case 'query': {
      const graph = graphWithCurrent(paths, store, dsId);
      const labelIdx = g.argv.indexOf('--label');
      const fromIdx = g.argv.indexOf('--from');
      const toIdx = g.argv.indexOf('--to');
      const whereIdx = g.argv.indexOf('--where');
      const result = query(graph, {
        label: labelIdx >= 0 ? g.argv[labelIdx + 1] : undefined,
        from: fromIdx >= 0 ? g.argv[fromIdx + 1] : undefined,
        to: toIdx >= 0 ? g.argv[toIdx + 1] : undefined,
        where: whereIdx >= 0 ? JSON.parse(g.argv[whereIdx + 1]) : undefined,
      });
      out(result, g.json);
      break;
    }

    default:
      formatError(`unknown graph subcommand: ${g.subcommand}`);
      process.exit(1);
  }
}

function out(v: unknown, json?: boolean): void {
  if (json) {
    formatJson(v);
  } else {
    process.stdout.write(JSON.stringify(v, null, 2) + '\n');
  }
}
