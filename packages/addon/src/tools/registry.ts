/**
 * Tool registry — maps ToolMode keys to their ToolDefinition.
 *
 * The pluggability point for the orchestrator (preview.tsx).
 * Adding a new tool means importing its module and adding it to the map.
 */

import type { ToolMode, ToolDefinition } from './types';
import { tool as commentTool } from './comment/index';
import { tool as copyTool } from './copy/index';
import { tool as referenceTool } from './reference/index';
import { tool as textEditTool } from './text-edit/index';
import { tool as wandTool } from './wand/index';
import { tool as placeTool } from './place/index';

/**
 * Create the tool registry map.
 * Maps each tool's mode key to its ToolDefinition.
 */
export function createRegistry(): Map<ToolMode, ToolDefinition> {
  const registry = new Map<ToolMode, ToolDefinition>();

  const tools: ToolDefinition[] = [
    commentTool,
    copyTool,
    referenceTool,
    textEditTool,
    wandTool,
    placeTool,
  ];

  for (const t of tools) {
    registry.set(t.mode, t);
  }

  return registry;
}

/** Singleton registry instance for use by the orchestrator. */
export const toolRegistry: Map<ToolMode, ToolDefinition> = createRegistry();
