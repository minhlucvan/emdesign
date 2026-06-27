import fs from 'node:fs';
import path from 'node:path';
import type { RepoPaths } from '@emdesign/backend';
import { effectiveAdapter, ensureDir } from '@emdesign/backend';
import { formatJson, formatError } from '../lib/format.js';

export interface ComposeArgs {
  name: string;
  components: string[];
  layout?: 'stack' | 'grid' | 'sidebar';
  json?: boolean;
}

/**
 * Compose a view from existing components. Writes a composition file that imports
 * and arranges components in a basic layout (stack, grid, or sidebar).
 */
export async function cmdCompose(args: ComposeArgs, paths: RepoPaths): Promise<void> {
  const { name, components, layout = 'stack' } = args;
  if (!name || components.length === 0) {
    formatError('usage: emdesign compose <name> --components "Comp1,Comp2,..." [--layout stack|grid|sidebar]');
    process.exit(1);
  }

  const adapter = effectiveAdapter(paths);
  const ext = adapter.fileExt;
  const imports = components.map(c => `import { ${c} } from "@ds/${c}";`).join('\n');
  const renders = components.map(c => `      <${c} />`).join('\n');

  let wrapper: string;
  switch (layout) {
    case 'grid':
      wrapper = `<div className="grid grid-cols-2 gap-4">\n${renders}\n    </div>`;
      break;
    case 'sidebar':
      wrapper = `<div className="flex gap-4">\n      <aside className="w-64 shrink-0">\n        ${components.slice(0, 1).map(c => `<${c} />`).join('\n        ')}\n      </aside>\n      <main className="flex-1 space-y-4">\n${components.slice(1).map(c => `        <${c} />`).join('\n')}\n      </main>\n    </div>`;
      break;
    case 'stack':
    default:
      wrapper = `<div className="space-y-4">\n${renders}\n    </div>`;
  }

  const source = `import React from "react";
${imports}

export interface ${name}Props {
  className?: string;
}

export function ${name}({ className }: ${name}Props) {
  return (
    <div className={className}>
    ${wrapper}
    </div>
  );
}
`;

  const generatedDir = paths.generatedDir;
  ensureDir(generatedDir);
  const filePath = path.join(generatedDir, `${name}${ext}`);
  fs.writeFileSync(filePath, source);

  if (args.json) {
    formatJson({ name, file: filePath, components, layout });
  } else {
    process.stderr.write(`Composed ${name} → ${filePath}\n`);
    process.stderr.write(`Components: ${components.join(', ')}\n`);
    process.stderr.write(`Layout: ${layout}\n`);
  }
}
