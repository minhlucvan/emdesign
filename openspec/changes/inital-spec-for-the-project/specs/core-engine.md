# ADDED — emdesign Design-Engineering Engine core engine specification

## Purpose

This delta specification defines the requirements for the emdesign design-engineering engine: a headless Studio backend that drives Storybook as its front end. It covers design system management, component generation, consistency linting, visual regression testing, critique gating, knowledge graph, CLI/server, Storybook addon, MCP tool surface, framework adapters, and the agent workspace loop.

## Requirements

### R1. Design System Management — Creation
`design-systems/`

**ADDED** — The system SHALL support creating a design system from a 9-section DESIGN.md and tokens.css with required role families, via the `create_design_system` MCP tool and `emdesign ds create` CLI command.

- 9-section `DESIGN.md` contract format with frontmatter and token binding
- `tokens.css` with required role families
- Creates `design-systems/<id>/` directory with `DESIGN.md`, `tokens.css`, and `code/` subdirectory

**Scenario**: Create a valid design system
- Given a valid 9-section DESIGN.md with frontmatter and a tokens.css containing all required role families
- When the agent calls `create_design_system` with both files
- Then the system creates `design-systems/<id>/DESIGN.md`, `design-systems/<id>/tokens.css`, and `design-systems/<id>/code/`
- And returns the design system ID
- And the design system appears in `list_design_systems`

**Scenario**: Create with missing required role families (negative)
- Given a tokens.css that lacks the `--color-surface` role family
- When the agent calls `create_design_system`
- Then the system returns an error listing the missing required role families
- And no directory is created

### R2. Design System Management — Validation
`design-systems/`

**ADDED** — The system SHALL validate a design system has all required role families via the `validate_design_system` MCP tool. Required role families SHALL be: `--color-surface`, `--color-accent`, `--color-neutral`, `--color-danger`, `--color-success`, `--color-warning`, `--color-info`, `--font-body`, `--font-headline`, `--radius-sm`, `--radius-md`, `--radius-lg`, `--space-xs`, `--space-sm`, `--space-md`, `--space-lg`, `--space-xl`, `--space-2xl`, `--space-3xl`.

**Scenario**: Validate a complete design system
- Given a design system with all required role families defined in tokens.css
- When the agent calls `validate_design_system` with the design system ID
- Then the tool returns success with no missing role errors

**Scenario**: Validate an incomplete design system
- Given a design system missing `--font-headline` and `--space-3xl`
- When the agent calls `validate_design_system`
- Then the tool returns an error listing exactly the two missing families

### R3. Design System Management — Selection
`.emdesign/active-ds`

**ADDED** — The system SHALL support selecting a design system as active via the `emdesign ds use` CLI command and `/mds:system:use` agent command.

**Scenario**: Select an existing design system
- Given a design system with ID "atelier"
- When the user runs `emdesign ds use atelier`
- Then `.emdesign/active-ds` contains the ID "atelier"
- And subsequent design context generation uses that design system

**Scenario**: Select a non-existent design system (negative)
- Given no design system with ID "nonexistent"
- When the user runs `emdesign ds use nonexistent`
- Then the command returns an error indicating the design system does not exist
- And `.emdesign/active-ds` is unchanged

### R4. Design System Management — Update
`design-systems/`

**ADDED** — The system SHALL support updating an existing design system's DESIGN.md, tokens.css, and code/ primitives via the `apply_design_system` MCP tool.

**Scenario**: Update a design system's tokens.css
- Given an existing design system with ID "atelier"
- When the agent calls `apply_design_system` with updated tokens.css
- Then the file on disk is replaced
- And the graph is rebuilt via `graph_rebuild`
- And `validate_design_system` still passes on the updated content

### R5. Design System Management — Switching
`.emdesign/`

**ADDED** — The system SHALL support switching the active design system and rebinding all token references. Switching SHALL update `.emdesign/active-ds`, rebuild the graph, and re-skin all components via Tailwind CSS custom properties.

