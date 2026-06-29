/**
 * buildTarget — unit tests.
 *
 * Tests for the buildTarget(el, root, storyId?, component?) function that
 * builds a CommentTarget payload from a DOM element.
 */

import { buildTarget } from '../dom-utils/buildTarget';

// ── Helpers ────────────────────────────────────────────────────────────

function makeEl(overrides: Partial<Element> = {}): Element {
  const rect: DOMRect = {
    x: 10, y: 20, width: 200, height: 100,
    top: 20, right: 210, bottom: 120, left: 10,
    toJSON: () => ({}),
  };
  return {
    nodeType: 1,
    tagName: 'BUTTON',
    textContent: 'Click me',
    className: 'btn primary',
    getBoundingClientRect: () => rect,
    ...overrides,
  } as Element;
}

function makeRoot(): Element {
  return { nodeType: 1, tagName: 'BODY' } as Element;
}

// ── Tests ──────────────────────────────────────────────────────────────

describe('buildTarget', () => {
  it('returns CommentTarget shape with all expected fields', () => {
    const el = makeEl();
    const root = makeRoot();
    const target = buildTarget(el, root);

    expect(target).toHaveProperty('selector');
    expect(target).toHaveProperty('box');
    expect(target).toHaveProperty('text');
    expect(target).toHaveProperty('tag');
    expect(target).toHaveProperty('classes');
    // box sub-fields
    expect(target.box).toHaveProperty('x');
    expect(target.box).toHaveProperty('y');
    expect(target.box).toHaveProperty('width');
    expect(target.box).toHaveProperty('height');
  });

  it('returns correct tag and text from element', () => {
    const el = makeEl();
    const root = makeRoot();
    const target = buildTarget(el, root);
    expect(target.tag).toBe('button');
    expect(target.text).toBe('Click me');
  });

  it('includes storyId when provided', () => {
    const el = makeEl();
    const root = makeRoot();
    const target = buildTarget(el, root, 'my-story');
    expect(target.storyId).toBe('my-story');
  });

  it('includes component when provided', () => {
    const el = makeEl();
    const root = makeRoot();
    const target = buildTarget(el, root, undefined, 'MyComp');
    expect(target.component).toBe('MyComp');
  });

  it('handles element with no className — classes is undefined', () => {
    const el = makeEl({ className: 0 } as unknown as Partial<Element>);
    const root = makeRoot();
    const target = buildTarget(el, root);
    // When className is not a string (e.g. SVGAnimatedString or numeric),
    // the original code checks `typeof el.className === 'string'`
    expect(target.classes).toBeUndefined();
  });

  it('truncates text to 120 characters', () => {
    const longText = 'A'.repeat(200);
    const el = makeEl({ textContent: longText });
    const root = makeRoot();
    const target = buildTarget(el, root);
    expect(target.text).toHaveLength(120);
    expect(target.text).toBe(longText.slice(0, 120));
  });

  it('trims whitespace from text', () => {
    const el = makeEl({ textContent: '  hello world  ' });
    const root = makeRoot();
    const target = buildTarget(el, root);
    expect(target.text).toBe('hello world');
  });

  it('assigns correct box values from getBoundingClientRect', () => {
    const el = makeEl();
    const root = makeRoot();
    const target = buildTarget(el, root);
    expect(target.box).toEqual({ x: 10, y: 20, width: 200, height: 100 });
  });
});
