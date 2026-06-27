/**
 * Channel events for the component context harness.
 *
 * Communication flow:
 * - preview → manager: EVT_VIEW_CONTEXT (current story/component/viewport context)
 * - preview → manager: EVT_COMPONENT_ERROR (render error caught by ErrorBoundary)
 * - preview → manager: EVT_ELEMENT_SELECTED (user clicked an element in reference mode)
 */

// ── EVT_VIEW_CONTEXT ──────────────────────────────────────────────────

/** Preview → Manager: sent on story change and viewport resize. */
export const EVT_VIEW_CONTEXT = 'emdesign/view-context';

export interface ViewContextPayload {
  component: string;
  storyId: string;
  storyName: string;
  viewport: { width: number; height: number };
  componentFile?: string;
  storyFile?: string;
  designSystem: string;
  tokens?: string[];
}

// ── EVT_COMPONENT_ERROR ───────────────────────────────────────────────

/** Preview → Manager: sent when a component crashes inside the ErrorBoundary. */
export const EVT_COMPONENT_ERROR = 'emdesign/component-error';

export interface ComponentErrorPayload {
  component: string;
  story: string;
  error: string;
  componentStack?: string;
}

// ── EVT_ELEMENT_SELECTED ──────────────────────────────────────────────

/** Preview → Manager: sent when the user clicks an element in reference mode. */
export const EVT_ELEMENT_SELECTED = 'emdesign/element-selected';

export interface ElementSelectedPayload {
  tag: string;
  text: string;
  selector: string;
  component: string;
  rect: { x: number; y: number; width: number; height: number };
  computedStyles: Record<string, string>;
  emdesignComponent?: string;
  tokenBindings?: string[];
}
