/**
 * buildTarget — build a CommentTarget payload from a DOM element.
 *
 * Calls cssPath to generate the selector, reads bounding rect, text,
 * tag name, and className from the element so the result can be sent
 * to the manager panel as a structured element reference.
 *
 * Extracted from preview.tsx.
 */

import { cssPath } from './cssPath';
import type { CommentTarget } from '../channel';

export function buildTarget(
  el: Element,
  root: Element,
  storyId?: string,
  component?: string,
): CommentTarget {
  const b = el.getBoundingClientRect();
  return {
    selector: cssPath(el, root),
    box: { x: b.x, y: b.y, width: b.width, height: b.height },
    text: (el.textContent ?? '').trim().slice(0, 120),
    tag: el.tagName.toLowerCase(),
    classes: typeof el.className === 'string' ? el.className : undefined,
    storyId,
    component,
  };
}
