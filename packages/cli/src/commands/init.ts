import path from 'node:path';
import { init, attach, update } from '@emdesign/workspace';
import { formatJson, formatError } from '../lib/format.js';

export interface InitArgs {
  framework?: string;
  dir?: string;
}

export interface AttachArgs {
  dir?: string;
}

export interface UpdateArgs {
  dir?: string;
  force?: boolean;
  prune?: boolean;
  dryRun?: boolean;
  storybook?: boolean;
  json?: boolean;
}

export async function cmdInit(args: InitArgs): Promise<void> {
  const dir = path.resolve(args.dir ?? '.');
  const framework = args.framework;
  if (!framework) {
    formatError('usage: emdesign init <framework> [--dir .]');
    process.exit(1);
  }
  const r = init(framework, dir);
  formatJson({ framework: r.framework, filesWritten: r.wrote.length, notes: r.notes });
}

export async function cmdAttach(args: AttachArgs): Promise<void> {
  const dir = path.resolve(args.dir ?? '.');
  const r = attach(dir);
  formatJson({ framework: r.framework, filesWritten: r.wrote.length, notes: r.notes });
}

export async function cmdUpdate(args: UpdateArgs): Promise<void> {
  const dirArg = args.dir ? path.resolve(args.dir) : undefined;
  const result = update({
    targetDir: dirArg,
    force: args.force,
    prune: args.prune,
    dryRun: args.dryRun,
    checkStorybook: args.storybook,
  });
  const summary: Record<string, unknown> = {};
  if (result.added.length) summary.added = result.added;
  if (result.updated.length) summary.updated = result.updated;
  if (result.skipped.length) summary.skipped = result.skipped;
  if (result.removed.length) summary.removed = result.removed;
  if (result.notes.length) summary.notes = result.notes;
  if (!Object.keys(summary).length) summary.ok = 'Workspace is up to date.';
  formatJson(summary);
}