**Scenario**: Switch design systems
- Given two installed design systems "atelier" and "corporate" with different color palettes
- When the user switches from "atelier" to "corporate"
- Then `.emdesign/active-ds` contains "corporate"
- And all rendered components display using "corporate" token values via CSS custom properties

### R6. Design Context Prompt Composer
`packages/backend/src/designContext.ts`

**ADDED** — The system SHALL compose an agent prompt from DESIGN.md + tokens.css + primitives + rules via the `get_design_context` MCP tool. The composed context SHALL include: the 9-section DESIGN.md content, the token role definitions with values, the primitive component catalog, and the active rule set.

**Scenario**: Get design context for an active system
- Given an active design system with DESIGN.md, tokens.css, and code/ primitives
- When the agent calls `get_design_context`
- Then the response includes the DESIGN.md content, token role definitions, and primitive catalog
- And the response is formatted as a system prompt suitable for component generation

### R7. Component Generation (create/edit)
`packages/backend/src/mcp.ts`

**ADDED** — The system SHALL generate React/Tailwind components from a specification with design context, via the `create_component` and `edit_component` MCP tools. Generated components SHALL reference only semantic token classes (`bg-surface`, `text-accent`, `rounded`, etc.) and never raw hex colors, font stacks, or off-token spacing values.

**Scenario**: Generate a component from a valid spec
- Given an active design system and a valid component description
- When the agent calls `create_component` with the description
- Then files are written to `src/generated/<Name>.tsx` and `src/generated/<Name>.stories.tsx`
- And `lint_consistency` on the output returns 0 P0 findings

**Scenario**: Generate a component with raw hex colors (negative)
- Given the agent calls `create_component` and the generated code includes a raw hex color like `#3B82F6`
- When `lint_consistency` runs on the generated files
- Then it returns a P0 finding at the exact line with the raw hex value

### R8. Generated File Layout
`apps/workspace-react/src/generated/`

**ADDED** — The system SHALL write generated components to `src/generated/<Name>.tsx` with corresponding `src/generated/<Name>.stories.tsx` files. These files SHALL be auto-discovered by Storybook and support live HMR on regeneration.

**Scenario**: Generated file structure
- Given the agent calls `create_component` for a component named "Button"
- When generation completes successfully
- Then `src/generated/Button.tsx` exists with the component code
- And `src/generated/Button.stories.tsx` exists with a valid CSF story
- And Storybook renders the generated story without manual import

### R9. Capture Promotion
`packages/backend/src/capture.ts`

**ADDED** — The system SHALL promote generated components from `src/generated/` to `src/components/<Name>/` (git-tracked) via the `capture_reusable_component` MCP tool. The capture SHALL copy the `.tsx` and `.stories.tsx` files, record critique evidence, rebuild the graph, and commit the result.

**Scenario**: Capture a passing component
- Given a component in `src/generated/` that passes all critique gates
- When the agent calls `capture_reusable_component`
- Then files are copied to `src/components/<Name>/`
- And the graph is rebuilt to include the new component node
- And the new directory is git-tracked

### R10. Consistency Lint
`packages/backend/src/lint/`

**ADDED** — The system SHALL detect off-token values and anti-patterns with two severity levels. P0 (blocking) violations SHALL include: raw hex colors outside the token system, indigo gradients, slop emoji, invented metrics, and filler copy. P1 (advisory) violations SHALL include: ALL-CAPS without letter-spacing, placeholder images, and accent overuse (accent color occupying more than 40% of visible element area, computed by aggregating accent-colored element bounding boxes relative to the viewport). The token-contract self-check SHALL verify all required role families are present, no unknown roles exist, and no dangling `var()` references remain.

**Scenario**: P0 violation detection
- Given a component file containing `color: #3B82F6` outside the token system
- When `lint_consistency` is called on the file
- Then it returns a P0 finding at the exact file:line location

**Scenario**: P1 advisory — accent overuse
- Given a component where accent-colored elements occupy 50% of the viewport area
- When `lint_consistency` is called
- Then it returns a P1 finding for accent overuse with the computed area percentage

**Scenario**: Empty component (edge case)
- Given a component file with zero content
- When `lint_consistency` is called
- Then it returns 0 findings (no false positives on empty input)

