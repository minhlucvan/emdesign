# CLI Feedback V2 — Production-Grade Design System & UI Tool

> Date: 2026-06-27
> Inspired by: `docs/research/broken-fe-loop.md` — "Stronger models alone won't solve the frontend bottleneck"
> Builds on: V1 CLI Feedback (see `CLI-FEEDBACK.md`)

---

## 0. Vision

The emdesign CLI should be the **control plane for production design engineering** — a tool that doesn't just scaffold components but orchestrates the full lifecycle of complex, multi-screen applications with enterprise-grade design systems. It turns visual guesswork into deterministic math, constrains agents to typed design system compilers, and runs a double-loop of Builder + Inspector until quality gates pass. A developer (or AI agent) should be able to go from `emdesign init` to a deployed, multi-screen, token-bound, accessibility-audited application in one session.

---

## 1. The Four Pillars (from broken-fe-loop.md)

The `broken-fe-loop.md` document identifies four fundamental shifts needed. Here's how the CLI embodies each:

### Pillar 1: Real-Time Headless Rendering & Semantic DOM Trees

**Problem:** VLMs looking at screenshots is slow, expensive, and imprecise. An agent can't tell if something is "4px off" from a screenshot.

**CLI Commands:**

```
emdesign render analyze <component>     # Headless render → semantic DOM tree + coordinate grid
emdesign render snapshot <component>    # Capture render as structured JSON (not a PNG)
emdesign layout audit <component>       # Spatial metrics: alignment, spacing, overlap, contrast
emdesign layout grid <component>        # Overlay the design grid, measure adherence
emdesign layout diff <a> <b>            # Structural diff of two layout snapshots
```

**How it works:**
- Headless Playwright renders the component
- A semantic tree extractor walks the DOM and produces a coordinate grid: `{ tag, className, rect: {x,y,w,h}, children }`
- Spatial metrics are computed deterministically: `Component A overlaps B by 4px`, `Contrast ratio 2.1:1 FAIL`
- The agent gets precise numbers, not blurry screenshots
- This already partially exists in `packages/backend/src/spatial.ts` — needs to be surfaced to CLI

**What exists today:** `packages/backend/src/spatial.ts` (basic geometry audit), `visualTest.ts` (Playwright rendering), `doctor visual` (pixelmatch diff). These are the building blocks — they need to be unified and exposed as proper CLI commands with structured output.

#### Design Principle: `doctor` Is the Gate — Specialized Commands Are the Diagnostic

A key architectural decision: **`doctor` stays as the fast, unified gate**, while specialized commands provide deep diagnostic capability.

| Level | Command | Purpose | Speed | Output |
|-------|---------|---------|-------|--------|
| **Gate** | `doctor lint <comp>` | Token-rule compliance | ~100ms | pass/fail score |
| **Gate** | `doctor visual <comp>` | Pixel diff vs baseline | ~2s | diff % + pass/fail |
| **Gate** | `doctor spatial <comp>` | Geometry rules | ~500ms | score + violation count |
| **Gate** | `doctor all <comp> --gate` | Aggregate ship decision | ~3s | ship/revise/continue |
| **Diagnostic** | `spatial audit <comp>` | Full geometry breakdown | ~1s | bounding boxes, overlap px, grid adherence |
| **Diagnostic** | `component a11y <comp>` | Deep axe-core audit | ~5s | violation tree with element selectors |
| **Diagnostic** | `render analyze <comp>` | Semantic DOM tree | ~2s | coordinate grid + computed styles |
| **Generative** | `component test <comp>` | Test generation + run | ~10s | test file + pass/fail |
| **Generative** | `story auto <comp>` | Story generation | ~3s | CSF file |
| **Automation** | `loop <comp>` | Double-loop until pass | variable | gate result + evidence |

The rule of thumb:
- If a check returns a **numeric score** (0-1) and fits in the composite gate → a `doctor` kind
- If it returns **structured data** (DOM tree, violation tree, coordinate grid) → a dedicated command
- If it **generates code** (tests, stories) → a dedicated command
- If it **runs a loop** (build → check → fix) → a dedicated command

This keeps `doctor` fast, predictable, and machine-friendly while specialized commands provide the rich output humans (and AI agents) need for debugging.

### Pillar 2: Design System Compilers

**Problem:** Agents writing raw Tailwind/CSS creates infinite surface area for bugs. Every component can invent new visual values.

