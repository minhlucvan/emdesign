import type { RepoPaths, Store } from '@emdesign/backend';
import {
  resolveDesignSystem,
  runVisualTest,
  toStoryId,
  effectiveAdapter,
} from '@emdesign/backend';
import { standardCritique } from '@emdesign/vision-critic';
import { formatJson, formatError } from '../lib/format.js';
import { activeDsId } from '../lib/resolve.js';

export interface VisionArgs {
  component: string;
  mode: 'standard' | 'compare';
  provider?: 'claude' | 'gemini' | 'minimax';
  reference?: string;
  json?: boolean;
}

export async function cmdVision(args: VisionArgs, paths: RepoPaths, store: Store): Promise<void> {
  const name = args.component;
  if (!name) {
    formatError('vision requires a component name');
    process.exit(1);
  }

  // Ensure a fresh screenshot before critiquing
  try { await runVisualTest(paths, name); } catch { /* non-fatal */ }

  const critiqueMode = args.mode === 'compare' ? 'reference' as const : 'standard' as const;
  const result = await standardCritique(
    {
      root: paths.root,
      screenshotsDir: paths.screenshotsDir,
      designSystemsDir: paths.designSystemsDir,
      activeDsId: paths.activeDesignSystem,
    },
    {
      component: name,
      mode: critiqueMode,
      provider: args.provider,
      referenceImagePath: args.mode === 'compare' ? args.reference : undefined,
    },
  );

  if (args.json) {
    formatJson(result);
  } else {
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  }
}
