/**
 * MCP tools for session management.
 * These register alongside the existing emdesign MCP tools.
 */
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { PlatformOrchestrator } from '../types.js';

function text(s: string) {
  return { content: [{ type: 'text' as const, text: s }] };
}

export function registerSessionMcpTools(server: McpServer, orch: PlatformOrchestrator): void {
  server.registerTool(
    'create_session',
    {
      description: 'Start a new emdesign workflow session. Returns the session id and initial status.',
      inputSchema: {
        type: z.enum(['design-loop', 'inbox-loop', 'design-system-loop', 'view-loop', 'custom']),
        name: z.string().optional().describe('Component/page name'),
        instruction: z.string().optional().describe('Instruction or brief'),
        args: z.record(z.unknown()).optional(),
      },
    },
    async (input) => {
      const session = await orch.createSession({
        type: input.type,
        workflow: input.type,
        args: { ...input.args, name: input.name, instruction: input.instruction },
        instruction: input.instruction,
      });
      return text(JSON.stringify({ id: session.id, status: session.emdesignStatus }));
    },
  );

  server.registerTool(
    'cancel_session',
    {
      description: 'Cancel a running emdesign session by id.',
      inputSchema: { id: z.string() },
    },
    async ({ id }) => {
      await orch.cancelSession(id);
      return text(`Session ${id} cancelled.`);
    },
  );

  server.registerTool(
    'list_sessions',
    {
      description: 'List all emdesign-managed sessions.',
      inputSchema: {},
    },
    async () => {
      const sessions = orch.listSessions();
      return text(JSON.stringify(sessions.map(s => ({
        id: s.id,
        type: s.emdesignType,
        status: s.emdesignStatus,
        phase: s.currentPhase,
        round: s.currentRound,
        display: s.display,
      })), null, 2));
    },
  );

  server.registerTool(
    'list_claude_sessions',
    {
      description: 'List all Claude Code sessions (from ~/.claude/).',
      inputSchema: {},
    },
    async () => {
      const sessions = await orch.getClaudeSessions();
      return text(JSON.stringify(sessions.map(s => ({
        id: s.id,
        display: s.display,
        project: s.projectName,
        timestamp: s.timestamp,
      })), null, 2));
    },
  );

  server.registerTool(
    'get_platform_status',
    {
      description: 'Get unified platform status: services + sessions.',
      inputSchema: {},
    },
    async () => {
      return text(JSON.stringify(orch.getState(), null, 2));
    },
  );
}