**CLI Commands:**

```
emdesign ds compile <id>                # Compile tokens → TypeScript types + CSS + docs
emdesign ds typegen <id>                # Generate typed token exports (TokenColor, TokenSpacing, etc.)
emdesign ds validate --strict <id>      # Strict mode: every component must use compiled tokens only
emdesign ds version <id>                # Semantic version bump for the design system
emdesign ds changelog <id>              # Auto-generate changelog from snapshot history
emdesign ds export <id>                 # Export as a consumable npm package
emdesign ds template <id>               # Create reusable DS template from existing system
```

**How it works:**
- `ds compile` reads DESIGN.md + tokens.css + manifest.json and produces:
  - `dist/tokens.ts` — typed exports: `export const ColorSurface = '--color-surface' as const`
  - `dist/tokens.css` — the compiled CSS
  - `dist/types.ts` — TypeScript types for every token category
  - `dist/DESIGN.md` — formatted documentation
- `ds validate --strict` ensures generated components import from the compiled types, not raw strings
- Agents can't invent `bg-[#abc123]` — they must reference `TokenColor.Surface` which is typed

**What exists today:** `tokens.css` with CSS custom properties, `SEMANTIC_TOKEN_ROLES` in `@emdesign/dsr`, `validateDesignSystem()` in scaffold.ts. No type generation or compilation exists.

### Pillar 3: Double-Loop Execution (Dual-Agent Architecture)

**Problem:** Single-agent loops conflate building and checking. A builder shouldn't also be the inspector.

**CLI Commands:**

```
emdesign watch <component>              # Continuous: build → render → inspect → report
emdesign agent builder <component>      # Spawn a Builder sub-agent
emdesign agent inspector <component>    # Spawn a Visual Inspector sub-agent
emdesign loop <component>               # Full double-loop until gate passes
```

**How it works:**
- `agent builder` spawns an agent focused only on component composition, state mapping, and prop passing
- `agent inspector` spawns a fast vision model whose only job is to diff the expected design against the generated output
- `loop` orchestrates: Builder produces → Inspector validates → feedback to Builder → repeat until gate passes
- `watch` runs this continuously on file changes, like a test runner in watch mode

```
┌─────────────────┐     component + props     ┌─────────────────┐
│  Builder Agent  │ ─────────────────────────→ │  Inspector      │
│  (composition)  │ ←────────────────────────  │  (VLM + rules)  │
└─────────────────┘    layout telemetry +       └─────────────────┘
                        violation report
```

**What exists today:** `@emdesign/session` (AgentRunner + SessionManager) can spawn agents. `@emdesign/vision-critic` can do VLM analysis. `doctor` provides rule checks. These need to be wired into a loop.

### Pillar 4: Uniform Code Pipelines (AST-Based Layout)

**Problem:** Translation from design tools → code is lossy. Agents guess at layout intent from flat images.

**CLI Commands:**

```
emdesign import figma <file>             # Import Figma file → tokens + component tree + layout
emdesign import image <file>             # Import reference image → DS extraction
emdesign import url <url>                # Import from URL → screenshot + extraction
emdesign layout snapshot <component>     # Capture the semantic layout AST
emdesign layout diff <a> <b>             # Compare two layout ASTs structurally
```

**How it works:**
- Import produces a deterministic AST: a tree of `{ type: 'Stack' | 'Grid' | 'Box', props, children }`
- The AST is parametric: it uses design tokens, not absolute values
- `layout snapshot` captures the rendered component's DOM as a semantic tree
- `layout diff` compares two snapshots structurally: `Node 3 changed from Stack(direction=row) to Stack(direction=col)`

**What exists today:** Nothing for Figma import. The `explore hierarchy` command does something similar for existing components.

---

## 2. Production-Grade Command Catalog

Complete proposed command surface:

### Design System (Advanced)

| Command | Purpose | Priority |
|---------|---------|----------|
| `ds compile <id>` | Compile tokens → TypeScript types + CSS + docs | 🔴 P0 |
| `ds typegen <id>` | Generate typed token exports | 🔴 P0 |
| `ds validate --strict <id>` | Strict token-only enforcement | 🔴 P0 |
| `ds version <id> <major\|minor\|patch>` | Semantic version bump | 🟡 P2 |
| `ds changelog <id>` | Auto-generate changelog | 🟡 P2 |
| `ds export <id>` | Export as npm package | 🔴 P0 |
| `ds template create <id> --from <ds>` | Create reusable DS template | 🟡 P1 |
| `ds template list` | List available DS templates | 🟢 P3 |

