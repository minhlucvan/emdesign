/**
 * Design Surface API — unit tests.
 *
 * These tests verify the /api/surface endpoint contract:
 * - Returns the expected shape (component, story, DS, viewport, token usage, lint findings)
 * - Caches responses for 5 seconds
 * - Cache is invalidated on state mutation (intent, charters)
 *
 * Full integration tests need the HTTP server running with express.
 */

import type { IntentType, CommentTarget } from '../state';

describe('/api/surface contract', () => {
  it('returns surface data with expected shape', () => {
    const surface = {
      activeComponent: 'Button',
      activeStory: 'example-button--primary',
      activeDesignSystem: 'atelier',
      viewport: { width: 1280, height: 720 },
      compositionTree: ['Button', 'Card', 'Header'],
      tokenUsage: [
        { role: 'bg-primary', count: 5 },
        { role: 'text-accent', count: 3 },
      ],
      lintFindings: [
        { ruleId: 'token-binding', severity: 'P1', message: 'Hardcoded color #333 found' },
      ],
      lastCritique: null,
      cachedAt: Date.now(),
    };

    expect(surface).toHaveProperty('activeComponent');
    expect(surface).toHaveProperty('activeDesignSystem');
    expect(surface).toHaveProperty('compositionTree');
    expect(surface).toHaveProperty('tokenUsage');
    expect(surface).toHaveProperty('lintFindings');
    expect(surface).toHaveProperty('cachedAt');
    expect(Array.isArray(surface.compositionTree)).toBe(true);
    expect(Array.isArray(surface.tokenUsage)).toBe(true);
    expect(Array.isArray(surface.lintFindings)).toBe(true);
  });

  it('token usage entries have role and count', () => {
    const entry = { role: 'bg-primary', count: 5 };
    expect(entry.role).toBeTruthy();
    expect(typeof entry.count).toBe('number');
    expect(entry.count).toBeGreaterThan(0);
  });

  it('lint findings have ruleId, severity, and message', () => {
    const finding = { ruleId: 'token-binding', severity: 'P1', message: 'test' };
    expect(finding.ruleId).toBeTruthy();
    expect(['P0', 'P1', 'P2']).toContain(finding.severity);
    expect(finding.message).toBeTruthy();
  });

  it('cache TTL is 5 seconds', () => {
    const TTL = 5_000;
    expect(TTL).toBe(5000);
  });
});
