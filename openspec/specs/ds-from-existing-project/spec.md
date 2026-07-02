## ADDED Requirements

### Requirement: User can create a design system from an existing project

🧪 **TDD:**
- **RED** → Write `extract.test.ts` + `adopt.test.ts` asserting extraction behavior (Tailwind config, CSS vars, component scanning, clustering), component placement (idempotent), rebinding (unambiguous applied, ambiguous flagged), and report generation (all components classified).
- **GREEN** → Implement `extract.ts`, `adopt.ts`, `report.ts` + fixture project until all vitest assertions pass.

The system SHALL provide a "From Existing Project" path that takes a project directory (or the
current workspace) and produces a complete, validated emdesign design system following the standard
contract (`DESIGN.md`, `tokens.css`, `code/` primitives, `skills/`, `graph.json`) declared in
`emdesign.config.json`. The path SHALL work whether or not the project contains a `DESIGN.md`.

#### Scenario: Project has no DESIGN.md
- **WHEN** the user starts the flow against a project with a Tailwind config and components but no `DESIGN.md`
- **THEN** the system runs the `ds-from-project` workflow to extract design decisions from the source
- **THEN** the system generates a `DESIGN.md` covering the standard sections from the extracted evidence
- **THEN** the system generates `tokens.css` declaring all required semantic token roles
- **THEN** the system scaffolds/derives `code/` primitives and builds `graph.json`
- **THEN** the system declares the new design system in `emdesign.config.json`
- **THEN** the system validates the token contract and returns an adoption report

#### Scenario: Project already has a DESIGN.md
- **WHEN** the project contains a `DESIGN.md`
- **THEN** the system treats the existing `DESIGN.md` as the canonical source
- **THEN** the system reconciles it against the values actually used in the code
- **THEN** the report flags each place where the code diverges from the declared `DESIGN.md`
- **THEN** the generated `tokens.css` prefers the `DESIGN.md` values and notes overrides

#### Scenario: Generated system passes its own validation
- **WHEN** the workflow completes
- **THEN** the generated design system SHALL pass `ds validate` (token contract self-check)
- **THEN** any role that could not be confidently inferred uses a documented default and is listed in the report

### Requirement: A multi-stage workflow drives creation with progress feedback

🧪 **TDD:**
- **RED** → Write `workflow-from-project.test.ts` asserting `runFromProject` executes all 8 stages in order, emits stage events, handles no-DESIGN.md and with-DESIGN.md paths, and fails cleanly on stage failure.
- **GREEN** → Implement `workflow.ts` `runFromProject()` method with 10-stage pipeline (scan, extract, synthesize DESIGN.md, tokens, build-skill, taste, primitives, adopt, graph, validate), SSE progress, DESIGN.md synthesis/reconciliation, build-skill/taste generation, and atomic registration.

The system SHALL implement a `ds-from-project` workflow with discrete stages — scan, extract,
synthesize `DESIGN.md`, generate `tokens.css`, **generate build-skill**, **generate taste-skill**,
derive primitives, adopt components, build graph, validate — and SHALL emit progress for each stage
so a client can show real-time status.

#### Scenario: Stage progress is streamed
- **WHEN** the workflow runs
- **THEN** each stage SHALL emit a progress event with the stage name and status (started / completed / failed)
- **THEN** a client subscribing to progress receives events in stage order
- **THEN** intermediate artifacts (extracted tokens, generated `DESIGN.md`) are available to the client as they complete

#### Scenario: A stage fails
- **WHEN** a stage fails (e.g., the project cannot be parsed)
- **THEN** the workflow SHALL stop, emit a failed event naming the stage and reason
- **THEN** no partial design system is registered in `emdesign.config.json`

### Requirement: Backend API starts and streams the ds-from-project workflow

🧪 **TDD:**
- **RED** → Write `surface-from-project.test.ts` asserting POST endpoint validates path, streams SSE progress, and serves adoption report.
- **GREEN** → Implement `POST /api/design-systems/from-project` + `GET /api/design-systems/:id/adoption-report` in `workflow-api.ts`.

The system SHALL expose backend endpoints to start the `ds-from-project` workflow, stream its
progress, and return the adoption report (see the `component-adoption` capability for the report's
shape).

#### Scenario: Start via API
- **WHEN** a client POSTs a start request with a project path
- **THEN** the backend validates the path exists and is a supported project type
- **THEN** the backend begins the workflow and returns a handle for streaming progress

### Requirement: CLI command `ds import project` runs the flow

🧪 **TDD:**
- **RED** → Write `importProjectDesign.test.ts` + `ds-import-project.test.ts` asserting the CLI prints stage progress, emits report (--json / human), honors --gate with correct exit codes, and errors on invalid path.
- **GREEN** → Implement `importProjectDesign` in `scaffold.ts` and `else if (importSrc === 'project')` branch in `cmdDs`.

The system SHALL provide a CLI command `ds import project <path>` as a sibling of the existing
`ds import awesome|git|vendor` commands that runs the `ds-from-project` workflow and emits the
adoption report.

#### Scenario: Start via CLI
- **WHEN** the user runs `ds import project ./my-app`
- **THEN** the CLI runs the workflow and prints stage progress
- **THEN** on completion it prints (or with `--json` emits) the adoption report
- **THEN** the exit code is non-zero if validation fails or with `--gate` if any component is not loop-ready

#### Scenario: Invalid project path
- **WHEN** the supplied path does not exist or is not a supported project
- **THEN** the system returns an error identifying the problem and does not create a design system

### Requirement: Design system includes per-DS skills

🧪 **TDD:**
- **RED** → Write test asserting `skills/build/SKILL.md` and `skills/taste/SKILL.md` exist and contain the required sections (build: all 9 sections including token roles table, type scale, spacing, radius & depth, motion, component patterns, anti-patterns, reuse-vs-author; taste: 3 dials set, brand fingerprint, visual characteristics, anti-patterns).
- **GREEN** → Add `"build-skill"` and `"taste"` stages to `runFromProject()` after tokens stage, generating both SKILL.md files from DESIGN.md + tokens.css.

Every generated design system SHALL include a `skills/` directory with dedicated skill files that agents, CLI, and the Storybook panel reference to understand the system's specific design language. This requirement extends the standard contract to: `DESIGN.md`, `tokens.css`, `code/` primitives, `skills/`, `graph.json`.

#### Scenario: Build skill is generated
- **WHEN** the ds-from-project workflow completes
- **THEN** `design-systems/<id>/skills/build/SKILL.md` exists
- **THEN** it contains all 9 required sections: Token Roles table, Type Scale, Spacing Scale, Radius & Depth, Motion, Component Patterns, Anti-Patterns, Reuse vs Author
- **THEN** the token roles table maps every SEMANTIC_TOKEN_ROLE to its Tailwind class, CSS variable, and a usage note
- **THEN** anti-patterns explicitly forbid raw hex, hardcoded spacing, and off-token values

#### Scenario: Taste skill is generated
- **WHEN** the ds-from-project workflow completes
- **THEN** `design-systems/<id>/skills/taste/SKILL.md` exists
- **THEN** its YAML frontmatter declares the 3 dials: DESIGN_VARIANCE, MOTION_INTENSITY, VISUAL_DENSITY (each 1-10)
- **THEN** the body includes a brand fingerprint, visual characteristics, and anti-patterns specific to the design system
