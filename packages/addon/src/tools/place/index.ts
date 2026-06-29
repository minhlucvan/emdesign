/**
 * Place tool — hover to detect insertion zone, click to place a component.
 *
 * Extracted from preview.tsx place mode logic.
 * Determines zone (before/after/into/replace) based on relative Y + Shift key.
 * Emits EVT_PLACE_TRIGGER.
 */

import { addons } from '@storybook/preview-api';
import { EVT_PLACE_TRIGGER } from '../../channel';
import { buildTarget, collectComputedStyles } from '../../dom-utils';
import type { ToolDefinition, ToolContext } from '../types';
import type { PlacementMode, PlaceTriggerPayload } from '../../channel';

export const tool: ToolDefinition = {
  mode: 'place' as const,
  hint: 'emdesign: hover top (before) · bottom (after) · middle (into) · Shift (replace)',

  onClick(e: MouseEvent, ctx: ToolContext): void {
    const root = document.getElementById('storybook-root') ?? document.body;
    const el = e.target as Element | null;
    if (!el || !root.contains(el)) return;
    e.preventDefault();
    e.stopPropagation();

    const target = buildTarget(el, root, ctx.storyId, ctx.component);
    const computedStyles = collectComputedStyles(el);
    const rect = el.getBoundingClientRect();
    const relY = (e.clientY - rect.top) / rect.height;

    let detectedZone: PlacementMode;
    if (e.shiftKey) {
      detectedZone = 'replace';
    } else if (relY < 0.25) {
      detectedZone = 'before';
    } else if (relY > 0.75) {
      detectedZone = 'after';
    } else {
      detectedZone = 'into';
    }

    const placePayload: PlaceTriggerPayload = {
      tag: target.tag || '',
      text: target.text || '',
      selector: target.selector,
      component: ctx.component || target.component || '',
      rect: { x: target.box?.x ?? 0, y: target.box?.y ?? 0, width: target.box?.width ?? 0, height: target.box?.height ?? 0 },
      computedStyles,
      storyId: ctx.storyId,
      placementMode: detectedZone,
      selectedComponent: '',
    };

    addons.getChannel().emit(EVT_PLACE_TRIGGER, placePayload);
    ctx.setToast(`placing ${detectedZone} <${target.tag}>`);
    ctx.offAndSync();
  },
};
