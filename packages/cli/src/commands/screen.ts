import fs from 'node:fs';
import path from 'node:path';
import type { RepoPaths } from '@emdesign/backend';
import { effectiveAdapter, ensureDir } from '@emdesign/backend';
import { formatJson, formatError } from '../lib/format.js';

export interface ScreenCreateArgs {
  name: string;
  route?: string;
  layout?: string;
  json?: boolean;
}

export interface ScreenListArgs {
  json?: boolean;
}

/**
 * Screen CRUD — create a screen with routing metadata, list screens, show tree.
 * Implements the V2 §3.4 screen system.
 */
export async function cmdScreenCreate(args: ScreenCreateArgs, paths: RepoPaths): Promise<void> {
  const { name, route = `/${name.toLowerCase()}`, layout } = args;
  if (!name) {
    formatError('usage: screen create <name> [--route <path>] [--layout <layout>]');
    process.exit(1);
  }

  const adapter = effectiveAdapter(paths);
  const ext = adapter.fileExt;
  const screensDir = path.join(process.cwd(), 'src', 'screens', name);
  ensureDir(screensDir);

  // Screen component
  const imports = layout
    ? `import { ${layout} } from '../${layout}';`
    : '';
  const wrapper = layout
    ? `<${layout}>\n      <h1>${name}</h1>\n    </${layout}>`
    : `<div>\n      <h1>${name}</h1>\n    </div>`;

  const screenSource = `import React from "react";
${imports}

export interface ${name}Props {
  className?: string;
}

export function ${name}({ className }: ${name}Props) {
  return (
    ${wrapper}
  );
}
`;

  fs.writeFileSync(path.join(screensDir, `${name}${ext}`), screenSource);

  // Story file
  const storySource = `import type { Meta, StoryObj } from '@storybook/react';
import { ${name} } from './${name}';

const meta = {
  title: 'Screens/${name}',
  component: ${name},
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ${name}>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
`;
  fs.writeFileSync(path.join(screensDir, `${name}${adapter.storyExt ?? '.stories.tsx'}`), storySource);

  // Page metadata
  const pageJson = { name, route, layout, createdAt: new Date().toISOString() };
  fs.writeFileSync(path.join(screensDir, 'page.json'), JSON.stringify(pageJson, null, 2) + '\n');

  if (args.json) {
    formatJson({ name, route, dir: screensDir, layout });
  } else {
    process.stderr.write(`Screen created: ${name}\n`);
    process.stderr.write(`  Route: ${route}\n`);
    process.stderr.write(`  Dir: ${screensDir}\n`);
    if (layout) process.stderr.write(`  Layout: ${layout}\n`);
  }
}

/** List all screens */
export async function cmdScreenList(args: ScreenListArgs, paths: RepoPaths): Promise<void> {
  const screensDir = path.join(process.cwd(), 'src', 'screens');
  if (!fs.existsSync(screensDir)) {
    if (args.json) { formatJson({ screens: [] }); } else { process.stdout.write('No screens found.\n'); }
    return;
  }

  const entries = fs.readdirSync(screensDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => {
      const pageJsonPath = path.join(screensDir, d.name, 'page.json');
      const meta = fs.existsSync(pageJsonPath) ? JSON.parse(fs.readFileSync(pageJsonPath, 'utf8')) : {};
      return { name: d.name, route: meta.route ?? `/${d.name.toLowerCase()}`, layout: meta.layout, createdAt: meta.createdAt };
    });

  if (args.json) {
    formatJson({ screens: entries });
  } else {
    process.stdout.write(`Screens (${entries.length}):\n`);
    for (const e of entries) {
      process.stdout.write(`  ${e.name} → ${e.route}${e.layout ? ` [layout: ${e.layout}]` : ''}\n`);
    }
  }
}
