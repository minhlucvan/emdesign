/**
 * ToolDefinition — the contract for every canvas tool.
 *
 * Each tool module exports a ToolDefinition that the orchestrator
 * (preview.tsx) uses to route events and render overlays. Adding a
 * new tool means adding one module that satisfies this interface.
 */

import type { ToolMode } from '../channel';

export type { ToolMode } from '../channel';

/** A numbered pin pinned to a position on the canvas. */
export interface Pin {
  n: number;
  box?: { x: number; y: number; width: number; height: number };
  text: string;
  sessionId?: string;
}

/**
 * Context passed from the orchestrator to every tool lifecycle hook.
 * Tools receive read-only state plus setter callbacks for shared UI
 * (pins, toast) and a function to deactivate and sync.
 */
export interface ToolContext {
  /** The element currently under the cursor, if any. */
  hoverEl: Element | null;
  /** The active story's id. */
  storyId?: string;
  /** The active story's component name. */
  component?: string;
  /** Current pins on the canvas. */
  pins: Pin[];
  /** Set new pins. */
  setPins: React.Dispatch<React.SetStateAction<Pin[]>>;
  /** Show a brief toast message. */
  setToast: (msg: string) => void;
  /** Deactivate the current tool and sync the mode back to the manager panel. */
  offAndSync: () => void;
}

/**
 * A tool definition returned by every tool module.
 *
 * Lifecycle hooks are optional — a tool that only performs an action on
 * click (like copy) may only implement `onClick`.
 */
export interface ToolDefinition {
  /** The mode key this tool registers for (must be unique across all tools). */
  mode: ToolMode;
  /** Short hint displayed in the overlay hint bar when this tool is active. */
  hint: string;

  // ── Lifecycle hooks ───────────────────────────────────────────────

  onActivate?(ctx: ToolContext): void;
  onDeactivate?(ctx: ToolContext): void;
  onMouseMove?(e: MouseEvent, ctx: ToolContext): void;
  onClick?(e: MouseEvent, ctx: ToolContext): void;
  onKeyDown?(e: KeyboardEvent, ctx: ToolContext): void;

  /**
   * Optional overlay rendered alongside the shared overlay chrome
   * (pins, placeholder overlays, hint bar).
   */
  renderOverlay?(ctx: ToolContext): React.ReactNode;
}
