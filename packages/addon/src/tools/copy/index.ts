/**
 * Copy tool — click an element to copy its identifier to the clipboard.
 *
 * Extracted from preview.tsx copy mode logic.
 * Emits EVT_COPIED and shows a pin.
 */

import { addons } from '@storybook/preview-api';
import { EVT_COPIED } from '../../channel';
import { buildTarget, describe } from '../../dom-utils';
import type { ToolDefinition, ToolContext } from '../types';

export const tool: ToolDefinition = {
  mode: 'copy' as const,
  hint: 'emdesign: click an element to copy its identifier',

  onClick(e: MouseEvent, ctx: ToolContext): void {
    const root = document.getElementById('storybook-root') ?? document.body;
    const el = e.target as Element | null;
    if (!el || !root.contains(el)) return;
    e.preventDefault();
    e.stopPropagation();

    const target = buildTarget(el, root, ctx.storyId, ctx.component);
    const payload = describe(target);
    try { navigator.clipboard?.writeText(payload); } catch { /* clipboard blocked */ }

    addons.getChannel().emit(EVT_COPIED, { ok: true, selector: target.selector });
    ctx.setPins((p) => [...p, { n: p.length + 1, box: target.box as { x: number; y: number; width: number; height: number }, text: 'copied' }]);
    ctx.setToast(`copied <${target.tag}>`);
    ctx.offAndSync();
  },
};
