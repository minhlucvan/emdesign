/**
 * withComponentContext — Storybook decorator that wraps every component with:
 * - `data-emdesign-component` attribute on the root element
 * - An ErrorBoundary that catches render errors and reports them via channel
 * - A `<script type="application/emdesign+json">` tag with component metadata
 *
 * Usage in .storybook/preview.ts:
 * ```ts
 * import { withComponentContext } from '@emdesign/addon/harness';
 * export const decorators = [withComponentContext];
 * ```
 */

import React, { useEffect, useRef } from 'react';
import { addons } from '@storybook/preview-api';
import { EVT_VIEW_CONTEXT, EVT_COMPONENT_ERROR } from './channel';

// ---------------------------------------------------------------------------
// ErrorBoundary
// ---------------------------------------------------------------------------

interface EBProps { children: React.ReactNode; component: string; story: string; }
interface EBState { hasError: boolean; error: Error | null; }

class ComponentErrorBoundary extends React.Component<EBProps, EBState> {
  constructor(props: EBProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): EBState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    const { component, story } = this.props;
    addons.getChannel().emit(EVT_COMPONENT_ERROR, {
      component,
      story,
      error: error.message,
      componentStack: info.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div data-emdesign-error="true" style={{
          padding: 16, margin: 8, border: '1px solid #e74c3c', borderRadius: 6,
          background: '#fef2f2', color: '#991b1b', font: '13px sans-serif',
        }}>
          <strong>⚠️ Component Error</strong>
          <pre style={{ marginTop: 8, fontSize: 12, whiteSpace: 'pre-wrap' }}>
            {this.state.error?.message}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Minimal token-binding detection: checks source for `--color-*`, `bg-*`, `text-*`
 * references to known semantic token roles.
 */
function detectTokenBindings(meta?: Record<string, unknown>): string[] {
  // Token bindings are best detected from the component source at build time.
  // At runtime we infer from static metadata if available.
  if (meta?.tokenBindings) return meta.tokenBindings as string[];
  return [];
}

/**
 * Build a ComponentContext script tag payload from available data.
 */
function buildMetadata(context: any): Record<string, unknown> {
  const component = context?.title?.split('/').pop() ?? 'Unknown';
  const meta = (context?.component as any)?.__emdesign_meta;
  return {
    component,
    props: meta?.props ?? {},
    tokenBindings: detectTokenBindings(meta),
    stories: meta?.stories ?? [],
    designSystem: meta?.designSystem ?? '',
  };
}

/**
 * Extract component file path from story context (webpack/Vite resolve).
 */
function extractFilePath(context: any): string | undefined {
  try {
    return context?.parameters?.fileName ?? context?.component?.__file ?? undefined;
  } catch { return undefined; }
}

// ---------------------------------------------------------------------------
// Context Enricher
// ---------------------------------------------------------------------------

/**
 * Renders inside the story iframe, emits EVT_VIEW_CONTEXT on story change,
 * and attaches the data attribute + metadata script tag to the story root.
 */
function ContextEnricher({ context }: { context: any }) {
  const enrichedRef = useRef<string | null>(null);

  useEffect(() => {
    const id = context?.id;
    if (!id || enrichedRef.current === id) return;
    enrichedRef.current = id;

    const container = document.getElementById('storybook-root');
    if (!container) return;

    // ── Set data attribute on the first child element ──────────────
    const firstChild = container.firstElementChild as HTMLElement | null;
    if (firstChild && !firstChild.hasAttribute('data-emdesign-component')) {
      const name = context.title?.split('/').pop() ?? 'Unknown';
      firstChild.setAttribute('data-emdesign-component', name);
    }

    // ── Inject metadata script tag ─────────────────────────────────
    let script = container.querySelector('script[type="application/emdesign+json"]');
    if (!script) {
      script = document.createElement('script');
      script.setAttribute('type', 'application/emdesign+json');
      container.appendChild(script);
    }
    const meta = buildMetadata(context);
    script.textContent = JSON.stringify(meta);

    // ── Emit EVT_VIEW_CONTEXT ──────────────────────────────────────
    const component = (context.title?.split('/').pop() ?? 'Unknown') as string;
    const viewport = { width: window.innerWidth, height: window.innerHeight };
    addons.getChannel().emit(EVT_VIEW_CONTEXT, {
      component,
      storyId: context.id ?? id,
      storyName: context.name ?? 'default',
      viewport,
      componentFile: extractFilePath(context),
      storyFile: context?.parameters?.storyFile,
      designSystem: meta.designSystem as string,
      tokens: meta.tokenBindings as string[] | undefined,
    });
  }, [context?.id, context?.title, context?.name]);

  return null;
}

// ---------------------------------------------------------------------------
// Decorator
// ---------------------------------------------------------------------------

/**
 * Storybook decorator that wraps each story with:
 * 1. An ErrorBoundary (catches render errors, reports via channel)
 * 2. ContextEnricher (emits EVT_VIEW_CONTEXT, adds data attrs + metadata script)
 *
 * Use as a global decorator:
 * ```ts
 * export { withComponentContext } from '@emdesign/addon/harness';
 * // or manually:
 * import { withComponentContext } from '@emdesign/addon/harness';
 * export const decorators = [withComponentContext];
 * ```
 */
export const withComponentContext = (
  Story: React.ComponentType,
  context: any,
) => {
  const component = context?.title?.split('/').pop() ?? 'Unknown';
  const story = context?.name ?? 'default';

  return (
    <ComponentErrorBoundary component={component} story={story}>
      <Story />
      <ContextEnricher context={context} />
    </ComponentErrorBoundary>
  );
};

export default withComponentContext;
