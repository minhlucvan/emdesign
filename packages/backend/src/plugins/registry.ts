import type { MedesignPlugin } from '@emdesign/plugin-api';
import { reactPlugin } from '@emdesign/plugin-react';
import { cssPlugin } from '@emdesign/plugin-css';
import { tailwindPlugin } from '@emdesign/plugin-tailwindcss';
import { shadcnPlugin } from '@emdesign/plugin-shadcn';
import { corePlugin } from '@emdesign/plugin-core';

/** Built-in plugins (each a separate @emdesign/plugin-* package). External plugins
 *  (`@emdesign/plugin-<id>` / `emdesign-plugin-<id>`) can be added at startup via registerPlugin();
 *  resolvePlugin is the single lookup point. */
const REGISTRY = new Map<string, MedesignPlugin>([
  [reactPlugin.id, reactPlugin],
  [cssPlugin.id, cssPlugin],
  [tailwindPlugin.id, tailwindPlugin],
  [shadcnPlugin.id, shadcnPlugin],
  [corePlugin.id, corePlugin],
]);

export function registerPlugin(plugin: MedesignPlugin): void {
  REGISTRY.set(plugin.id, plugin);
}

export function resolvePlugin(id: string): MedesignPlugin | undefined {
  return REGISTRY.get(id);
}

export function availablePlugins(): Array<{ id: string; kind: string; implemented: boolean }> {
  return Array.from(REGISTRY.values()).map((p) => ({ id: p.id, kind: p.kind, implemented: !!p.codegenInstructions }));
}
