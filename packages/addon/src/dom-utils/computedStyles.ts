/**
 * collectComputedStyles — extract a set of CSS computed properties
 * from a DOM element.
 *
 * Returns an object mapping CSS property names to their computed values.
 * Returns an empty object when getComputedStyle is unavailable (SSR, Node)
 * or when a cross-origin iframe throws a SecurityError.
 *
 * Extracted from preview.tsx.
 */

const STYLE_KEYS = [
  'color',
  'backgroundColor',
  'fontSize',
  'fontWeight',
  'marginTop',
  'marginRight',
  'marginBottom',
  'marginLeft',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'borderRadius',
  'boxShadow',
  'display',
  'position',
] as const;

export function collectComputedStyles(el: Element): Record<string, string> {
  const result: Record<string, string> = {};
  try {
    const cs = getComputedStyle(el);
    if (!cs) return result;
    for (const key of STYLE_KEYS) {
      result[key] = cs.getPropertyValue(key);
    }
  } catch {
    // cross-origin iframe or SSR without getComputedStyle
  }
  return result;
}
