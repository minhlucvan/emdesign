import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: [
      'src/**/*.test.{ts,tsx}',
      'design-systems/*/__tests__/**/*.test.{ts,tsx}',
    ],
    environment: 'jsdom',
  },
});
