# Tasks — inital-spec-for-the-project

## Phase 0: Foundation

- [ ] **P0.1** Scaffold npm workspace monorepo structure — `packages/*` (backend, cli, graph, addon, dsr) + `apps/*` (workspace, workspace-react), root `tsconfig.json`, workspace `package.json`
- [ ] **P0.2** Define core types — `FrameworkAdapter` interface, `RepoPaths`, `DesignSystem` schema, `ComponentSpec`, `LintFinding`, `CritiqueScore`, graph node/edge types. Place in `packages/dsr` (shared token roles/primitives) and `packages/backend/src/`
- [ ] **P0.3** Implement `emdesign.config.json` schema + `resolveRepoPaths` utility — read project config, resolve all directories relative to project root
- [ ] **P0.4** Design system file structure scaffold — `design-systems/<id>/manifest.json`, `DESIGN.md` (9-section template), `tokens.css` (required role families), `code/` (primitives + stories)
- [ ] **P0.5** Build `DESIGN.md` parser — extract frontmatter, identify H2 sections by title, cache section anchors. Must handle the 9-section format + optional 10th (Tokens) section

## Phase 1: Backend Engine

- [ ] **P1.1** Design context prompt composer (`designContext.ts`) — read DESIGN.md + tokens.css + code/ primitives + task instruction → compose agent system prompt
- [ ] **P1.2** Consistency lint (`packages/backend/src/lint/`) — port anti-slop + token-contract self-check rules from open-design's `lint-artifact.ts`. P0 = blocking violations (off-token hex, indigo gradients, slop emoji, etc.); P1 = advisory
- [ ] **P1.3** Visual test engine (`visualTest.ts`) — Playwright screenshot + pixelmatch diff vs baseline; handle new component (score=1) vs changed (score=0.5) vs pass vs fail
- [ ] **P1.4** Critique scoreboard (`critique/scoreboard.ts`) — `computeComposite` (weighted mean over present scores) + dual-gate `decideRound` (composite ≥ threshold, mustFix === 0, composite ≥ baseline ratchet)
- [ ] **P1.5a** MCP tool surface — design/context tools: `get_design_context`, `poll_change_request`
- [ ] **P1.5b** MCP tool surface — generation tools: `create_component`, `edit_component`, `render_preview`, `capture_reusable_component`, `scaffold_primitives`, `create_design_system`, `apply_design_system`, `validate_design_system`, `list_design_systems`
- [ ] **P1.5c** MCP tool surface — critique tools: `lint_consistency`, `run_visual_test`, `critique_score`, `record_evidence`, `screenshot_path`
- [ ] **P1.5d** MCP tool surface — graph tools: `where_to_fix`, `find_affected`, `consistency_brief`, `get_context`, `query`, `rebuild`
- [ ] **P1.6** Capture engine (`capture.ts`) — promote generated component from `src/generated/` to `src/components/<Name>/`; copy `.tsx` + `.stories.tsx` + evidence; rebuild graph; git-track
- [ ] **P1.7** HTTP bridge (`http.ts`) — `/api/*` endpoints for the Storybook addon: state, change requests, screenshot serving, critique results
- [ ] **P1.8** Component generation (`create_component`/`edit_component`) — call design context, write `.tsx` + `.stories.tsx` to `src/generated/`, run lint, return findings
- [ ] **P1.9** State management (`state.ts`) — `.emdesign/state.json` read/write for change request queue, active design system, scores buffer

## Phase 2: Knowledge Graph

- [ ] **P2.1** Graph data structures (`packages/graph/`) — `Graph` class with nodes/edges storage, label+property filtering, serialization to JSON
- [ ] **P2.2** File system walker — read `design-systems/<id>/` dir tree, create `file` nodes + `contains` edges
- [ ] **P2.3** Token parser (`addTokens`) — parse `tokens.css` → `token` nodes, `color` nodes via `tokenValue`, `typeface` via `usesFont`, all with `declaredIn` edges
- [ ] **P2.4** Section parser (`addSections`) — extract sections from `DESIGN.md` → `section` nodes; `definedIn` edges for tokens mentioned in section bodies
- [ ] **P2.5** Code parser (`addPrimitives`, `addStories`) — use ts-morph to parse `code/*.tsx` → `primitive`, `prop`, `variant`, `state` nodes; `uses`, `composes` edges; parse `*.stories.tsx` → `story` + `storyOf` edges
- [ ] **P2.6** Rule registry (`rules.ts`) — define built-in lint rules as `rule` nodes with `governs` edges (minus `manifest.craft.exemptions`)
- [ ] **P2.7** Graph query API — `whereToFix`, `findAffected`, `consistencyBrief`, `getContext`, `query` — all with provenance (file:line) on every result
- [ ] **P2.8** Graph builder CLI/MCP — `graph_rebuild` tool + `emdesign graph build <id>`, deterministic build from code, output to `design-systems/<id>/graph.json`

