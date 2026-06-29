# Session Tracing & Debugging

## Overview

emdesign uses **Claude's native session storage** as its logging and tracing backend.
Every agent interaction, tool call, and workflow stage is recorded in structured JSONL
files under `~/.claude/`. The `@emdesign/session` package reads this data and exposes
it through CLI commands, HTTP APIs, and the Storybook addon UI.

## Architecture

```
CLI commands (--trace)           Storybook addon UI
         |                              |
    [PlatformEventBus]                  |
         |                              |
    ┌────┼────────────┐                 |
    v    v            v                 |
  File sink  WebSocket  SSE endpoints   |
    |                    |              |
    v                    v              v
  .emdesign/logs/    ~/.claude/      HTTP :4321
  (global + per-session)  (session JSONL files)
```

Three storage layers:

| Layer | Location | Format | Contents |
|-------|----------|--------|----------|
| **Claude sessions** | `~/.claude/projects/<project>/<uuid>.jsonl` | JSONL | Full conversation history: user messages, assistant replies, tool calls, thinking blocks, token usage |
| **Session index** | `~/.claude/history.jsonl` | JSONL | One line per session: display text, timestamp, project path |
| **Workflow logs** | `examples/<project>/.emdesign/logs/` | NDJSON | Structured log entries with levels (debug/info/warn/error), per-session and global aggregation |

## CLI Commands

### `emdesign session list`

List all Claude sessions across all projects:

```bash
# Last 10 sessions
emdesign session list --limit 10

# Filter by project
emdesign session list --project /path/to/project

# Show only failed sessions
emdesign session list --failed

# JSON output
emdesign session list --json
```

Output example:

```
SESSION ID                          DISPLAY                          TIMESTAMP           STATUS
em_ses_1782747366008_2h0r           Import stripe from awesome...     2026-06-29 22:30   completed
c512592a-12d0-4b2a-8d13-a54fa...   Fix typography token refs         2026-06-28 10:15   failed
```

### `emdesign session show <id>`

Inspect a single session's metadata and summary:

```bash
emdesign session show em_ses_1782747366008_2h0r
```

Shows:
- Session display text
- Project path
- Start timestamp + duration
- Status (created/running/completed/failed/cancelled)
- Message count
- Model used (claude-opus-4-8, deepseek-v4-flash, etc.)
- Total token usage (input + output)

### `emdesign session logs <id>`

View the full conversation log for a session:

```bash
# Human-readable format (default)
emdesign session logs em_ses_1782747366008_2h0r

# Follow mode (live tail)
emdesign session logs em_ses_1782747366008_2h0r --tail

# Raw JSONL
emdesign session logs em_ses_1782747366008_2h0r --format json
```

Human-readable output labels each message:

```
[2026-06-29T22:30:00.000Z] ──────────────────────────────────────
[USER] Import stripe from awesome-design-md

[2026-06-29T22:30:00.120Z] ──────────────────────────────────────
[SYSTEM] Stage: fetch — done
[SYSTEM] Stage: parse — done
[SYSTEM] Stage: generate tokens — done
[SYSTEM] Stage: scaffold primitives — done
[SYSTEM] Stage: generate preview — done
[SYSTEM] Stage: validate — done
[SYSTEM] Import complete: 12 tokens, primitives scaffolded

[2026-06-29T22:30:05.200Z] ──────────────────────────────────────
[THINKING] The user wants to customize the typography...
─────────────────────────────────────────────────────────────────
[TOOL:Skill] Input: emdesign
─────────────────────────────────────────────────────────────────
[TOOL RESULT] Launching skill: emdesign
─────────────────────────────────────────────────────────────────
[ASSISTANT] I've imported the Stripe design system and scaffolded
all primitives. The system has 12 tokens ready for use.
```

### `emdesign logs`

Query logs across all sessions from the global trace:

