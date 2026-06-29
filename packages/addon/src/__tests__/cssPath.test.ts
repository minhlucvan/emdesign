/**
 * cssPath — unit tests.
 *
 * Tests for the cssPath(el, root) pure function that generates a CSS selector
 * path from an element up to (but not including) a root boundary element.
 */

import { cssPath } from '../dom-utils/cssPath';

// ── Helpers ────────────────────────────────────────────────────────────

/**
 * Create a minimal Element-like object with the minimum surface cssPath needs:
 * nodeType, tagName, parentElement, children.
 */
function makeEl(
  tag: string,
  parent: Element | null = null,
  children: Element[] = [],
): Element {
  return {
    nodeType: 1,
    tagName: tag.toUpperCase(),
    parentElement: parent,
    children: children as unknown as HTMLCollection,
  } as unknown as Element;
}

// ── Tests ──────────────────────────────────────────────────────────────

describe('cssPath', () => {
  it('generates simple tag path for a direct child of root', () => {
    const root = makeEl('body');
    const span = makeEl('span', root);
    expect(cssPath(span, root)).toBe('span');
  });

  it('generates "div > span" for span inside div inside root', () => {
    const root = makeEl('body');
    const div = makeEl('div', root);
    const span = makeEl('span', div);
    expect(cssPath(span, root)).toBe('div > span');
  });

  it('disambiguates nth-of-type when siblings share tag name', () => {
    const root = makeEl('body');
    const ul = makeEl('ul', root);
    const li1 = makeEl('li', ul);
    const li2 = makeEl('li', ul);
    // Set up children so the index is correct
    Object.defineProperty(ul, 'children', {
      value: [li1, li2] as unknown as HTMLCollection,
    });
    // Patch parentElement for the children
    Object.defineProperty(li1, 'parentElement', { value: ul });
    Object.defineProperty(li2, 'parentElement', { value: ul });
    // li2 is at index 1 → nth-of-type(2)
    expect(cssPath(li2, root)).toContain('li:nth-of-type(2)');
  });

  it('returns empty string when el is the root', () => {
    const root = makeEl('body');
    expect(cssPath(root, root)).toBe('');
  });

  it('handles deep nesting: ul > li > span path construction', () => {
    const root = makeEl('body');
    const ul = makeEl('ul', root);
    const li = makeEl('li', ul);
    const span = makeEl('span', li);
    // Wire up children so nth-of-type is not triggered (single child each)
    Object.defineProperty(root, 'children', { value: [ul] as unknown as HTMLCollection });
    Object.defineProperty(ul, 'children', { value: [li] as unknown as HTMLCollection });
    Object.defineProperty(li, 'children', { value: [span] as unknown as HTMLCollection });
    // Patch parentElement for each
    Object.defineProperty(ul, 'parentElement', { value: root });
    Object.defineProperty(li, 'parentElement', { value: ul });
    Object.defineProperty(span, 'parentElement', { value: li });
    expect(cssPath(span, root)).toBe('ul > li > span');
  });

  it('stops at root boundary even when root is not the document body', () => {
    const root = makeEl('section');
    const div = makeEl('div', root);
    const span = makeEl('span', div);
    Object.defineProperty(div, 'parentElement', { value: root });
    Object.defineProperty(span, 'parentElement', { value: div });
    Object.defineProperty(root, 'children', { value: [div] as unknown as HTMLCollection });
    Object.defineProperty(div, 'children', { value: [span] as unknown as HTMLCollection });
    expect(cssPath(span, root)).toBe('div > span');
  });
});
