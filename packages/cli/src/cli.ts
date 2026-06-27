#!/usr/bin/env node
import fs from 'node:fs';
import type { RepoPaths, Store } from '@emdesign/backend';
import {
  resolveRepoPaths,
  Store as StoreClass,
  createHttpBridge,
  startHttpBridge,
  effectiveAdapter,
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
import { cmdCompose } from './commands/compose.js';
import { cmdSpatialAudit } from './commands/spatial.js';
import { cmdRenderAnalyze } from './commands/render.js';
import { cmdA11y, cmdComponentTest, cmdComponentDiff } from './commands/component.js';
import { cmdStoryAuto } from './commands/story.js';
import { cmdScreenCreate, cmdScreenList } from './commands/screen.js';
import { cmdLoop } from './commands/loop.js';
import { cmdStorybookHealth } from './commands/storybook.js';
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
  if (argv.includes('--version') || argv.includes('-V')) {
    const { version } = JSON.parse(
      await fs.promises.readFile(new URL('../package.json', import.meta.url), 'utf8')
    ) as { version: string };
    process.stdout.write(`emdesign v${version}\n`);
    return;
  }
  if (argv.includes('--completion')) {
    const shellIdx = argv.indexOf('--completion');
    const shell = shellIdx >= 0 && shellIdx + 1 < argv.length && !argv[shellIdx + 1].startsWith('--') ? argv[shellIdx + 1] : 'bash';
    const commands = ['init','attach','update','serve','up','health','use','ds','design','generate','doctor','vision','capture','capture-baseline','discover','doc','graph','explore','compose','help'];
    const dsSubs = ['list','create','use','validate','grade','scaffold','customize','update','diff','compare','conflicts','history','bases','base-detail','context','prompt'];
    if (shell === 'zsh') {
      process.stdout.write(`#compdef emdesign
_emdesign() {
  local -a commands
  commands=(${commands.map(c => `'${c}:emdesign command'`).join(' ')})
  _arguments \\
    '--json[Structured JSON output]' \\
    '--gate[Exit code verdict]' \\
    '--quiet[Suppress stderr]' \\
    '--version[Show version]' \\
    '--completion[Generate completion]:shell:(bash zsh)' \\
    '1: :->command' \\
    '*: :->args'
  case $state in
    command) _describe 'command' commands ;;
    args) case $words[1] in
      ds) _describe 'ds subcommand' (${dsSubs.join(' ')}) ;;
    esac ;;
  esac
}
compdef _emdesign emdesign
`);
    } else {
      // bash completion
      process.stdout.write(`_emdesign_completions() {
  local cur=\${COMP_WORDS[COMP_CWORD]}
  local prev=\${COMP_WORDS[COMP_CWORD-1]}
  case $prev in
    ds) COMPREPLY=($(compgen -W "${dsSubs.join(' ')}" -- $cur)) ;;
    --completion) COMPREPLY=($(compgen -W "bash zsh" -- $cur)) ;;
    *) COMPREPLY=($(compgen -W "${commands.join(' ')} --json --gate --quiet --version" -- $cur)) ;;
  esac
}
complete -F _emdesign_completions emdesign
`);
    }
    return;
  }
  const [cmd = 'help', ...rest] = argv;
  const paths = resolveRepoPaths(process.cwd());
  const store = new StoreClass(paths);

  if (!store.get().activeDesignSystem) {
    store.update({ activeDesignSystem: 'atelier' });
  }

  const json = rest.includes('--json');
  const gate = rest.includes('--gate');
  const quiet = rest.includes('--quiet');

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
      // Batch mode: generate each entry from a JSON file
      if (rest.includes('--batch')) {
        const batchFile = rest[rest.indexOf('--batch') + 1];
        let entries: { name: string; source: string; story?: string; mode?: string }[];
        try {
          entries = JSON.parse(fs.readFileSync(batchFile, 'utf8'));
          if (!Array.isArray(entries)) throw new Error('batch file must contain a JSON array');
        } catch (e) {
          formatError(`batch file error: ${(e as Error).message}`);
          process.exit(1);
        }
        for (const entry of entries) {
          process.stderr.write(`Generating ${entry.name}...\n`);
          await cmdGenerate({
            name: entry.name, mode: (entry.mode as any) ?? 'create',
            content: entry.source, json,
          }, paths, store);
        }
        break;
      }
      const name = positional(rest);
      if (!name) { formatError('usage: emdesign generate <name> [--content <source>] [--mode create|edit] [--source <file>] [--stdin]'); process.exit(1); }
      const mode = rest.includes('--mode') ? (rest[rest.indexOf('--mode') + 1] as 'create' | 'edit') : 'create';
      const content = rest.includes('--content') ? rest[rest.indexOf('--content') + 1] : undefined;
      const source = rest.includes('--source') ? rest[rest.indexOf('--source') + 1] : undefined;
      const story = rest.includes('--story') ? rest[rest.indexOf('--story') + 1] : undefined;
      await cmdGenerate({
        name, mode, content, source, story,
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

      // Explicit --kind flag takes precedence over positional parsing
      if (rest.includes('--kind')) {
        kind = rest[rest.indexOf('--kind') + 1];
        component = first;
      } else if (KINDS.has(first)) {
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
      const timeout = rest.includes('--timeout') ? Number(rest[rest.indexOf('--timeout') + 1]) : undefined;
      await cmdDoctor({
        component,
        kind,
        story,
        theme,
        timeout,
        detail: rest.includes('--detail'),
        quiet: rest.includes('--quiet'),
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
      // Batch capture all generated components
      if (rest.includes('--all')) {
        const adapter = effectiveAdapter(paths);
        const ext = adapter.fileExt;
        const files = fs.readdirSync(paths.generatedDir).filter(f => f.endsWith(ext) && !f.endsWith('.stories' + ext));
        const names = [...new Set(files.map(f => f.replace(ext, '')))];
        for (const comp of names) {
          process.stderr.write(`Capturing ${comp}...\n`);
          await cmdCapture({ component: comp, baseline: rest.includes('--baseline'), json }, paths);
        }
        break;
      }
      const name = positional(rest);
      if (!name) { formatError('usage: emdesign capture <component> [--baseline] [--all]'); process.exit(1); }
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

    // ── Compose / View ──────────────────────────────────────────────────
    case 'compose': {
      const compName = positional(rest);
      if (!compName) { formatError('usage: emdesign compose <name> --components "Comp1,Comp2,..." [--layout stack|grid|sidebar]'); process.exit(1); }
      const compsArg = rest.includes('--components') ? rest[rest.indexOf('--components') + 1] : '';
      const components = compsArg.split(',').map(s => s.trim()).filter(Boolean);
      const layout = rest.includes('--layout') ? rest[rest.indexOf('--layout') + 1] as 'stack' | 'grid' | 'sidebar' : 'stack';
      await cmdCompose({ name: compName, components, layout, json }, paths);
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

    // ── Spatial Audit ──────────────────────────────────────────────────
    case 'spatial': {
      const [sub, ...spatialRest] = rest;
      if (sub === 'audit' || sub === 'grid') {
        const component = positional(spatialRest);
        if (!component) { formatError('usage: emdesign spatial audit|grid <component> [--grid] [--story <name>]'); process.exit(1); }
        const story = spatialRest.includes('--story') ? spatialRest[spatialRest.indexOf('--story') + 1] : undefined;
        const theme = spatialRest.includes('--theme') ? spatialRest[spatialRest.indexOf('--theme') + 1] as 'light' | 'dark' : undefined;
        await cmdSpatialAudit({ component, story, theme, grid: sub === 'grid', json }, paths);
      } else {
        formatError('usage: emdesign spatial audit|grid <component>');
        process.exit(1);
      }
      break;
    }

    // ── Render Analyze ──────────────────────────────────────────────────
    case 'render': {
      const [renderSub, ...renderRest] = rest;
      if (renderSub === 'analyze' || renderSub === 'snapshot') {
        const component = positional(renderRest);
        if (!component) { formatError('usage: emdesign render analyze|snapshot <component> [--story <name>] [--theme light|dark]'); process.exit(1); }
        const story = renderRest.includes('--story') ? renderRest[renderRest.indexOf('--story') + 1] : undefined;
        const theme = renderRest.includes('--theme') ? renderRest[renderRest.indexOf('--theme') + 1] as 'light' | 'dark' : undefined;
        await cmdRenderAnalyze({ component, story, theme, json }, paths);
      } else {
        formatError('usage: emdesign render analyze|snapshot <component>');
        process.exit(1);
      }
      break;
    }

    // ── Component Intelligence ──────────────────────────────────────────
    case 'component': {
      const [compSub, ...compRest] = rest;
      const component = positional(compRest);
      if (compSub === 'a11y') {
        if (!component) { formatError('usage: emdesign component a11y <component>'); process.exit(1); }
        const story = compRest.includes('--story') ? compRest[compRest.indexOf('--story') + 1] : undefined;
        const theme = compRest.includes('--theme') ? compRest[compRest.indexOf('--theme') + 1] as 'light' | 'dark' : undefined;
        await cmdA11y({ component, story, theme, json }, paths);
      } else if (compSub === 'test') {
        if (!component) { formatError('usage: emdesign component test <component>'); process.exit(1); }
        await cmdComponentTest({ component, json }, paths);
      } else if (compSub === 'diff') {
        if (!component) { formatError('usage: emdesign component diff <component>'); process.exit(1); }
        await cmdComponentDiff({ component, json }, paths);
      } else {
        formatError('usage: emdesign component a11y|test|diff <component>');
        process.exit(1);
      }
      break;
    }

    // ── Story Auto ──────────────────────────────────────────────────────
    case 'story': {
      const [storySub, ...storyRest] = rest;
      if (storySub === 'auto') {
        const component = positional(storyRest);
        if (!component) { formatError('usage: emdesign story auto <component>'); process.exit(1); }
        await cmdStoryAuto({ component, json }, paths);
      } else {
        formatError('usage: emdesign story auto <component>');
        process.exit(1);
      }
      break;
    }

    // ── Screen / Page ───────────────────────────────────────────────────
    case 'screen': {
      const [screenSub, ...screenRest] = rest;
      if (screenSub === 'create') {
        const name = positional(screenRest);
        if (!name) { formatError('usage: emdesign screen create <name> [--route <path>] [--layout <layout>]'); process.exit(1); }
        const route = screenRest.includes('--route') ? screenRest[screenRest.indexOf('--route') + 1] : undefined;
        const layout = screenRest.includes('--layout') ? screenRest[screenRest.indexOf('--layout') + 1] : undefined;
        await cmdScreenCreate({ name, route, layout, json }, paths);
      } else if (screenSub === 'list') {
        await cmdScreenList({ json }, paths);
      } else {
        formatError('usage: emdesign screen create|list ...');
        process.exit(1);
      }
      break;
    }

    // ── Loop ────────────────────────────────────────────────────────────
    case 'loop': {
      const component = positional(rest);
      if (!component) { formatError('usage: emdesign loop <component> [--max-iterations <n>]'); process.exit(1); }
      const maxIterations = rest.includes('--max-iterations') ? Number(rest[rest.indexOf('--max-iterations') + 1]) : 10;
      await cmdLoop({ component, maxIterations, json }, paths, store);
      break;
    }

    // ── Storybook Health ───────────────────────────────────────────────────
    case 'storybook': {
      const [storybookSub, ...sbRest] = rest;
      if (storybookSub === 'health' || storybookSub === 'check') {
        const story = sbRest.includes('--story') ? sbRest[sbRest.indexOf('--story') + 1] : undefined;
        await cmdStorybookHealth({
          verbose: sbRest.includes('--verbose'),
          json: sbRest.includes('--json'),
          story,
        }, paths, store);
      } else {
        formatError('usage: emdesign storybook health|check [--story <id>] [--verbose] [--json]');
        process.exit(1);
      }
      break;
    }

    // ── Help ─────────────────────────────────────────────────────────────
    case 'help':
    default: {
      process.stdout.write(`
emdesign — design-engineering CLI

Usage:
  emdesign <command> [args] [flags]

Common flags:
  --json                  Structured JSON on stdout (machine-readable)
  --gate                  Exit code = verdict (0 = pass, 1 = fail)
  --quiet                 Suppress stderr messages (doctor)
  --version, -V           Show version
  --completion [bash|zsh] Generate shell completion script

── Project ──────────────────────────────────────────────
  init <framework> [--dir .]        Scaffold a new workspace
  attach [--dir .]                  Attach to existing project
  update [--dir .]                  Update workspace templates
  serve [--port 4321]               Start HTTP bridge
  up                                Start everything (bridge + Storybook)
  health                            Ping the HTTP server

── Design System ────────────────────────────────────────
  use <id>                          Switch active design system
  ds list                           List all design systems
  ds create <id> [--mode blank|brief|import|extract]
      [--from <base>] [--name <display>] [--description <text>]  Create DS
  ds update <id> [--name <name>] [--description <text>]  Update DS metadata
  ds diff <id1> <id2>              Compare design systems
  ds validate [id] [--gate]         Validate token contract + DSR rules
  ds grade [id] [--gate] [--timeout ms]    Grade DS quality
  ds scaffold <id> [--from <base>]  Copy base primitives
  ds customize <id> [--color <hex>] [--font <font>] [--name <name>]
      [--id <target-id>]            Clone + tweak a design system
  ds conflicts [id]                 List orphan/unused token conflicts
  ds history [id] [--snapshot]      Show version history / take snapshot
  ds bases                          List vendored base systems
  ds base-detail <id>               Show base system details
  ds context <comp> [instr]         Design context prompt for agent

── Component ────────────────────────────────────────────
  design <comp> [instruction]       Print design-context prompt for agent
  generate <name> [--content <src>] Create/edit component from inline source
      [--source <file>] [--stdin]   ...or from a file / stdin
      [--story <file>] [--mode create|edit]
      [--batch <file.json>]         Batch-generate from JSON array [{name,source}]
  doctor [kind] <comp> [--gate]     Run ALL verification checks
      [--timeout ms] [--detail] [--quiet]
      kinds: lint, visual, snapshot, spatial, charters, react
      (default: all; comma-separate for multiple: "lint,visual")
  doctor lint <comp>                Token lint only (fastest)
  doctor visual <comp> [--timeout]  Visual diff only (needs Storybook)
  doctor spatial <comp>             Geometry audit
  doctor charters <comp>            Story charter evaluation
  doctor react <comp>               React-doctor scan
  vision <comp> [--mode] [--provider]  AI vision critique
  capture <comp> [--baseline]       Promote to reusable component
  capture --all [--baseline]        Capture all generated components
  compose <name> --components "A,B,C" [--layout stack|grid|sidebar]  Compose a view
  component a11y <comp>             Deep axe-core a11y audit
  component test <comp>             Generate vitest tests
  component diff <comp>             Compare generated vs captured version
  story auto <comp>                 Auto-generate CSF stories from props

── V2 Commands ──────────────────────────────────────────
  ds compile <id> [--out <dir>]     Compile tokens → TypeScript types + CSS
  ds export <id> [--out <dir>]      Export DS as consumable npm package
  ds version <id> <major|minor|patch>  Semantic version bump
  ds changelog <id>                 Auto-generate changelog from history
  render analyze <comp>             Headless render → semantic DOM tree
  render snapshot <comp>            Capture render as structured JSON
  spatial audit <comp> [--grid]     Full geometry breakdown (bounding boxes, overlaps)
  spatial grid <comp>               Overlay design grid, measure adherence
  screen create <name> [--route <path>]  Create screen with routing
  screen list                       List all screens
  loop <comp> [--max-iterations <n>]    Full double-loop until gate passes
  storybook health|check [--verbose]    Deep Storybook diagnostics (browser-level)

── Browse ───────────────────────────────────────────────
  discover [--kind all|generated|components|primitives]
      [--filter <text>]             List stories, components, systems
  doc <target>                      Component/story documentation

── Knowledge Graph ──────────────────────────────────────
  graph build [ds-id]               Rebuild knowledge graph
  graph context <node-id>           Full node context
  graph impact <node-id>            Blast radius / affected dependents
  graph where-to-fix <artifact> <finding>  Pinpoint fix location
  graph guidance [name] --intent <text>    Consistency brief for a component
  graph query [--label <label>] [--from <n>] [--to <n>] [--where <json>]

── Explore Workspace ────────────────────────────────────
  explore [topic]                   Overview, ds, tokens, primitives,
      components, hierarchy, rules, charters, sections, stats
  explore hierarchy <name>          Composition tree
  explore tokens --json             Structured token output

Legacy aliases (still work): lint, visual-test, score,
vision-critique, design-context, spatial-audit
`);
      break;
    }
  }
}

main().catch((err) => {
  console.error('[emdesign] fatal:', err instanceof Error ? err.message : err);
  process.exit(1);
});
