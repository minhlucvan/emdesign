# Design — c0001-cli-agent-interface

## Summary

Replace the two-interface (CLI + MCP) architecture with a single comprehensive CLI that agents invoke as a subprocess. Delete `@emdesign/mcp-server`. Every backend capability becomes a CLI subcommand with `--json` output.

## Current architecture

```
Agent ──MCP SDK──▶ @emdesign/mcp-server (18 MCP tools) ──calls──▶ @emdesign/backend
       ──subprocess──▶ @emdesign/cli (24 commands) ──────calls──▶ @emdesign/backend
                                      HTTP bridge ──────serves──▶ @emdesign/addon (panel)
```

The MCP layer and the CLI layer duplicate each other. Adding a new capability means writing two interfaces.

## Target architecture

```
Agent ──subprocess──▶ @emdesign/cli (60+ commands) ──calls──▶ @emdesign/backend
                                               HTTP bridge ──serves──▶ @emdesign/addon (panel)
```

**Key changes**
1. `@emdesign/mcp-server` package deleted — MCP tool definitions folded into CLI commands
2. CLI grows from 24 to 60+ commands covering every MCP tool surface
3. Every command supports `--json`
4. Commands embed the backend engine directly — no server needed for most ops
5. HTTP bridge remains for the addon panel only

## CLI command architecture

### Structural pattern

Each backend capability maps to one CLI subcommand with a consistent structure:

```
emdesign <verb> [<noun>] [options] [--json] [--gate]
```

- `verb` = action (`create`, `lint`, `test`, `score`, `capture`, `discover`, etc.)
- `noun` = the thing being acted on (component name, DS ID, etc.)
- `--json` = structured output to stdout
- `--gate` = exit code is the verdict

### How the CLI resolves operations

```
                  ┌── serverUp()? ──yes──▶ POST /api/<route> (delegate to HTTP bridge)
                  │
caller ──▶ cmd ──┤
                  │
                  └── no server ──▶ import @emdesign/backend → call directly
```

This preserves the existing "proxy-to-server" pattern for operations that benefit from a running server (e.g., visual tests that need Storybook), while falling back to the embedded engine for the rest.

### JSON output format

```typescript
interface CliResponse<T = unknown> {
  ok: boolean;
  data: T;
  meta?: {
    took: number;           // wall-clock ms
    warnings?: string[];
    gate?: 'pass' | 'fail'; // only when --gate is set
  };
}
```

### Error handling

Errors go to stderr as human-readable messages. The `--json` response includes errors in `.meta.warnings[]`. Fatal errors exit 1 with a short message on stderr.

### Large input handling

Commands accepting large inputs (source code, DESIGN.md text) support `--stdin`. This avoids shell argv limits and lets agents pipe content efficiently:

```bash
cat component.tsx | emdesign generate Button --mode edit --stdin --json
```

## Package restructuring

### Removed
- `packages/mcp-server/` — entire package deleted
- `@emdesign/mcp-server` — removed from root `package.json` workspaces and CLI dependencies
- MCP HTTP mount in `serve`/`up` commands

### Modified
- `packages/cli/src/cli.ts` — rewritten to support the full command tree
- `packages/cli/package.json` — remove `@emdesign/mcp-server` dependency; add any needed backend exports
- `packages/backend/src/index.ts` — export any internals previously only exposed through MCP

### Unchanged
- `packages/backend/` — the engine itself stays the same
- `packages/addon/` — still talks HTTP bridge
- `packages/graph/` — consumed through CLI subcommands
- `packages/vision-critic/` — consumed through CLI
- `packages/plugin-react-doctor/` — consumed through CLI
- `packages/dsr/` — unchanged

## Agent integration pattern

The documented pattern in `docs/agent-integration.md` changes from:

```
# Old: agent connects to MCP endpoint
claude mcp add emdesign --transport http http://localhost:4321/mcp
```

To:

```
# New: agent invokes CLI directly
emdesign design-context --json
emdesign generate Button --mode edit --stdin --json
emdesign lint Button --json --gate
```

Workflows that previously called MCP tools now call CLI subcommands. The subagent types (`vision-critic`, `design-reviewer`, `consistency-auditor`) call the CLI instead of MCP tools.

## Migration

1. Implement the full CLI command tree (all 60+ commands)
2. Update gates (`scripts/gates/*.sh`) to use the new CLI
3. Update workflow scripts to replace MCP calls with CLI subprocess calls
4. Update `/mds:*` commands to use CLI subprocesses
5. Delete `@emdesign/mcp-server`
6. Remove MCP from `serve`/`up`
7. Rewrite `docs/agent-integration.md`
8. Update agent diagnostic files (MCP tools list, `.mcp.json` configs)

## Backward compatibility

- All existing CLI commands remain with the same names and flags (backward-compatible)
- New `--json` and `--gate` flags are additive
- The HTTP bridge API remains unchanged (addon panel compatibility)
- Gate scripts change their implementation but keep the same exit-code contract
