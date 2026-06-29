/**
 * toolBackend — Backend orchestration layer for tool events.
 *
 * Each handler creates a session, submits an intent, and handles errors
 * silently. Used by the toolbar (Tool.tsx) instead of calling api directly.
 */

import { addons } from '@storybook/preview-api';
import { api } from '../api';
import { EVT_CHAT_MODE, type CommentTarget, type WandTriggerPayload, type PlaceTriggerPayload } from '../channel';

/**
 * Handle a comment submit from the comment tool.
 * Creates a change-request session, stores the comment, submits the intent,
 * and opens the chat panel.
 */
export async function handleCommentSubmit(target: CommentTarget, instruction: string): Promise<void> {
  try {
    const prompt = [
      `Update component "${target.component || 'unknown'}": ${instruction}`,
      '',
      `Target element: <${target.tag}${target.selector ? ' ' + target.selector : ''}>`,
      `- Text: "${target.text || ''}"`,
      `- Story: ${target.storyId || ''}`,
    ].join('\n');

    const session = await api.createSession({
      type: 'change-request',
      instruction: prompt,
      scope: target.storyId ? `story:${target.storyId}` : 'global',
      origin: 'comment',
      elementContext: {
        selector: target.selector || '',
        tag: target.tag || '',
        text: target.text,
        component: target.component,
      },
    });

    await api.storeComment({
      storyId: target.storyId || '',
      selector: target.selector || '',
      text: instruction,
      tag: target.tag,
      component: target.component,
      sessionId: session.id,
    });

    await api.submitIntent({
      type: 'change-request',
      instruction: prompt,
      target,
      payload: { sessionId: session.id },
    });

    addons.getChannel().emit(EVT_CHAT_MODE, { enabled: true, sessionId: session.id });
  } catch {
    // Silently handle backend errors — no crash, no UI error message
  }
}

/**
 * Handle a text edit submission from the text-edit tool.
 * Submits an edit-text intent with the original and replacement text.
 */
export async function handleTextSubmit(target: CommentTarget, from: string, to: string): Promise<void> {
  try {
    await api.submitIntent({
      type: 'edit-text',
      instruction: `Replace the text of ${target.selector} — was "${from}" — with: "${to}"`,
      target,
      payload: { textEdit: { from, to } },
    });
  } catch {
    // silent
  }
}

/**
 * Handle a wand trigger from the wand tool.
 * Creates a wand session and submits a wand intent.
 */
export async function handleWandTrigger(payload: WandTriggerPayload): Promise<void> {
  try {
    const session = await api.createSession({
      type: 'wand',
      instruction: `Auto-fix component "${payload.component}" at ${payload.selector} (<${payload.tag}>)${payload.vision ? ' with vision critique' : ''}`,
      scope: payload.storyId ? `story:${payload.storyId}` : 'global',
      origin: 'wand',
      elementContext: {
        selector: payload.selector,
        tag: payload.tag,
        text: payload.text,
        component: payload.component,
        rect: payload.rect,
        vision: payload.vision,
      },
    });

    await api.submitIntent({
      type: 'wand',
      instruction: `Auto-fix ${payload.component}`,
      target: { selector: payload.selector, tag: payload.tag, text: payload.text, component: payload.component, storyId: payload.storyId },
      payload: { mode: 'guided', vision: payload.vision, sessionId: session.id },
    });
  } catch {
    // silent
  }
}

/**
 * Handle a place trigger from the place tool.
 * Creates a place session and submits a place intent.
 */
export async function handlePlaceTrigger(payload: PlaceTriggerPayload): Promise<void> {
  try {
    const session = await api.createSession({
      type: 'place',
      instruction: `Place component "${payload.selectedComponent}" ${payload.placementMode} ${payload.selector} (<${payload.tag}>)`,
      scope: payload.storyId ? `story:${payload.storyId}` : 'global',
      origin: 'place',
      elementContext: {
        selector: payload.selector,
        tag: payload.tag,
        text: payload.text,
        component: payload.component,
        rect: payload.rect,
        placementMode: payload.placementMode,
        selectedComponent: payload.selectedComponent,
      },
    });

    await api.submitIntent({
      type: 'place',
      instruction: `Place ${payload.selectedComponent} ${payload.placementMode} ${payload.selector}`,
      target: { selector: payload.selector, tag: payload.tag, text: payload.text, component: payload.component, storyId: payload.storyId },
      payload: { placementMode: payload.placementMode, selectedComponent: payload.selectedComponent, sessionId: session.id },
    });
  } catch {
    // silent
  }
}
