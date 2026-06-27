import type { RepoPaths, Store } from '@emdesign/backend';
import {
  createDesignSystem,
  applyDesignSystem,
  listDesignSystems,
  listBases,
  gradeDesignSystem,
  renderGrade,
  runtimeFor,
  normalizeDsRef,
} from '@emdesign/backend';
import { formatJson, formatError } from '../lib/format.js';
import { activeDsId } from '../lib/resolve.js';

export interface DsArgs {
  subcommand: string;
  args: string[];
  argv: string[];
  json?: boolean;
  gate?: boolean;
}

export async function cmdDs(ds: DsArgs, paths: RepoPaths, store: Store): Promise<void> {
  const [a1, a2, a3] = ds.args;

  switch (ds.subcommand) {
    case 'create': {
      if (!a1) {
        formatError('usage: emdesign ds create <id> [--mode blank|brief|import|extract] [--from <base>]');
        process.exit(1);
      }
      const modeIdx = ds.argv.indexOf('--mode');
      const mode = modeIdx >= 0 ? ds.argv[modeIdx + 1] as any : 'blank';
      const fromIdx = ds.argv.indexOf('--from');
      const from = fromIdx >= 0 ? ds.argv[fromIdx + 1] : undefined;
      const nameIdx = ds.argv.indexOf('--name');
      const name = nameIdx >= 0 ? ds.argv[nameIdx + 1] : undefined;
      const result = createDesignSystem(paths, { id: a1, mode, from, name });
      out(result, ds.json);
      break;
    }

    case 'bases': {
      const result = listBases(paths);
      out(result, ds.json);
      break;
    }

    case 'use': {
      if (!a1) {
        formatError('usage: emdesign ds use <id>');
        process.exit(1);
      }
      const r = applyDesignSystem(paths, a1);
      store.update({ activeDesignSystem: a1 });
      out(r, ds.json);
      break;
    }

    case 'validate': {
      const id = a1 ? normalizeDsRef(a1) : normalizeDsRef(activeDsId(store));
      const r = runtimeFor(paths).validate(id);
      out(r, ds.json);
      if (ds.gate && !r.ok) process.exit(1);
      break;
    }

    case 'grade': {
      const id = a1 ?? activeDsId(store);
      const r = await gradeDesignSystem(paths, id);
      const report = renderGrade(r);
      if (ds.json) {
        formatJson({ grade: r.grade, matchesGrade: r.matchesGrade, report });
      } else {
        process.stdout.write(report + '\n');
      }
      if (ds.gate && !r.matchesGrade) process.exit(1);
      break;
    }

    case 'scaffold': {
      if (!a1) {
        formatError('usage: emdesign ds scaffold <id> [--from <base>]');
        process.exit(1);
      }
      const fromIdx = ds.argv.indexOf('--from');
      const from = fromIdx >= 0 ? ds.argv[fromIdx + 1] : undefined;
      const { scaffoldPrimitives } = await import('@emdesign/backend');
      const ok = scaffoldPrimitives(paths, a1, from);
      if (ds.json) {
        formatJson({ id: a1, scaffolded: ok });
      } else {
        process.stdout.write(ok ? `Scaffolded primitives into ${a1}/code.\n` : 'Skipped.\n');
      }
      break;
    }

    case 'conflicts': {
      const id = a1 ?? activeDsId(store);
      const r = runtimeFor(paths).conflicts(normalizeDsRef(id));
      out(r, ds.json);
      break;
    }

    case 'history': {
      const id = a1 ?? activeDsId(store);
      const rt = runtimeFor(paths);
      if (ds.argv.includes('--snapshot')) rt.snapshot(id);
      const h = rt.history(id);
      out(h, ds.json);
      break;
    }

    case 'customize': {
      if (!a1) {
        formatError('usage: emdesign ds customize <id> [--name <name>] [--color <hex>] [--font <family>]');
        process.exit(1);
      }
      const { customizeDesignSystem } = await import('@emdesign/backend');
      const nameIdx = ds.argv.indexOf('--name');
      const colorIdx = ds.argv.indexOf('--color');
      const fontIdx = ds.argv.indexOf('--font');
      const c = customizeDesignSystem(paths, {
        baseRef: normalizeDsRef(a1),
        id: ds.argv[ds.argv.indexOf('--id') + 1] ?? a1,
        name: nameIdx >= 0 ? ds.argv[nameIdx + 1] : undefined,
        customizations: {
          seedColor: colorIdx >= 0 ? ds.argv[colorIdx + 1] : undefined,
          headlineFont: fontIdx >= 0 ? ds.argv[fontIdx + 1] : undefined,
        },
      });
      out(c, ds.json);
      break;
    }

    case 'base-detail': {
      if (!a1) {
        formatError('usage: emdesign ds base-detail <id>');
        process.exit(1);
      }
      const { baseDetail } = await import('@emdesign/backend');
      const detail = baseDetail(paths, normalizeDsRef(a1));
      out(detail, ds.json);
      break;
    }

    case 'list':
    default: {
      const systems = listDesignSystems(paths);
      out(systems, ds.json);
      break;
    }
  }
}

function out(v: unknown, json?: boolean): void {
  if (json) {
    formatJson(v);
  } else {
    process.stdout.write(typeof v === 'string' ? v + '\n' : JSON.stringify(v, null, 2) + '\n');
  }
}
