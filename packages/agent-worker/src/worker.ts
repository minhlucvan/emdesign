import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';

export interface QueueItem {
  id: string;
  type?: string;
  instruction: string;
}

export interface WorkerSession {
  crId: string;
  sessionId: string;
  pid: number;
  startedAt: number;
}

export interface AgentWorkerOptions {
  /** Dequeue the next pending intent (or null if empty). */
  dequeue: () => QueueItem | undefined;
  /** Mark intent as in_progress. */
  markInProgress: (id: string) => void;
  /** Mark intent as done. */
  markDone: (id: string, note?: string) => void;
  /** Mark intent as errored. */
  markError: (id: string, error: string) => void;
  /** Register a session (so it appears in the sidebar). */
  registerSession?: (sessionId: string, cr: QueueItem) => void;
  /** Workspace root. */
  cwd: string;
  /** Max concurrent sessions (default 3). */
  maxConcurrent?: number;
  /** Poll interval in ms (default 5000). */
  pollInterval?: number;
}

/**
 * AgentWorker — spawns Claude Code sessions for pending queue items.
 * Pure worker: polls a queue, spawns Claude, reports results.
 */
export class AgentWorker {
  private opts: Required<AgentWorkerOptions>;
  private active = new Map<string, WorkerSession>();
  private timer: ReturnType<typeof setInterval> | null = null;
  private running = false;

  constructor(opts: AgentWorkerOptions) {
    this.opts = {
      maxConcurrent: 3,
      pollInterval: 5000,
      registerSession: () => {},
      ...opts,
    };
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.drain();
    this.timer = setInterval(() => this.drain(), this.opts.pollInterval);
  }

  stop(): void {
    this.running = false;
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
  }

  get activeCount(): number { return this.active.size; }
  get isRunning(): boolean { return this.running; }
  get activeSessions(): WorkerSession[] { return [...this.active.values()]; }

  drain(): void {
    while (this.active.size < this.opts.maxConcurrent) {
      const item = this.opts.dequeue();
      if (!item) break;
      this.opts.markInProgress(item.id);
      this.spawn(item).catch((e) => {
        console.error(`[AgentWorker] ${item.id}:`, e.message);
        this.opts.markError(item.id, e.message);
      }).finally(() => this.active.delete(item.id));
    }
  }

  private async spawn(item: QueueItem): Promise<void> {
    const sessionId = randomUUID();
    const brandMatch = item.instruction.match(/"([^"]+)"/);
    const brand = brandMatch?.[1] || '';

    const prompt = item.type === 'create-design-system'
      ? `workflow('ds-import', { source: "awesome/${brand}", name: "${brand}" })`
      : item.instruction;

    this.opts.registerSession(sessionId, item);

    // Spawn Claude Code with pipe mode + stream-json
    const binPath = await this.resolveBinary();
    if (!binPath) throw new Error('claude binary not found');

    const child = spawn(binPath, [
      '-p', '--input-format', 'stream-json',
      '--output-format', 'stream-json',
      '--session-id', sessionId,
      '--permission-mode', 'bypassPermissions',
    ], {
      cwd: this.opts.cwd,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    const entry: WorkerSession = { crId: item.id, sessionId, pid: child.pid!, startedAt: Date.now() };
    this.active.set(item.id, entry);

    // Send prompt as stream-json message
    const msg = { type: 'user', message: { role: 'user', content: [{ type: 'text', text: prompt }] } };
    child.stdin!.write(JSON.stringify(msg) + '\n');
    // Don't close stdin — keep open for agent's tool use

    // Wait for exit
    await new Promise<void>((resolve) => {
      child.on('exit', (code) => {
        if (code === 0) this.opts.markDone(item.id, `Session: ${sessionId}`);
        else this.opts.markError(item.id, `Exit code ${code}`);
        resolve();
      });
      child.on('error', (err) => {
        this.opts.markError(item.id, err.message);
        resolve();
      });
    });
  }

  private async resolveBinary(): Promise<string | null> {
    const { execFile } = await import('node:child_process');
    const { promisify } = await import('node:util');
    const pexecFile = promisify(execFile);
    for (const bin of ['claude', 'openclaude']) {
      try {
        const { stdout } = await pexecFile('which', [bin]);
        const p = stdout.split('\n')[0]?.trim();
        if (p) return p;
      } catch { /* try next */ }
    }
    return null;
  }
}