```bash
# Last 50 log entries
emdesign logs

# Filter by level
emdesign logs --level warn
emdesign logs --level error

# Filter by session
emdesign logs --session em_ses_1782747366008_2h0r

# Time range
emdesign logs --since 5m
emdesign logs --since "2026-06-29T22:00:00Z" --until "2026-06-29T23:00:00Z"

# Follow mode (tail -f)
emdesign logs --follow

# JSON output
emdesign logs --format json
```

## The `--trace` Flag

The `--trace` flag creates a proper workflow session for any CLI operation.
Without it, commands run silently (existing behavior). With it, every stage
is recorded to both Claude's session storage and the local log files.

```bash
# No tracing — runs silently
emdesign ds import awesome stripe

# With tracing — creates session, logs every stage
emdesign ds import awesome stripe --trace
# Output:
#   ✓ Fetching DESIGN.md
#   ✓ Parsing frontmatter
#   ✓ Generating tokens.css
#   ✓ Scaffolding primitives
#   ✓ Generating preview
#   ✓ Validating
#   Import complete: stripe (12 tokens, session: em_ses_1234_5)
#   View session: emdesign session logs em_ses_1234_5

# With trace + log level filter
emdesign ds customize stitch --name "My DS" --trace --log-level debug
```

Combined with `--json`:

```bash
emdesign ds import awesome stripe --trace --json
# Returns machine-readable JSON with sessionId embedded
```

## Workflow Sessions

When a design system is imported or customized, the CLI creates a
**WorkflowSession** — an in-memory tracker with named stages:

```
import-awesome stages:
  1. fetch               Fetch DESIGN.md from GitHub
  2. parse               Parse YAML frontmatter
  3. generate tokens     Write tokens.css
  4. scaffold primitives Copy @atelier primitives
  5. generate preview    Build reference-example.html
  6. validate            Verify token contract

customize stages:
  1. clone               Copy vendor base
  2. customize tokens    Replace colors/fonts/spacing
  3. scaffold            Copy primitives
  4. validate            Verify token contract
```

Each stage updates:
- The `WorkflowStore` (in-memory, queryable by `workflow-status` API)
- The `PlatformEventBus` (broadcasts to WebSocket clients)
- The Claude session file (via `appendSessionMessage()`)
- The local log file (`.emdesign/logs/`)

## Toml Log Format

Log files use NDJSON (Newline-Delimited JSON):

```json
{"timestamp":"2026-06-29T22:30:00.000Z","level":"info","sessionId":"em_ses_1234","workflowId":"import-abc","message":"Fetching DESIGN.md","caller":"importAwesomeDesign"}
{"timestamp":"2026-06-29T22:30:00.120Z","level":"info","sessionId":"em_ses_1234","workflowId":"import-abc","message":"Stage: fetch — done","caller":"importAwesomeDesign"}
{"timestamp":"2026-06-29T22:30:01.050Z","level":"warn","sessionId":"em_ses_1234","workflowId":"import-abc","message":"Preview generation skipped — no color tokens","caller":"generatePreviewHtml"}
```

Two files are maintained:
- `.emdesign/logs/global.ndjson` — all entries from all sessions
- `.emdesign/logs/sessions/<sessionId>.ndjson` — per-session filtered view

## HTTP API

The backend exposes session/log data over HTTP for the Storybook addon:

### Read endpoints

| Method | Path | Returns | Description |
|--------|------|---------|-------------|
| `GET` | `/api/sessions` | `{ claudeSessions, emdesignSessions }` | All sessions (Claude-native + emdesign-managed) |
| `GET` | `/api/sessions/:id` | `SessionSummary` | Single session metadata |
| `GET` | `/api/sessions/:id/conversation` | `ConversationMessage[]` | Full conversation messages |
| `GET` | `/api/sessions/:id/conversation/stream` | SSE stream | Streaming conversation with offset cursor |
| `GET` | `/api/sessions/stream` | SSE stream | Live session list updates (30s heartbeat) |
| `GET` | `/api/logs/global` | `LogEntry[]` | Recent global log entries with level/session filtering |
| `GET` | `/api/logs/stream` | SSE stream | Live log entry stream |

### Write endpoints

