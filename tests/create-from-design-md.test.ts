/**
 * Integration tests for create-from-DESIGN.md workflow.
 *
 * VALUE: Validates the agent-driven pipeline that ingests a DESIGN.md file,
 * extracts tokens, scaffolds primitives, builds the graph, and validates
 * the result end-to-end against the live backend.
 *
 * Requires the backend on :4321.
 */
import { describe, it, expect } from 'vitest';
import { apiGet, apiPost } from './helpers/http.js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// ---------------------------------------------------------------------------
// Types
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

interface FromDesignMdResponse {
  sessionId: string;
}

interface DesignSystemFull {
  id: string;
  name: string;
  category?: string;
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

/** Load the atelier-minimal fixture DESIGN.md. */
function loadFixtureDesignMd(): string {
  return readFileSync(
    resolve(import.meta.dirname, 'fixtures/design-systems/atelier-minimal/DESIGN.md'),
    'utf-8',
  );
}

async function pollWorkflow(id: string, timeout = 60_000): Promise<WorkflowStatus> {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const status = await apiGet<WorkflowStatus>(`/api/design-systems/${id}/workflow-status`);
    if (status.status === 'completed' || status.status === 'error') return status;
    await new Promise(r => setTimeout(r, 1000));
  }
  throw new Error(`Workflow ${id} did not complete within ${timeout}ms`);
}

/** Expected stage sequence for the from-DESIGN.md workflow. */
const EXPECTED_STAGES = [
  'parse',
  'extract tokens',
  'generate tokens.css',
  'scaffold primitives',
  'build graph',
  'validate',
];

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('POST /api/design-systems/from-design-md', () => {
  it('returns a sessionId for valid DESIGN.md content', async () => {
    const designMd = loadFixtureDesignMd();
    const body = await apiPost<FromDesignMdResponse>('/api/design-systems/from-design-md', {
      content: designMd,
    });
    expect(body).toHaveProperty('sessionId');
    expect(typeof body.sessionId).toBe('string');
    expect(body.sessionId.length).toBeGreaterThan(0);
  });

  it('completes all adapted stages (parse -> validate)', async () => {
    const designMd = loadFixtureDesignMd();
    const { sessionId } = await apiPost<FromDesignMdResponse>('/api/design-systems/from-design-md', {
      content: designMd,
    });

    const status = await pollWorkflow(sessionId);
    expect(status.status).toBe('completed');

    for (const stageName of EXPECTED_STAGES) {
      const found = status.stages.find(s => s.name === stageName);
      expect(found, `Stage "${stageName}" should be present`).toBeDefined();
      expect(found!.status).toBe('completed');
    }
  });

  it('produces a design system matching the DESIGN.md source', async () => {
    const designMd = loadFixtureDesignMd();
    const { sessionId } = await apiPost<FromDesignMdResponse>('/api/design-systems/from-design-md', {
      content: designMd,
    });
    await pollWorkflow(sessionId);

    const full = await apiGet<DesignSystemFull>(`/api/design-system/${sessionId}/full`);
    // The fixture is named "Atelier Minimal" — the created system should reflect that
    expect(full.name).toBe('Atelier Minimal');
    // tokens.css should contain colors from the DESIGN.md (e.g. --color-accent: #4F46E5)
    expect(full.tokensCss).toContain('#4F46E5');
    expect(full.tokensCss).toContain('--color-accent');
    // Validation should pass
    expect(full.validation.ok).toBe(true);
  });

  it('includes the new system in GET /api/design-systems', async () => {
    const designMd = loadFixtureDesignMd();
    const { sessionId } = await apiPost<FromDesignMdResponse>('/api/design-systems/from-design-md', {
      content: designMd,
    });
    await pollWorkflow(sessionId);

    const list = await apiGet<DesignSystemsList>('/api/design-systems');
    const ids = list.systems.map(s => s.id);
    expect(ids).toContain(sessionId);
  });

  it('returns 400 for invalid content (no YAML frontmatter)', async () => {
    const res = await fetch(`${BASE}/api/design-systems/from-design-md`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'This is just random text without any frontmatter.' }),
    });
    expect(res.status).toBe(400);
  });
});
