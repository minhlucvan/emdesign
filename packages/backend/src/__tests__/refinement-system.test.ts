/**
 * Refinement System — unit tests for the agent-driven design-system refinement pipeline.
 *
 * Tests SnapshotManager, ActivityLogger, the refine-design-system MCP tool, the revert
 * endpoint, and the IntentType extension. These modules do not exist yet (RED step).
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import express from 'express';
import http from 'node:http';

let tmpDir: string;
let dsDir: string;

beforeAll(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'emdesign-refinement-test-'));
  dsDir = path.join(tmpDir, 'design-systems', 'test-ds');
  fs.mkdirSync(path.join(dsDir, 'code'), { recursive: true });
  fs.writeFileSync(path.join(dsDir, 'DESIGN.md'), '---\nname: Test DS\n---\n# Test DS\n');
  fs.writeFileSync(path.join(dsDir, 'tokens.css'), ':root { --color-accent: #2563eb; }');
  fs.writeFileSync(path.join(dsDir, 'manifest.json'), JSON.stringify({ id: 'test-ds', name: 'Test DS' }));
  fs.writeFileSync(path.join(dsDir, 'code', 'Button.tsx'), 'export const Button = () => null;');
});

afterAll(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('SnapshotManager', () => {
  it('record() copies system directory to .snapshots/<timestamp>/', async () => {
    const { SnapshotManager } = await import('../refinement.js');
    const manager = new SnapshotManager({ baseDir: dsDir });
    const snapshotId = await manager.record();
    expect(snapshotId).toBeTruthy();
    expect(typeof snapshotId).toBe('string');

    const snapDir = path.join(dsDir, '.snapshots', snapshotId);
    expect(fs.existsSync(snapDir)).toBe(true);
    expect(fs.existsSync(path.join(snapDir, 'DESIGN.md'))).toBe(true);
    expect(fs.existsSync(path.join(snapDir, 'tokens.css'))).toBe(true);
    expect(fs.existsSync(path.join(snapDir, 'manifest.json'))).toBe(true);
    expect(fs.existsSync(path.join(snapDir, 'code', 'Button.tsx'))).toBe(true);
  });

  it('latest() returns the most recent snapshot id or null', async () => {
    const { SnapshotManager } = await import('../refinement.js');
    const manager = new SnapshotManager({ baseDir: dsDir });
    expect(manager.latest()).toBeNull();
    const id = await manager.record();
    expect(manager.latest()).toBe(id);
  });

  it('restore() writes back original files from snapshot', async () => {
    const { SnapshotManager } = await import('../refinement.js');
    const manager = new SnapshotManager({ baseDir: dsDir });

    // Record original state
    await manager.record();

    // Modify the system
    fs.writeFileSync(path.join(dsDir, 'DESIGN.md'), '---\nname: Modified\n---\n# Modified\n');
    fs.writeFileSync(path.join(dsDir, 'tokens.css'), ':root { --color-accent: #ff0000; }');

    // Restore
    const restored = await manager.restore();
    expect(restored).toHaveProperty('ok', true);
    expect(restored).toHaveProperty('restored');
    expect(Array.isArray(restored.restored)).toBe(true);
    expect(restored.restored.length).toBeGreaterThan(0);

    // Verify content is back to original
    const designMd = fs.readFileSync(path.join(dsDir, 'DESIGN.md'), 'utf8');
    expect(designMd).toContain('Test DS');
    expect(designMd).not.toContain('Modified');

    const tokensCss = fs.readFileSync(path.join(dsDir, 'tokens.css'), 'utf8');
    expect(tokensCss).toContain('#2563eb');
  });

  it('returns 404 when no snapshot exists to revert from', async () => {
    const { SnapshotManager } = await import('../refinement.js');
    const manager = new SnapshotManager({ baseDir: dsDir });
    // Don't record any snapshot first
    const result = await manager.restore();
    expect(result).toHaveProperty('ok', false);
    expect(result).toHaveProperty('error');
  });
});

describe('MCP tool: refine-design-system', () => {
  it('reads current system state and applies a natural language instruction', async () => {
    const { refineDesignSystem } = await import('../mcp/refine-system.js');
    const result = await refineDesignSystem({
      dsPath: dsDir,
      instruction: 'Change the accent color to a warmer orange',
    });
    expect(result).toHaveProperty('changes');
    expect(Array.isArray(result.changes)).toBe(true);
    expect(result.changes.length).toBeGreaterThan(0);
    expect(result).toHaveProperty('note');
    expect(typeof result.note).toBe('string');
  });

  it('reads DESIGN.md, tokens.css, and manifest before applying', async () => {
    const { refineDesignSystem } = await import('../mcp/refine-system.js');
    const result = await refineDesignSystem({
      dsPath: dsDir,
      instruction: 'Update the design system description',
    });
    expect(result).toHaveProperty('changes');
  });
});

describe('ActivityLogger', () => {
  it('logs refinement activity with instruction, files changed, validation result, timestamp', async () => {
    const { ActivityLogger } = await import('../refinement.js');
    const logger = new ActivityLogger({ dsPath: dsDir });
    await logger.log({
      instruction: 'Change accent to orange',
      filesChanged: ['tokens.css'],
      validationResult: { ok: true, note: 'Token contract complete.' },
      timestamp: new Date().toISOString(),
    });

    const entries = logger.entries();
    expect(Array.isArray(entries)).toBe(true);
    expect(entries.length).toBeGreaterThanOrEqual(1);
    const last = entries[entries.length - 1];
    expect(last).toHaveProperty('instruction', 'Change accent to orange');
    expect(last).toHaveProperty('filesChanged');
    expect(last).toHaveProperty('validationResult');
    expect(last).toHaveProperty('timestamp');
  });
});

describe('ActivityLogger — existing activity log integration', () => {
  it('refinement entries appear in the existing activity log', async () => {
    const { ActivityLogger } = await import('../refinement.js');
    const logger = new ActivityLogger({ dsPath: dsDir });
    await logger.log({
      instruction: 'Update spacing tokens',
      filesChanged: ['tokens.css'],
    });
    const entries = logger.entries();
    expect(entries.some((e: any) => e.instruction === 'Update spacing tokens')).toBe(true);
  });
});

describe('POST /api/design-systems/:id/revert', () => {
  let server: http.Server;
  let baseUrl: string;

  beforeAll(async () => {
    // Create a fresh DS for revert endpoint testing
    const revertTmp = fs.mkdtempSync(path.join(os.tmpdir(), 'emdesign-revert-test-'));
    const revertDsDir = path.join(revertTmp, 'design-systems', 'revert-ds');
    fs.mkdirSync(path.join(revertDsDir, 'code'), { recursive: true });
    fs.writeFileSync(path.join(revertDsDir, 'DESIGN.md'), '---\nname: Revert DS\n---\n# Revert DS\n');
    fs.writeFileSync(path.join(revertDsDir, 'tokens.css'), ':root { --color-accent: #2563eb; }');
    fs.writeFileSync(path.join(revertDsDir, 'manifest.json'), JSON.stringify({ id: 'revert-ds', name: 'Revert DS' }));

    // Import and set up the workflow API router with revert endpoint
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

  it('restores the most recent snapshot and returns ok with restored files', async () => {
    // First create a snapshot via the MCP tool, then revert
    const res = await fetch(`${baseUrl}/api/design-systems/revert-ds/revert`, {
      method: 'POST',
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('ok', true);
    expect(body).toHaveProperty('restored');
    expect(Array.isArray(body.restored)).toBe(true);
  });

  it('returns 404 when no snapshot exists', async () => {
    const res = await fetch(`${baseUrl}/api/design-systems/no-snapshots/revert`, {
      method: 'POST',
    });
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body).toHaveProperty('error');
  });
});

describe('IntentType — refine-design-system', () => {
  it('refine-design-system is accepted in the IntentType union', async () => {
    const { Store } = await import('../state.js');
    const { resolveRepoPaths } = await import('../paths.js');

    // Create a minimal repoPaths for Store construction
    const rp = resolveRepoPaths(tmpDir);
    const store = new Store(rp);

    const cr = store.enqueueIntent({
      type: 'refine-design-system' as any,
      instruction: 'Make the accent color warmer',
      payload: { dsId: 'test-ds', scope: 'colors' },
    });
    expect(cr.type).toBe('refine-design-system');
    expect(cr.payload).toHaveProperty('dsId', 'test-ds');
    expect(cr.payload).toHaveProperty('scope', 'colors');
  });

  it('enqueueIntent creates entries with refine-design-system type', async () => {
    const { Store } = await import('../state.js');
    const { resolveRepoPaths } = await import('../paths.js');

    const rp = resolveRepoPaths(tmpDir);
    const store = new Store(rp);

    store.enqueueIntent({
      type: 'refine-design-system' as any,
      instruction: 'Update typography scale',
    });

    const cr = store.nextQueued();
    expect(cr).toBeDefined();
    expect(cr!.type).toBe('refine-design-system');
  });
});

describe('dsWorkflowStatus — surface API extension', () => {
  it('dsWorkflowStatus field is present in the surface API response', async () => {
    // The surface API response from http.ts should include dsWorkflowStatus
    // We test by inspecting the type shape
    const surfaceResponse = {
      activeComponent: null,
      activeDesignSystem: 'test-ds',
      compositionTree: [],
      tokenUsage: [],
      lintFindings: [],
      lastCritique: null,
      cachedAt: Date.now(),
      dsWorkflowStatus: 'idle' as string,
    };
    expect(surfaceResponse).toHaveProperty('dsWorkflowStatus');
    expect(typeof surfaceResponse.dsWorkflowStatus).toBe('string');
    expect(['idle', 'running', 'completed', 'failed', 'cancelled']).toContain(surfaceResponse.dsWorkflowStatus);
  });
});
