# emdesign CLI Command Reference

> Date: 2026-06-27
> Generated from: `packages/cli/src/cli.ts` and `packages/cli/src/commands/`

This document is the authoritative reference for all emdesign CLI commands.
It covers commands implemented across V1 (core), V2 (spatial/render/screen/loop),
and V3 (registry/import/blocks/blueprints/lint-rules).

---

## Table of Contents

1. [Workspace & Server](#1-workspace--server)
2. [Design System Registry](#2-design-system-registry)
3. [Design System Management](#3-design-system-management)
4. [Design System Compilation](#4-design-system-compilation)
5. [Design System Lint Rules](#5-design-system-lint-rules)
6. [Component Lifecycle](#6-component-lifecycle)
7. [Verification (Doctor)](#7-verification-doctor)
8. [Visual & Spatial Analysis](#8-visual--spatial-analysis)
9. [Component Intelligence](#9-component-intelligence)
10. [Composition & Screens](#10-composition--screens)
11. [Knowledge Graph](#11-knowledge-graph)
12. [Exploration](#12-exploration)
13. [Automation](#13-automation)
14. [Session Tracing & Debugging](#14-session-tracing--debugging)
15. [Universal Flags](#15-universal-flags)

---

## 1. Workspace & Server

| Command | Description | Requires |
|---------|-------------|----------|
| `init <framework> [--dir .]` | Scaffold a new emdesign workspace for a framework (react-tailwind, etc.) | — |
| `attach [--dir .]` | Link emdesign to an existing project | Existing project |
| `update [--dir .] [--force] [--prune] [--dry-run] [--storybook]` | Update workspace templates | Existing workspace |
| `serve [--port 4321]` | Start the HTTP bridge server | — |
| `up` | Start everything (bridge + Storybook + WebSocket + health checks) | `@emdesign/session` |
| `health` | Ping the HTTP server health endpoint | Running server |

### Examples

```bash
emdesign init react-tailwind --dir ./my-app
emdesign serve --port 8080
emdesign up
emdesign health --json
```

---

## 2. Design System Registry

| Command | Description |
|---------|-------------|
| `ds create <id> [--mode blank\|brief\|import\|extract] [--from <base>] [--name <display>] [--description <text>]` | Create a design system |
| `ds import awesome <brand> [--name <name>]` | Import from awesome-design-md (74 brands) |
| `ds import git <url> [--ref <ref>] [--path <dir>] [--name <name>]` | Import from git repository |
| `ds import vendor <id> [--name <name>]` | Import from vendored base |
| `ds import project <path> [--name <name>] [--id <id>] [--json] [--gate]` | Reverse-engineer an existing project into a design system, adopt its components, and print the adoption report (`--gate` ⇒ non-zero when validation fails or any component needs a manual fix) |
| `ds search <query> [--limit <n>]` | Search registries by keyword/category |
| `ds info [id]` | Show detailed design system info |
| `ds list` | List all local design systems |
| `ds bases` | List all vendored base templates |
| `ds base-detail <id>` | Show a base system's details |

### Examples

```bash
emdesign ds create atelier --mode blank
emdesign ds import awesome linear --name "MyLinear"
emdesign ds import project ./my-app --name "My App DS" --gate
emdesign ds search fintech --limit 10
emdesign ds info atelier
```

---

## 3. Design System Management

| Command | Description |
|---------|-------------|
| `ds use <id>` | Switch the active design system |
| `ds update <id> [--name <name>] [--description <text>]` | Update DS metadata |
| `ds customize <id> [--color <hex>] [--font <family>] [--name <name>] [--id <new-id>] [--brand <name>] [--primary <hex>] [--secondary <hex>] [--body-font <font>] [--spacing <px>]` | Clone + customize a DS |
| `ds validate [id] [--strict] [--gate]` | Validate token contract completeness |
| `ds grade [id] [--gate] [--timeout <ms>]` | Grade DS quality against production rubric |
| `ds diff <id1> <id2>` | Compare two design systems |
| `ds conflicts [id]` | List orphan/unused token conflicts |
| `ds history [id] [--snapshot]` | Show version history / take snapshot |

### Examples

```bash
emdesign use atelier
emdesign ds customize atelier --name "MyBrand" --primary "#6366f1" --body-font "Inter" --spacing 4
emdesign ds validate atelier --strict
emdesign ds diff atelier dashboard-ui
```

---

## 4. Design System Compilation

| Command | Description |
|---------|-------------|
| `ds compile <id> [--out <dir>]` | Compile tokens → TypeScript types + CSS |
| `ds export <id> [--out <dir>]` | Export DS as npm-consumable package |
| `ds version <id> <major\|minor\|patch>` | Semantic version bump on manifest |
| `ds changelog <id> [--snapshot]` | Show or create changelog entry |

### Generated Files

```bash
ds compile atelier --out dist/
# → dist/tokens.ts    (typed token constants)
# → dist/types.ts     (category union types)
# → dist/tokens.css   (compiled CSS)

ds export atelier
# → design-systems/atelier/dist/
#   tokens.ts, types.ts, tokens.css, package.json
```

---

## 5. Design System Lint Rules

| Command | Description |
|---------|-------------|
| `ds lint-rules list [id]` | Show active rules, preset, exemptions |
| `ds lint-rules set <id> <rule> <P0\|P1\|P2\|off>` | Change a rule's severity |
| `ds lint-rules preset <id> <preset>` | Apply a named preset |

### Presets

| Preset | Rules Included |
|--------|---------------|
| `editorial` | off-token-color, accent-overuse, filler-copy, sans-display |
| `product` | off-token-color, accent-overuse, emoji-icon, invented-metric, external-image |
| `fintech` | + strict-contrast, mono-data-values, no-decorative-accent |
| `minimal` | —accent-overuse, —external-image, + strict-spacing |
| `brutalist` | —accent-overuse, + no-focus-ring |
| `a11y-strict` | All rules at P0, +contrast-min-7-1, +focus-visible-required |

---

## 6. Component Lifecycle

| Command | Description |
|---------|-------------|
| `design <comp> [instruction]` | Generate design-context prompt for AI agent |
| `ds context <comp> [instruction]` | Same as `design` (ds subcommand alias) |
| `generate <name> [--content <src>] [--source <file>] [--stdin] [--mode create\|edit] [--story <file>] [--stdin-story]` | Create/edit a component |
| `generate --batch <file.json>` | Batch-generate from JSON manifest |
| `story auto <comp>` | Auto-generate CSF stories from props |
| `capture <comp> [--baseline]` | Promote generated component → reusable |
| `capture --all [--baseline]` | Batch-capture all generated components |
| `vision <comp> [--mode standard\|compare] [--provider claude\|gemini\|minimax] [--reference <path>]` | AI vision critique |

---

## 7. Verification (Doctor)

| Kind | Command | What It Checks | Speed | Requires |
|------|---------|---------------|-------|----------|
| `lint` | `doctor lint <comp>` | Token-rule compliance | ~100ms | Source file |
| `visual` | `doctor visual <comp>` | Pixel diff vs baseline | ~2s | Storybook + baseline |
| `spatial` | `doctor spatial <comp>` | Geometry rules | ~500ms | Storybook |
| `snapshot` | `doctor snapshot <comp>` | DOM render check | ~2s | Storybook |
| `charters` | `doctor charters <comp>` | Story charter evaluation | ~100ms | Story file |
| `react` | `doctor react <comp>` | React anti-patterns | ~1s | Source file |
| `all` | `doctor all <comp> [--gate] [--timeout] [--detail] [--quiet]` | Composite gate | ~3s | Varies |

### Flags

| Flag | Effect |
|------|--------|
| `--gate` | Exit code 0 = ship, 1 = revise |
| `--timeout <ms>` | Per-command timeout guard |
| `--detail` | Show all findings with remediation |
| `--quiet` | Suppress stderr output |
| `--json` | Structured JSON result |

---

## 8. Storybook Diagnostics

| Command | Description |
|---------|-------------|
| `storybook health` | Full diagnostic: port reachability, story index count, compilation errors (Playwright browser console), @ds alias consistency, duplicate story detection, filesystem vs index comparison |
| `storybook health --verbose` | Same as above with full console log and error details |
| `storybook health --story <id>` | Same plus renders a specific story and checks for runtime errors |

### Health Status

| Status | Meaning |
|--------|---------|
| `healthy` | All checks pass — Storybook is ready |
| `degraded` | All checks pass with warnings — usable but needs attention |
| `down` | Port unreachable — Storybook is not running |

### When to Use

- Before running any `doctor visual`, `render analyze`, `spatial audit`, or `component a11y` command (they all need Storybook)
- When Storybook behaves unexpectedly (missing stories, compilation errors)
- In CI to verify the Storybook build before running visual tests

## 9. Visual & Spatial Analysis

| Command | Description |
|---------|-------------|
| `render analyze <comp> [--story <name>] [--theme light\|dark] [--out <file>]` | Headless render → semantic DOM tree + coordinates + computed styles |
| `render snapshot <comp>` | Capture render as structured JSON |
| `spatial audit <comp> [--grid] [--story <name>] [--theme light\|dark]` | Full geometry breakdown: bounding boxes, overlap detection |
| `spatial grid <comp>` | Overlay design grid, measure adherence |

---

## 9. Component Intelligence

| Command | Description |
|---------|-------------|
| `component a11y <comp> [--story <name>] [--theme light\|dark]` | Deep axe-core accessibility audit |
| `component test <comp>` | Generate vitest test file from props |
| `component diff <comp>` | Compare generated vs captured versions |

---

## 10. Composition & Screens

| Command | Description |
|---------|-------------|
| `ds block list [--tags <tags>]` | List building blocks (27 available) |
| `ds scaffold <id> --blocks <list>` | Scaffold specific blocks into a DS |
| `ds blueprint list [--category <cat>]` | List composition blueprints (14 available) |
| `ds blueprint apply <id> <target>` | Generate component from a blueprint |
| `compose <name> --components "A,B,C" [--layout stack\|grid\|sidebar]` | Compose components into a view |
| `screen create <name> [--route <path>] [--layout <layout>]` | Create a screen with routing |
| `screen list` | List all screens |

### Blueprints

| Blueprint | Composes | Use Case |
|-----------|----------|----------|
| `stat-card` | Card, Heading, Text, Badge | Dashboard metrics |
| `data-table` | Table, Pagination, Badge | Tabular data |
| `data-filters` | Input, Select, Button | Filter bars |
| `form-section` | FormField, Input, Select, Textarea | Form groups |
| `page-header` | Heading, Breadcrumb, Button | Page chrome |
| `sidebar-nav` | Stack, Text, Badge | Navigation |
| `modal-form` | Modal, FormField, Button | Dialog forms |
| `tabs-with-content` | Tabs, Stack, Card | Tabbed interfaces |
| `card-grid` | Grid, Card, Heading | Card layouts |
| `settings-page` | Tabs, FormField, Switch | Settings UI |
| `activity-feed` | Stack, Card, Text, Badge | Activity streams |
| `chart-card` | Card, Heading, Tabs | Chart containers |

---

## 11. Knowledge Graph

| Command | Description |
|---------|-------------|
| `graph build [ds-id]` | Rebuild knowledge graph from scratch |
| `graph context <node-id>` | Full node context (in/out edges, properties) |
| `graph impact <node-id>` | Blast radius — affected dependents |
| `graph where-to-fix <artifact> <finding>` | Pinpoint fix location |
| `graph guidance [name] --intent <text>` | Consistency brief for building a component |
| `graph query [--label <l>] [--from <n>] [--to <n>] [--where <json>]` | Property-filtered graph query |

---

## 12. Exploration

| Topic | Command | Output |
|-------|---------|--------|
| Overview | `explore` / `explore overview` | DS name, primitives, tokens, rules, charters, sections count |
| Design System | `explore ds` | DS details |
| Tokens | `explore tokens [name]` | All tokens by kind, optional filter |
| Primitives | `explore primitives [name]` | All primitives with props, variants, states |
| Components | `explore components [name]` | Generated + captured components |
| Hierarchy | `explore hierarchy <name>` | Composition tree |
| Rules | `explore rules` | Lint rules by severity |
| Charters | `explore charters` | Element charters |
| Sections | `explore sections` | DESIGN.md sections |
| Stats | `explore stats` | Graph node/edge counts |

All explore topics support `--json` for structured output.

### Browse Commands

| Command | Description |
|---------|-------------|
| `discover [--kind all\|generated\|components\|primitives\|ds] [--filter <text>]` | List stories, components, systems |
| `doc <target>` | Comprehensive component/story documentation |

---

## 13. Automation

| Command | Description |
|---------|-------------|
| `loop <comp> [--max-iterations <n>]` | Double-loop: build → lint → visual → gate → iterate |
| `generate --batch <file.json>` | Generate multiple components from manifest |
| `capture --all [--baseline]` | Capture all generated components |
| `doctor all --gate` | Full composite gate (CI-ready) |

### Loop Architecture

```
Round 1..N:
  Phase 1: Lint    → token compliance check (fast)
  Phase 2: Visual  → pixel diff (if Storybook available)
  Phase 3: Gate    → composite score + mustFix count
  Decision: SHIP (pass) | REVISE (iterate) | FAIL (max iterations)
```

---

## 14. Universal Flags

| Flag | Description |
|------|-------------|
| `--json` | Structured JSON output on stdout (`{ok, data, meta}`) |
| `--gate` | Exit code = pass verdict (0 = ship, 1 = fail) |
| `--quiet` | Suppress stderr messages (doctor) |
| `--trace` | Enable session tracing — creates a Claude session, logs every stage (see [Session Tracing](session-tracing.md)) |
| `--log-level <level>` | Set minimum log level (debug\|info\|warn\|error, default: info) |
| `--version`, `-V` | Show `emdesign v<version>` |
| `--completion [bash\|zsh]` | Generate shell completion script |

---

## 15. Session Tracing & Debugging

emdesign records every agent interaction, tool call, and workflow stage using
**Claude's native session storage** (`~/.claude/`). The `session` subcommand
lets you inspect sessions and logs from the CLI.

### Commands

| Command | Description |
|---------|-------------|
| `session list [--limit N] [--project <path>] [--failed]` | List recent Claude sessions |
| `session show <id>` | Show session metadata and summary |
| `session logs <id> [--tail] [--format text\|json]` | View full conversation log |
| `logs [--level <lvl>] [--session <id>] [--since <iso>] [--follow]` | Query global or per-session logs |

### Usage

```bash
# List recent sessions
emdesign session list --limit 5

# View a session's conversation
emdesign session logs em_ses_1782747366008_2h0r

# Filter logs by severity
emdesign logs --level error --since 30m

# Import with full tracing
emdesign ds import awesome stripe --trace
```

See [`docs/session-tracing.md`](session-tracing.md) for full documentation,
including the JSONL log format, event bus reference, and HTTP API endpoints.

## 16. Intent & Chat Commands

Send design intents or start agent chat sessions directly from the CLI —
same paths the Storybook addon UI uses.

### Commands

| Command | Description |
|---------|-------------|
| `intent <type> <instruction>` | Submit an intent to the backend queue (identical to UI toolbar/wizard) |
| `chat <message> --type <intent-type>` | Start an interactive chat session with SSE streaming (identical to ChatSidebar) |

### Intent Types

| Type | What it does | Agent route |
|------|-------------|-------------|
| `create-component` | New component from scratch | `/mds:craft:component` |
| `change-request` | Modify an existing component | `/mds:craft:update` |
| `create-story` | Auto-generate CSF story file | `/mds:craft:story` |
| `create-view` | Compose components into a view | `/mds:craft:view` |
| `create-design-system` | Create a new design system | `/mds:system:create` |
| `update-design-system` | Modify tokens/typography | `/mds:system:update` |
| `edit-text` | Inline text edit on an element | `/mds:craft:update` |

### Usage

```bash
# Submit an intent to the queue (non-blocking)
emdesign intent create-component "Hero card with gradient background and CTA"

# Start a chat session and stream the agent's response (blocking)
emdesign chat "Build a pricing table with 3 tiers" --type create-component --wait

# Interactive mode (stream response, then prompt for follow-up)
emdesign chat "Make the header sticky" --type change-request --interactive

# With session tracing
emdesign chat "Newsletter signup form" --type create-component --trace
```

See [`docs/session-tracing.md`](session-tracing.md) for full documentation,
including all intent types, chat modes, and the intent routing flow.
