/**
 * Integration tests for create-from-prompt workflow.
 *
 * VALUE: Validates the full agent-driven design system creation pipeline
 * from a natural language prompt, end-to-end against the live backend.
 *
 * Requires the backend on :4321.
 */
import { describe, it, expect } from 'vitest';
import { apiGet, apiPost } from './helpers/http.js';

// ---------------------------------------------------------------------------
// Types matching the delta-spec API contracts
// ---------------------------------------------------------------------------

interface WorkflowStage {
  name: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  progress: number;
}

interface WorkflowStatus {
  sessionId: string;
  stages: WorkflowStage[];
  status: 'running' | 'completed' | 'error';
}

interface DesignSystemSummary {
  id: string;
  name?: string;
  designMd?: string;
  tokensCss?: string;
}

/** POST /api/design-systems/from-prompt response */
interface FromPromptResponse {
  sessionId: string;
}

interface DesignSystemFull {
  id: string;
  name: string;
  description?: string;
  category?: string;
  designMd: string;
  tokensCss: string;
  components: Array<{ name: string; status: string }>;
  validation: { ok: boolean; errors?: string[] };
}

interface DesignSystemsList {
  active: string;
  systems: Array<{ id: string; name?: string }>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const BASE = `http://localhost:${process.env.EMDESIGN_PORT ?? '4321'}`;

/**
 * Poll GET /api/design-systems/:id/workflow-status until completed/error,
 * or throw on timeout (60s).
 */
async function pollWorkflow(id: string, timeout = 60_000): Promise<WorkflowStatus> {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const status = await apiGet<WorkflowStatus>(`/api/design-systems/${id}/workflow-status`);
    if (status.status === 'completed' || status.status === 'error') return status;
    await new Promise(r => setTimeout(r, 1000));
  }
  throw new Error(`Workflow ${id} did not complete within ${timeout}ms`);
}

/** Expected stage sequence for the from-prompt workflow. */
const EXPECTED_STAGES = [
  'analyze',
  'generate DESIGN.md',
  'generate tokens',
  'scaffold primitives',
  'build graph',
  'validate',
];

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('POST /api/design-systems/from-prompt', () => {
  it('returns a sessionId for a valid prompt', async () => {
    const body = await apiPost<FromPromptResponse>('/api/design-systems/from-prompt', {
      prompt: 'Dark editorial with a lime accent color, serif headlines, and generous spacing',
    });
    expect(body).toHaveProperty('sessionId');
    expect(typeof body.sessionId).toBe('string');
    expect(body.sessionId.length).toBeGreaterThan(0);
  });

  it('completes all workflow stages (analyze -> validate)', async () => {
    const { sessionId } = await apiPost<FromPromptResponse>('/api/design-systems/from-prompt', {
      prompt: 'Minimal fintech, blue primary, clean sans-serif, sharp corners',
    });

    const status = await pollWorkflow(sessionId);
    expect(status.status).toBe('completed');

    // Every expected stage is present and completed
    for (const stageName of EXPECTED_STAGES) {
      const found = status.stages.find(s => s.name === stageName);
      expect(found, `Stage "${stageName}" should be present`).toBeDefined();
      expect(found!.status).toBe('completed');
    }
  });

  it('includes the newly created system in GET /api/design-systems', async () => {
    const { sessionId } = await apiPost<FromPromptResponse>('/api/design-systems/from-prompt', {
      prompt: 'Warm editorial with amber accents',
    });
    await pollWorkflow(sessionId);

    const list = await apiGet<DesignSystemsList>('/api/design-systems');
    const ids = list.systems.map(s => s.id);
    expect(ids).toContain(sessionId);
  });

  it('returns a full design-system object from GET /api/design-system/:id/full', async () => {
    const { sessionId } = await apiPost<FromPromptResponse>('/api/design-systems/from-prompt', {
      prompt: 'Clean minimalist design system',
    });
    await pollWorkflow(sessionId);

    const full = await apiGet<DesignSystemFull>(`/api/design-system/${sessionId}/full`);
    expect(full).toHaveProperty('id', sessionId);
    expect(full).toHaveProperty('name');
    expect(typeof full.name).toBe('string');
    expect(full).toHaveProperty('designMd');
    expect(typeof full.designMd).toBe('string');
    expect(full.designMd.length).toBeGreaterThan(0);
    expect(full).toHaveProperty('tokensCss');
    expect(typeof full.tokensCss).toBe('string');
    expect(full.tokensCss.length).toBeGreaterThan(0);
    expect(full).toHaveProperty('components');
    expect(Array.isArray(full.components)).toBe(true);
    expect(full).toHaveProperty('validation');
    expect(full.validation.ok).toBe(true);
  });

  it('returns 400 when submitting an empty prompt', async () => {
    const res = await fetch(`${BASE}/api/design-systems/from-prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: '' }),
    });
    expect(res.status).toBe(400);
  });
});
