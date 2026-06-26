import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  // Existing package tests
  'packages/backend',
  'packages/graph',
  'packages/dsr',
  'packages/vision-critic',
  // Integration & surface tests
  'tests',
]);
