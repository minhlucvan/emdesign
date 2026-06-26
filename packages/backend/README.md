# @emdesign/backend

The **emdesign Studio backend** — the headless design-engineering engine. It's a library (not a
standalone binary — use `@emdesign/cli` for that) containing:

- **MCP server** — tool surface agents drive the design loop through
- **Agent harness** — pluggable adapter registry for spawning coding-agent CLIs
- **Prompt composer** — assembles DESIGN.md + tokens + primitives into agent prompts
- **Consistency lint** — anti-slop + token-contract self-check (P0/P1 rules)
- **Visual test** — Playwright screenshot + pixelmatch diff vs baseline
- **Critique scoreboard** — composite weighted scoring + dual-gate decide
- **Capture** — promotes generated components to git-tracked reusable components
- **HTTP bridge** — `/api/*` endpoints for the Storybook addon panel

## Role in the system

The backend is the brain: it owns `.emdesign/` state, `design-systems/<id>/graph.json`,
and all the deterministic quality tools (lint, visual test, scoreboard gate). It exposes
its capabilities via MCP tools and HTTP endpoints.

## Related

- `@emdesign/cli` — wraps the backend as a CLI binary
- `@emdesign/dsr` — design-system runtime domain layer
- `@emdesign/graph` — knowledge graph data model
- `@emdesign/doctor` — rule-based design-system linting
- `@emdesign/plugin-*` — framework/styling/library plugins
