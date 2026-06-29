/**
 * Wand tool — click an element to auto-fix with AI.
 *
 * Extracted from preview.tsx wand mode logic.
 * Shows purple highlight + wand icon on hover, collects computed styles,
 * and emits EVT_WAND_TRIGGER with optional vision flag on Shift+click.
 */

import React from 'react';
import { addons } from '@storybook/preview-api';
import { EVT_WAND_TRIGGER } from '../../channel';
import { buildTarget, collectComputedStyles } from '../../dom-utils';
import type { ToolDefinition, ToolContext } from '../types';
import type { WandTriggerPayload } from '../../channel';

export const tool: ToolDefinition = {
  mode: 'wand' as const,
  hint: 'emdesign: click an element to auto-fix',

  onClick(e: MouseEvent, ctx: ToolContext): void {
    const root = document.getElementById('storybook-root') ?? document.body;
    const el = e.target as Element | null;
    if (!el || !root.contains(el)) return;
    e.preventDefault();
    e.stopPropagation();

    const target = buildTarget(el, root, ctx.storyId, ctx.component);
    const computedStyles = collectComputedStyles(el);
    const emdesignComponent = el.closest('[data-emdesign-component]')?.getAttribute('data-emdesign-component') || undefined;

    const wandPayload: WandTriggerPayload = {
      tag: target.tag || '',
      text: target.text || '',
      selector: target.selector,
      component: emdesignComponent || ctx.component || target.component || '',
      rect: { x: target.box?.x ?? 0, y: target.box?.y ?? 0, width: target.box?.width ?? 0, height: target.box?.height ?? 0 },
      computedStyles,
      storyId: ctx.storyId,
      vision: e.shiftKey,
    };

    addons.getChannel().emit(EVT_WAND_TRIGGER, wandPayload);
    ctx.setPins((p) => [...p, { n: p.length + 1, box: target.box as { x: number; y: number; width: number; height: number }, text: `auto-fix <${target.tag}>` }]);
    ctx.setToast(`auto-fix triggered for <${target.tag}>`);
    ctx.offAndSync();
  },

  renderOverlay(ctx: ToolContext): React.ReactNode {
    if (!ctx.hoverEl) return null;
    const rect = ctx.hoverEl.getBoundingClientRect();
    return (
      <div style={{ position: 'fixed', top: rect.top, left: rect.left, width: rect.width, height: rect.height, outline: '2px solid #a855f7', background: 'rgba(168,85,247,0.10)', zIndex: 99998, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: -22, right: -6, fontSize: 14, lineHeight: 1, pointerEvents: 'none' }}>🪄</div>
      </div>
    );
  },
};
