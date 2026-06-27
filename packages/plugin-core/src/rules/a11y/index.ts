/**
 * Core accessibility rules — rendered checks for ARIA/accessibility patterns.
 *
 * Rules validate focus indicators, image alt text, and heading level order.
 * They complement the existing contrast-aa and tap-target rules.
 */
import type { RenderedReviewRule, RenderedReviewContext } from '@emdesign/plugin-api';

// ---- focus-visible indicator ----
const focusVisibleRule: RenderedReviewRule = {
  id: 'core-a11y-focus-visible',
  category: 'a11y',
  title: 'Interactive elements show focus indicator',
  severity: 'P2',
  target: 'focus-visible outline or ring on interactive elements',
  check: ({ renders }: RenderedReviewContext) => {
    const bad: string[] = [];
    for (const snap of renders) {
      for (const n of snap.nodes) {
        // Check interactive elements for focus-visible patterns
        if (n.tag === 'button' || n.tag === 'a' || n.tag === 'input' || n.tag === 'select' || n.tag === 'textarea') {
          // Check for focus ring classes
          const hasFocusRing =
            /\bfocus[:\-]?(visible|within)?[:\-]?(ring|outline)\b/i.test(n.classes) ||
            n.classes.includes('focus:outline') ||
            n.classes.includes('focus-visible:');
          if (!hasFocusRing) {
            // Skip elements that are likely non-interactive by role
            if (n.classes.includes('disabled') || n.classes.includes('pointer-events-none')) continue;
            bad.push(`${n.selector} (${n.tag}) lacks focus-visible indicator`);
          }
        }
      }
    }
    const top = bad.slice(0, 10);
    return {
      pass: bad.length === 0,
      detail: bad.length ? `${bad.length} element(s) without focus indicator` : 'all interactive elements have focus indicators',
      fix: top.length ? `Add focus-visible:ring-2 or focus-visible:outline-2: ${top.join('; ')}` : undefined,
    };
  },
};

// ---- alt text on images ----
const imageAltRule: RenderedReviewRule = {
  id: 'core-a11y-image-alt',
  category: 'a11y',
  title: 'Images have alt text',
  severity: 'P1',
  target: 'alt attribute on <img> elements',
  check: ({ renders }: RenderedReviewContext) => {
    const bad: string[] = [];
    for (const snap of renders) {
      for (const n of snap.nodes) {
        if (n.tag !== 'img') continue;
        // Check for alt text presence from the node text
        // (RenderNode.text captures textContent, which for <img> is usually empty)
        // Also check if the img role is 'presentation' which allows empty alt
        const hasRolePresentation = n.classes?.includes('role-presentation');
        const hasAriaHidden = n.classes?.includes('aria-hidden');

        if (!n.text.trim() && !hasRolePresentation && !hasAriaHidden) {
          bad.push(`${n.selector} has no alt text`);
        }
      }
    }
    const top = bad.slice(0, 10);
    return {
      pass: bad.length === 0,
      detail: bad.length ? `${bad.length} image(s) without alt text` : 'all images have alt text',
      fix: top.length ? `Add alt="description" or alt="" (decorative) to images: ${top.join('; ')}` : undefined,
    };
  },
};

// ---- heading order ----
const headingOrderRule: RenderedReviewRule = {
  id: 'core-a11y-heading-order',
  category: 'a11y',
  title: 'Heading levels do not skip',
  severity: 'P2',
  target: 'h1→h2→h3→… (no skipping)',
  check: ({ renders }: RenderedReviewContext) => {
    const bad: string[] = [];
    const HEADING_RE = /^h([1-6])$/;
    for (const snap of renders) {
      let prevLevel = 0;
      for (const n of snap.nodes) {
        const m = n.tag.match(HEADING_RE);
        if (!m) continue;
        const level = parseInt(m[1]);
        if (prevLevel > 0 && level > prevLevel + 1) {
          bad.push(`${n.selector} jumps from h${prevLevel} to h${level}`);
        }
        prevLevel = level;
      }
    }
    const top = bad.slice(0, 10);
    return {
      pass: bad.length === 0,
      detail: bad.length ? `${bad.length} heading level skip(s)` : 'heading order is sequential',
      fix: top.length ? `Ensure headings descend by one level: ${top.join('; ')}` : undefined,
    };
  },
};

export const CORE_A11Y_RULES: RenderedReviewRule[] = [
  focusVisibleRule,
  imageAltRule,
  headingOrderRule,
];