### R11. Visual Regression Testing
`packages/backend/src/visualTest.ts`

**ADDED** — The system SHALL detect visual regressions via Playwright screenshot compared against a stored baseline using pixelmatch.

- New component with no baseline SHALL score 1.0
- Component with detectable changes below threshold SHALL score 0.5
- Component with changes at or above threshold SHALL return a fail result
- Baseline management SHALL support creation on first run and intentional update via `--update-baseline` flag

**Scenario**: New component (no baseline)
- Given a component with no stored baseline screenshot
- When `run_visual_test` is called
- Then the current screenshot is stored as the baseline
- And the score is 1.0

**Scenario**: Visual regression detected
- Given a component with a stored baseline
- When `run_visual_test` detects a pixel diff > 0 and < threshold
- Then the score is 0.5
- And the diff image path is available via `screenshot_path`

**Scenario**: Intentional baseline update
- Given a component with a stored baseline that has intentionally changed
- When the developer or agent calls `run_visual_test` with `--update-baseline`
- Then the current screenshot replaces the stored baseline
- And subsequent `run_visual_test` comparisons use the new baseline

### R12. Critique Gate — Composite Threshold
`packages/backend/src/critique/scoreboard.ts`

**ADDED** — The system SHALL compute a weighted composite score across four feedback sources (rule/lint, visual, vision, LLM) plus a11y, via the `computeComposite` function. The composite SHALL be a weighted mean over present scores. The gate SHALL require the composite to meet or exceed a configurable threshold.

**Scenario**: Composite meets threshold
- Given four feedback scores: rule=0.9, visual=0.8, vision=0.85, LLM=0.9 with equal weights
- When `computeComposite` is called
- Then the composite is 0.8625
- And if the threshold is 0.8, the composite condition passes

### R13. Critique Gate — MustFix Zero
`packages/backend/src/critique/scoreboard.ts`

**ADDED** — The system SHALL require the mustFix count to equal zero for the gate to pass. Any P0 lint finding, failed visual test, or P0 vision critique SHALL increment mustFix. The `critique_score` MCP tool SHALL return the mustFix count along with file:line locations for each mustFix item.

**Scenario**: MustFix blocks gate
- Given a component with one P0 lint finding (mustFix=1) and composite=0.9
- When `decideRound` is called
- Then the gate returns 'continue'
- And the response includes the mustFix item with file:line location

### R14. Critique Gate — Ratchet
`packages/backend/src/critique/scoreboard.ts`

**ADDED** — The system SHALL require the composite score to meet or exceed the prior iteration's baseline composite score. This ratchet SHALL prevent quality regression across iterations of the same component.

**Scenario**: Ratchet blocks regression
- Given the prior iteration composite baseline is 0.85
- When the current iteration composite is 0.82 (meets threshold 0.8 but below baseline)
- Then `decideRound` returns 'continue'
- And the response indicates the ratchet condition failed

### R15. Critique Gate — Configurable Weights
`packages/backend/src/critique/scoreboard.ts`

**ADDED** — The system SHALL support per-project weight configuration for the composite score formula. Weights SHALL be stored in the design system configuration and affect the weighted mean computation in `computeComposite`.

**Scenario**: Custom weights applied
- Given a project configured with weights [lint=0.4, visual=0.3, vision=0.2, LLM=0.1]
- When `computeComposite` computes the weighted mean
- Then it uses the project-specific weights rather than equal weighting

### R16. Knowledge Graph — Build
`packages/graph/`

**ADDED** — The system SHALL build a labeled property graph from code + metadata deterministically (never LLM-generated), via the `graph_rebuild` MCP tool and `emdesign graph build <id>` CLI command.

- Node kinds: designSystem, file, section, token, color, typeface, theme, primitive, prop, variant, state, story, artifact, rule
- Edge kinds: declaredIn, contains, definedIn, tokenValue, usesFont, uses, composes, references, hasProp, hasVariant, hasState, storyOf, overrides, governs, violates, documentedBy, produces
- Every node SHALL resolve to an exact file:line provenance

