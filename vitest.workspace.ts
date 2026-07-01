import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  // Existing package tests
  'packages/backend',
  'packages/graph',
  'packages/dsr',
  'packages/vision-critic',
  // Addon (Storybook panel, toolbar tools, channel events)
  'packages/addon',
  // MCP server (the agent-facing tool surface)
  'packages/mcp-server',
  // Visual diff engine
  'packages/visual-diff',
  // Integration & surface tests
  'tests',
]);
