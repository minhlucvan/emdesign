import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    include: ['examples/test-production/design-systems/figma/__tests__/TypeRow.test.ts'],
    exclude: ['**/node_modules/**', 'packages/**', 'apps/**', 'tests/**'],
    workspace: undefined,
  },
});