### Multi-Screen / Multi-Page

| Command | Purpose | Priority |
|---------|---------|----------|
| `screen create <name> --route <path>` | Create screen with routing | 🔴 P0 |
| `screen list` | List all screens | 🟡 P2 |
| `screen tree` | Visualize routing hierarchy | 🟡 P2 |
| `layout create <name> --type sidebar\|topnav\|blank` | Create app layout | 🔴 P0 |
| `layout snapshot <screen>` | Capture semantic layout AST | 🟡 P1 |
| `layout diff <screen-a> <screen-b>` | Structural layout comparison | 🟡 P1 |
| `router add <path> --component <comp>` | Add route | 🟡 P1 |
| `router tree` | Visualize route structure | 🟢 P3 |

### Component Intelligence

All of these are **diagnostic/generative commands** — they go beyond `doctor`'s pass/fail gate to provide rich output.

| Command | Purpose | Relationship to `doctor` | Priority |
|---------|---------|-------------------------|----------|
| `component test <comp> --runner vitest` | **Diagnostic:** generate + run component tests | Completely new — generative | 🔴 P0 |
| `component a11y <comp>` | **Diagnostic:** deep axe-core audit with violation tree | Enriched version of potential `doctor a11y` kind | 🔴 P0 |
| `component perf <comp>` | **Diagnostic:** render performance profiling | Completely new | 🟡 P1 |
| `component diff <comp> <rev>` | **Diagnostic:** structural diff across versions | Completely new | 🟡 P1 |
| `component history <comp>` | **Diagnostic:** version history | Completely new | 🟡 P2 |
| `story auto <comp>` | **Generative:** exhaustive story generation from props | Completely new — generative | 🔴 P0 |
| `template create <name> --kind` | **Generative:** reusable component patterns | Completely new | 🟡 P1 |
| `template use <name> <target>` | **Generative:** instantiate a template | Completely new | 🟡 P1 |

### Visual / Spatial Quality

| Command | Purpose | Relationship to `doctor` | Priority |
|---------|---------|-------------------------|----------|
| `doctor lint <comp>` | **Gate:** token-rule compliance (fast) | Core doctor kind | 🔴 P0 |
| `doctor visual <comp>` | **Gate:** pixel diff vs baseline | Core doctor kind | 🔴 P0 |
| `doctor spatial <comp>` | **Gate:** fast geometry rules | Core doctor kind | 🔴 P0 |
| `doctor snapshot <comp>` | **Gate:** DOM render check | Core doctor kind | 🟡 P1 |
| `doctor charters <comp>` | **Gate:** story charter evaluation | Core doctor kind | 🟡 P1 |
| `doctor react <comp>` | **Gate:** React anti-patterns | Plugin doctor kind | 🟡 P1 |
| `doctor a11y <comp>` (new kind) | **Gate:** fast a11y rule check | New doctor kind (fast rules only) | 🔴 P0 |
| `spatial audit <comp>` | **Diagnostic:** full geometry breakdown (bounding boxes, overlap px, grid) | Enriched output from same engine | 🔴 P0 |
| `spatial grid <comp>` | **Diagnostic:** overlay design grid, measure adherence | Dedicated spatial sub-command | 🟡 P1 |
| `render analyze <comp>` | **Diagnostic:** headless render → semantic DOM tree + computed coordinates | Completely new — no doctor equivalent | 🔴 P0 |
| `render snapshot <comp>` | **Diagnostic:** capture render as structured JSON | Completely new | 🟡 P1 |
| `component a11y <comp>` | **Diagnostic:** deep axe-core audit with violation tree | Expanded version of doctor a11y kind | 🔴 P0 |

### Agent / Workflow

| Command | Purpose | Priority |
|---------|---------|----------|
| `agent builder <comp> --instruction <text>` | Spawn Builder agent | 🟡 P1 |
| `agent inspector <comp> --reference <path>` | Spawn Visual Inspector agent | 🟡 P1 |
| `watch <comp>` | Continuous build→render→inspect loop | 🟡 P1 |
| `loop <comp>` | Full double-loop until gate passes | 🔴 P0 |

### Batch / Pipeline

