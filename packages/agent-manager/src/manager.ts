import { AgentWorker, type QueueItem } from '@emdesign/agent-worker';

export interface AgentManagerOptions {
  /** Dequeue next pending intent (Store.nextQueued or equivalent). */
  dequeue: () => QueueItem | undefined;
  /** Mark intent as in_progress. */
  markInProgress: (id: string) => void;
  /** Mark intent as done. */
  markDone: (id: string, note?: string) => void;
  /** Mark intent as errored. */
  markError: (id: string, error: string) => void;
  /** Register a session (e.g. with PlatformManager + ~/.claude/history.jsonl). */
  registerSession?: (sessionId: string, item: QueueItem) => void;
  /** Workspace root for spawned agents. */
  cwd: string;
  /** Max concurrent sessions per worker (default 3). */
  maxConcurrent?: number;
  /** Number of workers to start (default 1). */
  workerCount?: number;
}

/**
 * AgentManager — orchestrates workers, queue, and session lifecycle.
 * Single entry point: start() begins watching the intent queue.
 */
export class AgentManager {
  private opts: Required<AgentManagerOptions>;
  private workers: AgentWorker[] = [];
  private started = false;

  constructor(opts: AgentManagerOptions) {
    this.opts = {
      maxConcurrent: 3,
      workerCount: 1,
      registerSession: () => {},
      ...opts,
    };
  }

  /** Start watching the intent queue. Workers begin polling immediately. */
  start(): void {
    if (this.started) return;
    this.started = true;

    for (let i = 0; i < this.opts.workerCount; i++) {
      const worker = new AgentWorker({
        dequeue: this.opts.dequeue,
        markInProgress: this.opts.markInProgress,
        markDone: this.opts.markDone,
        markError: this.opts.markError,
        registerSession: this.opts.registerSession,
        cwd: this.opts.cwd,
        maxConcurrent: this.opts.maxConcurrent,
      });
      worker.start();
      this.workers.push(worker);
    }
  }

  /** Stop all workers. */
  stop(): void {
    for (const w of this.workers) w.stop();
    this.workers = [];
    this.started = false;
  }

  /** Add an additional worker. */
  addWorker(maxConcurrent?: number): AgentWorker {
    const w = new AgentWorker({
      dequeue: this.opts.dequeue,
      markInProgress: this.opts.markInProgress,
      markDone: this.opts.markDone,
      markError: this.opts.markError,
      registerSession: this.opts.registerSession,
      cwd: this.opts.cwd,
      maxConcurrent: maxConcurrent ?? this.opts.maxConcurrent,
    });
    w.start();
    this.workers.push(w);
    return w;
  }

  /** Total active sessions across all workers. */
  get activeSessions(): number {
    return this.workers.reduce((s, w) => s + w.activeCount, 0);
  }

  /** All active worker sessions. */
  get sessions() {
    return this.workers.flatMap(w => w.activeSessions);
  }

  /** Whether the manager is running. */
  get isStarted(): boolean { return this.started; }
}