## Phase 3: Frontend & Addon

- [ ] **P3.1** Storybook host (`apps/workspace-react`) — scaffold Storybook 8 + Tailwind CSS with semantic class mapping in `tailwind.config.js`
- [ ] **P3.2** Active design system binding — `active-design-system.css` import, `@ds` Vite alias resolving to active system's `code/` directory, hot-reload on system switch
- [ ] **P3.3** Addon panel (`packages/addon/`) — React panel for Storybook: chat input, capture button, visual diff viewer, score display, change request queue status
- [ ] **P3.4** Generated component rendering — `src/generated/` stories auto-discovered by Storybook, live HMR on regeneration

## Phase 4: CLI & Gates

- [ ] **P4.1** CLI scaffold (`packages/cli/`) — `emdesign` bin, subcommands: `serve`, `mcp`, `ds` (create/use/validate/list), `use <id>`, `graph build <id>`, `init`, `attach`, `design-context`, `lint`, `visual-test`, `score`, `capture`
- [ ] **P4.2** Server mode — `emdesign serve` → start MCP server + HTTP bridge on port 4321; proxy CLI calls via HTTP when server is running, embed engine for one-shot ops
- [ ] **P4.3** Init/Attach — `emdesign init react-tailwind <dir>` (scaffold fresh project), `emdesign attach` (add to existing Storybook project, additive and idempotent)
- [ ] **P4.4** Gate scripts (`scripts/gates/`) — `lint.sh <Component>` (exit 0 = no P0), `visual.sh <Component>` (Storybook on :6006), `build.sh` (typecheck); all shell out to CLI

## Phase 5: Workspace & Agents

- [ ] **P5.1** `.claude/` workspace scaffold — commands (`/mds:*`), agents (`vision-critic`, `design-reviewer`, `consistency-auditor`), skills (`using-design-skills`, `component-build`, `design-review`, etc.), workflow engine (`design-loop.js`)
- [ ] **P5.2** Design loop workflow — `design-loop.js`: build → parallel critics → critique_score gate → whereToFix on fail → revise loop; shares same gate as interactive path
- [ ] **P5.3** `/mds:design` command — AskUserQuestion for intent → consistency brief → build → loop → gate → capture ready
- [ ] **P5.4** `/mds:system:*` commands — `create`, `update`, `use` — design system lifecycle from the agent
- [ ] **P5.5** Critic subagents — `vision-critic` (reads screenshot, scores hierarchy/balance/rhythm/brand/polish), `design-reviewer` (reads code + spec + DESIGN.md, scores composition/api/semantics/intent/voice)

## Phase 6: Starter Design System

- [ ] **P6.1** Atelier design system (`design-systems/atelier/`) — complete 9-section DESIGN.md, tokens.css with all required role families, `code/` primitives (Button, Card, Badge, Input, etc.) with CSF stories
- [ ] **P6.2** Primitive components — React/Tailwind implementations of standard design primitives referencing only semantic token classes
- [ ] **P6.3** `scaffold_primitives` utility — clone the reference system's primitives when seeding a new design system

## Phase 7: Integration & Testing

- [ ] **P7.1** End-to-end agent loop test — start server + Storybook, run `/mds:design` for a simple component, verify all four feedback sources produce scores, verify gate decides correctly
- [ ] **P7.2** Visual test baseline management — baseline screenshot creation, update on intentional changes, regression detection
- [ ] **P7.3** CI integration — `npm run test:visual` in CI, gate scripts in CI pipeline
- [ ] **P7.4** Documentation — `docs/architecture.md`, `docs/workspace.md`, `docs/spec.md`, `docs/data-model.md`, `docs/harness-engine.md`, `QUICKSTART.md`, `CONTRIBUTING.md`
- [ ] **P7.5** Framework adapter stubs — register Vue, Svelte, Web Components, Angular adapters (stub implementations, metadata-only graph mode)
- [ ] **P7.6** Multi-design-system test — verify that switching design systems correctly re-skins all components via token rebinding