| Command | Purpose | Priority |
|---------|---------|----------|
| `batch build <manifest.json>` | Build multiple components from spec | 🔴 P0 |
| `batch test <glob>` | Test multiple components in parallel | 🟡 P1 |
| `batch capture <glob>` | Capture multiple components | 🟡 P1 |
| `pipeline run <file.yml>` | Run a multi-step pipeline | 🟡 P2 |

### Theme / Multi-Brand

| Command | Purpose | Priority |
|---------|---------|----------|
| `theme create <id> --from <ds>` | Create theme variant | 🟡 P1 |
| `theme use <id>` | Switch active theme | 🟡 P1 |
| `theme list` | List themes | 🟢 P3 |
| `theme diff <a> <b>` | Compare theme token overrides | 🟡 P2 |

### Design Import

| Command | Purpose | Priority |
|---------|---------|----------|
| `import figma <key>` | Import Figma file → tokens + components | 🟡 P1 |
| `import image <file>` | Extract DS from reference image | 🟡 P2 |
| `import url <url>` | Screenshot + extract from URL | 🟢 P3 |

---

## 3. Architecture Sketches

### 3.1 Layout Engine (render analyze)

```
emdesign render analyze StatsCard
```

1. Headless Playwright renders the component at a viewport
2. A custom script walks the rendered DOM and extracts:
   ```json
   {
     "tree": [
       {
         "tag": "div",
         "rect": { "x": 0, "y": 0, "w": 380, "h": 140 },
         "className": "bg-surface-raised border border-border rounded p-5",
         "computedStyle": { "backgroundColor": "#ffffff", ... },
         "children": [
           { "tag": "p", "rect": { "x": 20, "y": 20, "w": 340, "h": 16 }, "text": "Total Revenue" },
           { "tag": "p", "rect": { "x": 20, "y": 44, "w": 340, "h": 35 }, "text": "$48,250" },
           { "tag": "p", "rect": { "x": 20, "y": 92, "w": 340, "h": 20 }, "text": "↑ 12.5% from last month" }
         ]
       }
     ],
     "metrics": {
       "internalPadding": 20,
       "childSpacing": 8,
       "borderRadius": 8,
       "contrastRatios": { "label/bg": 8.5, "value/bg": 12.1, "trend/success": 4.8 }
     },
     "violations": [
       { "type": "insufficient-contrast", "severity": "P1", "message": "Trend text (#16a34a) on white bg: ratio 4.8 (needs 7:1 for small text)" }
     ]
   }
   ```

**Implementation approach:**
```
packages/layout-engine/
  src/
    renderer.ts        — Playwright headless render
    tree-extractor.ts  — DOM → semantic tree walker
    metrics.ts         — Spatial/contrast computation
    grid-matcher.ts    — Grid overlay measurement
    diff.ts            — Structural tree diff
    cli.ts             — CLI surface
```

**Reuses from today:** `playwright` already in deps, `visualTest.ts` already does headless rendering.

### 3.2 Design System Compiler (ds compile)

```
emdesign ds compile dashboard-ui
```

1. Reads `design-systems/dashboard-ui/tokens.css` → parses all `--token-name: value` pairs
2. Groups tokens by category (color, type, spacing, etc.)
3. Generates:

**`dist/tokens.ts`** — typed token exports:
```typescript
// Auto-generated by emdesign ds compile. Do not edit.
export const Token = {
  ColorSurface: '--color-surface' as const,
  ColorSurfaceRaised: '--color-surface-raised' as const,
  ColorText: '--color-text' as const,
  // ...
} as const;

export type TokenKey = keyof typeof Token;
export type TokenValue = (typeof Token)[keyof typeof Token];

export const ColorTokens = ['--color-surface', '--color-surface-raised', '--color-text', /* ... */] as const;
export type ColorToken = (typeof ColorTokens)[number];
```

**`dist/tokens.css`** — compiled (same as source, validated):
```css
:root { /* validated and compiled */ }
```

**`dist/types.ts`** — TypeScript utility types:
```typescript
export type SpacingScale = 2 | 4 | 8 | 12 | 16 | 20 | 24 | 32 | 40 | 48 | 64 | 80;
export type ColorRole = 'surface' | 'surface-raised' | 'surface-dark' | /* ... */;
export type FontFamily = 'sans' | 'mono';
```

**Implementation approach:**
```
packages/ds-compiler/
  src/
    parser.ts       — Read tokens.css + manifest.json
    token-types.ts  — Generate TypeScript types
    css-gen.ts      — Generate compiled CSS
    docs-gen.ts     — Generate documentation
    export.ts       — Package for npm
```

