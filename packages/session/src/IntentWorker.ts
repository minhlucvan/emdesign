/**
 * IntentWorker — background daemon that polls the intent queue and spawns
 * Claude Code sessions for each pending intent.
 *
 * event/message → queue (state.json) → consumer (this worker) → session manager
 */

import { AgentRunner, type AgentHandle } from './AgentRunner.js';
import { claudeAdapter } from '@emdesign/backend';
import type { PlatformOrchestrator } from './types.js';

export interface IntentWorkerOptions {
  /** Function that returns the next pending intent (or null). */
  dequeue: () => { id: string; type?: string; instruction: string } | undefined;
  /** Callback to mark an intent as in_progress. */
  markInProgress: (id: string) => void;
  /** Callback to mark an intent as done. */
  markDone: (id: string, note?: string) => void;
  /** Callback to mark an intent as errored. */
  markError: (id: string, error: string) => void;
  /** Platform orchestrator for session registration (optional). */
  orch?: PlatformOrchestrator;
  /** Workspace root (cwd for spawned agents). */
  cwd: string;
  /** Max concurrent sessions (default: 3). */
  maxConcurrent?: number;
  /** Poll interval in ms (default: 5000). */
  pollInterval?: number;
}

interface ActiveSession {
  crId: string;
  sessionId: string;
  handle: AgentHandle;
  startedAt: number;
}

interface InternalOpts {
  dequeue: () => { id: string; type?: string; instruction: string } | undefined;
  markInProgress: (id: string) => void;
  markDone: (id: string, note?: string) => void;
  markError: (id: string, error: string) => void;
  orch?: PlatformOrchestrator;
  cwd: string;
  maxConcurrent: number;
  pollInterval: number;
}

/**
 * IntentWorker polls the queue and spawns Claude Code sessions for
 * pending intents. It manages concurrency limits, lifecycle, and
 * reports status back to the queue.
 */
export class IntentWorker {
  private opts: InternalOpts;
  private active = new Map<string, ActiveSession>();
  private timer: ReturnType<typeof setInterval> | null = null;
  private running = false;

  constructor(opts: IntentWorkerOptions) {
    this.opts = {
      maxConcurrent: 3,
      pollInterval: 5000,
      ...opts,
    };
  }

  /** Start polling the queue. */
  start(): void {
    if (this.running) return;
    this.running = true;
    this.drain();
    this.timer = setInterval(() => this.drain(), this.opts.pollInterval);
  }

  /** Stop polling and cancel any pending timer. */
  stop(): void {
    this.running = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /** Number of currently active (running) sessions. */
  get activeCount(): number { return this.active.size; }

  /** Check if the worker is running. */
  get isRunning(): boolean { return this.running; }

  /** Force a drain cycle (for immediate processing). */
  drain(): void {
    if (!this.running) return;

    while (this.active.size < this.opts.maxConcurrent) {
      const cr = this.opts.dequeue();
      if (!cr) break;

      this.opts.markInProgress(cr.id);
      this.spawn(cr).catch((e) => {
        console.error(`[IntentWorker] ${cr.id} failed:`, e.message);
        this.opts.markError(cr.id, e.message);
      }).finally(() => {
        this.active.delete(cr.id);
      });
    }
  }

  private async spawn(cr: { id: string; type?: string; instruction: string }): Promise<void> {
    const { randomUUID } = await import('node:crypto');
    const sessionId = randomUUID();

    // Map intent type to workflow instruction
    const brandMatch = cr.instruction.match(/"([^"]+)"/);
    const brand = brandMatch?.[1] || '';

    const typeToWorkflow: Record<string, string> = {
      'create-design-system': `workflow('ds-import', { source: "awesome/${brand}", name: "${brand}" })`,
    };
    const prompt = typeToWorkflow[cr.type ?? ''] || cr.instruction;

    const runner = new AgentRunner();
    const handle = await runner.spawn({
      def: claudeAdapter,
      cwd: this.opts.cwd,
      prompt,
      newSessionId: sessionId,
      allowedDirs: [this.opts.cwd],
    });

    const entry: ActiveSession = { crId: cr.id, sessionId, handle, startedAt: Date.now() };
    this.active.set(cr.id, entry);

    // Register with PlatformManager if available
    if (this.opts.orch) {
      try {
        await this.opts.orch.createSession({
          type: cr.type as any ?? 'change-request',
          workflow: 'ds-import',
          args: { intentId: cr.id, brand },
          instruction: cr.instruction,
          origin: 'chat',
        });
      } catch { /* registration optional */ }
    }

    // Also register in ~/.claude/history.jsonl so sidebar claudeSessions picks it up
    try {
      const os = await import('node:os');
      const fs = await import('node:fs');
      const path = await import('node:path');
      const historyEntry = {
        sessionId,
        display: `Intent: ${cr.instruction.slice(0, 80)}`,
        timestamp: Date.now(),
        project: this.opts.cwd,
      };
      const historyPath = path.join(os.homedir(), '.claude', 'history.jsonl');
      fs.appendFileSync(historyPath, JSON.stringify(historyEntry) + '\n');
    } catch { /* history registration optional */ }

    // Wait for the agent to finish
    await handle.waitForExit();
    this.opts.markDone(cr.id, `Session: ${sessionId}`);
  }
}
