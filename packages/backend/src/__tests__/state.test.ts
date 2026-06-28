import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

// ---------------------------------------------------------------------------
// R26 — State Management (.emdesign/state.json)
// Scenarios: round-trip persistence, queue append/poll, empty-queue edge case
// ---------------------------------------------------------------------------

let tmpDir: string;
let repoPaths: any;

beforeEach(async () => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'emdesign-state-test-'));
  fs.mkdirSync(path.join(tmpDir, '.emdesign'), { recursive: true });
  const { resolveRepoPaths } = await import('../paths.js');
  repoPaths = resolveRepoPaths(tmpDir);
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('Store — readState/writeState round-trip', () => {
  it('creates initial empty state when no file exists', async () => {
    const { Store } = await import('../state.js');
    const store = new Store(repoPaths);
    const state = store.get();
    expect(state.changeRequests).toEqual([]);
    expect(state.currentComponent).toBeNull();
    expect(state.lastDiff).toBeNull();
    expect(state.lintPassing).toBeNull();
    expect(state.lastCritique).toBeNull();
    expect(state.comments).toEqual({});
  });

  it('persists state.json to disk at the correct path', async () => {
    const { Store } = await import('../state.js');
    const store = new Store(repoPaths);
    store.update({ currentComponent: 'Button' });
    const filePath = repoPaths.stateFile;
    expect(fs.existsSync(filePath)).toBe(true);
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    expect(raw.currentComponent).toBe('Button');
  });
});

describe('Store — queue management', () => {
  it('enqueueIntent adds a pending change request', async () => {
    const { Store } = await import('../state.js');
    const store = new Store(repoPaths);
    const cr = store.enqueueIntent({ instruction: 'Create a Button component' });
    expect(cr.status).toBe('queued');
    expect(cr.instruction).toBe('Create a Button component');
    expect(cr.id).toBeDefined();
    expect(cr.createdAt).toBeDefined();
  });

  it('enqueueChangeRequest adds a back-compat change request', async () => {
    const { Store } = await import('../state.js');
    const store = new Store(repoPaths);
    const cr = store.enqueueChangeRequest('Update the Card component');
    expect(cr.type).toBe('change-request');
    expect(cr.instruction).toBe('Update the Card component');
  });

  it('nextQueued returns the oldest pending item', async () => {
    const { Store } = await import('../state.js');
    const store = new Store(repoPaths);
    store.enqueueChangeRequest('First request');
    store.enqueueChangeRequest('Second request');
    const next = store.nextQueued();
    expect(next).toBeDefined();
    expect(next!.instruction).toBe('First request');
  });

  it('nextQueued marks the returned item (does NOT change its status — poll then mark)', async () => {
    const { Store } = await import('../state.js');
    const store = new Store(repoPaths);
    store.enqueueChangeRequest('Test request');
    const next = store.nextQueued();
    expect(next!.status).toBe('queued');
    // After polling, the agent marks it in-flight
    store.setChangeRequestStatus(next!.id, 'in_progress');
    const state = store.get();
    const cr = state.changeRequests.find((c: any) => c.id === next!.id);
    expect(cr!.status).toBe('in_progress');
  });

  it('nextQueued returns undefined for empty queue (no error)', async () => {
    const { Store } = await import('../state.js');
    const store = new Store(repoPaths);
    const next = store.nextQueued();
    expect(next).toBeUndefined();
  });

  it('setChangeRequestStatus updates status and optional note', async () => {
    const { Store } = await import('../state.js');
    const store = new Store(repoPaths);
    const cr = store.enqueueChangeRequest('Build the form');
    store.setChangeRequestStatus(cr.id, 'done', 'Completed successfully');
    const state = store.get();
    const updated = state.changeRequests.find((c: any) => c.id === cr.id);
    expect(updated!.status).toBe('done');
    expect(updated!.note).toBe('Completed successfully');
  });
});

describe('Store — active system and critiques', () => {
  it('lastCritique stores composite, decision, mustFix', async () => {
    const { Store } = await import('../state.js');
    const store = new Store(repoPaths);
    store.update({
      lastCritique: {
        scores: { visual: 1.0, tokens: 0.9 },
        composite: 0.95,
        decision: 'ship',
        mustFix: 0,
      },
    });
    const state = store.get();
    expect(state.lastCritique!.composite).toBeCloseTo(0.95);
    expect(state.lastCritique!.decision).toBe('ship');
    expect(state.lastCritique!.mustFix).toBe(0);
  });
});

describe('Store — cross-process sync', () => {
  it('reloads state when underlying file changes', async () => {
    const { Store } = await import('../state.js');
    const store = new Store(repoPaths);
    // Write initial state so the file exists
    store.update({ currentComponent: 'Test' });
    // Simulate another process modifying the file (the MCP agent)
    const filePath = repoPaths.stateFile;
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    raw.changeRequests = [{ id: 'external_1', instruction: 'External request', status: 'queued', createdAt: new Date().toISOString() }];
    // Ensure mtime will be different
    await new Promise((r) => setTimeout(r, 10));
    fs.writeFileSync(filePath, JSON.stringify(raw, null, 2));

    // The next read should pick up the external change
    const state = store.get();
    expect(state.changeRequests).toHaveLength(1);
    expect(state.changeRequests[0].instruction).toBe('External request');
  });
});

// ---------------------------------------------------------------------------
// Back-compat: poll_change_request behavior (from MCP spec)
// ---------------------------------------------------------------------------
describe('poll_change_request behavior', () => {
  it('returns pending items when queue has them', async () => {
    const { Store } = await import('../state.js');
    const store = new Store(repoPaths);
    store.enqueueChangeRequest('Change the button color');
    const next = store.nextQueued();
    expect(next).toBeDefined();
    expect(next!.status).toBe('queued');
  });

  // R26 edge case: empty queue returns empty (no error)
  it('returns undefined for empty queue — no crash, no error object', async () => {
    const { Store } = await import('../state.js');
    const store = new Store(repoPaths);
    expect(store.nextQueued()).toBeUndefined();
  });
});
