/**
 * @emdesign/agent-manager — orchestrates agent workers, queue routing,
 * session lifecycle, and conversation management.
 *
 * Single entry point for the backend: agentManager.start() watches the
 * intent queue, routes intents to workers, and manages sessions.
 */
export { AgentManager } from './manager.js';
export type { AgentManagerOptions } from './manager.js';
