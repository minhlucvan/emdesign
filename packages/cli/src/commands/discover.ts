import fs from 'node:fs';
import path from 'node:path';
import type { RepoPaths, Store } from '@emdesign/backend';
import {
  resolveDesignSystem,
  effectiveAdapter,
  toStoryId,
  runtimeFor,
} from '@emdesign/backend';
import { getContext } from '@emdesign/graph';
import { loadOrBuild, overlayGenerated } from '@emdesign/backend';
import { formatJson, formatError } from '../lib/format.js';
import { activeDsId } from '../lib/resolve.js';
import { listAllStories, fetchStorybookIndex, parseCsfTitle } from '../lib/storybook.js';

export interface DiscoverArgs {
  kind?: string;
  filter?: string;
  json?: boolean;
}

export interface DocArgs {
  target: string;
  json?: boolean;
}

export async function cmdDiscover(args: DiscoverArgs, paths: RepoPaths, store: Store): Promise<void> {
  const STORYBOOK_URL = process.env.EMDESIGN_STORYBOOK_URL ?? 'http://localhost:6006';

  if (args.kind === 'ds' || args.kind === 'design_systems') {
    const systems = runtimeFor(paths).list();
    const result = Array.isArray(systems) ? systems : [];
    if (args.json) {
      formatJson(result);
    } else {
      process.stdout.write(JSON.stringify(result, null, 2) + '\n');
    }
    return;
  }

  // Try Storybook index.json first
  const sbEntries = await fetchStorybookIndex(STORYBOOK_URL);
  let entries;
  if (sbEntries) {
    entries = sbEntries;
    if (args.kind && args.kind !== 'all') {
      const prefix = args.kind === 'primitives' ? 'design-systems-' : `${args.kind}-`;
      entries = entries.filter(e => e.id.startsWith(prefix));
    }
  } else {
    const all = listAllStories(paths);
    entries = all.map(e => ({ id: e.id, title: e.title, name: e.name }));
    if (args.kind && args.kind !== 'all') {
      entries = entries.filter(e => {
        if (args.kind === 'generated') return e.id.startsWith('generated-');
        if (args.kind === 'components') return e.id.startsWith('components-');
        if (args.kind === 'primitives') return e.id.startsWith('design-systems-');
        return true;
      });
    }
  }

  if (args.filter) {
    const f = args.filter.toLowerCase();
    entries = entries.filter((e: any) =>
      e.id.toLowerCase().includes(f) || (e.title && e.title.toLowerCase().includes(f))
    );
  }

  const withUrls = (entries as any[]).map(e => ({
    ...e,
    previewUrl: `${STORYBOOK_URL}/iframe.html?id=${e.id}&viewMode=story`,
  }));

  if (args.json) {
    formatJson(withUrls);
  } else {
    process.stdout.write(JSON.stringify(withUrls, null, 2) + '\n');
  }
}

export async function cmdDoc(args: DocArgs, paths: RepoPaths, store: Store): Promise<void> {
  const target = args.target;
  if (!target) {
    formatError('doc requires a target (component name or story ID)');
    process.exit(1);
  }

  const STORYBOOK_URL = process.env.EMDESIGN_STORYBOOK_URL ?? 'http://localhost:6006';
  const id = activeDsId(store);
  const ds = resolveDesignSystem(paths, id);
  const isStoryId = target.includes('--');
  const name = isStoryId
    ? target.split('--')[0]!.replace(/^(generated|components)-/i, '')
    : target.replace(/^generated-/i, '');

  const result: Record<string, unknown> = {
    component: name,
    designSystem: { id: ds.name ?? id, tokens: ds.declaredTokens?.length ?? 0, primitives: ds.primitives ?? [] },
    previewUrl: `${STORYBOOK_URL}/iframe.html?id=${toStoryId(name)}&viewMode=story`,
    designMd: ds.designMd.slice(0, 1500) + (ds.designMd.length > 1500 ? '\n...(truncated)...' : ''),
  };

  // Knowledge graph context
  try {
    const g = loadOrBuild(paths, id);
    const current = store.get().currentComponent;
    if (current) {
      try { overlayGenerated(g, paths, id, current); } catch { /* ignore */ }
    }
    const nodeId = g.has(`art/${name}`) ? `art/${name}` : null;
    if (nodeId) result.graphContext = getContext(g, nodeId);
  } catch { /* graph optional */ }

  // Story file metadata
  const adapter = effectiveAdapter(paths);
  const storyFile = path.join(paths.generatedDir, `${name}${adapter.storyExt}`);
  if (fs.existsSync(storyFile)) {
    const source = fs.readFileSync(storyFile, 'utf8');
    const { title, exports: storyExports } = parseCsfTitle(source);
    result.story = { title, exports: storyExports };
  }

  // Story-specific details
  if (isStoryId) {
    const storyName = target.split('--')[1] ?? 'default';
    result.storyDetail = { storyId: target, storyName };
  }

  if (args.json) {
    formatJson(result);
  } else {
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  }
}