| Method | Path | Body | Description |
|--------|------|------|-------------|
| `POST` | `/api/sessions` | `{ type, instruction, scope? }` | Create a new session |
| `POST` | `/api/sessions/:id/cancel` | `{}` | Cancel a running session |
| `POST` | `/api/sessions/:id/resume` | `{}` | Resume a paused session |

## Stories Tab (Storybook Addon)

The **Sessions** tab in the Storybook addon (`viewMode: emdesign-sessions`)
provides a GUI for browsing sessions and conversations.

![Sessions tab layout]
```
┌──────────────────────────────────────────────┐
│  🔍 Search sessions...                  [+ New] │
├──────────────────────┬───────────────────────┤
│  em_ses_1234_5      │ [USER] Import stripe  │
│  Import stripe...    │ from awesome-design-md│
│  Jun 29 22:30 ✓     │                       │
│                      │ [ASSISTANT] I've      │
│  c512592a-12d0       │ imported the Stripe   │
│  Fix typography refs │ design system...      │
│  Jun 28 10:15 ✗     │                       │
│                      │ [TOOL:bash] npm run   │
│  ...                 │ ...                   │
├──────────────────────┴───────────────────────┤
│  Status: completed · 12 tokens · 1.2s       │
└──────────────────────────────────────────────┘
```

Features:
- Left pane: searchable session list with status badges
- Right pane: conversation viewer with collapsible tool calls
- Filters: Story, Project, Design System tabs
- Real-time updates via SSE

## Event Bus Reference

The `PlatformEventBus` emits typed events that flow through the system:

| Event | When | Payload |
|-------|------|---------|
| `session:created` | New session starts | `{ session }` |
| `session:status` | Session state changes | `{ sessionId, status, phase?, round? }` |
| `session:completed` | Session finishes | `{ sessionId, result?, error? }` |
| `session:log` | Agent stdout/stderr line | `{ sessionId, line, stream }` |
| `service:status` | Service lifecycle | `{ service, status, info? }` |
| `state:update` | Studio state changes | `{ studio }` |
| `intent:queued` | New change request | `{ intent }` |
| `intent:resolved` | Change request done | `{ intent }` |

## CLI Intent Commands

The CLI can submit design intents and start agent chat sessions — the same two paths
the Storybook addon UI uses:

### `emdesign intent <type> <instruction>`

Send an intent to the backend queue. This is identical to what the UI does when you
click a tool or submit a create-wizard form — it writes to `.emdesign/state.json`
where the agent picks it up.

```bash
# Create a new component
emdesign intent create-component "A hero card with gradient background, CTA button, and avatar row"

# Request a change to an existing component
emdesign intent change-request "Make the primary button larger and add focus ring"

# Create a story for a component
emdesign intent create-story "Show loading, empty, and error states for HeroCard"

# Create or update a design system
emdesign intent create-design-system "Dark editorial with lime accent, serif headlines"
emdesign intent update-design-system "Change primary color to violet-600"

# Edit text on an element (with optional CSS selector target)
emdesign intent edit-text "Update the heading to 'Welcome Back'" --selector ".hero-title"

# Compose a view from components
emdesign intent create-view "Landing page with hero, features grid, and footer"
```

Intent type supports `--json` for machine-readable output and `--trace` to log
the operation to the session store.

Output:

```json
{
  "ok": true,
  "changeRequestId": "cr_1719600000000_0",
  "queueLength": 2
}
```

### `emdesign chat <message> --type <intent-type>`

Start an interactive chat session with the agent, routed by intent type.
This connects to the same `POST /api/chat/stream` endpoint the ChatSidebar
uses, subscribes to SSE events, and streams the agent's response to stdout.

```bash
# Free-form chat (no intent routing)
emdesign chat "What design system is currently active?"

# Create a component (routes to /mds:craft:component)
emdesign chat "Build a pricing table with 3 tiers" --type create-component

# Request a change (routes to /mds:craft:update)
emdesign chat "Make the header sticky and add a shadow" --type change-request

# Create a story (routes to /mds:craft:story)
emdesign chat "Stories for loading, empty, error states" --type create-story

# Design system operations (routes to /mds:system:create | update)
emdesign chat "Corporate blue design system, Inter font" --type create-design-system
emdesign chat "Update accent to emerald green" --type update-design-system
```

