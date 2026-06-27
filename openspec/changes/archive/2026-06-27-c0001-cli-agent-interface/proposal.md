---
name: "c0001-cli-agent-interface"
---

# CLI Agent Interface — replace MCP with a comprehensive CLI

## What

Replace the current MCP-based agent integration (`@emdesign/mcp-server`) with a single, comprehensive CLI at `packages/cli` that exports every tool an AI agent needs as a first-class subcommand with JSON output. Agents invoke the CLI as a subprocess — no MCP protocol, no running server required for most operations.

## Why

The current architecture has three independent interfaces — the **CLI** (`emdesign`), the **MCP server** (`@emdesign/mcp-server`), and the **HTTP bridge** (`backend/src/http.ts`) — each wrapping the same backend functions in different protocols. This causes:

1. **Protocol indirection**: Every tool call goes `agent → MCP SDK → MCP transport → backend`. The MCP layer adds ~2 ms of serialization latency per call and, more critically, introduces a hard dependency on the `@modelcontextprotocol/sdk` and the Streamable HTTP spec. Debugging a failing tool means tracing through three layers.

2. **Two packages doing the same thing**: `@emdesign/cli` (24 commands) and `@emdesign/mcp-server` (18 MCP tools) both wrap `@emdesign/backend`. They share no common tool-definition vocabulary, so adding a new capability means writing it twice — once as a CLI command, once as an MCP tool — or worse, writing it only as an MCP tool and leaving the CLI incomplete.

3. **Server-required fragility**: Most MCP tools require a running `emdesign serve` process. This means every agent workflow must start a daemon, wait for it to be ready, and handle the case where it crashes. A comprehensive CLI can embed the engine and work standalone for the common path.

4. **Agent ergonomics**: AI agents are best at invoking subprocesses with arguments and parsing structured output. MCP is a layer of abstraction that complicates debugging — agents can't see the raw request/response, and tool-call failures are opaque. A CLI with `--json` flags gives the agent direct, debuggable output.

5. **Storybook MCP redundancy**: The current setup exposes two MCP endpoints — one for emdesign (40+ tools) and one for Storybook (7 tools). The emdesign tools already cover everything Storybook offers (`list_all_documentation`, `get_documentation`, `get_changed_stories`). Maintaining both is unnecessary.

## Scope

**In scope:**
- Design and implement a comprehensive CLI command tree covering every agent-facing capability
- Embed all backend operations directly (no server required for the common path)
- Remove `@emdesign/mcp-server` package entirely
- Remove the MCP HTTP mount from `serve`/`up`
- Add `--json` / `--format json` to every command for structured agent consumption
- Add `--gate` flag to commands used as quality gates (exit code = verdict)
- Provide stdin streaming for large prompts (DESIGN.md, component source) to avoid argv limits
- Keep the HTTP bridge for the Storybook addon panel (it needs CORS + SSE, not MCP)
- Keep agent-adapter harness (`backend/src/harness/`) — it's orthogonal; it spawns agents, it doesn't need MCP
- Update all workflow scripts, gates (`scripts/gates/*.sh`), and `/mds:*` commands to use the new CLI

**Out of scope:**
- Rewriting the backend engine (`@emdesign/backend`) — we wrap it, not replace it
- Changing how the Storybook addon panel communicates — it continues to use the HTTP bridge
- Changing the knowledge graph (`@emdesign/graph`) — it's consumed through the CLI
- Changing design system storage format

## Assumptions

1. Agents run in an environment where `npx tsx` or a built `emdesign` binary is available on PATH.
2. The HTTP bridge remains for the browser-based addon (not for agents).
3. The typical agent workflow involves 5–15 tool calls per iteration (lint → fix → visual-test → score → loop); subprocess overhead is acceptable at this cadence.
4. For the rare case where an agent wants to watch a long-running process (e.g., `serve`), we provide a `--watch` / background mode.

## Impact

| Package | Action |
|---------|--------|
| `@emdesign/mcp-server` | **Remove** entirely — no longer needed |
| `@emdesign/cli` | **Major rewrite** — from 24 to 60+ commands covering every backend capability |
| `@emdesign/backend` | **Minor** — export a few more internals that were only exposed through MCP |
| `@emdesign/addon` | **None** — still talks HTTP bridge |
| `@emdesign/workspace` | **None** — still uses CLI via `init`/`attach` |
| Workflow scripts and gates | **Update** — replace any MCP calls with CLI subprocess calls |
| `docs/agent-integration.md` | **Rewrite** — document CLI-based integration instead of MCP |
