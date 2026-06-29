/**
 * Orchestrator — integration tests for ToolOverlay.
 *
 * Tests the orchestrator's event delegation to tool modules via the registry.
 * Verifies that only the active tool receives events, overlays render correctly,
 * and shared state (ToolContext) is properly passed.
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createRoot, type Root } from 'react-dom/client';

// ── Mocks ──────────────────────────────────────────────────────────────

// Mock wand module to work around the pre-existing JSX-in-.ts build issue.
vi.mock('../tools/wand/index', () => ({
  tool: {
    mode: 'wand',
    hint: 'Mock wand tool',
    onActivate: vi.fn(),
    onDeactivate: vi.fn(),
    onClick: vi.fn(),
    onMouseMove: vi.fn(),
    onKeyDown: vi.fn(),
    renderOverlay: () => null,
  },
}));

// Working event-emitter mock for the Storybook channel.
// ToolOverlay uses addons.getChannel().on(EVT_TOOL_MODE, ...) to set mode.
const channelHandlers: Record<string, Function[]> = {};
const mockChannel = {
  on: vi.fn((event: string, handler: Function) => {
    if (!channelHandlers[event]) channelHandlers[event] = [];
    channelHandlers[event].push(handler);
  }),
  off: vi.fn((event: string, handler: Function) => {
    if (channelHandlers[event]) {
      channelHandlers[event] = channelHandlers[event].filter(h => h !== handler);
    }
  }),
  emit: vi.fn((event: string, ...args: any[]) => {
    (channelHandlers[event] || []).forEach(h => h(...args));
  }),
};
vi.mock('@storybook/preview-api', () => ({
  addons: { getChannel: () => mockChannel },
}));

// ── Imports ────────────────────────────────────────────────────────────
import { ToolOverlay } from '../preview';
import { EVT_TOOL_MODE } from '../channel';
import { createRegistry, toolRegistry } from '../tools/registry';
import { type ToolDefinition, type ToolContext, type Pin } from '../tools/types';
import { tool as commentTool } from '../tools/comment';
import { tool as copyTool } from '../tools/copy';

// ── Helpers ────────────────────────────────────────────────────────────

/** Save and restore toolRegistry around tests that inject mock tools. */
let savedRegistry: Map<string, ToolDefinition> | null = null;

function saveRegistry(): void {
  savedRegistry = new Map(toolRegistry as any);
}

function restoreRegistry(): void {
  if (savedRegistry) {
    toolRegistry.clear();
    for (const [k, v] of savedRegistry) {
      (toolRegistry as any).set(k, v);
    }
    savedRegistry = null;
  }
}

/** Create a mock ToolDefinition for testing. */
function makeMockTool(
  mode: string,
  overrides: Partial<ToolDefinition> = {},
): ToolDefinition {
  return {
    mode: mode as any,
    hint: `Mock tool: ${mode}`,
    onActivate: vi.fn(),
    onDeactivate: vi.fn(),
    onClick: vi.fn(),
    onMouseMove: vi.fn(),
    onKeyDown: vi.fn(),
    renderOverlay: vi.fn(() => null),
    ...overrides,
  };
}

/** Set up a DOM container for rendering React components in tests. */
function setupContainer(): HTMLDivElement {
  const container = document.createElement('div');
  container.id = 'test-container';
  document.body.appendChild(container);
  return container;
}

function teardownContainer(container: HTMLDivElement, root: Root): void {
  root.unmount();
  container.remove();
}

/** Dispatch a click event on a child of body so root.contains(el) passes. */
function dispatchClick(clientX = 100, clientY = 100): void {
  const target = document.createElement('div');
  target.id = 'click-target';
  document.body.appendChild(target);
  target.dispatchEvent(
    new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      clientX,
      clientY,
    }),
  );
  target.remove();
}

/** Dispatch a mousemove event on a child of body. */
function dispatchMouseMove(clientX = 100, clientY = 100): void {
  const target = document.createElement('div');
  target.id = 'move-target';
  document.body.appendChild(target);
  target.dispatchEvent(
    new MouseEvent('mousemove', {
      bubbles: true,
      cancelable: true,
      clientX,
      clientY,
    }),
  );
  target.remove();
}

