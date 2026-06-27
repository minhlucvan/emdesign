# Agent Integration

emdesign serves two MCP endpoints that any MCP-capable AI agent can connect to:

| Endpoint | URL | Tools | Purpose |
|----------|-----|-------|---------|
| **emdesign** | `http://localhost:4321/mcp` | 40+ | Design systems, lint, visual tests, critique, knowledge graph, vision critique |
| **Storybook** | `http://localhost:6006/mcp` | 7 | Story browsing, documentation, component previews, interaction tests |

---

## Quick Start

Start the full platform:

```bash
emdesign serve
```

This starts:
- **HTTP bridge** with emdesign MCP on port 4321 (`/mcp`)
- Storybook with Storybook MCP on port 6006 (`/mcp`)

Both MCP endpoints are available simultaneously.

---

## Claude Code

### Via `.mcp.json` (project-level, auto-detected)

Add to your project root `.mcp.json`:

```json
{
  "mcpServers": {
    "emdesign": {
      "url": "http://localhost:4321/mcp"
    },
    "storybook": {
      "url": "http://localhost:6006/mcp"
    }
  }
}
```

### Via CLI commands

```bash
# Connect to emdesign MCP (HTTP)
claude mcp add emdesign --transport http http://localhost:4321/mcp

# Connect to Storybook MCP (HTTP)
claude mcp add storybook --transport http http://localhost:6006/mcp

# Or connect via stdio (no HTTP server needed)
claude mcp add emdesign -- npx tsx packages/cli/src/cli.ts mcp
```

Once connected, Claude Code auto-discovers all tools. Try:

```
# List available tools from emdesign
> List your available MCP tools

# Discover components
> Use list_all_documentation to see all stories

# Get design context
> Use get_design_context to understand the design system before building
```

---

## Cursor

Add to `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "emdesign": {
      "url": "http://localhost:4321/mcp",
      "transport": "http"
    },
    "storybook": {
      "url": "http://localhost:6006/mcp",
      "transport": "http"
    }
  }
}
```

---

## VS Code (via GitHub Copilot)


## Using Python MCP SDK

```python
import asyncio
from mcp import ClientSession, StdioClientTransport

async def main():
    # Connect to emdesign via stdio
    transport = StdioClientTransport(["npx", "tsx", "packages/cli/src/cli.ts", "mcp"])
    async with ClientSession(transport) as session:
        tools = await session.list_tools()
        print(f"emdesign tools: {len(tools.tools)}")
        for tool in tools.tools:
            print(f"  - {tool.name}: {tool.description[:80]}")

asyncio.run(main())
```

For HTTP transport:

```python
from mcp import ClientSession, HttpClientTransport

transport = HttpClientTransport("http://localhost:4321/mcp")
```

---

## How the Harness Writes MCP Config

When emdesign spawns an agent (via `emdesign up` or the session orchestrator),
The agent auto-discovers all MCP tools on startup.

---

## Tool Reference

### emdesign MCP Tools (40+)

These include all design-engineering tools plus re-implemented Storybook equivalents:

| Tool | Description |
|------|-------------|
| `get_design_context` | Get design system context for component generation |
| `create_component` | Create a generated component with story |
| `edit_component` | Revise a generated component |
| `lint_consistency` | Lint against token contract + anti-slop rules |
| `run_visual_test` | Screenshot + pixelmatch visual diff |
| `run_component_tests` | Visual + interaction tests (enhanced) |
| `capture_reusable_component` | Promote generated → reusable |
| `critique_score` | Authoritative quality gate |
| `list_all_documentation` | List all stories/documentation (Storybook compat) |
| `get_documentation` | Component documentation (Storybook compat) |
| `get_documentation_for_story` | Story-level documentation (Storybook compat) |
| `get_changed_stories` | Recently changed story files (Storybook compat) |
| `get_component_instructions` | Authoring instructions (Storybook compat) |
| `graph_*` | Knowledge graph queries (impact, where-to-fix, etc.) |
| `vision_critique` | LLM-based visual review |
| `ds_*` | Design system management tools |

### Storybook MCP Tools (7)

Available when `@storybook/addon-mcp` is installed:

| Tool | Description |
|------|-------------|
| `get-changed-stories` | Stories changed since last commit |
| `get-storybook-story-instructions` | Story authoring instructions |
| `preview-stories` | Render story previews |
| `list-all-documentation` | List all documentation entries |
| `get-documentation` | Get component documentation |
| `get-documentation-for-story` | Get documentation for a specific story |
| `run-story-tests` | Run Storybook interaction + a11y tests |

---

## Troubleshooting

**Q: MCP endpoint returns 404**
Make sure the server is running: `emdesign serve` or `emdesign up`.

**Q: Agent can't connect to Storybook MCP**
Verify `@storybook/addon-mcp` is installed and Storybook is running on port 6006.

**Q: Tools not appearing in agent**
Some agents (like Copilot) need explicit tool selection. Check your agent's MCP configuration.

**Q: `emdesign mcp` (stdio) not working**
Ensure `emdesign` CLI is built or use `npx tsx packages/cli/src/cli.ts mcp`.
