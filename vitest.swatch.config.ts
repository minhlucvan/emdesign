import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    include: ['examples/fresh-import/design-systems/figma/__tests__/Swatch.test.ts'],
    exclude: ['**/node_modules/**', 'packages/**', 'apps/**', 'tests/**'],
    workspace: undefined,
  },
});
