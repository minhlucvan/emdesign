/**
 * Comment tool — click an element to open a comment popover.
 *
 * Extracted from preview.tsx composing state logic.
 * Emits EVT_COMMENT_SUBMIT via channel when the user submits a comment.
 */

import React from 'react';
import { addons } from '@storybook/preview-api';
import { EVT_COMMENT_SUBMIT } from '../../channel';
import { buildTarget } from '../../dom-utils';
import type { ToolDefinition, ToolContext } from '../types';

export const tool: ToolDefinition = {
  mode: 'comment' as const,
  hint: 'emdesign: click an element to comment',

  onClick(e: MouseEvent, ctx: ToolContext): void {
    const root = document.getElementById('storybook-root') ?? document.body;
    const el = e.target as Element | null;
    if (!el || !root.contains(el)) return;
    e.preventDefault();
    e.stopPropagation();

    const target = buildTarget(el, root, ctx.storyId, ctx.component);
    addons.getChannel().emit(EVT_COMMENT_SUBMIT, { target, instruction: '' });
  },

  renderOverlay(_ctx: ToolContext): React.ReactNode {
    return null;
  },
};
