import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    include: ['examples/test-production/design-systems/figma/__tests__/Heading.test.ts'],
  },
});