**Scenario**: Graph build from design system
- Given a complete design system directory with DESIGN.md, tokens.css, and code/ primitives
- When `graph_rebuild` runs
- Then `design-systems/<id>/graph.json` is created
- And it contains file, section, token, color, primitive, and story nodes
- And every node has a file:line provenance field

**Scenario**: Graph build with code syntax errors (negative)
- Given a code file with syntax errors in the design system primitives
- When `graph_rebuild` runs
- Then metadata nodes (file, section, token) are still created
- But code-specific nodes (primitive, prop, variant, state) are skipped for the errored file
- And an error is logged for the skipped file

### R17. Knowledge Graph — Query API
`packages/graph/`

**ADDED** — The system SHALL support query methods, each with file:line provenance on every result:

- `whereToFix(tokenId)` — accepts a token name (e.g. `--color-accent`), returns `Array<{file: string, line: number, kind: string}>` of all occurrences of that token across the design system
- `findAffected(tokenId)` — accepts a token name, returns all nodes that would be affected by changing that token, traversing `uses` and `references` edges
- `consistencyBrief()` — returns a structured brief of all primitives (with their props and variants), tokens (with their values), and governing rules
- `getContext(nodeId)` — accepts a node ID, returns the full node and its immediate neighborhood (connected nodes and edges)
- `query(label, properties)` — accepts a node label and property filters, returns all matching nodes

**Scenario**: whereToFix query
- Given a graph built from a design system that uses `--color-accent` in three files
- When `where_to_fix` is called with token `--color-accent`
- Then it returns three `{file, line, kind}` entries, one per usage location
- And each entry resolves to an exact source location

**Scenario**: consistencyBrief query
- Given a design system with 5 primitives and 12 tokens in the graph
- When `consistency_brief` is called
- Then it returns a structured brief listing all primitives with their props, and all tokens with values

### R18. CLI Server
`packages/cli/`

**ADDED** — The system SHALL start an MCP server and HTTP bridge on port 4321 via `emdesign serve`. The server SHALL embed the engine for MCP tool execution, proxy CLI calls over HTTP, and handle the change request state.

**Scenario**: Server starts successfully
- Given port 4321 is available
- When `emdesign serve` is run
- Then the server starts and listens on port 4321
- And MCP tools are available at the default MCP endpoint

**Scenario**: Port already in use (negative)
- Given port 4321 is already bound by another process
- When `emdesign serve` is run
- Then the server logs an error and exits with code 1

### R19. CLI Client
`packages/cli/`

**ADDED** — The system SHALL provide subcommands for all engine operations: `ds` (create, use, validate, list), `use <id>`, `graph build <id>`, `init <framework>`, `attach`, `design-context`, `lint`, `visual-test`, `score`, `capture`. The client SHALL proxy to a running server via HTTP when a server is active, and embed the engine for one-shot operations otherwise.

**Scenario**: CLI lint called
- Given a file `Button.tsx` with a raw hex color
- When `emdesign lint Button` is called
- Then it returns the same P0 findings as the MCP `lint_consistency` tool

**Scenario**: CLI init scaffold
- Given a fresh directory with no emdesign project
- When `emdesign init react-tailwind <dir>` is run
- Then `<dir>` contains the standard monorepo structure with workspace config

### R20. Storybook Addon
`packages/addon/`

**ADDED** — The system SHALL provide a Storybook addon panel supporting: a chat interface for submitting change requests, a capture button for promoting generated to captured components, a visual diff viewer with score display, and change request queue status.

**Scenario**: Addon panel renders
- Given Storybook is running with the @emdesign/addon registered
- When the user opens the emdesign addon panel
- Then it displays a chat input, capture button, and score display
- And it polls `/api/state` for change request queue status

### R21. MCP Tool Surface
`packages/backend/src/mcp.ts`

**ADDED** — The system SHALL expose MCP tools with defined schemas. Core tool schemas:

