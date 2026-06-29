/**
 * cssPath — generate a CSS selector path from an element up to a root boundary.
 *
 * Returns a string like "div > span:nth-of-type(2)" or "" when el === root.
 * The root element is excluded from the path. When siblings share a tag name
 * an `:nth-of-type()` pseudo-class is appended for disambiguation.
 *
 * Extracted from preview.tsx.
 */

export function cssPath(el: Element, root: Element): string {
  const parts: string[] = [];
  let cur: Element | null = el;
  while (cur && cur !== root && cur.nodeType === 1) {
    let sel = cur.tagName.toLowerCase();
    const parent: Element | null = cur.parentElement;
    if (parent) {
      const sibs = Array.from(parent.children).filter(
        (c) => c.tagName === cur!.tagName,
      );
      if (sibs.length > 1) sel += `:nth-of-type(${sibs.indexOf(cur) + 1})`;
    }
    parts.unshift(sel);
    cur = cur.parentElement;
  }
  return parts.join(' > ');
}
