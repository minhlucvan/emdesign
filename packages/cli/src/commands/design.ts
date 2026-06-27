import type { RepoPaths, Store } from '@emdesign/backend';
import {
  resolveDesignSystem,
  composePrompt,
  effectiveAdapter,
} from '@emdesign/backend';
import { getContext, consistencyBrief } from "@emdesign/graph";
import { loadOrBuild, overlayGenerated } from "@emdesign/backend";
import { formatJson, formatError } from '../lib/format.js';
import { activeDsId } from '../lib/resolve.js';

export interface DesignArgs {
  component?: string;
  instruction?: string;
  json?: boolean;
}

export async function cmdDesign(args: DesignArgs, paths: RepoPaths, store: Store): Promise<void> {
  const name = args.component ?? 'Component';
  const instruction = args.instruction ?? '(describe the component)';

  const id = activeDsId(store);
  const ds = resolveDesignSystem(paths, id);

  // Try to get graph context
  let graphContext: string | undefined;
  try {
    const g = loadOrBuild(paths, id);
    const current = store.get().currentComponent;
    if (current) {
      try { overlayGenerated(g, paths, id, current); } catch { /* not parseable */ }
    }
    const nodeId = g.has(`art/${name}`) ? `art/${name}` : g.has(`${id}/${name}`) ? `${id}/${name}` : null;
    if (nodeId) {
      graphContext = JSON.stringify(getContext(g, nodeId), null, 2);
    } else {
      graphContext = JSON.stringify(consistencyBrief(g, { name, intent: instruction }), null, 2);
    }
  } catch { /* graph optional */ }

  const codegenInstructions = effectiveAdapter(paths).codegenInstructions(ds);
  const prompt = composePrompt({ ds, componentName: name, instruction, graphContext, codegenInstructions });

  if (args.json) {
    formatJson({
      prompt,
      designSystem: { id: ds.name ?? id, tokens: ds.declaredTokens?.length ?? 0 },
      tokens: ds.declaredTokens ?? [],
      primitives: ds.primitives ?? [],
    });
  } else {
    process.stdout.write(prompt + '\n');
  }
}
