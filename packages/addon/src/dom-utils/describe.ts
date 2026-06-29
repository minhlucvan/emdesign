/**
 * describe — produce a human-readable + machine-readable element descriptor.
 *
 * The output is a multi-line string with the element's component, story,
 * selector, tag, text, classes, and bounding box, followed by a "---"
 * separator and the full payload as JSON. Designed for the copy tool.
 *
 * Extracted from preview.tsx.
 */

import type { CommentTarget } from '../channel';

export function describe(t: CommentTarget): string {
  const lines = [
    'emdesign element',
    t.component ? `component: ${t.component}` : '',
    t.storyId ? `story: ${t.storyId}` : '',
    `selector: ${t.selector}`,
    `tag: <${t.tag}>`,
    t.text ? `text: "${t.text}"` : '',
    t.classes ? `classes: "${t.classes}"` : '',
    t.box
      ? `box: ${Math.round(t.box.x)},${Math.round(t.box.y)} ${Math.round(t.box.width)}×${Math.round(t.box.height)}`
      : '',
  ].filter(Boolean);
  return `${lines.join('\n')}\n---\n${JSON.stringify(t)}`;
}
