## ADDED Requirements

### Requirement: Magic wand orchestrator workflow

A new workflow `magic-wand-workflow.js` SHALL be added to `apps/workspace/templates/claude/workflows/`. It SHALL orchestrate the full auto-fix pipeline:

1. **Enrich context** — resolve the selected element against the knowledge graph to get component name, file path, design system tokens
2. **Diagnose (parallel)** — run render analyze, spatial audit, a11y audit, and doctor lint concurrently. Optionally run vision critique if `vision: true`
3. **Aggregate** — collect all diagnostic outputs into a unified issue list via the `visual-diagnostic-aggregator`
4. **Generate fixes** — for each auto-fixable issue, generate a targeted fix candidate
5. **Apply fixes** — apply all fix candidates to source files, maintaining a session journal
6. **Verify** — run `doctor all --gate`, compare before/after scores
7. **Rollback on failure** — if gate fails (composite drops by >0.05 or mustFix increases), rollback all changes via the session journal
8. **Report** — return results to the Wand Results panel

#### Scenario: Complete auto-fix pipeline runs
- **WHEN** `magic-wand-workflow` receives a valid `WandTriggerEvent`
- **THEN** it SHALL run all 8 pipeline stages in order
- **AND** return a standardized result with `fixed`, `gate`, and `results`

#### Scenario: Parallel diagnostic probes
- **WHEN** the workflow reaches the Diagnose stage
- **THEN** `emdesign render analyze`, `emdesign spatial audit`, `emdesign doctor lint`, and `emdesign component a11y` SHALL be invoked in parallel via `workflow.parallel()`
- **AND** the workflow SHALL wait for all probes to complete (with individual timeouts of 10s each)
- **AND** probes that fail/timeout SHALL be reported as "unavailable" rather than blocking the pipeline

#### Scenario: Vision critique is optional
- **WHEN** `vision: true` is set in the trigger event
- **THEN** the workflow SHALL also run `emdesign vision <component>` after the parallel diagnostic probes
- **AND** vision results SHALL be merged into the aggregate issue list
- **WHEN** `vision: false` (default)
- **THEN** the vision probe SHALL NOT be invoked

#### Scenario: Gate verification with rollback
- **WHEN** all fixes are applied and `doctor all --gate` runs
- **THEN** the workflow SHALL compare the new composite score and mustFix count against pre-fix baselines
- **AND** if `newComposite < oldComposite - 0.05` OR `newMustFix > oldMustFix`
- **THEN** the workflow SHALL rollback ALL changes via the session journal
- **AND** return a result with `gate: "rollback"` and the regression details
- **AND** display "Auto-fix reverted due to regression" in the results panel

#### Scenario: Rollback restores original files
- **WHEN** rollback is triggered
- **THEN** each edit in the session journal SHALL be reverted in reverse order
- **AND** the journal file SHALL be marked as `rolled_back: true`
- **AND** a second verification gate SHALL confirm the component returned to its pre-fix state
- **AND** if post-rollback verification fails, the workflow SHALL surface an error

#### Scenario: Partial fix (some issues fixed, some skipped)
- **WHEN** some issues are auto-fixable and others are not
- **THEN** the workflow SHALL fix all auto-fixable issues in one batch
- **AND** report non-fixable issues separately in the `needsHuman` result field
- **AND** the gate SHALL run against the full set of applied fixes

### Requirement: Workflow registration in entry-workflow.js

The `entry-workflow.js` SHALL be updated to route `wand` intents to `magic-wand-workflow`:

- Intent type `wand` or `auto-fix` SHALL classify as element-layer `magic-wand-workflow`
- Intent type `wand --vision` SHALL set `vision: true` in the workflow args
- The `/mds:wand` CLI command SHALL invoke the entry workflow with type `wand`

#### Scenario: Entry workflow routes wand intent
- **WHEN** `entry-workflow` receives type `wand` with target `Button`
- **THEN** it SHALL classify to `element/wand` layer
- **AND** enrich context with workspace, DS, Storybook, and graph info
- **AND** execute `magic-wand-workflow` with args `{ name: "Button" }`

### Requirement: /mds:wand CLI command

A new slash command `/mds:wand` SHALL be added to `apps/workspace/templates/claude/commands/mds/`. It SHALL:

- Accept a component name as argument: `/mds:wand Button`
- Accept `--vision` flag: `/mds:wand Button --vision`
- Invoke the entry workflow with type `wand`
- Display results in a formatted summary

#### Scenario: CLI wand fixes named component
- **WHEN** user runs `/mds:wand Button`
- **THEN** the entry workflow SHALL run `magic-wand-workflow` on `Button`
- **AND** output a summary of what was detected and fixed

#### Scenario: CLI wand with vision
- **WHEN** user runs `/mds:wand Button --vision`
- **THEN** vision critique SHALL be included in the diagnostic pipeline