/** Render ToolOverlay and emit the tool mode. Uses flushSync to force commit. */
import { flushSync } from 'react-dom';

function renderOverlay(
  container: HTMLDivElement,
  root: Root,
  mode: string,
  opts: { storyId?: string; component?: string } = {},
): void {
  flushSync(() => {
    root.render(
      React.createElement(ToolOverlay, {
        storyId: opts.storyId ?? 'test-story',
        component: opts.component ?? 'TestComp',
      }),
    );
  });
  // Emit mode event so the useEffect listener sets the active tool.
  // flushSync before/after ensures React commits the state update.
  flushSync(() => {
    mockChannel.emit(EVT_TOOL_MODE, { mode });
  });
}

// ═══════════════════════════════════════════════════════════════════════
// Registry & ToolDefinition contract
// ═══════════════════════════════════════════════════════════════════════

describe('Tool registry integration', () => {
  it('createRegistry returns all 6 tools', () => {
    const registry = createRegistry();
    expect(registry.size).toBe(6);
    expect(registry.has('comment')).toBe(true);
    expect(registry.has('copy')).toBe(true);
    expect(registry.has('reference')).toBe(true);
    expect(registry.has('text')).toBe(true);
    expect(registry.has('wand')).toBe(true);
    expect(registry.has('place')).toBe(true);
  });

  it('singleton toolRegistry matches createRegistry shape', () => {
    const registry = createRegistry();
    expect(toolRegistry.size).toBe(registry.size);
    for (const [mode, def] of registry) {
      expect(toolRegistry.get(mode)?.mode).toBe(def.mode);
      expect(typeof toolRegistry.get(mode)?.hint).toBe('string');
    }
  });

  it('every tool in the registry has a unique mode key', () => {
    const registry = createRegistry();
    const modes = Array.from(registry.keys());
    expect(new Set(modes).size).toBe(modes.length);
  });

  it('each tool exports a valid ToolDefinition', () => {
    expect(commentTool.mode).toBe('comment');
    expect(typeof commentTool.hint).toBe('string');
    expect(typeof commentTool.onClick).toBe('function');

    expect(copyTool.mode).toBe('copy');
    expect(typeof copyTool.hint).toBe('string');
    expect(typeof copyTool.onClick).toBe('function');
  });
});

// ═══════════════════════════════════════════════════════════════════════
// Event delegation — replaces mock tools in the registry and uses the
// channel to set the active mode.
// ═══════════════════════════════════════════════════════════════════════

describe('ToolOverlay event delegation', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = setupContainer();
    root = createRoot(container);
    saveRegistry();
  });

  afterEach(() => {
    try { root.unmount(); } catch { /* already unmounted */ }
    container.remove();
    restoreRegistry();
    vi.restoreAllMocks();
    // Reset channel handlers between tests
    Object.keys(channelHandlers).forEach(k => { delete channelHandlers[k]; });
  });

  it('delegates click to active tool\'s onClick handler', () => {
    const onClickA = vi.fn();
    const onClickB = vi.fn();

    // Register mock tools under non-special modes (not 'comment' or 'place'
    // which the orchestrator handles directly).
    toolRegistry.set('copy' as any, makeMockTool('copy', { onClick: onClickA }));
    toolRegistry.set('reference' as any, makeMockTool('reference', { onClick: onClickB }));

    renderOverlay(container, root, 'copy');

    dispatchClick(200, 200);

    // Only the active tool's onClick should be invoked
    expect(onClickA).toHaveBeenCalledTimes(1);
    expect(onClickB).not.toHaveBeenCalled();
  });

  it('ignores click when mode is off', () => {
    const onClick = vi.fn();
    toolRegistry.set('copy' as any, makeMockTool('copy', { onClick }));

    renderOverlay(container, root, 'off');

    dispatchClick(200, 200);

    // When mode is 'off', no tool's onClick should be called
    expect(onClick).not.toHaveBeenCalled();
  });

  it('delegates mousemove to active tool only', () => {
    const onMouseMoveA = vi.fn();
    toolRegistry.set('copy' as any, makeMockTool('copy', { onMouseMove: onMouseMoveA }));

    renderOverlay(container, root, 'copy');

    dispatchMouseMove(200, 200);

    expect(onMouseMoveA).toHaveBeenCalledTimes(1);
  });
});

