#!/usr/bin/env node
import type { RepoPaths, Store } from '@emdesign/backend';
import {
  resolveRepoPaths,
  Store as StoreClass,
  createHttpBridge,
  startHttpBridge,
} from '@emdesign/backend';
import { formatError } from './lib/format.js';
import { cmdDesign } from './commands/design.js';
import { cmdGenerate } from './commands/generate.js';
import { cmdDoctor } from './commands/doctor.js';
import { cmdVision } from './commands/vision.js';
import { cmdCapture, cmdCaptureBaseline } from './commands/capture.js';
import { cmdDiscover, cmdDoc } from './commands/discover.js';
import { cmdDs } from './commands/ds.js';
import { cmdGraph } from './commands/graph.js';
import { cmdInit, cmdAttach, cmdUpdate } from './commands/init.js';
import { cmdExplore } from './commands/explore.js';

const PORT = Number(process.env.EMDESIGN_PORT ?? 4321);

/**
 * Extract the next positional arg (doesn't start with --) from an array.
 */
function positional(argv: string[], offset = 0): string | undefined {
  let idx = 0;
  for (const a of argv) {
    if (a.startsWith('--')) continue;
    if (idx++ === offset) return a;
  }
  return undefined;
}

async function main() {
  const argv = process.argv.slice(2);
  const [cmd = 'help', ...rest] = argv;
  const paths = resolveRepoPaths(process.cwd());
  const store = new StoreClass(paths);

  if (!store.get().activeDesignSystem) {
    store.update({ activeDesignSystem: 'atelier' });
  }

  const json = rest.includes('--json');
  const gate = rest.includes('--gate');

  switch (cmd) {
    // ── Workspace / Project ──────────────────────────────────────────────
    case 'init': {
      const framework = rest[0];
      const dirIdx = rest.indexOf('--dir');
      const dir = dirIdx >= 0 ? rest[dirIdx + 1] : undefined;
      await cmdInit({ framework, dir });
      break;
    }

    case 'attach': {
      const dir = rest[0] && !rest[0].startsWith('--') ? rest[0] : undefined;
      await cmdAttach({ dir });
      break;
    }

    case 'update': {
      const dir = rest[0] && !rest[0].startsWith('--') ? rest[0] : undefined;
      await cmdUpdate({
        dir,
        force: rest.includes('--force'),
        prune: rest.includes('--prune'),
        dryRun: rest.includes('--dry-run'),
        storybook: rest.includes('--storybook'),
      });
      break;
    }

    // ── Server ──────────────────────────────────────────────────────────
    case 'serve': {
      let orch: any;
      try {
        const { PlatformManager } = await import('@emdesign/session');
        orch = new PlatformManager(paths);
      } catch { /* session not available */ }

      const app = await createHttpBridge(store, paths, orch);
      const server = app.listen(PORT, () => {
        console.error(`[emdesign] Server running on http://localhost:${PORT}`);
      });
      if (orch) {
        try {
          const { attachWebSocket } = await import('@emdesign/session');
          attachWebSocket(server as any, orch.bus);
        } catch { /* ws not supported */ }
        orch.services.startHealthChecks();
      }
      break;
    }

    case 'up': {
      let orch: any;
      try {
        const { PlatformManager, attachWebSocket } = await import('@emdesign/session');
        orch = new PlatformManager(paths);
        const server = await startHttpBridge(store, paths, PORT, orch);
        try { attachWebSocket(server as any, orch.bus); } catch { /* ws not available */ }
        orch.startService('storybook').catch(() => {});
        orch.services.startHealthChecks();
        console.error('[emdesign] Platform running. Ctrl+C to stop.');
      } catch (e) {
        console.error('[emdesign] up failed:', (e as Error).message);
        process.exit(1);
      }
      break;
    }

    case 'health': {
      try {
        const r = await fetch(`http://localhost:${PORT}/api/health`, { signal: AbortSignal.timeout(1000) });
        const data = await r.json();
        if (json) process.stdout.write(JSON.stringify(data, null, 2) + '\n');
        else console.error(`[emdesign] Server: ${data.ok ? 'ok' : 'unhealthy'}`);
      } catch {
        if (json) { formatError('Server not reachable'); process.exit(1); }
        else { console.error('[emdesign] Server not reachable'); process.exit(1); }
      }
      break;
    }

    // ── Design system ────────────────────────────────────────────────────
    case 'use': {
      const id = positional(rest);
      if (!id) { formatError('usage: emdesign use <design-system-id>'); process.exit(1); }
      const { resolveDesignSystem, applyDesignSystem } = await import('@emdesign/backend');
      resolveDesignSystem(paths, id);
      const r = applyDesignSystem(paths, id);
      store.update({ activeDesignSystem: id });
      if (json) process.stdout.write(JSON.stringify(r, null, 2) + '\n');
      else console.error(`[emdesign] active design system → ${id}`);
      break;
    }

    case 'ds': {
      const [subcommand = 'list', ...dsArgs] = rest;
      await cmdDs({ subcommand, args: dsArgs, argv: rest, json, gate }, paths, store);
      break;
    }

    // ── Component lifecycle ─────────────────────────────────────────────
    case 'design':
    case 'design-context': {
      const comp = positional(rest);
      const instruction = positional(rest, 1);
      await cmdDesign({ component: comp, instruction, json }, paths, store);
      break;
    }

    case 'generate': {
      const name = positional(rest);
      if (!name) { formatError('usage: emdesign generate <name> [--mode create|edit] [--stdin]'); process.exit(1); }
      const mode = rest.includes('--mode') ? (rest[rest.indexOf('--mode') + 1] as 'create' | 'edit') : 'create';
      const source = rest.includes('--source') ? rest[rest.indexOf('--source') + 1] : undefined;
      const story = rest.includes('--story') ? rest[rest.indexOf('--story') + 1] : undefined;
      await cmdGenerate({
        name, mode, source, story,
        stdin: rest.includes('--stdin'),
        stdinStory: rest.includes('--stdin-story'),
        json,
      }, paths, store);
      break;
    }

    // ── Doctor: `doctor <kind> <component>` — kind is optional (default: all) ──
    case 'doctor':
    case 'lint':
    case 'visual-test':
    case 'score':
    case 'spatial-audit':
    case 'render-lint':
    case 'spatial': {
      // Parse: first positional could be a kind (lint/visual/etc) or a component name.
      // The doctor check-kinds are: lint, visual, snapshot, spatial, charters, react.
      const KINDS = new Set(['lint', 'visual', 'snapshot', 'spatial', 'charters', 'react']);
      const first = positional(rest) ?? '';
      const second = positional(rest, 1);

      let kind: string;
      let component: string | undefined;

      if (KINDS.has(first)) {
        kind = first;
        component = second;
      } else {
        // Legacy aliases set the kind implicitly
        kind = cmd === 'lint' ? 'lint'
          : cmd === 'visual-test' ? 'visual'
          : cmd === 'score' ? 'all'
          : cmd === 'spatial-audit' || cmd === 'spatial' || cmd === 'render-lint' ? 'spatial'
          : 'all';
        component = first || (cmd === 'score' ? (rest.includes('--component') ? rest[rest.indexOf('--component') + 1] : undefined) : undefined);
      }

      if (!component) {
        formatError(`usage: emdesign doctor [kind] <component> [--gate] [--json]\n  kinds: lint, visual, snapshot, spatial, charters, react`);
        process.exit(1);
      }

      const story = rest.includes('--story') ? rest[rest.indexOf('--story') + 1] : undefined;
      const theme = rest.includes('--theme') ? rest[rest.indexOf('--theme') + 1] as 'light' | 'dark' : undefined;
      await cmdDoctor({
        component,
        kind,
        story,
        theme,
        detail: rest.includes('--detail'),
        evidence: rest.includes('--evidence') ? rest[rest.indexOf('--evidence') + 1] : undefined,
        gate,
        json,
      }, paths, store);
      break;
    }

    // ── Vision ───────────────────────────────────────────────────────────
    case 'vision':
    case 'vision-critique': {
      const component = positional(rest);
      if (!component) { formatError('usage: emdesign vision <component> [--mode] [--provider]'); process.exit(1); }
      const mode = rest.includes('--mode') ? rest[rest.indexOf('--mode') + 1] as 'standard' | 'compare' : 'standard';
      const provider = rest.includes('--provider') ? rest[rest.indexOf('--provider') + 1] as 'claude' | 'gemini' | 'minimax' : undefined;
      const reference = rest.includes('--reference') ? rest[rest.indexOf('--reference') + 1] : undefined;
      await cmdVision({ component, mode, provider, reference, json }, paths, store);
      break;
    }

    // ── Capture ──────────────────────────────────────────────────────────
    case 'capture': {
      const name = positional(rest);
      if (!name) { formatError('usage: emdesign capture <component> [--baseline]'); process.exit(1); }
      if (rest.includes('--baseline')) {
        await cmdCapture({ component: name, baseline: true, json }, paths);
      } else {
        await cmdCapture({ component: name, json }, paths);
      }
      break;
    }

    case 'capture-baseline': {
      const name = positional(rest);
      if (!name) { formatError('usage: emdesign capture-baseline <component>'); process.exit(1); }
      await cmdCaptureBaseline({ component: name, json }, paths);
      break;
    }

    // ── Browse ───────────────────────────────────────────────────────────
    case 'discover': {
      const kind = rest.includes('--kind') ? rest[rest.indexOf('--kind') + 1] : 'all';
      const filter = rest.includes('--filter') ? rest[rest.indexOf('--filter') + 1] : undefined;
      await cmdDiscover({ kind, filter, json }, paths, store);
      break;
    }

    case 'doc': {
      const target = positional(rest);
      if (!target) { formatError('usage: emdesign doc <target>'); process.exit(1); }
      await cmdDoc({ target, json }, paths, store);
      break;
    }

    // ── Knowledge graph ──────────────────────────────────────────────────
    case 'graph': {
      const [subcommand = 'build', ...graphArgs] = rest;
      await cmdGraph({ subcommand, args: graphArgs, argv: rest, json }, paths, store);
      break;
    }

    // ── Explore ──────────────────────────────────────────────────────────
    case 'explore': {
      const topic = positional(rest);
      const name = positional(rest, 1);
      const ds = rest.includes('--ds') ? rest[rest.indexOf('--ds') + 1] : undefined;
      await cmdExplore({ topic, name, ds, json }, paths, store);
      break;
    }

    // ── Help ─────────────────────────────────────────────────────────────
    case 'help':
    default: {
      process.stdout.write(`
emdesign — design-engineering CLI

Usage:
  emdesign <command> [args] [--json] [--gate]

Project:
  init <framework> [--dir .]          Scaffold a new workspace
  attach [--dir .]                    Attach to existing project
  update [--dir .]                    Update workspace templates
  serve [--port 4321]                 Start HTTP bridge
  up                                  Start everything
  health                              Ping the HTTP server

Design system:
  use <id>                            Switch active system
  ds list|create|use|validate|grade|scaffold|conflicts|history|bases|base-detail

Component:
  design [comp] [instr]               Design context prompt
  generate <name> [--mode] [--stdin]  Create or edit a component
  doctor [kind] <comp> [--gate]       ALL verification (kinds: lint,visual,snapshot,spatial,charters,react)
  vision <comp> [--mode] [--provider] Vision critique
  capture <comp> [--baseline]         Promote to reusable

Browse:
  discover [--kind] [--filter]        List components, stories, systems
  doc <target>                        Component/story documentation

Knowledge graph:
  graph build|context|impact|query|guidance|where-to-fix

Explore workspace:
  explore [topic]                     Overview, ds, tokens, primitives, components, hierarchy, rules, charters, sections, stats

Doctor kinds (use as subcommands):
  doctor lint <comp>     — lint only (fastest)
  doctor visual <comp>   — visual diff only
  doctor spatial <comp>  — geometry audit
  doctor charters <comp> — story charter evaluation
  doctor react <comp>    — react-doctor scan

Legacy aliases (still work):
  lint, visual-test, score, vision-critique, design-context, spatial-audit

Options:
  --json    Structured JSON output on stdout
  --gate    Exit code = verdict (0 = pass, 1 = fail)

`);
      break;
    }
  }
}

main().catch((err) => {
  console.error('[emdesign] fatal:', err instanceof Error ? err.message : err);
  process.exit(1);
});
