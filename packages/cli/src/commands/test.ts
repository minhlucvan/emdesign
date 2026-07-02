/**
 * Test command — placeholder for the CI test subcommand.
 * Re-exported from the built dist or created as stub.
 */
import type { RepoPaths } from '@emdesign/backend';

export interface TestArgs {
  subcommand: string;
  args: string[];
  source?: string;
  story?: string;
  json?: boolean;
  gate?: boolean;
  paths: RepoPaths;
  trace?: any;
}

export async function cmdTest(opts: TestArgs): Promise<void> {
  const { formatJson, formatError } = await import('../lib/format.js');
  switch (opts.subcommand) {
    case 'validate':
    case 'lint':
    case 'audit':
    case 'grade':
    case 'visual':
    case 'spatial':
    case 'render':
    case 'doctor':
    case 'charter':
    case 'contrast':
    case 'graph':
    case 'context':
    case 'states':
    case 'page':
    case 'behavior':
      if (opts.json) {
        formatJson({ ok: true, note: `Test subcommand '${opts.subcommand}' — delegating to CI gate.` });
      } else {
        process.stdout.write(`Test '${opts.subcommand}' — delegate to CI gate.\n`);
      }
      break;
    default:
      formatError(`Unknown test subcommand: ${opts.subcommand}`);
      process.exit(1);
  }
}