The `--type` flag maps to the same `/mds:*` command routing as the UI:

| Intent Type | /mds: Route |
|---|---|
| `create-component` | `/mds:craft:component` |
| `change-request` (or omitted) | `/mds:craft:update` |
| `create-story` | `/mds:craft:story` |
| `create-design-system` | `/mds:system:create` |
| `update-design-system` | `/mds:system:update` |

#### Chat modes

```bash
# Non-blocking: submit intent, print ID, return immediately
emdesign intent create-component "Hero card" --type create-component

# Blocking: wait for agent response, stream SSE events to stdout
emdesign chat "Hero card with gradient" --type create-component --wait

# Interactive: stream response, then prompt for follow-up
emdesign chat "Build a pricing table" --type create-component --interactive

# Pipe mode: read message from stdin
echo "Create a dark mode variant of the dashboard" | emdesign chat --type change-request

# With tracing
emdesign chat "Newsletter signup form" --type create-component --trace
```

When `--trace` is set, the entire conversation is recorded to the Claude session
store and can be inspected with `emdesign session logs <session-id>`.

### Intent Types (Complete)

| Type | UI Source | Agent Route | Description |
|------|-----------|-------------|-------------|
| `change-request` | Toolbar comment, Live panel | `/mds:craft:update` | General change to existing component |
| `create-component` | Create Wizard | `/mds:craft:component` | New component from scratch |
| `create-story` | Create Wizard | `/mds:craft:story` | Auto-generate CSF story file |
| `create-view` | Create Wizard | `/mds:craft:view` | Compose multiple components into a view |
| `create-design-system` | Design tab | `/mds:system:create` | Create new design system |
| `update-design-system` | Design tab | `/mds:system:update` | Modify existing design system |
| `refine-design-system` | Dashboard cards | `/mds:system:update` | Refine specific token scope |
| `edit-text` | Pen tool | `/mds:craft:update` | Inline text edit |
| `comment` | Comment tool | `/mds:craft:update` | Element-scoped feedback |
| `wand` | Wand tool | (auto-fix) | AI auto-fix an element |
| `place` | Place tool | (place) | Insert component at location |

## Quick Start

```bash
# List recent sessions
emdesign session list --limit 5

# Import with full tracing
emdesign ds import awesome stripe --trace

# View what happened
emdesign session logs <session-id-from-output>

# Query warnings from all sessions
emdesign logs --level warn --since 1h

# Follow logs live
emdesign logs --follow

# Submit an intent (same as browser UI)
emdesign intent create-component "Hero card with CTA"

# Start an agent chat session
emdesign chat "Build a pricing table" --type create-component --wait
```

## Implementation

Key source files:

| File | Purpose |
|------|---------|
| `packages/cli/src/commands/session.ts` | `session list/show/logs` CLI commands |
| `packages/cli/src/commands/intent.ts` | `intent` and `chat` CLI commands — submit intents, stream agent responses |
| `packages/cli/src/cli.ts` | `--trace` / `--log-level` flags, `session`/`intent`/`chat` command registration |
| `packages/cli/src/commands/ds.ts` | Workflow session integration for import/customize |
| `packages/session/src/storage.ts` | Read/write Claude session JSONL files |
| `packages/session/src/log-sink.ts` | Persist `session:log` events to `.emdesign/logs/` |
| `packages/backend/src/workflow.ts` | `WorkflowStore`, `WorkflowSession`, stage tracking |
| `packages/backend/src/workflow-api.ts` | HTTP endpoints for workflow status/streaming |
| `packages/backend/src/http.ts` | Express bridge, `/api/intent`, `/api/chat/stream`, `/api/logs/*` endpoints |
| `packages/backend/src/state.ts` | `Store` — intent queue, `.emdesign/state.json` persistence |
| `packages/backend/src/scaffold.ts` | `importAwesomeDesign`, `customizeDesignSystem` with callbacks |
