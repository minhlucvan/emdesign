/**
 * Text edit tool — click a text element to edit it inline.
 *
 * Extracted from preview.tsx text mode logic.
 * Sets contentEditable, listens for Enter to commit / Escape to revert.
 * Emits EVT_TEXT_SUBMIT on commit.
 */

import { addons } from '@storybook/preview-api';
import { EVT_TEXT_SUBMIT } from '../../channel';
import { buildTarget } from '../../dom-utils';
import type { ToolDefinition, ToolContext } from '../types';

const ACCENT = '#2563eb';

export const tool: ToolDefinition = {
  mode: 'text' as const,
  hint: 'emdesign: click a text element to edit it inline',

  onClick(e: MouseEvent, ctx: ToolContext): void {
    const root = document.getElementById('storybook-root') ?? document.body;
    const el = e.target as Element | null;
    if (!el || !root.contains(el)) return;
    e.preventDefault();
    e.stopPropagation();

    const he = el as HTMLElement;
    const from = (he.textContent ?? '').trim();
    he.contentEditable = 'true';
    he.style.outline = `2px solid ${ACCENT}`;
    he.focus();

    // Place caret at the end
    const sel = window.getSelection();
    if (sel) {
      const r = document.createRange();
      r.selectNodeContents(he);
      r.collapse(false);
      sel.removeAllRanges();
      sel.addRange(r);
    }

    // Commit or revert on keydown
    const onKeyDown = (ke: KeyboardEvent) => {
      if (ke.key === 'Enter' && !ke.shiftKey) {
        ke.preventDefault();
        document.removeEventListener('keydown', onKeyDown, true);
        const to = (he.textContent ?? '').trim();
        he.contentEditable = 'false';
        he.style.outline = '';
        if (to && to !== from) {
          const target = buildTarget(he, root, ctx.storyId, ctx.component);
          addons.getChannel().emit(EVT_TEXT_SUBMIT, { target, from, to });
          ctx.setToast('text edit queued');
        }
        ctx.offAndSync();
      } else if (ke.key === 'Escape') {
        ke.preventDefault();
        document.removeEventListener('keydown', onKeyDown, true);
        he.contentEditable = 'false';
        he.style.outline = '';
        he.textContent = from; // revert
        ctx.offAndSync();
      }
    };

    document.addEventListener('keydown', onKeyDown, true);
  },
};
