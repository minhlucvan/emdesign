/**
 * Reference tool — click an element to reference it in chat.
 *
 * Extracted from preview.tsx reference mode logic.
 * Collects computed styles, resolves data-emdesign-component,
 * emits EVT_ELEMENT_SELECTED, and creates a pin.
 */

import { addons } from '@storybook/preview-api';
import { EVT_ELEMENT_SELECTED } from '../../channel';
import { buildTarget, collectComputedStyles } from '../../dom-utils';
import type { ToolDefinition, ToolContext } from '../types';
import type { ElementSelectedPayload } from '../../channel';

export const tool: ToolDefinition = {
  mode: 'reference' as const,
  hint: 'emdesign: click an element to reference it in chat',

  onClick(e: MouseEvent, ctx: ToolContext): void {
    const root = document.getElementById('storybook-root') ?? document.body;
    const el = e.target as Element | null;
    if (!el || !root.contains(el)) return;
    e.preventDefault();
    e.stopPropagation();

    const target = buildTarget(el, root, ctx.storyId, ctx.component);
    const computedStyles = collectComputedStyles(el);
    const emdesignComponent = el.closest('[data-emdesign-component]')?.getAttribute('data-emdesign-component') || undefined;

    const payload: ElementSelectedPayload = {
      tag: target.tag || '',
      text: target.text || '',
      selector: target.selector,
      component: ctx.component || target.component || '',
      rect: { x: target.box?.x ?? 0, y: target.box?.y ?? 0, width: target.box?.width ?? 0, height: target.box?.height ?? 0 },
      computedStyles,
      emdesignComponent,
    };

    addons.getChannel().emit(EVT_ELEMENT_SELECTED, payload);
    ctx.setPins((p) => [...p, { n: p.length + 1, box: target.box as { x: number; y: number; width: number; height: number }, text: `referenced <${target.tag}>` }]);
    ctx.setToast(`referenced <${target.tag}>`);
    ctx.offAndSync();
  },
};
