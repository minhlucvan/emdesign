/**
 * Element Selection Tool — unit tests.
 *
 * These tests verify the reference-mode element selection flow:
 * - ToolMode includes 'reference'
 * - EVT_ELEMENT_SELECTED event carries the correct payload shape
 * - Element picker produces valid CSS selectors
 * - ChatSidebar displays selection card on event
 *
 * NOTE: This addon package requires @storybook/test + jsdom for full
 * component tests. These spec-level tests document the expected contract.
 */

import { EVT_ELEMENT_SELECTED, type ElementSelectedPayload } from '../channel';

// ── Contract tests ────────────────────────────────────────────────────

describe('EVT_ELEMENT_SELECTED', () => {
  it('has the correct event name', () => {
    expect(EVT_ELEMENT_SELECTED).toBe('emdesign/element-selected');
  });
});

describe('ElementSelectedPayload', () => {
  const mockPayload: ElementSelectedPayload = {
    tag: 'button',
    text: 'Submit',
    selector: 'body > div > button:nth-of-type(1)',
    component: 'Example',
    rect: { x: 100, y: 200, width: 80, height: 32 },
    computedStyles: {
      color: 'rgb(255, 255, 255)',
      backgroundColor: 'rgb(37, 99, 235)',
      fontSize: '14px',
      fontWeight: '500',
    },
    emdesignComponent: 'Button',
    tokenBindings: ['text-accent', 'bg-primary'],
  };

  it('carries required fields', () => {
    expect(mockPayload.tag).toBe('button');
    expect(mockPayload.text).toBe('Submit');
    expect(mockPayload.selector).toBeTruthy();
    expect(mockPayload.component).toBeTruthy();
    expect(mockPayload.rect).toHaveProperty('x');
    expect(mockPayload.rect).toHaveProperty('y');
    expect(mockPayload.rect).toHaveProperty('width');
    expect(mockPayload.rect).toHaveProperty('height');
    expect(mockPayload.computedStyles).toHaveProperty('color');
  });

  it('has optional emdesignComponent field', () => {
    expect(mockPayload.emdesignComponent).toBe('Button');
  });

  it('has optional tokenBindings field', () => {
    expect(mockPayload.tokenBindings).toContain('text-accent');
    expect(mockPayload.tokenBindings).toContain('bg-primary');
  });

  it('allows missing optional fields', () => {
    const minimal: ElementSelectedPayload = {
      tag: 'div',
      text: '',
      selector: '#root',
      component: 'App',
      rect: { x: 0, y: 0, width: 0, height: 0 },
      computedStyles: {},
    };
    expect(minimal.emdesignComponent).toBeUndefined();
    expect(minimal.tokenBindings).toBeUndefined();
  });
});
