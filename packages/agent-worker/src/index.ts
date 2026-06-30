/**
 * @emdesign/agent-worker — Claude Code session worker.
 *
 * Polls a queue for pending intents and spawns Claude Code sessions.
 * Pure worker — no knowledge of HTTP, store, or backend.
 * Managed by @emdesign/agent-manager.
 */
export { AgentWorker } from './worker.js';
export type { AgentWorkerOptions, WorkerSession, QueueItem } from './worker.js';
