/**
 * Workflow API — unit tests for the design-system creation workflow HTTP endpoints.
 *
 * Tests the contract of each new endpoint defined in the design-system-creation-experience
 * change. These tests reference modules that do not exist yet (RED step).
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import http from 'node:http';

let server: http.Server;
let baseUrl: string;

beforeAll(async () => {
  // workflowApiRouter is exported from ../../workflow-api.js — does NOT exist yet
  const { workflowApiRouter } = await import('../workflow-api.js');
  const app = express();
  app.use(express.json());
  app.use('/api', workflowApiRouter);

  return new Promise<void>((resolve) => {
    server = app.listen(0, () => {
      const addr = server.address();
      if (addr && typeof addr === 'object') {
        baseUrl = `http://127.0.0.1:${addr.port}`;
      }
      resolve();
    });
  });
});

afterAll(() => {
  if (server) server.close();
});

describe('POST /api/design-systems/from-prompt', () => {
  it('accepts { prompt, name?, id? } and returns { sessionId: string }', async () => {
    const res = await fetch(`${baseUrl}/api/design-systems/from-prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'Dark editorial with lime accent' }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('sessionId');
    expect(typeof body.sessionId).toBe('string');
    expect(body.sessionId.length).toBeGreaterThan(0);
  });

  it('rejects missing prompt with 400', async () => {
    const res = await fetch(`${baseUrl}/api/design-systems/from-prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toHaveProperty('error');
  });

  it('rejects empty prompt string with 400', async () => {
    const res = await fetch(`${baseUrl}/api/design-systems/from-prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: '' }),
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toHaveProperty('error');
  });
});

describe('POST /api/design-systems/from-design-md', () => {
  it('accepts { content, name?, id? } and returns { sessionId: string }', async () => {
    const res = await fetch(`${baseUrl}/api/design-systems/from-design-md`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: '---\nname: Test\ncategory: Editorial\n---\n# Test\n',
      }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('sessionId');
    expect(typeof body.sessionId).toBe('string');
  });

  it('rejects non-existent filePath with 400', async () => {
    const res = await fetch(`${baseUrl}/api/design-systems/from-design-md`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filePath: '/tmp/nonexistent-design-md-xyz.md' }),
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toHaveProperty('error');
    expect(body.error).toContain('not found');
  });

  it('accepts { filePath } with an existing file', async () => {
    const testContent = '---\nname: Test\ncategory: Editorial\n---\n# Test\n';
    const testFilePath = `/tmp/test-design-md-${Date.now()}.md`;
    require('fs').writeFileSync(testFilePath, testContent, 'utf8');
    try {
      const res = await fetch(`${baseUrl}/api/design-systems/from-design-md`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath: testFilePath }),
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty('sessionId');
    } finally {
      require('fs').unlinkSync(testFilePath);
    }
  });

  it('rejects missing content and filePath with 400', async () => {
    const res = await fetch(`${baseUrl}/api/design-systems/from-design-md`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toHaveProperty('error');
  });

  it('rejects invalid YAML frontmatter (missing required fields)', async () => {
    const res = await fetch(`${baseUrl}/api/design-systems/from-design-md`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'no frontmatter here' }),
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toHaveProperty('error');
  });
});

describe('GET /api/design-systems/create-options', () => {
  it('returns modes, samplePrompts, and tips', async () => {
    const res = await fetch(`${baseUrl}/api/design-systems/create-options`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('modes');
    expect(Array.isArray(body.modes)).toBe(true);
    for (const mode of body.modes) {
      expect(mode).toHaveProperty('id');
      expect(mode).toHaveProperty('label');
      expect(mode).toHaveProperty('description');
    }
    expect(body).toHaveProperty('samplePrompts');
    expect(Array.isArray(body.samplePrompts)).toBe(true);
    expect(body).toHaveProperty('tips');
    expect(Array.isArray(body.tips)).toBe(true);
  });
});

describe('GET /api/design-systems/:id/workflow-status', () => {
  it('returns session status and stages for a valid session', async () => {
    // First create a session
    const createRes = await fetch(`${baseUrl}/api/design-systems/from-prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'Minimal fintech, blue primary' }),
    });
    const { sessionId } = await createRes.json();

    const res = await fetch(`${baseUrl}/api/design-systems/${sessionId}/workflow-status`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('sessionId', sessionId);
    expect(body).toHaveProperty('status');
    expect(['running', 'completed', 'failed', 'cancelled']).toContain(body.status);
    expect(body).toHaveProperty('stages');
    expect(Array.isArray(body.stages)).toBe(true);
    if (body.stages.length > 0) {
      const stage = body.stages[0];
      expect(stage).toHaveProperty('name');
      expect(stage).toHaveProperty('status');
      expect(stage).toHaveProperty('progress');
    }
  });

  it('returns 404 for an unknown session', async () => {
    const res = await fetch(`${baseUrl}/api/design-systems/nonexistent-session/workflow-status`);
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body).toHaveProperty('error');
  });
});

describe('POST /api/design-systems/:id/tokens', () => {
  it('accepts valid token updates and returns ok', async () => {
    const res = await fetch(`${baseUrl}/api/design-systems/test-ds/tokens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tokens: [
          { role: 'color-accent', value: '#ff6600' },
          { role: 'color-surface', value: '#ffffff' },
        ],
      }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('ok', true);
    expect(body).toHaveProperty('updated');
    expect(typeof body.updated).toBe('number');
  });

  it('rejects tokens with unknown roles with 400', async () => {
    const res = await fetch(`${baseUrl}/api/design-systems/test-ds/tokens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tokens: [{ role: 'color-nonexistent', value: '#000' }],
      }),
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toHaveProperty('error');
  });

  it('rejects non-hex color values', async () => {
    const res = await fetch(`${baseUrl}/api/design-systems/test-ds/tokens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tokens: [{ role: 'color-accent', value: 'not-a-hex' }],
      }),
    });
    expect(res.status).toBe(400);
  });

  it('rejects negative spacing values', async () => {
    const res = await fetch(`${baseUrl}/api/design-systems/test-ds/tokens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tokens: [{ role: 'space-unit', value: '-8px' }],
      }),
    });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/design-systems/:id/primitives', () => {
  it('accepts valid primitive names and returns scaffolded list', async () => {
    const res = await fetch(`${baseUrl}/api/design-systems/test-ds/primitives`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ primitives: ['Button', 'Card'] }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('ok', true);
    expect(body).toHaveProperty('scaffolded');
    expect(Array.isArray(body.scaffolded)).toBe(true);
  });

  it('rejects unknown primitive names', async () => {
    const res = await fetch(`${baseUrl}/api/design-systems/test-ds/primitives`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ primitives: ['NonExistentBlock'] }),
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toHaveProperty('error');
  });
});

describe('GET /api/design-systems/:id/workflow-stream (SSE)', () => {
  it('emits SSE events progressing through stages', async () => {
    const createRes = await fetch(`${baseUrl}/api/design-systems/from-prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'Minimal fintech' }),
    });
    const { sessionId } = await createRes.json();

    const res = await fetch(`${baseUrl}/api/design-systems/${sessionId}/workflow-stream`);
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('text/event-stream');

    const text = await res.text();
    expect(text).toContain('data:');
    const lines = text.trim().split('\n').filter((l) => l.startsWith('data: '));
    expect(lines.length).toBeGreaterThanOrEqual(2);

    // First event should be the analyzing stage (id=0)
    const first = JSON.parse(lines[0].replace(/^data: /, ''));
    expect(first).toHaveProperty('id');
    expect(first).toHaveProperty('status');
    expect(first).toHaveProperty('detail');

    // Last event should be done/completed
    const last = JSON.parse(lines[lines.length - 1].replace(/^data: /, ''));
    expect(last).toHaveProperty('status', 'completed');
  });
});

describe('POST /api/design-systems/customize (extended options)', () => {
  it('accepts extended customization options', async () => {
    const res = await fetch(`${baseUrl}/api/design-systems/customize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        baseRef: 'open-design/atelier',
        id: 'custom-test',
        name: 'Custom Test',
        customizations: {
          seedColor: '#ff0000',
          colorVariant: 'vibrant',
          colorMode: 'dark',
          headlineFont: 'Inter',
          bodyFont: 'Inter',
          roundness: '8px',
          spacing: 8,
          labelFont: 'Inter',
        },
      }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('id', 'custom-test');
    expect(body).toHaveProperty('note');
    expect(body).toHaveProperty('active', true);
  });
});

describe('POST /api/workflows/:sessionId/cancel', () => {
  it('cancels a running workflow and updates status', async () => {
    const createRes = await fetch(`${baseUrl}/api/design-systems/from-prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'Cancel test' }),
    });
    const { sessionId } = await createRes.json();

    const cancelRes = await fetch(`${baseUrl}/api/workflows/${sessionId}/cancel`, {
      method: 'POST',
    });
    expect(cancelRes.status).toBe(200);
    const cancelBody = await cancelRes.json();
    expect(cancelBody).toHaveProperty('ok', true);

    const statusRes = await fetch(`${baseUrl}/api/design-systems/${sessionId}/workflow-status`);
    const statusBody = await statusRes.json();
    expect(statusBody.status).toBe('cancelled');
  });
});
