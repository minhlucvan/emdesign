import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  // Existing package tests — each uses its own vitest.config.ts or defaults
  '../packages/backend',
  '../packages/graph',
  '../packages/dsr',
  '../packages/vision-critic',
  // This package — surfaces, scenarios, and smoke tests
  '.',
]);
