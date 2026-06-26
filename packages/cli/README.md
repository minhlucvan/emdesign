# @emdesign/cli

The **emdesign CLI** (`emdesign`) — the thin client that agents, workspace commands, and gates invoke.
Proxies to a running backend server over HTTP, or embeds the `@emdesign/engine` for one-shot operations
(init, attach, lint, validate, graph build).

## Role in the system

The CLI is the interface between the agent/developer and the backend engine. It's what
`scripts/gates/*.sh` and the `/mds:*` commands shell out to.

## Usage

```bash
emdesign serve              # Start the HTTP + MCP server
emdesign mcp                # MCP server over stdio
emdesign init <framework>   # Scaffold a new emdesign workspace
emdesign attach             # Attach to an existing Storybook project
emdesign ds <cmd>           # Design system commands: create, use, validate, list, bases, doctor
emdesign lint <Component>   # Consistency-lint a generated component
emdesign graph build <id>   # Rebuild the knowledge graph for a design system
```

## Binaries

- `emdesign` / `emdesign-backend` — both point at `dist/cli.js`

## Related

- `@emdesign/backend` — the engine library the CLI wraps
- `@emdesign/workspace` — init/attach installer
- `@emdesign/mcp-server` — MCP server wrapper
