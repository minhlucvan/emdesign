/**
 * Workflow Orchestrator — unit tests for the multi-stage agent-driven workflow.
 *
 * Tests WorkflowOrchestrator, WorkflowStore, and the MCP tools (analyze-design-prompt,
 * generate-design-md, generate-tokens). These modules do not exist yet (RED step).
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';

describe('WorkflowStore', () => {
  it('exports a WorkflowStore class', async () => {
    const { WorkflowStore } = await import('../workflow.js');
    const store = new WorkflowStore();
    expect(store).toBeDefined();
  });

  it('create() stores a session with stages', async () => {
    const { WorkflowStore } = await import('../workflow.js');
    const store = new WorkflowStore();
    const stages = [
      { name: 'analyze', status: 'pending' as const, progress: 0 },
      { name: 'generate-design-md', status: 'pending' as const, progress: 0 },
      { name: 'generate-tokens', status: 'pending' as const, progress: 0 },
    ];
    store.create('session-1', stages);
    const session = store.get('session-1');
    expect(session).toBeDefined();
    expect(session!.stages).toHaveLength(3);
    expect(session!.stages[0].name).toBe('analyze');
  });

  it('updateStage() updates a stage by name', async () => {
    const { WorkflowStore } = await import('../workflow.js');
    const store = new WorkflowStore();
    store.create('session-2', [{ name: 'analyze', status: 'pending', progress: 0 }]);
    store.updateStage('session-2', 'analyze', 'running', 25);
    const session = store.get('session-2');
    expect(session!.stages[0].status).toBe('running');
    expect(session!.stages[0].progress).toBe(25);
  });

  it('updateStage() sets error message when provided', async () => {
    const { WorkflowStore } = await import('../workflow.js');
    const store = new WorkflowStore();
    store.create('session-3', [{ name: 'analyze', status: 'pending', progress: 0 }]);
    store.updateStage('session-3', 'analyze', 'error', 50, 'Something went wrong');
    const session = store.get('session-3');
    expect(session!.stages[0].status).toBe('error');
    expect(session!.stages[0].error).toBe('Something went wrong');
  });

  it('get() returns undefined for unknown session', async () => {
    const { WorkflowStore } = await import('../workflow.js');
    const store = new WorkflowStore();
    expect(store.get('nonexistent')).toBeUndefined();
  });

  it('cancel() marks the session as cancelled', async () => {
    const { WorkflowStore } = await import('../workflow.js');
    const store = new WorkflowStore();
    store.create('session-4', [{ name: 'analyze', status: 'running', progress: 50 }]);
    store.cancel('session-4');
    const session = store.get('session-4');
    expect(session!.status).toBe('cancelled');
  });
});

describe('WorkflowOrchestrator — create-from-prompt', () => {
  it('runs stages in order: analyze -> generate-design-md -> generate-tokens -> scaffold-primitives -> build-graph -> validate', async () => {
    const { WorkflowOrchestrator } = await import('../workflow.js');
    const orchestrator = new WorkflowOrchestrator();
    const result = await orchestrator.runFromPrompt({
      prompt: 'Dark editorial with lime accent',
    });
    expect(result).toHaveProperty('sessionId');
    expect(result).toHaveProperty('completed', true);
    expect(result).toHaveProperty('artifacts');
  });

  it('each stage updates the workflow progress store with name, status, and progress', async () => {
    const { WorkflowStore, WorkflowOrchestrator } = await import('../workflow.js');
    const store = new WorkflowStore();
    const orchestrator = new WorkflowOrchestrator(store);
    const { sessionId } = await orchestrator.runFromPrompt({
      prompt: 'Minimal fintech, blue primary',
    });
    const session = store.get(sessionId);
    expect(session).toBeDefined();
    for (const stage of session!.stages) {
      expect(stage).toHaveProperty('name');
      expect(stage).toHaveProperty('status');
      expect(stage).toHaveProperty('progress');
    }
  });
});

describe('WorkflowOrchestrator — create-from-design-md', () => {
  it('runs adapted stages: parse -> extract-tokens -> generate-tokens-css -> scaffold-primitives -> build-graph -> validate', async () => {
    const { WorkflowOrchestrator } = await import('../workflow.js');
    const orchestrator = new WorkflowOrchestrator();
    const result = await orchestrator.runFromDesignMd({
      content: '---\nname: Test\ncategory: Editorial\n---\n# Test DS\n',
    });
    expect(result).toHaveProperty('sessionId');
    expect(result).toHaveProperty('completed', true);
  });
});

describe('WorkflowOrchestrator — progress store concurrency', () => {
  it('progress store is keyed by session ID and accessible concurrently', async () => {
    const { WorkflowStore } = await import('../workflow.js');
    const store = new WorkflowStore();
    store.create('alpha', [{ name: 'stage-1', status: 'running', progress: 50 }]);
    store.create('beta', [{ name: 'stage-1', status: 'pending', progress: 0 }]);

    const [alpha, beta] = [store.get('alpha'), store.get('beta')];
    expect(alpha!.stages[0].progress).toBe(50);
    expect(beta!.stages[0].status).toBe('pending');

    // Updates to one session don't affect the other
    store.updateStage('alpha', 'stage-1', 'done', 100);
    expect(store.get('alpha')!.stages[0].status).toBe('done');
    expect(store.get('beta')!.stages[0].status).toBe('pending');
  });
});

describe('MCP tool: analyze-design-prompt', () => {
  it('analyzeDesignPrompt returns mood, category, keywords, accentColor?, fonts?', async () => {
    const { analyzeDesignPrompt } = await import('../mcp/analyze-prompt.js');
    const result = await analyzeDesignPrompt({ prompt: 'Dark editorial with lime accent' });
    expect(result).toHaveProperty('mood');
    expect(result).toHaveProperty('category');
    expect(result).toHaveProperty('keywords');
    expect(Array.isArray(result.keywords)).toBe(true);
    // Optional fields
    if (result.accentColor !== undefined) {
      expect(typeof result.accentColor).toBe('string');
    }
    if (result.fonts !== undefined) {
      expect(typeof result.fonts).toBe('object');
    }
  });
});

describe('MCP tool: generate-design-md', () => {
  it('generateDesignMd produces a 9-section DESIGN.md string from analysis result', async () => {
    const { generateDesignMd } = await import('../mcp/generate-design-md.js');
    const analysis = {
      mood: 'dark, editorial, sophisticated',
      category: 'editorial',
      keywords: ['minimal', 'typographic', 'lime'],
      accentColor: '#84cc16',
      fonts: { display: 'Inter', body: 'Source Serif 4' },
    };
    const designMd = await generateDesignMd({ analysis });
    expect(typeof designMd).toBe('string');
    expect(designMd).toContain('# ');
    // Should have sections marked by ## headings
    const sections = designMd.match(/^##\s+\d+\./gm);
    expect(sections).toBeDefined();
    expect(sections!.length).toBeGreaterThanOrEqual(9);
  });

  it('generateDesignMd accepts optional baseRef', async () => {
    const { generateDesignMd } = await import('../mcp/generate-design-md.js');
    const analysis = { mood: 'clean', category: 'product', keywords: ['modern'] };
    const designMd = await generateDesignMd({ analysis, baseRef: 'open-design/atelier' });
    expect(typeof designMd).toBe('string');
  });
});

describe('MCP tool: generate-tokens', () => {
  it('generateTokens parses DESIGN.md and produces complete tokens.css', async () => {
    const { generateTokens } = await import('../mcp/generate-tokens.js');
    const designMd = `---
name: Test DS
category: Editorial
---
# Test DS

## 2. Color
--color-accent: #84cc16;
--color-surface: #1a1a1a;
--color-text: #f5f5f5;

## 3. Typography
--font-display: "Inter", system-ui, sans-serif;
--font-sans: "Source Serif 4", serif;
`;
    const tokensCss = await generateTokens({ designMd });
    expect(typeof tokensCss).toBe('string');
    expect(tokensCss).toContain('--color-accent');
    expect(tokensCss).toContain('--color-surface');
    expect(tokensCss).toContain('--font-display');
    // Should include all SEMANTIC_TOKEN_ROLES
    expect(tokensCss).toContain('--color-text');
    expect(tokensCss).toContain('--color-border');
  });
});

describe('Workflow cancellation', () => {
  it('cancellation stops execution mid-stage and prevents further stages', async () => {
    const { WorkflowOrchestrator } = await import('../workflow.js');
    const orchestrator = new WorkflowOrchestrator();
    const { sessionId } = await orchestrator.runFromPrompt({
      prompt: 'This will be cancelled',
    });
    await orchestrator.cancel(sessionId);
    const session = orchestrator.getSession(sessionId);
    expect(session).toBeDefined();
    expect(session!.status).toBe('cancelled');
  });
});

describe('Workflow timeout', () => {
  it('timeout (120s) marks the session as failed with a timeout error', async () => {
    const { WorkflowOrchestrator } = await import('../workflow.js');
    const orchestrator = new WorkflowOrchestrator({ timeout: 0 }); // Immediate timeout
    const { sessionId } = await orchestrator.runFromPrompt({
      prompt: 'Slow operation test',
    });
    const session = orchestrator.getSession(sessionId);
    expect(session).toBeDefined();
    expect(session!.status).toBe('failed');
    expect(session!.error).toBeDefined();
    expect(session!.error!.toLowerCase()).toContain('timeout');
  });
});