**Reuses from today:** `parseDeclaredTokens()` in `designContext.ts`, `SEMANTIC_TOKEN_ROLES` in `@emdesign/dsr`.

### 3.3 Double-Loop Architecture (watch/loop)

```
emdesign loop StatsCard
```

1. **Phase 1: Build** → Builder agent receives design context (`ds context`) + writes component
2. **Phase 2: Lint** → `doctor lint` (fast, deterministic)
3. **Phase 3: Render** → `render analyze` (headless → semantic tree)
4. **Phase 4: Spatial** → `spatial audit` (geometry, contrast, grid)
5. **Phase 5: Visual** → `doctor visual` (pixel diff, if baseline exists)
6. **Phase 6: Gate** → composite score + mustFix count → pass/fail
7. **Phase 7: Iterate** → feedback → Builder → repeat from Phase 1

```
┌─────────────────────────────────────────────────────┐
│ loop StatsCard                                      │
│                                                     │
│  ┌──────────┐   ┌───────┐   ┌────────┐   ┌───────┐ │
│  │ Builder  │ → │ Lint  │ → │ Render │ → │ Gate  │ │
│  │ (agent)  │   │ (rule) │   │ (spatial)│  │ (score)│ │
│  └──────────┘   └───────┘   └────────┘   └───────┘ │
│       ↑                             │               │
│       └───── revise ────────────────┘               │
│                                                     │
│  Decision: SHIP | REVISE | FAIL                     │
└─────────────────────────────────────────────────────┘
```

**Implementation approach:**
```
packages/double-loop/
  src/
    orchestrator.ts  — Phase sequencing + state machine
    builder.ts       — Agent spawning for build phase
    inspector.ts     — Multi-source inspection coordinator
    gater.ts         — Composite scoring + iteration logic
    watcher.ts       — File watch mode
```

**Reuses from today:** `@emdesign/session` (AgentRunner), `@emdesign/backend` (lint, visual test), `@emdesign/vision-critic`.

### 3.4 Screen / Router System

```
emdesign screen create Dashboard --route /dashboard
```

1. Creates a screen directory: `src/screens/Dashboard/`
2. Generates a screen component with layout + routing metadata
3. Updates the router configuration
4. Registers the screen in a manifest

```
src/screens/
  Dashboard/
    Dashboard.tsx         — Screen component (composes layout + content)
    Dashboard.stories.tsx — Story for the screen
    Dashboard.state.ts    — State model / data fetching spec
    page.json             — Metadata (route, title, layout, auth)
```

**Implementation approach:**
```
packages/router/
  src/
    screen.ts     — Screen CRUD
    layout.ts     — Layout management
    manifest.ts   — Screen manifest
    generator.ts  — Code generation
```

---

## 4. Implementation Roadmap

### Phase 1: Foundation (Now)

Build on what exists. These are mostly surfacing existing backend capabilities to the CLI.

| # | Feature | Existing Infra | New Work |
|---|---------|---------------|----------|
| 1 | `spatial audit` | `packages/backend/src/spatial.ts` | CLI surface + --json |
| 2 | `component a11y` | Playwright + axe-core | New package `plugin-a11y` |
| 3 | `story auto` | CSF parsing in `storybook.ts` | Prop introspection → story gen |
| 4 | `component diff` | Graph `findAffected()` | Version tracking in store |
| 5 | `component test` | None | Vitest template generation |
| 6 | `batch build/capture` | `generate --batch` exists | Extend to `capture --batch` |
| 7 | `ds compile --types` | `parseDeclaredTokens()` | Type generation |

### Phase 2: Growth (Next)

| # | Feature | Depends On | Effort |
|---|---------|-----------|--------|
| 1 | `render analyze` | Phase 1 spatial | Medium (new package) |
| 2 | `layout audit/diff` | render analyze | Medium |
| 3 | `ds validate --strict` | Phase 1 types | Small (flag addition) |
| 4 | `theme create/use` | DS versioning | Medium |
| 5 | `template system` | None | Medium |
| 6 | `screen create` | Layout system | Large |

### Phase 3: Advanced (Future)

| # | Feature | Depends On | Effort |
|---|---------|-----------|--------|
| 1 | `loop` (double-loop) | agent builder + inspector | Large |
| 2 | `watch` (continuous) | loop | Medium |
| 3 | `import figma` | Figma API integration | Large |
| 4 | `import image` | Vision extraction | Very Large |
| 5 | `ds export` (npm) | ds compile | Medium |

