# Design — inital-spec-for-the-project

## Context

This document records the architectural decisions and system design of **emdesign**, a design-engineering engine that drives Storybook as its front end, backed by an MCP tool surface, a knowledge graph, and a four-source critique gate.

## Design decisions

### D1. Token binding, never raw values

All generated components reference semantic role classes (`bg-surface`, `text-accent`, `rounded`) instead of raw hex colors, font stacks, or spacing values. The Tailwind config maps these to CSS custom properties from the active design system's `tokens.css`. This means swapping the design system re-skins every component without code changes.

**Rationale**: The primary goal is design-system fidelity. Raw values drift; tokens enforce a single source of truth. This also makes the consistency lint simple — any `<color>` or `border-` value that doesn't match a declared token is a P0 violation.

### D2. Property graph as the design-system knowledge layer

A labeled property graph (`packages/graph/`) encodes every entity (token, primitive, color, theme, rule, file, section, story, artifact) and its relationships (`uses`, `composes`, `tokenValue`, `violates`, `declaredIn`). The graph is built deterministically from code + metadata, never by the LLM.

**Rationale**: A design system is deeply relational. Flat text can't answer "what breaks if I change `--color-accent`?" The graph makes these queries natural and deterministic. Provenance is universal — every node resolves to an exact `file:line`.

### D3. Dual-gate critique with ratchet

Components pass only when all three conditions hold: `composite ≥ threshold`, `mustFix === 0`, and `composite ≥ baseline`. The composite is a weighted mean over present scores (tokens, visual, vision, LLM, a11y). The ratchet means quality never regresses across iterations.

**Rationale**: A high average shouldn't override a blocking issue (P0 lint, failed build, P0 vision finding). The ratchet prevents oscillation where a component barely passes on one iteration then regresses on the next. The weights are configurable per-project.

### D4. Framework-agnostic core with pluggable adapters

The engine (server, lint, visual test, graph, critique) is framework-blind. Only the `FrameworkAdapter` interface is per-framework:
- `codegenInstructions` — generation rules
- `lint` — framework-specific consistency rules
- `storyTemplate` — CSF story format
- `parsesCode` — whether AST-based graph parsing is implemented

**Rationale**: The visual test, vision critique, graph token layer, addon, and gate are renderer-agnostic — they all work through the Storybook iframe. This means adding a new framework (Vue, Svelte, Web Components) requires only the adapter, not re-implementing the engine.

### D5. Four-source feedback, one deterministic gate

The critique gate weighs four independent feedback sources:

| Source | How it's produced | What it scores |
|---|---|---|
| **Rule** | `lint_consistency` + token self-check | Token usage, anti-pattern violations |
| **Visual** | Playwright screenshot vs baseline (pixelmatch) | Visual regression |
| **Vision** | Subagent reads the screenshot | Hierarchy, balance, rhythm, on-brand, polish |
| **LLM** | Subagent reads code + spec + DESIGN.md | Composition, API, semantics, intent, voice |

**Rationale**: Each source catches what the others miss. Lint catches hard errors but can't judge aesthetics. Vision catches layout issues but can't verify token binding. The composite score is more robust than any single signal.

### D6. MCP-first tool surface

The backend exposes its capabilities as MCP tools (`get_design_context`, `create_component`, `edit_component`, `lint_consistency`, `run_visual_test`, `capture_reusable_component`, `critique_score`, `graph_*`, etc.), with an HTTP bridge (`/api/*`) for the Storybook addon.

**Rationale**: MCP is the natural protocol for AI tool use — the agent calls tools directly, receives structured results, and can loop on them. The HTTP bridge exists only for the browser-based addon which can't use MCP directly.

### D7. Generated vs captured separation

Components start in `src/generated/` (ephemeral, auto-overwritten) and move to `src/components/` only on explicit Capture. The capture step promotes the component, records evidence, rebuilds the graph, and commits the result.

**Rationale**: Generated components are intermediate artifacts — they may be revised multiple times in the agent loop. Captured components are production code. The separation prevents accidental loss of hand-tuned changes and gates quality before components enter the tracked codebase.

## System architecture

```
                          ┌──────────────────────────────────────────────┐
                          │  Storybook (FRONT END)  apps/workspace-react  │
    user ───change req──▶  │  • renders generated CSF stories (live, HMR) │
                          │  • @emdesign/addon panel: chat · capture · diff│
                          └───────▲───────────────────────┬────────────────┘
                           HTTP   │ /api/state             │ change requests
                           bridge │                        ▼
                          ┌───────┴────────────────────────────────────────┐
                          │  emdesign Studio backend  packages/backend      │
                          │  ┌─────────────┐  ┌──────────────┐  ┌─────────┐ │
    agent (Claude Code) ─▶│  │ MCP server  │  │ prompt       │  │ harness │ │
                          │  │ (tools)     │  │ composer     │  │ (CLIs)  │ │
                          │  └─────┬───────┘  └──────┬───────┘  └─────────┘ │
                          │        │ get_design_context │                    │
                          │  ┌─────▼──────┐  ┌─────────▼───────┐  ┌────────┐ │
                          │  │ design-sys │  │ consistency lint│  │ visual │ │
                          │  │ resolver   │  │ + token check   │  │ test   │ │
                          │  └─────┬──────┘  └─────────────────┘  └───┬────┘ │
                          │        │ critique/scoreboard (gate)       │       │
                          └────────┼──────────────────────────────────┼───────┘
                                   ▼                                  ▼
                          design-systems/<id>/            apps/workspace-react/src/generated/
                          DESIGN.md · tokens.css · code/   <Name>.tsx + <Name>.stories.tsx
                                                           → capture → src/components/<Name>/
```

## Package map

| Package | Path | Role |
|---|---|---|
| `@emdesign/backend` | `packages/backend/` | Engine: MCP tools, lint, visual test, critique, graph builder, design context, capture, HTTP bridge |
| `@emdesign/cli` | `packages/cli/` | CLI client (`emdesign`): serve, MCP, ds, graph, design-context, lint, visual-test, etc. |
| `@emdesign/graph` | `packages/graph/` | Labeled property graph of a design system |
| `@emdesign/addon` | `packages/addon/` | Storybook addon panel (chat, capture, visual diff) |
| `@emdesign/dsr` | `packages/dsr/` | Shared token roles / primitives |
| `@emdesign/workspace` | `apps/workspace/` | Abstract workspace core: init/attach installer, template, config schema, framework registry |
| `@emdesign/workspace-react` | `apps/workspace-react/` | React/Tailwind provider: Storybook + Tailwind dogfood instance + init template source |

## Key data flows

1. **Agent-driven component build**: Agent calls `get_design_context` → receives DESIGN.md + tokens + primitives → calls `create_component` → server writes generated files + runs lint → agent calls `run_visual_test` → scores route through critique gate → loop or ship

2. **Design system switch**: `/mds:system:use <id>` → rebind tokens.css → rewrite `.emdesign/active-ds` → rebuild graph → restart Storybook → all components re-skin via Tailwind custom properties

3. **Knowledge graph query**: Agent calls `graph_consistency_brief` → server traverses primitives/tokens/rules/theme from graph.json → returns structured brief → agent builds against it

4. **Critique gate**: `critique_score` receives scores from all four sources → computes weighted composite → checks mustFix === 0 → checks ratchet → returns 'ship' or 'continue' + file:line fix guidance
