# Agent Integration Specification

## REMOVED — MCP-based agent integration

The `@emdesign/mcp-server` package is removed. The MCP HTTP endpoint at `/mcp` is removed from `serve` and `up`. The `emdesign mcp` stdio subcommand is removed.

The `docs/agent-integration.md` file is rewritten to remove all MCP references.

## ADDED — CLI-based agent integration

### How agents interact with emdesign

Agents invoke the `emdesign` CLI as a subprocess, passing `--json` for structured output:

```bash
# Example: get design context
emdesign design-context --json

# Example: lint a component
emdesign lint Button --json --gate

# Example: run visual test
emdesign visual-test Button --json

# Example: get critique score
emdesign score --component Button --json --gate

# Example: discover components
emdesign discover --source all --json
```

### Subprocess invocation pattern

```
stdin  →  [agent]  →  spawn('emdesign', ['<cmd>', '--json'])
                     ↓
                  child_process
                     ↓
stdout →  JSON object  →  agent parses .data
stderr →  human logs   →  agent ignores or logs
exit   →  0 = success, 1 = error/gate failure
```

### How workflow scripts use the CLI

Gates (`scripts/gates/*.sh`) call the CLI directly:

```sh
# lint.sh
emdesign lint "$1" --gate  # exit code = verdict

# visual.sh
emdesign visual-test "$1" --gate
```

Workflow scripts and `/mds:*` commands call the CLI for each operation, piping JSON output into the agent's decision loop.

### No server required for common path

The CLI embeds `@emdesign/backend` directly for all operations except:
- `serve` / `up` — starts the HTTP bridge (needed only for the Storybook addon panel)
- `session create` — spawns a long-lived agent session (optional)

All design-context, lint, visual-test, score, capture, graph, ds, and discover commands work without a running server.

### Storybook MCP compatibility

The 7 Storybook MCP tools (from `@storybook/addon-mcp`) are replaced by emdesign CLI equivalents:

| Storybook MCP tool | emdesign CLI replacement |
|---|---|
| `get-changed-stories` | `emdesign change-request changed-stories --json` |
| `get-storybook-story-instructions` | `emdesign design-context --instruction "..." --json` |
| `preview-stories` | N/A — agents open the URL directly |
| `list-all-documentation` | `emdesign discover --source all --json` |
| `get-documentation` | `emdesign documentation <target> --json` |
| `get-documentation-for-story` | `emdesign documentation <story-id> --json` |
| `run-story-tests` | `emdesign test <component> --json` |