---

## 5. What This Unlocks

With the V2 CLI, an agent workflow for a production app would look like:

```bash
# 1. Project setup
emdesign init react-tailwind
emdesign ds create app-ui --mode blank
emdesign use app-ui

# 2. Design system compilation (new)
emdesign ds compile app-ui           # → typed tokens
emdesign ds validate --strict app-ui # → every component must use compiled tokens

# 3. Layout scaffold (new)
emdesign layout create AppLayout --type sidebar
emdesign screen create Dashboard --route /dashboard --layout AppLayout
emdesign screen create Settings --route /settings --layout AppLayout
emdesign screen create Reports --route /reports --layout AppLayout
emdesign router tree                # → see the full routing hierarchy

# 4. Build components with spatial quality (new)
emdesign ds context DataTable "Sortable table with pagination, column resize, row selection"
emdesign generate DataTable --source ./DataTable.tsx
emdesign spatial audit DataTable     # → "Column headers misaligned by 2px at breakpoint 768px"
emdesign component a11y DataTable    # → "Sort buttons missing aria-sort attribute"
emdesign component test DataTable    # → generates vitest tests
emdesign story auto DataTable        # → generates all variant stories from prop types
emdesign loop DataTable              # → full double-loop until gate passes

# 5. Batch operations (new)
emdesign batch build dashboard-manifest.json  # builds all components in parallel
emdesign batch capture "src/generated/*.tsx"   # captures all that pass

# 6. Rollout with impact analysis (new)
emdesign rollout plan DataTable       # → "3 screens use DataTable, 1 test will break"
emdesign rollout execute plan-001     # → applies changes, runs tests, updates screens
emdesign rollout status               # → "plan-001: 3/3 screens updated, all passing"

# 7. Multi-theme (new)
emdesign theme create dark --from app-ui
emdesign theme diff app-ui dark       # → shows token-level differences
emdesign theme use dark
```

---

## 6. Summary: V1 → V2 Evolution

| Dimension | V1 (Current) | V2 (Proposed) |
|-----------|-------------|---------------|
| **Scope** | Single component at a time | Multi-screen, multi-component |
| **Quality** | Lint + visual diff (subjective) | Spatial + a11y + perf (deterministic) |
| **Tokens** | CSS custom properties | Compiled TypeScript types |
| **Design system** | Static files | Versioned, compiled, exportable |
| **Agent loop** | Manual per-command | Automated double-loop |
| **Layout** | Free-form CSS/Tailwind | Constrained by token compiler |
| **Screens** | Not supported | First-class screen/router model |
| **Batch** | One at a time | Batch operations |
| **Theme** | Single theme | Multi-theme with diff |
| **Import** | None | Figma, image, URL |
| **Testing** | Visual only | Unit + a11y + perf + visual |
| **Rollout** | None | Planned with impact analysis |

---

## Appendix: Existing Infrastructure That Can Be Leveraged

