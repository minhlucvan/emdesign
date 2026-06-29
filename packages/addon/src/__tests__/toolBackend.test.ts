/**
 * toolBackend — unit tests (RED step).
 *
 * Tests for the backend orchestration service (toolBackend.ts) that
 * delegates API calls for each tool event type. The module does not
 * exist yet — these tests confirm the expected interface so the
 * implementation can be written to match.
 *
 * Drawn from delta specs: toolbar-backend/spec.md, chat-controller/spec.md,
 * tool-behaviors/spec.md.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleCommentSubmit, handleTextSubmit, handleWandTrigger, handlePlaceTrigger } from '../services/toolBackend';
import { api } from '../api';
import { EVT_CHAT_MODE, type CommentTarget, type WandTriggerPayload, type PlaceTriggerPayload } from '../channel';

// ── Mocks ────────────────────────────────────────────────────────────────

const mockEmit = vi.fn();

vi.mock('@storybook/preview-api', () => ({
  addons: {
    getChannel: () => ({ emit: mockEmit }),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

// ── Shared fixtures ──────────────────────────────────────────────────────

const mockSession = { id: 'session-001' };

const commentTarget: CommentTarget = {
  selector: 'div > button.primary',
  tag: 'button',
  text: 'Submit',
  storyId: 'example-button--primary',
  component: 'Button',
  box: { x: 100, y: 200, width: 80, height: 32 },
};

const wandPayload: WandTriggerPayload = {
  tag: 'button',
  text: 'Click me',
  selector: 'div > button.primary',
  component: 'Button',
  rect: { x: 100, y: 200, width: 80, height: 32 },
  computedStyles: { color: 'rgb(255,255,255)', backgroundColor: 'rgb(37,99,235)' },
  storyId: 'example-button--primary',
  vision: false,
};

const placePayload: PlaceTriggerPayload = {
  tag: 'div',
  text: 'Container',
  selector: '#main > div.content',
  component: 'Container',
  rect: { x: 0, y: 0, width: 600, height: 400 },
  computedStyles: {},
  storyId: 'example-container--default',
  placementMode: 'after',
  selectedComponent: 'a stats card with trend indicator',
};

// ── Tests ─────────────────────────────────────────────────────────────────

describe('handleCommentSubmit', () => {
  it('creates a change-request session with correct params and submits intent', async () => {
    vi.mocked(api.createSession).mockResolvedValueOnce(mockSession as any);
    vi.mocked(api.storeComment).mockResolvedValueOnce({ ok: true } as any);
    vi.mocked(api.submitIntent).mockResolvedValueOnce({} as any);

    await handleCommentSubmit(commentTarget, 'Make this bigger');

    // api.createSession called with type change-request, instruction, scope, origin comment, element context
    expect(api.createSession).toHaveBeenCalledWith({
      type: 'change-request',
      instruction: expect.stringContaining('Make this bigger'),
      scope: 'story:example-button--primary',
      origin: 'comment',
      elementContext: {
        selector: 'div > button.primary',
        tag: 'button',
        text: 'Submit',
        component: 'Button',
      },
    });
  });

  it('stores the comment with session reference', async () => {
    vi.mocked(api.createSession).mockResolvedValueOnce(mockSession as any);
    vi.mocked(api.storeComment).mockResolvedValueOnce({ ok: true } as any);
    vi.mocked(api.submitIntent).mockResolvedValueOnce({} as any);

    await handleCommentSubmit(commentTarget, 'Make this bigger');

    expect(api.storeComment).toHaveBeenCalledWith({
      storyId: 'example-button--primary',
      selector: 'div > button.primary',
      text: 'Make this bigger',
      tag: 'button',
      component: 'Button',
      sessionId: 'session-001',
    });
  });

  it('submits a change-request intent with sessionId', async () => {
    vi.mocked(api.createSession).mockResolvedValueOnce(mockSession as any);
    vi.mocked(api.storeComment).mockResolvedValueOnce({ ok: true } as any);
    vi.mocked(api.submitIntent).mockResolvedValueOnce({} as any);

    await handleCommentSubmit(commentTarget, 'Make this bigger');

    expect(api.submitIntent).toHaveBeenCalledWith({
      type: 'change-request',
      instruction: expect.any(String),
      target: commentTarget,
      payload: { sessionId: 'session-001' },
    });
  });

  it('emits EVT_CHAT_MODE with enabled and sessionId after submission', async () => {
    vi.mocked(api.createSession).mockResolvedValueOnce(mockSession as any);
    vi.mocked(api.storeComment).mockResolvedValueOnce({ ok: true } as any);
    vi.mocked(api.submitIntent).mockResolvedValueOnce({} as any);

    await handleCommentSubmit(commentTarget, 'Make this bigger');

    expect(mockEmit).toHaveBeenCalledWith(EVT_CHAT_MODE, { enabled: true, sessionId: 'session-001' });
  });
});

describe('handleTextSubmit', () => {
  const from = 'Old heading';
  const to = 'New heading';

  it('submits an edit-text intent with original and new text', async () => {
    vi.mocked(api.submitIntent).mockResolvedValueOnce({} as any);

    await handleTextSubmit(commentTarget, from, to);

    expect(api.submitIntent).toHaveBeenCalledWith({
      type: 'edit-text',
      instruction: expect.stringContaining(from),
      target: commentTarget,
      payload: { textEdit: { from, to } },
    });
  });

  it('does not call createSession or storeComment', async () => {
    vi.mocked(api.submitIntent).mockResolvedValueOnce({} as any);

    await handleTextSubmit(commentTarget, from, to);

    expect(api.createSession).not.toHaveBeenCalled();
    expect(api.storeComment).not.toHaveBeenCalled();
  });
});

describe('handleWandTrigger', () => {
  it('creates a wand session with element context including vision flag', async () => {
    vi.mocked(api.createSession).mockResolvedValueOnce(mockSession as any);
    vi.mocked(api.submitIntent).mockResolvedValueOnce({} as any);

    await handleWandTrigger(wandPayload);

    expect(api.createSession).toHaveBeenCalledWith({
      type: 'wand',
      instruction: expect.stringContaining('Auto-fix'),
      scope: 'story:example-button--primary',
      origin: 'wand',
      elementContext: {
        selector: wandPayload.selector,
        tag: wandPayload.tag,
        text: wandPayload.text,
        component: wandPayload.component,
        rect: wandPayload.rect,
        vision: false,
      },
    });
  });

  it('submits a wand intent with mode guided and sessionId', async () => {
    vi.mocked(api.createSession).mockResolvedValueOnce(mockSession as any);
    vi.mocked(api.submitIntent).mockResolvedValueOnce({} as any);

    await handleWandTrigger(wandPayload);

    expect(api.submitIntent).toHaveBeenCalledWith({
      type: 'wand',
      instruction: expect.any(String),
      target: {
        selector: wandPayload.selector,
        tag: wandPayload.tag,
        text: wandPayload.text,
        component: wandPayload.component,
        storyId: wandPayload.storyId,
      },
      payload: { mode: 'guided', vision: false, sessionId: 'session-001' },
    });
  });

  it('includes vision:true in elementContext when Shift was held', async () => {
    const visionPayload = { ...wandPayload, vision: true };
    vi.mocked(api.createSession).mockResolvedValueOnce(mockSession as any);
    vi.mocked(api.submitIntent).mockResolvedValueOnce({} as any);

    await handleWandTrigger(visionPayload);

    expect(api.createSession).toHaveBeenCalledWith(
      expect.objectContaining({
        elementContext: expect.objectContaining({ vision: true }),
      }),
    );
  });
});

describe('handlePlaceTrigger', () => {
  it('creates a place session with placement context', async () => {
    vi.mocked(api.createSession).mockResolvedValueOnce(mockSession as any);
    vi.mocked(api.submitIntent).mockResolvedValueOnce({} as any);

    await handlePlaceTrigger(placePayload);

    expect(api.createSession).toHaveBeenCalledWith({
      type: 'place',
      instruction: expect.stringContaining('Place'),
      scope: 'story:example-container--default',
      origin: 'place',
      elementContext: {
        selector: placePayload.selector,
        tag: placePayload.tag,
        text: placePayload.text,
        component: placePayload.component,
        rect: placePayload.rect,
        placementMode: 'after',
        selectedComponent: 'a stats card with trend indicator',
      },
    });
  });

  it('submits a place intent with placementMode and selectedComponent', async () => {
    vi.mocked(api.createSession).mockResolvedValueOnce(mockSession as any);
    vi.mocked(api.submitIntent).mockResolvedValueOnce({} as any);

    await handlePlaceTrigger(placePayload);

    expect(api.submitIntent).toHaveBeenCalledWith({
      type: 'place',
      instruction: expect.any(String),
      target: {
        selector: placePayload.selector,
        tag: placePayload.tag,
        text: placePayload.text,
        component: placePayload.component,
        storyId: placePayload.storyId,
      },
      payload: {
        placementMode: 'after',
        selectedComponent: 'a stats card with trend indicator',
        sessionId: 'session-001',
      },
    });
  });
});

describe('error resilience', () => {
  it('handleCommentSubmit does not throw on network error', async () => {
    vi.mocked(api.createSession).mockRejectedValueOnce(new Error('Network error'));

    await expect(handleCommentSubmit(commentTarget, 'test')).resolves.toBeUndefined();
  });

  it('handleTextSubmit does not throw on network error', async () => {
    vi.mocked(api.submitIntent).mockRejectedValueOnce(new Error('Network error'));

    await expect(handleTextSubmit(commentTarget, 'from', 'to')).resolves.toBeUndefined();
  });

  it('handleWandTrigger does not throw on network error', async () => {
    const minimalPayload: WandTriggerPayload = {
      tag: 'div', text: '', selector: '#x', component: 'C',
      rect: { x: 0, y: 0, width: 10, height: 10 },
      computedStyles: {}, vision: false,
    };
    vi.mocked(api.createSession).mockRejectedValueOnce(new Error('Network error'));

    await expect(handleWandTrigger(minimalPayload)).resolves.toBeUndefined();
  });

  it('handlePlaceTrigger does not throw on network error', async () => {
    const minimalPayload: PlaceTriggerPayload = {
      tag: 'div', text: '', selector: '#x', component: 'C',
      rect: { x: 0, y: 0, width: 10, height: 10 },
      computedStyles: {}, storyId: 'test',
      placementMode: 'after', selectedComponent: 'stats',
    };
    vi.mocked(api.createSession).mockRejectedValueOnce(new Error('Network error'));

    await expect(handlePlaceTrigger(minimalPayload)).resolves.toBeUndefined();
  });
});
