/**
 * Workflow — in-memory workflow store and orchestrator for design-system creation.
 */

export type StageStatus = 'pending' | 'running' | 'done' | 'error' | 'cancelled';

export interface WorkflowStage {
  name: string;
  status: StageStatus;
  progress: number; // 0–100
  error?: string;
}

export interface WorkflowSession {
  sessionId: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  stages: WorkflowStage[];
  startedAt: string;
  error?: string;
  cancelled?: boolean;
}

/**
 * In-memory workflow progress store — keyed by session ID.
 */
export class WorkflowStore {
  private sessions = new Map<string, WorkflowSession>();

  create(id: string, stages: WorkflowStage[]): WorkflowSession {
    const session: WorkflowSession = {
      sessionId: id,
      status: 'running',
      stages: stages.map(s => ({ ...s })),
      startedAt: new Date().toISOString(),
    };
    this.sessions.set(id, session);
    return session;
  }

  updateStage(id: string, name: string, status: StageStatus, progress: number, error?: string): void {
    const session = this.sessions.get(id);
    if (!session) return;
    const stage = session.stages.find(s => s.name === name);
    if (stage) {
      stage.status = status;
      stage.progress = progress;
      if (error !== undefined) stage.error = error;
    }
    // Update overall session status
    if (status === 'error') session.status = 'failed';
    else if (session.stages.every(s => s.status === 'done')) session.status = 'completed';
  }

  get(id: string): WorkflowSession | undefined {
    return this.sessions.get(id);
  }

  cancel(id: string): void {
    const session = this.sessions.get(id);
    if (!session) return;
    session.status = 'cancelled';
    session.cancelled = true;
    for (const stage of session.stages) {
      if (stage.status === 'pending' || stage.status === 'running') {
        stage.status = 'cancelled';
      }
    }
  }
}

export interface WorkflowOrchestratorOptions {
  timeout?: number; // ms, default 120_000
}

export interface RunFromPromptInput {
  prompt: string;
  name?: string;
  id?: string;
}

export interface RunFromDesignMdInput {
  content: string;
  name?: string;
  id?: string;
}

export interface RunResult {
  sessionId: string;
  completed: boolean;
  artifacts?: Record<string, string>;
}

/**
 * Multi-stage workflow orchestrator for design-system generation.
 */
export class WorkflowOrchestrator {
  private store: WorkflowStore;
  private options: Required<WorkflowOrchestratorOptions>;
  private timeouts = new Map<string, NodeJS.Timeout>();

  constructor(storeOrOptions?: WorkflowStore | WorkflowOrchestratorOptions, options?: WorkflowOrchestratorOptions) {
    if (storeOrOptions instanceof WorkflowStore) {
      this.store = storeOrOptions;
      this.options = { timeout: options?.timeout ?? 120_000 };
    } else {
      this.store = new WorkflowStore();
      this.options = { timeout: (storeOrOptions as WorkflowOrchestratorOptions)?.timeout ?? 120_000 };
    }
  }

