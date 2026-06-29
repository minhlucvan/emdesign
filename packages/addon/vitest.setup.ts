/**
 * vitest.setup.ts — global test configuration.
 *
 * Provides global mocks and setup for the addon test suite.
 * Mocked modules are applied to every test file automatically.
 */
import { vi } from 'vitest';

// ── Global mock for the api module ───────────────────────────────────
// The toolBackend tests import { api } from '../api' and call
// vi.mocked(api.createSession).mockResolvedValueOnce(...). This global
// mock ensures api.createSession et al. are vitest Mock functions.
vi.mock('./src/api', () => ({
  api: {
    getState: vi.fn(),
    submitIntent: vi.fn(),
    submitChangeRequest: vi.fn(),
    capture: vi.fn(),
    runVisualTest: vi.fn(),
    listDesignSystems: vi.fn(),
    getDesignSystem: vi.fn(),
    getDesignSystemFull: vi.fn(),
    useDesignSystem: vi.fn(),
    listBases: vi.fn(),
    getBaseCategories: vi.fn(),
    getBaseDetail: vi.fn(),
    getBaseTokens: vi.fn(),
    getBasePreviewUrl: vi.fn(),
    customizeDesignSystem: vi.fn(),
    getLogs: vi.fn(),
    getHealth: vi.fn(),
    getGraphStats: vi.fn(),
    elementCrop: vi.fn(),
    listSessions: vi.fn(),
    createSession: vi.fn(),
    cancelSession: vi.fn(),
    getSessionConversation: vi.fn(),
    listServices: vi.fn(),
    startService: vi.fn(),
    stopService: vi.fn(),
    restartService: vi.fn(),
    storeComment: vi.fn(),
    getComments: vi.fn(),
    validateComponent: vi.fn(),
    updateTokens: vi.fn(),
    revertDesignSystem: vi.fn(),
    getPlatformStatus: vi.fn(),
  },
}));
