---
name: "c0001-session-tracing-cli"
---

# c0001-session-tracing-cli

## What

Add CLI commands for session tracing, intent submission, and agent chat, enabling the CLI to perform the same operations currently available only through the Storybook browser UI. Specifically:

- **`emdesign intent <type> <instruction>`** -- submits a design intent to the same `POST /api/intent` queue that the toolbar and CreateWizard use in the browser UI.
- **`emdesign chat <message> --type <intent-type>`** -- connects to the same `POST /api/chat/stream` SSE endpoint that the ChatSidebar uses, streaming agent responses to stdout.
- **`emdesign session list|show|logs`** -- reads Claude's native `~/.claude/` JSONL session storage via the existing `@emdesign/session` package (storage.ts, SessionManager).
- **`emdesign logs [--level] [--session] [--since]`** -- queries the global trace log at `.emdesign/logs/global.ndjson`.
- **`--trace` flag** -- creates a Claude session and logs every stage of any CLI command.

Docs already exist at `docs/session-tracing.md` and `docs/cli-commands.md` (sections 15-16). This change implements the CLI commands those docs describe.

## Why

The `@emdesign/session` package already contains the full infrastructure: `storage.ts` (read/write Claude JSONL files), `SessionManager` (create/cancel/resume sessions), `PlatformEventBus` (typed events), and `AgentRunner` (spawn Claude Code subprocess). The backend already exposes both the intent queue (`POST /api/intent`) and the chat SSE endpoint (`POST /api/chat/stream`). Both browser UI paths (intent toolbar + ChatSidebar) are functional.

However, the CLI has no commands to use any of these capabilities. Users who work from the terminal -- or who want to script, automate, or CI-pipeline their design workflow -- have no way to submit intents, start chat sessions, or trace operations without opening the Storybook UI. Adding these commands closes that gap and makes the full design-engineering loop accessible from the CLI.

## Scope

- New CLI command implementations only, wired into the existing CLI command registration and `@emdesign/session` package.
- No backend changes needed -- the backend endpoints already exist.
- No new packages. All dependencies are in `@emdesign/session` and `@emdesign/backend`.
- No UI surface. These are CLI/terminal commands only.

## Assumptions

- The backend server is running for `intent` and `chat` commands (same as all other commands that talk to the backend).
- The `session` and `logs` commands can operate without a running backend by reading local storage directly.
- The `--trace` flag is composable with all existing CLI commands.
