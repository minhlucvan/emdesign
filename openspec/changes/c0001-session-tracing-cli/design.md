# Design — c0001-session-tracing-cli

## Architecture

The CLI mirrors the two paths the Storybook addon UI uses to communicate
with the backend:

| UI Path | Backend | CLI Command |
|---------|---------|-------------|
| Toolbar / CreateWizard | `POST /api/intent` | `emdesign intent` |
| ChatSidebar | `POST /api/chat/stream` (SSE) | `emdesign chat` |
| Sessions tab | `GET /api/sessions`, `~/.claude/` | `emdesign session` |
| (no UI equivalent — new) | `.emdesign/logs/global.ndjson` | `emdesign logs` |

## Key decisions

1. **`intent` and `chat` require a running backend** — they delegate to the
   existing HTTP endpoints. No backend changes needed.

2. **`session` and `logs` work without a backend** — they read local files
   directly using the `@emdesign/session` package's `storage.ts`.

3. **`--trace` is composable** — it's a global flag parsed in `cli.ts` that
   creates a `PlatformEventBus` + `log-sink.ts` subscriber when set. Existing
   commands don't need modification — they just emit events if the bus is
   available.

4. **No new dependencies** — `@emdesign/session` already has `storage.ts`,
   `AgentRunner`, `PlatformEventBus`. The CLI already imports `@emdesign/backend`.

## File layout

```
packages/cli/src/
  commands/
    intent.ts         ← NEW: intent + chat commands
    session.ts        ← NEW: session list/show/logs + logs commands
  cli.ts              ← MODIFIED: register intent/chat/session, add --trace

packages/session/src/
  log-sink.ts         ← NEW: persist PlatformEventBus session:log events
  index.ts            ← MODIFIED: export createLogSink
```

## Logging pipeline

```
CLI command (--trace) or HTTP path
  → PlatformEventBus.emit('session:log', ...)
  → log-sink.ts subscriber
  → appendLog('__global__', entry)   → .emdesign/logs/global.ndjson
  → appendLog(sessionId, entry)      → .emdesign/logs/sessions/<id>.ndjson
```
