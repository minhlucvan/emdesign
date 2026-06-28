// CommonJS-compatible shim for require('../api') calls in test files.
// ESM imports resolve to api.ts (via .ts-first extensions in vitest config).
// This file provides only the properties that CJS require-based tests check.
export const api = {
  cancelSession: () => {},
};
