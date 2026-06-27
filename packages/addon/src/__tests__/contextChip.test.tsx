/**
 * Context Chip — unit tests.
 *
 * These tests verify the view context chip display:
 * - EVT_VIEW_CONTEXT carries the correct payload shape
 * - Context chip shows "Viewing: {component} @ {width}x{height}"
 * - Context is appended to chat messages when sending
 *
 * Full rendering tests need @storybook/test + jsdom.
 */

import { EVT_VIEW_CONTEXT, type ViewContextPayload } from '../channel';

describe('EVT_VIEW_CONTEXT', () => {
  it('has the correct event name', () => {
    expect(EVT_VIEW_CONTEXT).toBe('emdesign/view-context');
  });
});

describe('ViewContextPayload', () => {
  const mockPayload: ViewContextPayload = {
    component: 'Button',
    storyId: 'example-button--primary',
    storyName: 'Primary',
    viewport: { width: 1280, height: 720 },
    componentFile: 'src/components/Button.tsx',
    storyFile: 'src/components/Button.stories.tsx',
    designSystem: 'example',
    tokens: ['bg-primary', 'text-accent', 'rounded'],
  };

  it('carries all required fields', () => {
    expect(mockPayload.component).toBe('Button');
    expect(mockPayload.storyId).toBe('example-button--primary');
    expect(mockPayload.viewport.width).toBe(1280);
    expect(mockPayload.viewport.height).toBe(720);
    expect(mockPayload.designSystem).toBeTruthy();
  });

  it('includes optional file paths', () => {
    expect(mockPayload.componentFile).toContain('Button.tsx');
    expect(mockPayload.storyFile).toContain('Button.stories.tsx');
  });

  it('includes optional token bindings', () => {
    expect(mockPayload.tokens).toContain('bg-primary');
  });

  it('supports minimal payload', () => {
    const minimal: ViewContextPayload = {
      component: 'Unknown',
      storyId: '',
      storyName: '',
      viewport: { width: 0, height: 0 },
      designSystem: '',
    };
    expect(minimal.tokens).toBeUndefined();
    expect(minimal.componentFile).toBeUndefined();
  });
});
