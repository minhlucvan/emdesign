import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['*.test.ts'],
    exclude: ['node_modules', 'fixtures'],
    testTimeout: 60_000,
    hookTimeout: 60_000,
    env: {
      EMDESIGN_PORT: process.env.EMDESIGN_PORT || '4321',
      STORYBOOK_PORT: process.env.STORYBOOK_PORT || '6006',
    },
  },
});
