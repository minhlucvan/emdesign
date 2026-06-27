---
name: emdesign
description: Complete design-engineering workflow using emdesign CLI. From design system creation to screen deployment — all via CLI commands. Use at the START of any project to route through the right commands.
when: At the start of a new project, when building a new component, when needing to verify/analyze an existing component, or when automating the design pipeline.
workflow: full-lifecycle
commands: [ds create, ds import, ds customize, ds compile, ds export, design, generate, doctor, doctor all, render analyze, spatial audit, component a11y, compose, screen create, loop, capture]
---

# emdesign CLI Skill — Full Lifecycle

## Purpose

This is the **CLI-native companion** to the MCP-based `/mds:*` skills. While the `/mds:*` commands drive an agent-in-the-loop workflow via MCP tools, the CLI commands give you direct, scriptable, composable access to the same capabilities. Use this skill when:

- You're working in a headless/CI environment without Storybook panel
- You want to script multi-step workflows
- You need precise control over each step (as opposed to the opinionated `/mds:*` loop)
- You're building automation pipelines

## Workflow Map

```
Phase 1: Foundation          → DS discovery, import, creation, customization
         ↓
Phase 2: Compilation         → Token → TypeScript, validate, export
         ↓
Phase 3: Component Build     → Design context, generate, stories
         ↓
Phase 4: Verification        → Lint, visual, spatial, a11y, all (gate)
         ↓
Phase 5: Deep Analysis       → Render analyze, spatial audit, vision
         ↓
Phase 6: Composition         → Blueprints, compose views, create screens
         ↓
Phase 7: Automation          → Loop, batch generate, batch capture
```

## Phase-by-Phase

### Phase 1: Foundation — Design System Setup

```bash
# 1. Discover what's available
emdesign ds search "fintech dashboard"
emdesign ds info atelier

# 2. Import or create
emdesign ds import awesome linear --name "MyLinear"
emdesign ds create my-brand --mode blank

# 3. Customize tokens
emdesign ds customize atelier --name "MyBrand" --primary "#6366f1" --body-font "Inter"

# 4. Switch to active
emdesign use my-brand
```

### Phase 2: Compilation — Production-Ready Tokens

```bash
# 1. Validate contract
emdesign ds validate my-brand --strict

# 2. Compile to TypeScript
emdesign ds compile my-brand --out dist/tokens

# 3. Version and export
emdesign ds version my-brand minor
emdesign ds export my-brand
```

### Phase 3: Component Build

```bash
# 1. Get design context (for AI agents)
emdesign ds context StatsCard "A stats card with trend indicator"

# 2. Generate the component
emdesign generate StatsCard --source ./StatsCard.tsx --story ./StatsCard.stories.tsx

# 3. Auto-generate stories from props
emdesign story auto StatsCard
```

### Phase 4: Verification — Cascade Fast → Slow

```bash
# Pre-check: is Storybook healthy?
emdesign storybook health

# Fastest: token lint
emdesign doctor lint StatsCard

# Medium: visual diff (needs Storybook)
emdesign doctor visual StatsCard

# Slower: full composite gate
emdesign doctor all StatsCard --gate
```

### Phase 5: Deep Analysis

```bash
# Render analysis — see the DOM tree
emdesign render analyze StatsCard

# Spatial audit — detect overlaps
emdesign spatial audit StatsCard --grid

# Accessibility audit
emdesign component a11y StatsCard

# AI vision critique
emdesign vision StatsCard
```

### Phase 6: Composition

```bash
# List and apply blueprints
emdesign ds blueprint list
emdesign ds blueprint apply stat-card RevenueMetric

# Compose components into a view
emdesign compose Dashboard --components "Sidebar,Header,StatsGrid,DataTable" --layout sidebar

# Create a screen
emdesign screen create Dashboard --route /dashboard
```

### Phase 7: Automation

```bash
# Batch generate multiple components
emdesign generate --batch manifest.json

# Double-loop verify
emdesign loop StatsCard --max-iterations 5

# Batch capture all that pass
emdesign capture --all --baseline

# CI-ready gate
emdesign doctor all StatsCard --gate
```

## Which Interface to Use

| Situation | Use CLI | Use MCP (`/mds:*`) |
|-----------|---------|-------------------|
| Quick verification | ✅ `doctor lint` | ❌ |
| Full design loop with critique | ❌ | ✅ `/mds:craft:component` |
| CI/CD pipeline | ✅ `doctor all --gate` | ❌ |
| Batch operations | ✅ `generate --batch` | ❌ |
| Human-in-the-loop review | ❌ | ✅ `/mds:review` |
| Headless server environment | ✅ CLI commands | ❌ |
| Storybook panel integration | ❌ | ✅ `/mds:inbox` |
| Token compilation | ✅ `ds compile` | ❌ |
| Screenshot-based critique | ❌ | ✅ `/mds:vision` |
| Automated loop | ✅ `loop` | ✅ `/mds:craft:component` |

## Reference

For a complete command reference, see `cli-reference.md` in the workspace's `.claude/` directory or run `emdesign help`.

For the MCP-based workflow (agent-in-the-loop with human review), see the `/mds:*` skills in `.claude/skills/`.
