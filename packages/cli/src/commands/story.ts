import fs from 'node:fs';
import path from 'node:path';
import type { RepoPaths } from '@emdesign/backend';
import { effectiveAdapter, toStoryId, ensureDir } from '@emdesign/backend';
import { formatJson, formatError } from '../lib/format.js';

export interface StoryAutoArgs {
  component: string;
  json?: boolean;
}

/**
 * Auto-generate CSF stories from component prop types.
 * Analyzes the component source's props interface and generates stories for each variant.
 * Writes the story alongside the component (in components/ if captured, generated/ if not).
 */
export async function cmdStoryAuto(args: StoryAutoArgs, paths: RepoPaths): Promise<void> {
  const { component } = args;
  if (!component) {
    formatError('usage: story auto <component>');
    process.exit(1);
  }

  const adapter = effectiveAdapter(paths);
  const ext = adapter.fileExt;
  const storyExt = adapter.storyExt;

  // Check captured dir first, then generated dir
  const capturedPath = path.join(paths.componentsDir, component, `${component}${ext}`);
  const generatedPath = path.join(paths.generatedDir, `${component}${ext}`);
  const srcPath = fs.existsSync(capturedPath) ? capturedPath
    : fs.existsSync(generatedPath) ? generatedPath
    : null;

  if (!srcPath) {
    formatError(`Component not found at ${capturedPath} or ${generatedPath}`);
    process.exit(1);
  }

  // Determine output dir — alongside the component
  const isCaptured = srcPath === capturedPath;
  const outDir = isCaptured ? path.join(paths.componentsDir, component) : paths.generatedDir;
  ensureDir(outDir);

  const src = fs.readFileSync(srcPath, 'utf8');

  // Parse props interface — look for Props interface and export name
  const exportMatch = src.match(/export\s+(?:function|const)\s+(\w+)/);
  const name = exportMatch ? exportMatch[1] : component;
  const propMatch = src.match(/interface\s+\w*Props\s*{([^}]+)}/);
  const propBlock = propMatch ? propMatch[1] : '';
  const props = propBlock.split('\n')
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('//'))
    .map(l => {
      // Skip lines with function types (contain parentheses)
      if (l.includes('(') && l.includes(')')) return null;
      const m = l.match(/(\w+)\??:\s*([\w[\]<>]+)/);
      return m ? { name: m[1], type: m[2], required: !l.includes('?') } : null;
    })
    .filter(Boolean) as { name: string; type: string; required: boolean }[];

  // Generate stories
  const booleanProps = props.filter(p => p.type === 'boolean');
  const stringProps = props.filter(p => p.type === 'string');

  const defaultArgs = props.map(p => {
    if (p.type === 'boolean') return `    ${p.name}: false,`;
    if (p.type === 'string') return `    ${p.name}: 'sample',`;
    if (p.type === 'number') return `    ${p.name}: 0,`;
    if (p.type.endsWith('[]')) return `    ${p.name}: [],`;
    if (p.type.endsWith('}')) return `    ${p.name}: {} as any,`;
    return `    ${p.name}: undefined,`;
  }).join('\n');

  const variants = booleanProps.map(bp => {
    const variantArgs = props.map(p => {
      if (p.name === bp.name) return `    ${p.name}: true,`;
      if (p.type === 'boolean') return `    ${p.name}: false,`;
      if (p.type === 'string') return `    ${p.name}: 'sample',`;
      if (p.type === 'number') return `    ${p.name}: 0,`;
      if (p.type.endsWith('[]')) return `    ${p.name}: [],`;
      if (p.type.endsWith('}')) return `    ${p.name}: {} as any,`;
      return `    ${p.name}: undefined,`;
    }).join('\n');
    const variantName = bp.name.replace(/^is/, '').replace(/^has/, '') + 'Variant';
    return `export const ${variantName}: Story = {
  args: {\n${variantArgs}\n  },
  parameters: { charters: ['should render with ${bp.name}=true'] },
};`;
  });

  const title = isCaptured ? `Components/${component}` : `Generated/${component}`;

  const story = `import type { Meta, StoryObj } from '@storybook/react';
import { ${name} } from './${component}';

const meta: Meta<typeof ${name}> = {
  title: '${title}',
  component: ${name},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {\n${defaultArgs}\n  },
};

${variants.join('\n\n')}
`;

  // Write the story file alongside the component
  const storyFile = path.join(outDir, `${component}${storyExt}`);
  fs.writeFileSync(storyFile, story);

  if (args.json) {
    formatJson({ component, storyFile, props: props.length, variants: variants.length });
  } else {
    process.stderr.write(`Story auto-generated: ${storyFile}\n`);
    process.stderr.write(`Props found: ${props.length}, variants generated: ${variants.length}\n`);
  }
}
