/**
 * Tests backend REST API endpoints.
 *
 * VALUE: Verifies the HTTP API that powers the Storybook addon.
 * Every test here requires the backend running on :4321.
 *
 * These tests CANNOT silently skip. If the backend isn't running,
 * they fail with a clear connection error. Run `npm run backend`
 * in another terminal first.
 */
import { describe, it, expect } from 'vitest';
import { apiGet, apiPost } from './helpers/http.js';

describe('Backend REST API', () => {
  describe('GET /api/health', () => {
    it('returns ok: true and identifies itself', async () => {
      const body = await apiGet<{ ok: boolean; name: string; version: string; activeDesignSystem: string }>('/api/health');
      expect(body.ok).toBe(true);
      expect(body.name).toBe('emdesign');
      expect(typeof body.activeDesignSystem).toBe('string');
    });
  });

  describe('GET /api/state', () => {
    it('returns current system state', async () => {
      const body = await apiGet<Record<string, unknown>>('/api/state');
      expect(body).toHaveProperty('activeDesignSystem');
      expect(body).toHaveProperty('lintPassing');
    });
  });

  describe('GET /api/bases', () => {
    it('returns a bases array with at least one entry', async () => {
      const body = await apiGet<{ bases: unknown[] }>('/api/bases');
      expect(Array.isArray(body.bases)).toBe(true);
      expect(body.bases.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/design-systems', () => {
    it('returns systems list with atelier', async () => {
      const body = await apiGet<{ active: string; systems: Array<{ id: string }> }>('/api/design-systems');
      expect(body).toHaveProperty('systems');
      const ids = body.systems.map((s: { id: string }) => s.id);
      expect(ids).toContain('atelier');
    });
  });

  describe('POST /api/score — quality gate', () => {
    it('ships with perfect scores and mustFix=0', async () => {
      const result = await apiPost<{ composite: number; decision: string }>('/api/score', {
        scores: { tokens: 1.0, visual: 1.0, vision: 0.9, llm: 0.9 },
        mustFix: 0,
      });
      expect(result.decision).toBe('ship');
      expect(result.composite).toBeGreaterThanOrEqual(0.8);
    });

    it('revises with mustFix > 0 regardless of scores', async () => {
      const result = await apiPost<{ decision: string; mustFix?: number; unsatisfiedConditions?: string[] }>('/api/score', {
        scores: { tokens: 0.95, visual: 1.0 },
        mustFix: 2,
      });
      expect(result.decision).toBe('revise');
      expect(result.unsatisfiedConditions?.length).toBeGreaterThan(0);
    });

    it('revises below threshold', async () => {
      const result = await apiPost<{ decision: string }>('/api/score', {
        scores: { tokens: 0.3, visual: 0.3 },
        mustFix: 0,
      });
      expect(result.decision).toBe('revise');
    });

    it('revises when a source score is below its floor', async () => {
      const result = await apiPost<{ decision: string }>('/api/score', {
        scores: { tokens: 1.0, visual: 0.2, vision: 0.9, llm: 0.9 },
        mustFix: 0,
      });
      expect(result.decision).toBe('revise');
    });
  });

  describe('GET /api/graph/:id/stats', () => {
    it('returns graph node and edge counts for atelier', async () => {
      const body = await apiGet<{ id: string; stats: { nodes: number; edges: number } }>('/api/graph/atelier/stats');
      expect(body.id).toBe('atelier');
      expect(body.stats.nodes).toBeGreaterThan(0);
      expect(body.stats.edges).toBeGreaterThan(0);
    });
  });

  describe('POST /api/use', () => {
    it('switches the active design system', async () => {
      const result = await apiPost<{ id: string }>('/api/use', { id: 'atelier' }, 20_000);
      expect(result.id).toBe('atelier');
    });
  });
});