| Capability | Where It Lives Today | What's Missing |
|-----------|---------------------|----------------|
| **Headless rendering** | `packages/backend/src/visualTest.ts` (Playwright) | Semantic tree extraction |
| **Spatial audit** | `packages/backend/src/spatial.ts` — geometry checks with `SpatialFinding` (overlap/overflow/alignment measurements), scoring formula, integrated with DSR charters | Standalone CLI command with rich `--json` output |
| **Geometry charters (7)** | `packages/dsr/src/charters/geometry/` — `no-overlap`, `no-child-overflow`, `minimum-gap`, `z-index-collision`, `no-viewport-overflow`, `alignment`, `aspect-ratio` | CLI surface to run them individually |
| **Vision critique** | `packages/vision-critic/` — multi-model (Claude/Gemini/MiniMax), 5-axis scoring (hierarchy/balance/spacing/onBrand/polish), reference comparison, context builder | Integration into double-loop |
| **Knowledge graph** | `packages/graph/` — labeled property graph with 20+ node types, 20+ edge types, BFS traversal, query API, `findAffected()`, `whereToFix()`, `consistencyBrief()`, `getContext()` | Needs artifact persistence for generated components |
| **Token contract** | `packages/dsr/src/domain/values.ts` — `SEMANTIC_TOKEN_ROLES` (11 required), `validateDesignSystem()` in scaffold.ts | Type generation, compilation, strict mode |
| **Lint rules (13)** | `packages/dsr/src/rules/lint.ts` + `packages/graph/src/rules.ts` — `off-token-color`, `unresolved-token`, `ai-default-indigo`, `purple-gradient`, `trust-gradient`, `emoji-icon`, `left-accent-card`, `sans-display`, `invented-metric`, `filler-copy`, `external-image`, `accent-overuse`, `sans-display` | More spatial/a11y rules |
| **DS linting (doctor)** | `packages/doctor/src/` — 13 production-readiness rules (`token-contract`, `sections`, `type-scale`, `color-roles`, `components-specced`, `token-richness`, `theming`, `doc-depth`, `motion`, `craft-contract`, `conflicts`, `anti-slop`, `primitives`), grade A-F, DS-level `gradeDesignSystem()` in backend | Per-component strict mode |
| **A11y (rendered rules)** | `packages/plugin-core/src/rules/a11y/` — 3 rules: `core-a11y-focus-visible` (focus indicators), `core-a11y-image-alt` (alt text), `core-a11y-heading-order` (no heading skips) | More rules, axe-core integration |
| **Component testing** | `doctor visual` + `doctor snapshot` in CLI; `runVisualTest()` in backend | Unit test generation, a11y audit |
| **Agent spawning** | `packages/session/src/AgentRunner.ts` — spawns Claude Code as subprocess with stdin JSON-streaming, follow-up prompts, cancellation, event subscriptions, capability probing | Builder/Inspector specialization |
| **Session management** | `packages/session/src/SessionManager.ts` — session CRUD, resume, phase tracking; `ProcessManager.ts` — service lifecycle (start/stop/restart/health) | Integration with double-loop |
| **Storybook integration** | CSF parsing in `packages/cli/src/lib/storybook.ts` — `parseCsfTitle()`, `scanStoryFiles()`, `listAllStories()`, `fetchStorybookIndex()`; Storybook addon at `packages/addon/` | Auto-generation from props |
| **Framework adapters** | `packages/backend/src/adapters/` — composed plugin stack via `composeStack()`; plugins: react, css, tailwindcss, shadcn, core, react-doctor | More frameworks (Vue, Svelte) |
| **MCP tool surface (17)** | `packages/mcp-server/src/mcp.ts` — `get_design_context`, `generate_component`, `test_component`, `lint_component`, `evaluate_component`, `manage_design_system`, `query_knowledge_graph`, `rebuild_graph`, `vision_review`, `handle_change_request`, `discover_components`, `get_component_documentation`, `capture_component`, `capture_component_with_baseline`, `capture_baseline`, `spatial_audit`, `evaluate_story_charters` | Not affected — CLI complements MCP |
| **Theme support** | Graph schema has `theme` node label; `graph/src/build/themes.ts` builds theme nodes from `[data-theme]` CSS overrides; CLI `doctor --theme light\|dark` | Theme CRUD, diff, export |
| **Batch operations** | CLI `generate --batch <file.json>` (batch from JSON manifest); CLI `capture --all` (batch all generated) | Extend to more commands |
| **Evidence tracking** | `packages/backend/src/evidence.ts` — per-round critique scores + screenshots under `design/changes/<slug>/evidence/` | CLI surface for listing/showing |
| **HTTP API (20+ endpoints)** | `packages/backend/src/http.ts` — Express server on port 4321 covering health, state, DS CRUD, lint, charters, scoring, visual test, vision critique, element crop, comments, chat, upload, screenshots, graph stats, evidence logs | Some endpoints lack CLI equivalents |
| **Plugin architecture** | `packages/plugin-api/src/` — `MedesignPlugin` interface with hooks for codegen, lint, parsing, graph, doctor, rendered rules; 7 plugins implemented | Plugin SDK documentation |

**What notably does NOT exist (confirmed by search):**
| Missing Capability | Why It Matters |
|-------------------|----------------|
| **Figma/Sketch import** | No Figma API integration or file parser |
| **AST-level code analysis** | No dedicated compiler or AST walker beyond `react-doctor` |
| **Performance profiling** | No component render performance measurement |
| **Template scaffolding** | No reusable component template system beyond init |
| **Screen/page/router** | No multi-screen or routing model |
| **`@emdesign/workspace` package** | Imported by CLI but no `packages/workspace/` directory exists
