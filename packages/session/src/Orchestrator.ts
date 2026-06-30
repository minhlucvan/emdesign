/**
 * PlatformManager — the unifying facade that composes all subsystems.
 * Implements PlatformOrchestrator interface consumed by the HTTP bridge,
 * CLI, MCP server, and Storybook addon.
 */
import { Store, type RepoPaths } from '@emdesign/backend';
import { PlatformEventBus } from './hooks.js';
import { SessionStore } from './SessionStore.js';
import { SessionManager } from './SessionManager.js';
import { ProcessManager } from './ProcessManager.js';
import {
  getSessions,
  getConversation,
  getProjects,
  type EmSession,
  type ClaudeSession,
  type ConversationMessage,
} from './storage.js';
import { IntentWorker } from './IntentWorker.js';
import type {
  PlatformOrchestrator,
  PlatformState,
  ServiceType,
  ServiceInfo,
  SessionCreateOptions,
} from './types.js';

export class PlatformManager implements PlatformOrchestrator {
  readonly bus: PlatformEventBus;
  readonly sessions: SessionManager;
  readonly services: ProcessManager;
  readonly store: Store;
  readonly sessionStore: SessionStore;
  private workers: IntentWorker[] = [];

  constructor(private paths: RepoPaths) {
    this.bus = new PlatformEventBus();
    this.store = new Store(paths);
    this.sessionStore = new SessionStore(paths);
    this.sessions = new SessionManager(this.sessionStore, this.bus, paths);
    this.services = new ProcessManager(this.bus, paths, this.store);

    // Cleanup on process exit
    process.on('SIGINT', () => this.shutdown().catch(() => process.exit(1)));
    process.on('SIGTERM', () => this.shutdown().catch(() => process.exit(1)));
  }

  /** Start the default intent worker (queue consumer). */
  startWorker(maxConcurrent = 3): void {
    const worker = new IntentWorker({
      dequeue: () => this.store.nextQueued(),
      markInProgress: (id) => this.store.setChangeRequestStatus(id, 'in_progress'),
      markDone: (id, note) => this.store.setChangeRequestStatus(id, 'done', note),
      markError: (id, err) => this.store.setChangeRequestStatus(id, 'error', err),
      orch: this,
      cwd: this.paths.root,
      maxConcurrent,
    });
    worker.start();
    this.workers.push(worker);
    console.error(`[emdesign] Intent worker started (max ${maxConcurrent} concurrent)`);
  }

  /** Start an additional worker (for multi-worker setups). */
  addWorker(maxConcurrent?: number): IntentWorker {
    this.startWorker(maxConcurrent);
    return this.workers[this.workers.length - 1];
  }

  /** Stop all workers. */
  stopWorkers(): void {
    for (const w of this.workers) w.stop();
    this.workers = [];
  }

  /** Number of active sessions across all workers. */
  get activeSessions(): number {
    return this.workers.reduce((sum, w) => sum + w.activeCount, 0);
  }

  // ── Read-side (Claude session browsing) ──────────────────────────

  async getClaudeSessions(): Promise<EmSession[]> {
    const raw = await getSessions();
    return raw as EmSession[];
  }

  async getConversation(sessionId: string): Promise<ConversationMessage[]> {
    return getConversation(sessionId);
  }

  async getProjects(): Promise<string[]> {
    return getProjects();
  }

  // ── Write-side session management ────────────────────────────────

  async createSession(opts: SessionCreateOptions): Promise<EmSession> {
    return this.sessions.create(opts);
  }

  async cancelSession(id: string): Promise<void> {
    return this.sessions.cancel(id);
  }

  async resumeSession(id: string): Promise<void> {
    await this.sessions.resume(id);
  }

  getSession(id: string): EmSession | undefined {
    return this.sessions.get(id);
  }

  listSessions(): EmSession[] {
    return this.sessions.list();
  }

  // ── Service management ───────────────────────────────────────────

  async startService(type: ServiceType): Promise<ServiceInfo> {
    return this.services.start(type);
  }

  async stopService(type: ServiceType): Promise<void> {
    return this.services.stop(type);
  }

  async restartService(type: ServiceType): Promise<ServiceInfo> {
    return this.services.restart(type);
  }

  getService(type: ServiceType): ServiceInfo {
    return this.services.get(type);
  }

  listServices(): Record<ServiceType, ServiceInfo> {
    return this.services.list();
  }

  // ── Platform state ───────────────────────────────────────────────

  getState(): PlatformState {
    return {
      claudeSessions: [], // populated on-demand by the API handler
      emdesignSessions: this.sessionStore.list(),
      services: this.services.list(),
      studio: this.store.get(),
    };
  }

  // ── Events ───────────────────────────────────────────────────────

  on(event: string, handler: (e: any) => void): () => void {
    return this.bus.on(event as any, handler as any);
  }

  // ── Store access (for backward compat) ───────────────────────────

  getStore(): Store {
    return this.store;
  }

  // ── Lifecycle ────────────────────────────────────────────────────

  async shutdown(): Promise<void> {
    console.error('[emdesign] Shutting down platform...');
    await this.services.shutdown();
  }
}