| Tool | Purpose | Key Inputs | Output Shape |
|---|---|---|---|
| `get_design_context` | Compose agent prompt from active design system | (none — uses active DS) | `{prompt: string, tokens: object, primitives: object[], rules: object[]}` |
| `create_component` | Generate a new component | `{description: string}` | `{files: [{path, content}], lintFindings: [], status: string}` |
| `edit_component` | Edit an existing generated component | `{name: string, description: string}` | `{files: [{path, content}], lintFindings: [], status: string}` |
| `lint_consistency` | Run consistency lint on a component | `{component: string}` | `{findings: [{severity, location: {file, line}, message}]}` |
| `run_visual_test` | Run visual regression test | `{component: string}` | `{score: number, diff: string, baseline: string, pass: boolean}` |
| `critique_score` | Compute critique gate decision | `{component: string}` | `{composite: number, mustFix: number, baseline: number, decision: string}` |
| `capture_reusable_component` | Promote generated to captured | `{component: string}` | `{targetPath: string, evidence: object, status: string}` |
| `where_to_fix` | Find all usages of a token | `{token: string}` | `{occurrences: [{file, line, kind}]}` |
| `find_affected` | Find nodes impacted by changing a token | `{token: string}` | `{affected: [{id, kind, file, line}]}` |
| `consistency_brief` | Get structured consistency summary | (none) | `{primitives: [], tokens: [], rules: [], theme: {}}` |

**Scenario**: Unknown tool call (negative)
- Given an MCP tool name that does not exist in the registry
- When the agent calls it
- Then the server returns an error indicating the tool is unknown

### R22. Framework Adapter
`packages/backend/src/adapters/`

**ADDED** — The system SHALL support pluggable framework adapters via a `FrameworkAdapter` interface: `codegenInstructions` (generation rules), `lint` (framework-specific rules), `storyTemplate` (CSF story format), `parsesCode` (whether AST-based graph parsing is implemented). The `react-tailwind` adapter SHALL be fully implemented. Stub adapters (`vue`, `svelte`, `web-components`, `angular`) SHALL provide metadata-only graph mode: when `parsesCode` is false, the graph builder creates file and section nodes but no primitive, prop, variant, or state nodes for that adapter's files.

**Scenario**: React adapter generates valid code
- Given the react-tailwind adapter is active
- When the agent calls `create_component`
- Then the generated output is valid JSX with Tailwind semantic classes

**Scenario**: Stub adapter graph mode
- Given a design system using the vue stub adapter (parsesCode=false)
- When `graph_rebuild` runs
- Then `graph.json` contains file and section nodes for .vue files
- But no primitive, prop, or variant nodes are created for those files

### R23. Workspace Agent Loop
`.claude/`

**ADDED** — The system SHALL provide a Claude Code workspace with: `/mds:*` slash commands (design, system:create|update|use, craft:component|update|view|story, review, vision, ship); critic subagents (vision-critic, design-reviewer, consistency-auditor); workflow engine (`design-loop.js`: build -> parallel critics -> gate -> revise loop); and gate scripts (`scripts/gates/lint.sh`, `visual.sh`, `build.sh`).

**Scenario**: Design loop iteration
- Given a component in the generation loop
- When `design-loop.js` runs
- Then it invokes parallel critics (vision, design-review, consistency)
- Then calls `critique_score` to gate the results
- On 'continue' it calls `where_to_fix` for guidance
- On 'ship' it presents the component for capture

### R24. Starter Design System
`design-systems/atelier/`

**ADDED** — The system SHALL deliver a complete reference design system ("Atelier") including: a 9-section DESIGN.md with frontmatter, tokens.css covering all required role families, and code/ primitives (Button, Card, Badge, Input, etc.) with CSF stories. The `scaffold_primitives` utility SHALL clone the reference primitives when seeding a new design system.

**Scenario**: Starter DS primitives present
- Given the atelier design system is installed
- When the design system is validated
- Then tokens.css contains all required role families
- And code/ contains at least Button, Card, Badge, and Input primitives with CSF stories
- And DESIGN.md has exactly 9 sections with frontmatter

### R25. emdesign.config.json Schema
`packages/backend/src/`

