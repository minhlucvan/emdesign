/**
 * ComponentContext — metadata types for the `withComponentContext` Storybook harness.
 *
 * Every component wrapped with the harness becomes self-describing to the AI via:
 * 1. A `data-emdesign-component` attribute on the root element
 * 2. A `<script type="application/emdesign+json">` tag with full metadata
 * 3. An ErrorBoundary that reports render failures
 */

import type { RenderSnapshot } from '../rules/rendered.js';

// ---------------------------------------------------------------------------
// ComponentContext
// ---------------------------------------------------------------------------

/**
 * Full metadata payload for a component instance rendered via the harness.
 * Serialised into the `application/emdesign+json` script tag.
 */
export interface ComponentContext {
  /** Component name (PascalCase). */
  component: string;
  /** Source file path relative to project root. */
  filePath?: string;
  /** Story file path relative to project root. */
  storyFile?: string;
  /** Active design system ID. */
  designSystem: string;
  /** Prop names mapped to their TypeScript type strings. */
  props: Record<string, string>;
  /** CSS token roles this component's source references (e.g. `"--color-surface"`). */
  tokenBindings: string[];
  /** Story export names for this component. */
  stories: string[];
  /** Render snapshot data if captured. */
  renderSnapshot?: RenderSnapshot;
}

// ---------------------------------------------------------------------------
// ComponentErrorPayload
// ---------------------------------------------------------------------------

/**
 * Payload for the EVT_COMPONENT_ERROR channel event — fired when a component
 * crashes inside the ErrorBoundary.
 */
export interface ComponentErrorPayload {
  component: string;
  story: string;
  error: string;
  componentStack?: string;
}

// ---------------------------------------------------------------------------
// PropTypes — lightweight prop-type extraction
// ---------------------------------------------------------------------------

/**
 * Extract prop names + type annotations from a React component's source.
 * Simple regex-based — covers `interface XProps { … }` and `type XProps = { … }`.
 */
export function extractPropTypes(source: string): Record<string, string> {
  const props: Record<string, string> = {};

  // Match `interface XProps { prop1: Type1; prop2: Type2; ... }`
  const ifaceMatch = source.match(/interface\s+\w+Props\s*\{([^}]+)\}/);
  if (ifaceMatch) {
    for (const line of ifaceMatch[1].split('\n')) {
      const m = line.match(/^\s*(\w+)\s*[?:]?\s*(:\s*[^;]+);/);
      if (m) props[m[1]] = m[2].trim();
    }
    return props;
  }

  // Match `type XProps = { prop1: Type1; prop2: Type2; ... }`
  const typeMatch = source.match(/type\s+\w+Props\s*=\s*\{([^}]+)\}/);
  if (typeMatch) {
    for (const line of typeMatch[1].split('\n')) {
      const m = line.match(/^\s*(\w+)\s*[?:]?\s*(:\s*[^;]+);/);
      if (m) props[m[1]] = m[2].trim();
    }
  }

  return props;
}