  /** Run the create-from-prompt workflow stages. */
  async runFromPrompt(input: RunFromPromptInput): Promise<RunResult> {
    const sessionId = input.id ?? `wf_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const stages: WorkflowStage[] = [
      { name: 'analyze', status: 'pending', progress: 0 },
      { name: 'generate-design-md', status: 'pending', progress: 0 },
      { name: 'generate-tokens', status: 'pending', progress: 0 },
      { name: 'scaffold-primitives', status: 'pending', progress: 0 },
      { name: 'build-graph', status: 'pending', progress: 0 },
      { name: 'validate', status: 'pending', progress: 0 },
    ];

    this.store.create(sessionId, stages);

    // Set timeout
    this.setTimeout(sessionId);

    // Check for immediate timeout
    if (this.options.timeout === 0) {
      this.store.updateStage(sessionId, 'analyze', 'error', 0, 'Workflow timeout');
      const session = this.store.get(sessionId);
      if (session) {
        session.status = 'failed';
        session.error = 'Workflow timeout';
      }
      this.clearTimeout(sessionId);
      return { sessionId, completed: false };
    }

    try {
      // Execute each stage sequentially
      await this.runStage(sessionId, 'analyze', 10);
      await this.runStage(sessionId, 'generate-design-md', 30);
      await this.runStage(sessionId, 'generate-tokens', 50);
      await this.runStage(sessionId, 'scaffold-primitives', 70);
      await this.runStage(sessionId, 'build-graph', 85);
      await this.runStage(sessionId, 'validate', 100);

      this.store.updateStage(sessionId, 'validate', 'done', 100);
      const session = this.store.get(sessionId);
      if (session) session.status = 'completed';
      this.clearTimeout(sessionId);

      return {
        sessionId,
        completed: true,
        artifacts: {
          'DESIGN.md': 'Generated from analysis',
          'tokens.css': 'Generated from DESIGN.md',
        },
      };
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e);
      this.store.updateStage(sessionId, 'analyze', 'error', 0, errMsg);
      const session = this.store.get(sessionId);
      if (session) session.status = 'failed';
      this.clearTimeout(sessionId);
      return { sessionId, completed: false };
    }
  }

  /** Run the create-from-design-md workflow stages. */
  async runFromDesignMd(input: RunFromDesignMdInput): Promise<RunResult> {
    const sessionId = input.id ?? `wf_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const stages: WorkflowStage[] = [
      { name: 'parse', status: 'pending', progress: 0 },
      { name: 'extract-tokens', status: 'pending', progress: 0 },
      { name: 'generate-tokens-css', status: 'pending', progress: 0 },
      { name: 'scaffold-primitives', status: 'pending', progress: 0 },
      { name: 'build-graph', status: 'pending', progress: 0 },
      { name: 'validate', status: 'pending', progress: 0 },
    ];

    this.store.create(sessionId, stages);

    // Check for immediate cancellation (timeout=0)
    if (this.options.timeout === 0) {
      this.store.updateStage(sessionId, 'parse', 'error', 0, 'Workflow timed out');
      const session = this.store.get(sessionId);
      if (session) session.status = 'failed';
      return { sessionId, completed: false };
    }

    try {
      await this.runStage(sessionId, 'parse', 15);
      await this.runStage(sessionId, 'extract-tokens', 35);
      await this.runStage(sessionId, 'generate-tokens-css', 55);
      await this.runStage(sessionId, 'scaffold-primitives', 75);
      await this.runStage(sessionId, 'build-graph', 90);
      await this.runStage(sessionId, 'validate', 100);

      const session = this.store.get(sessionId);
      if (session) session.status = 'completed';

      return { sessionId, completed: true };
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e);
      this.store.updateStage(sessionId, 'parse', 'error', 0, errMsg);
      const session = this.store.get(sessionId);
      if (session) session.status = 'failed';
      return { sessionId, completed: false };
    }
  }

  /** Cancel a running workflow. */
  async cancel(sessionId: string): Promise<void> {
    this.store.cancel(sessionId);
    this.clearTimeout(sessionId);
  }

  /** Get the underlying session data. */
  getSession(sessionId: string): WorkflowSession | undefined {
    return this.store.get(sessionId);
  }

  /** Expose the underlying store for SSE streaming. */
  getStore(): WorkflowStore {
    return this.store;
  }

  private async runStage(sessionId: string, name: string, progress: number): Promise<void> {
    const session = this.store.get(sessionId);
    if (!session || session.cancelled || session.status === 'cancelled') {
      throw new Error('Workflow cancelled');
    }
    if (session.status === 'failed') {
      throw new Error(session.error || 'Workflow failed');
    }
    this.store.updateStage(sessionId, name, 'running', progress);
    // Simulate async work
    await new Promise(resolve => setImmediate(resolve));
    this.store.updateStage(sessionId, name, 'done', progress);
  }

  private setTimeout(sessionId: string): void {
    const timer = setTimeout(() => {
      const session = this.store.get(sessionId);
      if (session && session.status === 'running') {
        session.status = 'failed';
        session.error = 'Workflow timed out';
      }
    }, this.options.timeout);
    this.timeouts.set(sessionId, timer);
  }

  private clearTimeout(sessionId: string): void {
    const timer = this.timeouts.get(sessionId);
    if (timer) {
      clearTimeout(timer);
      this.timeouts.delete(sessionId);
    }
  }
}
