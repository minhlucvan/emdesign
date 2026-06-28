import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    extensions: ['.ts', '.tsx', '.mjs', '.js', '.jsx', '.json'],
  },
  test: {
    include: ['src/__tests__/**/*.test.{ts,tsx}'],
    name: '@emdesign/addon',
    environment: 'node',
    globals: true,
  },
});
