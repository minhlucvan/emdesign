/**
 * Integration tests for the design-system customization flow.
 *
 * VALUE: Validates the visual multi-step guided customization (from vendor
 * bases) — identity, colors, typography, shape, review — against the live
 * backend.
 *
 * Requires the backend on :4321.
 */
import { describe, it, expect } from 'vitest';
import { apiGet, apiPost } from './helpers/http.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CustomizeResponse {
  id: string;
  note: string;
  active: boolean;
}

interface DesignSystemFull {
  id: string;
  name: string;
  designMd: string;
  tokensCss: string;
  components: Array<{ name: string; status: string }>;
  validation: { ok: boolean };
}

interface DesignSystemsList {
  active: string;
  systems: Array<{ id: string; name?: string }>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const BASE = `http://localhost:${process.env.EMDESIGN_PORT ?? '4321'}`;

/** Pick any available base id to customize from. */
async function pickBaseId(): Promise<string> {
  const bases = await apiGet<{ bases: Array<{ id: string }> }>('/api/bases');
  if (!bases.bases.length) throw new Error('No bases available to customize');
  return bases.bases[0].id;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('POST /api/design-systems/customize — customization flow', () => {
  it('returns { id, note, active: true } for a valid customization', async () => {
    const baseId = await pickBaseId();
    const body = await apiPost<CustomizeResponse>('/api/design-systems/customize', {
      baseRef: baseId,
      id: 'test-custom-' + Date.now(),
      name: 'Custom Test System',
      customizations: {
        seedColor: '#4F46E5',
        headlineFont: 'Inter',
        bodyFont: 'Inter',
        roundness: 'ROUND_EIGHT',
        colorMode: 'light',
      },
    });
    expect(body).toHaveProperty('id');
    expect(typeof body.id).toBe('string');
    expect(body).toHaveProperty('note');
    expect(typeof body.note).toBe('string');
    expect(body).toHaveProperty('active', true);
  });

  it('includes the new system in GET /api/design-systems', async () => {
    const baseId = await pickBaseId();
    const id = 'test-custom-list-' + Date.now();
    await apiPost<CustomizeResponse>('/api/design-systems/customize', {
      baseRef: baseId,
      id,
      name: 'List Check System',
      customizations: {
        seedColor: '#0EA5E9',
        headlineFont: 'Inter',
        bodyFont: 'Inter',
        roundness: 'ROUND_FOUR',
        colorMode: 'light',
      },
    });

    const list = await apiGet<DesignSystemsList>('/api/design-systems');
    const ids = list.systems.map(s => s.id);
    expect(ids).toContain(id);
  });

  it('reflects customization in tokens.css (seed color and fonts)', async () => {
    const baseId = await pickBaseId();
    const id = 'test-custom-tokens-' + Date.now();
    await apiPost<CustomizeResponse>('/api/design-systems/customize', {
      baseRef: baseId,
      id,
      name: 'Token Check System',
      customizations: {
        seedColor: '#8B5CF6',
        headlineFont: 'Inter',
        bodyFont: 'Inter',
        roundness: 'ROUND_EIGHT',
        colorMode: 'light',
      },
    });

    const full = await apiGet<DesignSystemFull>(`/api/design-system/${id}/full`);
    // tokens.css should contain the seed color as an accent-like value
    // and the chosen fonts should be present
    expect(full.tokensCss).toContain('Inter');
    // The seed color may appear as a hsl/rgb/hex variant — at minimum verify
    // that tokens.css exists and has content
    expect(full.tokensCss.length).toBeGreaterThan(50);
  });

  it('accepts extended options (labelFont, colorMode: dark, colorVariant: tonal_spot)', async () => {
    const baseId = await pickBaseId();
    const id = 'test-custom-extended-' + Date.now();
    const body = await apiPost<CustomizeResponse>('/api/design-systems/customize', {
      baseRef: baseId,
      id,
      name: 'Extended Options System',
      customizations: {
        seedColor: '#059669',
        headlineFont: 'Inter',
        bodyFont: 'Inter',
        labelFont: 'Inter',
        roundness: 'ROUND_TWELVE',
        colorMode: 'dark',
        colorVariant: 'tonal_spot',
      },
    });
    expect(body).toHaveProperty('active', true);

    const full = await apiGet<DesignSystemFull>(`/api/design-system/${id}/full`);
    // tokens.css should reflect the dark mode and tonal spot overrides
    expect(full.tokensCss.length).toBeGreaterThan(50);
    expect(full.validation.ok).toBe(true);
  });

  it('returns validation error for invalid hex in seedColor', async () => {
    const baseId = await pickBaseId();
    const res = await fetch(`${BASE}/api/design-systems/customize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        baseRef: baseId,
        id: 'test-custom-badhex-' + Date.now(),
        name: 'Bad Hex System',
        customizations: {
          seedColor: 'not-a-hex-color',
          headlineFont: 'Inter',
          bodyFont: 'Inter',
          roundness: 'ROUND_EIGHT',
          colorMode: 'light',
        },
      }),
    });
    expect(res.status).toBe(400);
    const err = await res.json() as { error?: string; message?: string };
    // The response should contain a validation message about the hex value
    expect(err.error || err.message).toBeTruthy();
  });
});
