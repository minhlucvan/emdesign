/**
 * Integration tests for the design-system token editor.
 *
 * VALUE: Validates the bulk token update endpoint with validation (valid
 * hex, non-negative spacing, existing roles, bulk capacity) against the
 * live backend.
 *
 * Requires the backend on :4321.
 */
import { describe, it, expect } from 'vitest';
import { apiGet, apiPost } from './helpers/http.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TokenUpdateResponse {
  ok: boolean;
  updated: number;
}

interface DesignSystemFull {
  id: string;
  name: string;
  designMd: string;
  tokensCss: string;
  validation: { ok: boolean };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const BASE = `http://localhost:${process.env.EMDESIGN_PORT ?? '4321'}`;

/** Get the currently active design system id. */
async function getActiveSystemId(): Promise<string> {
  const health = await apiGet<{ activeDesignSystem: string }>('/api/health');
  return health.activeDesignSystem;
}

/** Parse CSS custom property values from a tokens.css string. */
function parseTokenValue(css: string, property: string): string | null {
  const re = new RegExp(`--${property}\\s*:\\s*([^;]+);`);
  const match = css.match(re);
  return match ? match[1].trim() : null;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('POST /api/design-systems/:id/tokens — token editor', () => {
  it('updates a single color token and returns { ok: true, updated: 1 }', async () => {
    const systemId = await getActiveSystemId();

    const result = await apiPost<TokenUpdateResponse>(`/api/design-systems/${systemId}/tokens`, {
      tokens: {
        'color-accent': '#FF5733',
      },
    });
    expect(result).toHaveProperty('ok', true);
    expect(result).toHaveProperty('updated', 1);
  });

  it('reflects token changes in tokens.css on disk', async () => {
    const systemId = await getActiveSystemId();
    const newColor = '#FF6B6B';

    await apiPost<TokenUpdateResponse>(`/api/design-systems/${systemId}/tokens`, {
      tokens: {
        'color-accent': newColor,
      },
    });

    const full = await apiGet<DesignSystemFull>(`/api/design-system/${systemId}/full`);
    const value = parseTokenValue(full.tokensCss, 'color-accent');
    expect(value).toBe(newColor);
  });

  it('rejects an invalid hex color value with 400', async () => {
    const systemId = await getActiveSystemId();
    const res = await fetch(`${BASE}/api/design-systems/${systemId}/tokens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tokens: {
          'color-accent': 'not-a-hex-color',
        },
      }),
    });
    expect(res.status).toBe(400);
    const body = await res.json() as { error?: string; message?: string; details?: string };
    const msg = body.error ?? body.message ?? body.details ?? '';
    expect(msg.length).toBeGreaterThan(0);
  });

  it('rejects a negative spacing token with 400', async () => {
    const systemId = await getActiveSystemId();
    const res = await fetch(`${BASE}/api/design-systems/${systemId}/tokens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tokens: {
          'space-md': '-16px',
        },
      }),
    });
    expect(res.status).toBe(400);
  });

  it('rejects a non-existent token role with 400', async () => {
    const systemId = await getActiveSystemId();
    const res = await fetch(`${BASE}/api/design-systems/${systemId}/tokens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tokens: {
          'color-ghost-role': '#FF0000',
        },
      }),
    });
    expect(res.status).toBe(400);
  });

  it('bulk updates 10 tokens at once and reflects all in tokens.css', async () => {
    const systemId = await getActiveSystemId();

    const updates: Record<string, string> = {
      'color-accent': '#111111',
      'color-surface': '#222222',
      'color-text': '#333333',
      'color-muted': '#444444',
      'color-border': '#555555',
      'space-xs': '2px',
      'space-sm': '4px',
      'space-md': '8px',
      'space-lg': '16px',
      'space-xl': '32px',
    };

    const result = await apiPost<TokenUpdateResponse>(`/api/design-systems/${systemId}/tokens`, {
      tokens: updates,
    });
    expect(result).toHaveProperty('ok', true);
    expect(result.updated).toBe(10);

    // Verify all in tokens.css
    const full = await apiGet<DesignSystemFull>(`/api/design-system/${systemId}/full`);
    for (const [role, expectedValue] of Object.entries(updates)) {
      const parsed = parseTokenValue(full.tokensCss, role);
      expect(parsed, `Token --${role} should be "${expectedValue}"`).toBe(expectedValue);
    }
  });
});