// ═══════════════════════════════════════════════════════════════════════
// Overlay rendering
// ═══════════════════════════════════════════════════════════════════════

describe('ToolOverlay rendering', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = setupContainer();
    root = createRoot(container);
    saveRegistry();
  });

  afterEach(() => {
    try { root.unmount(); } catch { /* already unmounted */ }
    container.remove();
    restoreRegistry();
    vi.restoreAllMocks();
    Object.keys(channelHandlers).forEach(k => { delete channelHandlers[k]; });
  });

  it('renders active tool\'s overlay via registry', () => {
    const renderFn = vi.fn(() =>
      React.createElement('div', { 'data-testid': 'mock-overlay', className: 'mock-overlay' }),
    );
    toolRegistry.set('copy' as any, makeMockTool('copy', { renderOverlay: renderFn }));

    renderOverlay(container, root, 'copy');

    // Should render the mock overlay in the DOM
    const overlayEl = container.querySelector('[data-testid="mock-overlay"]');
    expect(overlayEl).not.toBeNull();
  });

  it('does not render overlay when mode is off', () => {
    const renderFn = vi.fn(() =>
      React.createElement('div', { 'data-testid': 'mock-overlay' }),
    );
    toolRegistry.set('copy' as any, makeMockTool('copy', { renderOverlay: renderFn }));

    renderOverlay(container, root, 'off');

    // Active overlay should NOT be rendered
    const overlayEl = container.querySelector('[data-testid="mock-overlay"]');
    expect(overlayEl).toBeNull();
  });

  it('emits toast hint for active tool', () => {
    toolRegistry.set('copy' as any, makeMockTool('copy', { hint: 'click to copy' }));

    renderOverlay(container, root, 'copy');

    // Toast/hint bar should show the active tool's hint
    expect(container.textContent).toContain('click to copy');
  });
});

// ═══════════════════════════════════════════════════════════════════════
// ToolContext contract
// ═══════════════════════════════════════════════════════════════════════

describe('ToolContext contract', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = setupContainer();
    root = createRoot(container);
    saveRegistry();
  });

  afterEach(() => {
    try { root.unmount(); } catch { /* already unmounted */ }
    container.remove();
    restoreRegistry();
    vi.restoreAllMocks();
    Object.keys(channelHandlers).forEach(k => { delete channelHandlers[k]; });
  });

  it('passes ToolContext with required fields to tool handlers', () => {
    let capturedCtx: ToolContext | null = null;

    toolRegistry.set('copy' as any, makeMockTool('copy', {
      onClick: (_e: MouseEvent, ctx: ToolContext) => {
        capturedCtx = ctx;
      },
    }));

    renderOverlay(container, root, 'copy');

    dispatchClick(100, 100);

    expect(capturedCtx).not.toBeNull();
    expect(capturedCtx).toHaveProperty('hoverEl');
    expect(capturedCtx).toHaveProperty('storyId');
    expect(capturedCtx).toHaveProperty('component');
    expect(capturedCtx).toHaveProperty('pins');
    expect(typeof capturedCtx!.setPins).toBe('function');
    expect(typeof capturedCtx!.setToast).toBe('function');
    expect(typeof capturedCtx!.offAndSync).toBe('function');
  });

  it('supports minimal ToolContext with optional fields omitted', () => {
    const ctx: ToolContext = {
      hoverEl: null,
      pins: [],
      setPins: vi.fn(),
      setToast: vi.fn(),
      offAndSync: vi.fn(),
    };

    expect(ctx.storyId).toBeUndefined();
    expect(ctx.component).toBeUndefined();
    expect(ctx.pins).toEqual([]);

    ctx.setPins((prev) => [...prev, { n: 1, text: 'test' }]);
    expect(ctx.setPins).toHaveBeenCalledTimes(1);
  });
});