**ADDED** — The system SHALL define project configuration via `emdesign.config.json`. The schema SHALL specify: project paths (generated directory, captured directory, design systems root, state file), the active design system ID, and the framework selection. The `resolveRepoPaths` utility SHALL resolve all directory paths relative to the project root.

**Scenario**: Config loading
- Given a valid `emdesign.config.json` with paths and framework set to "react-tailwind"
- When the engine loads the configuration
- Then all paths are resolved relative to the project root
- And the framework adapter is set to react-tailwind

### R26. State Management
`.emdesign/`

**ADDED** — The system SHALL manage state via `.emdesign/state.json` including: the change request queue (pending and in-flight requests), the active design system identifier, and the scores buffer for critique history. The `poll_change_request` MCP tool SHALL read from this queue and return pending items.

**Scenario**: State persistence
- Given a change request submitted via the addon panel
- When the agent calls `poll_change_request`
- Then the request is returned from the queue
- And `.emdesign/state.json` contains the serialized request

**Scenario**: Empty queue (edge case)
- Given no pending change requests
- When `poll_change_request` is called
- Then it returns an empty queue with no error

### R27. DESIGN.md Parser
`packages/backend/src/`

**ADDED** — The system SHALL parse the 9-section DESIGN.md format: extract frontmatter (name, description), identify H2 sections by title, cache section anchors, and handle an optional 10th "Tokens" section.

**Scenario**: Parse a complete DESIGN.md
- Given a DESIGN.md with 9 H2 sections and valid frontmatter
- When the parser reads the file
- Then it returns the frontmatter, an array of section titles with anchors, and section bodies
- And section count equals 9 (or 10 if Tokens section is present)

**Scenario**: Parse a malformed DESIGN.md (negative)
- Given a DESIGN.md with no frontmatter or invalid YAML frontmatter
- When the parser reads the file
- Then it returns an error with diagnostic information about the parse failure

### R28. Storybook + Tailwind Host
`apps/workspace-react/`

**ADDED** — The system SHALL scaffold a Storybook 8 + Tailwind CSS host application with: semantic class mapping in `tailwind.config.js` (mapping `bg-surface`, `text-accent`, `rounded`, etc. to CSS custom properties from the active design system), active design system CSS import (`active-design-system.css`), `@ds` Vite alias resolving to the active system's `code/` directory, and hot-reload on design system switch.

**Scenario**: Semantic class rendering
- Given a component using `bg-surface` and `text-accent` classes
- When Storybook renders the component
- Then the CSS custom properties from the active design system's tokens.css are applied
- And visual styles reflect the active design system's token values

### R29. Generated Story Discovery
`apps/workspace-react/src/generated/`

**ADDED** — The system SHALL auto-discover generated stories in `src/generated/` via Storybook's glob-based story configuration. Newly generated stories SHALL appear in the Storybook sidebar without manual import or configuration changes. HMR SHALL update the preview on regeneration without a full reload.

**Scenario**: Story auto-discovery
- Given Storybook is running with glob patterns covering `src/generated/**/*.stories.tsx`
- When a new `.stories.tsx` file is created in `src/generated/`
- Then Storybook detects it via the glob pattern and renders it in the sidebar
- And HMR updates the preview without full reload

### R30. Integration & Testing
`scripts/`

**ADDED** — The system SHALL support:
- Baseline management for visual tests (creation on new component, update on intentional changes)
- CI integration via `npm run test:visual` in CI pipeline
- Framework adapter stubs for Vue, Svelte, Web Components, Angular registered in the adapter registry
- End-to-end verification: server + Storybook start, component generation, all four feedback sources produce scores, gate decides correctly

**Scenario**: E2E agent loop
- Given the server and Storybook are both running
- When an end-to-end test runs the agent loop for a simple component
- Then all four feedback sources (rule, visual, vision, LLM) produce scores
- And the gate decides correctly (ship or continue based on composite and mustFix)

**Scenario**: Multi-DS switching verification
- Given two design systems with different color tokens and rendered components
- When the system switches from one design system to the other
- Then all rendered components use the new design system's token values
- And visual test correctly reports changes compared to the previous baseline
