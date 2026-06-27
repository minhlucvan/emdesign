import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import type { RepoPaths } from '@emdesign/backend';

// ── Types ────────────────────────────────────────────────────────────

export interface StoryEntry {
  id: string;
  title: string;
  name: string;
  kind: 'generated' | 'component' | 'primitive';
  filePath: string;
}

export interface StorybookIndexEntry {
  id: string;
  title: string;
  name: string;
  type: string;
  tags?: string[];
  importPath?: string;
}

// ── CSF parsing ──────────────────────────────────────────────────────

export function parseCsfTitle(source: string): { title?: string; exports: string[] } {
  const titleMatch = source.match(/(?:export\s+default\s*:\s*|title:\s*["'])([^"'\n]+)/);
  const title = titleMatch?.[1]?.replace(/\/$/, '') ?? undefined;
  const exports: string[] = [];
  const exportRe = /export\s+(?:const\s+)?(\w+)/g;
  let m: RegExpExecArray | null;
  while ((m = exportRe.exec(source)) !== null) {
    if (!['default', 'meta', 'args', 'argTypes'].includes(m[1])) exports.push(m[1]);
  }
  return { title, exports };
}

// ── File scanning ────────────────────────────────────────────────────

export function scanStoryFiles(dir: string, kind: StoryEntry['kind']): StoryEntry[] {
  const entries: StoryEntry[] = [];
  if (!fs.existsSync(dir)) return entries;

  const files = fs.readdirSync(dir).filter(f => f.endsWith('.stories.tsx'));
  for (const file of files) {
    const filePath = path.join(dir, file);
    try {
      const source = fs.readFileSync(filePath, 'utf8');
      const { title, exports: storyExports } = parseCsfTitle(source);
      const componentName = path.basename(file, '.stories.tsx');
      const baseTitle = title ?? `Unknown/${componentName}`;

      for (const storyName of storyExports.length ? storyExports : ['default']) {
        const storyId = `${baseTitle.replace(/\//g, '-').toLowerCase()}--${storyName.toLowerCase()}`;
        entries.push({ id: storyId, title: baseTitle, name: storyName, kind, filePath });
      }
    } catch {
      // Skip unparseable files
    }
  }
  return entries;
}

export function listAllStories(paths: RepoPaths): StoryEntry[] {
  const all: StoryEntry[] = [];
  all.push(...scanStoryFiles(paths.generatedDir, 'generated'));
  all.push(...scanStoryFiles(paths.componentsDir, 'component'));

  const dsDir = path.join(paths.root, 'design-systems');
  if (fs.existsSync(dsDir)) {
    for (const dsEntry of fs.readdirSync(dsDir)) {
      const codeDir = path.join(dsDir, dsEntry, 'code');
      all.push(...scanStoryFiles(codeDir, 'primitive'));
    }
  }
  return all;
}

export function getChangedStories(since?: string): string[] {
  try {
    const ref = since ?? 'HEAD~1';
    const stdout = execSync(
      `git diff --name-only ${ref} -- '*.stories.*' 2>/dev/null || echo ""`,
      { encoding: 'utf8', timeout: 5000 },
    );
    return stdout.trim().split('\n').filter(Boolean);
  } catch {
    return [];
  }
}

export async function fetchStorybookIndex(storybookUrl: string): Promise<StorybookIndexEntry[] | null> {
  try {
    const res = await fetch(`${storybookUrl}/index.json`, { signal: AbortSignal.timeout(2000) });
    if (!res.ok) return null;
    const data = await res.json() as { entries: Record<string, StorybookIndexEntry> };
    return Object.values(data.entries).filter(e => e.type === 'story');
  } catch {
    return null;
  }
}
