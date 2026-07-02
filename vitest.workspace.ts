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
  // Testing SDK (assertion primitives for design system operations)
  'packages/testbed',
  // Browser-injectable DOM rule evaluation (token binding, anti-patterns, spacing, contrast)
  'packages/testdom',
  // Integration & surface tests
  'tests',
  // Design system primitives & component tests
  'design-systems',
  // Fresh-import Figma DS primitives (TDD validation)
  'examples/fresh-import/design-systems/figma',
]);
