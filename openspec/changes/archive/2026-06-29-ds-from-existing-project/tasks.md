## 1. Project analysis & extraction (RED → GREEN)

### 🟥 RED: Write extraction + clustering tests
- [x] **1R.1** Write `extract.test.ts` — test Tailwind config reading (colors/fonts/spacing/radius/shadows), asserting each observation carries `file:line` provenance into `tailwind.config.js`
- [x] **1R.2** Assert CSS custom-property collection with resolved values (resolve `var(--brand-blue)` to underlying hex), conflict detection vs Tailwind config
- [x] **1R.3** Assert component-source scanning for raw hex/px values with per-value occurrence counts
- [x] **1R.4** Assert clustering: near-duplicate colors (`#0a0a0a` vs `#0b0b0b`, delta ≤ 4) merged into one role, distant colors (`#0a0a0a` vs `#1a1a1a`, delta > 4) kept separate
- [x] **1R.5** Assert confidence scoring: occurrence ≥ 3 with single role → `confidence >= 0.8`; occurrence < 3 or multi-role → `confidence < 0.8` and flagged
- [x] **1R.6** Assert required roles with no evidence get documented defaults (source: `default`)
- [x] Run `npx vitest run packages/backend/src/project/extract.test.ts` → **RED confirmed** (SUT import fails)

### 🟩 GREEN: Implement extraction engine
- [x] **1G.1** Create `__fixtures__/sample-project` fixture (tailwind config + CSS vars including deliberate conflict + `Card.tsx` with near-duplicate/distant/rare values)
- [x] **1G.2** Implement `extract.ts`: Tailwind config reader (theme/extend: colors, fonts, spacing, radius, shadows)
- [x] **1G.3** Add CSS custom-property scanner with `var()` resolution, conflict flagging
- [x] **1G.4** Add component-source scanner for raw hex/px + inline utility usage
- [x] **1G.5** Implement clustering: per-channel merge tolerance ≤ 4, confidence scoring, evidence tracking
- [x] **1G.6** Fill required roles absent from evidence with documented defaults
- [x] Run `npx vitest run packages/backend/src/project/extract.test.ts` → **GREEN** (all assertions pass)

---

## 2. Component adoption (RED → GREEN)

### 🟥 RED: Write adoption + report tests
- [x] **2R.1** Write `adopt.test.ts` — assert components placed in `componentsDir`, CSF story generated when missing
- [x] **2R.2** Assert idempotent re-run: no duplicates, unchanged flags preserved
- [x] **2R.3** Assert unambiguous rebind: single candidate `confidence >= 0.8` → value rewritten, before/after + provenance recorded
- [x] **2R.4** Assert ambiguous value left untouched: multi-candidate or `< 0.8` confidence → flagged `needs-manual-fix`
- [x] **2R.5** Assert report classifies every component as `loop-ready` | `needs-manual-fix`
- [x] **2R.6** Assert report is machine-readable with per-component status, rebinds, and blocking values
- [x] Run `npx vitest run packages/backend/src/project/adopt.test.ts` → **RED confirmed** (SUT import fails)

### 🟩 GREEN: Implement adoption engine
- [x] **2G.1** Create `report.ts`: canonical `AdoptionReport` type + builder (per-component status, rebinds, blocking values)
- [x] **2G.2** Create `adopt.ts`: place discovered components into `componentsDir` (idempotent via diff)
- [x] **2G.3** Implement safe rebinding: rewrite hardcoded values only when exactly one high-confidence candidate exists
- [x] **2G.4** Generate CSF story for any adopted component lacking one
- [x] **2G.5** Derive per-component readiness from real lint (`countMustFix() === 0 && no off-token-color`)
- [x] **2G.6** Build structured adoption report with per-component status, rebinds, and blocking values
- [x] Run `npx vitest run packages/backend/src/project/adopt.test.ts` → **GREEN** (all assertions pass)

---

## 3. ds-from-project workflow + API (RED → GREEN)

### 🟥 RED: Write workflow + API tests
- [x] **3R.1** Write `workflow-from-project.test.ts` — assert `runFromProject` runs all 8 stages in order (scan → extract → synthesize DESIGN.md → tokens → primitives → adopt → graph → validate)
- [x] **3R.2** Assert each stage emits name/status/progress with intermediate artifacts
- [x] **3R.3** Assert no-DESIGN.md path synthesizes one, registers system with `source.type: "project"`
- [x] **3R.4** Assert project-with-DESIGN.md path keeps it canonical, prefers its token values, records divergences
- [x] **3R.5** Assert stage failure stops pipeline, registers nothing partial
- [x] **3R.6** Write `surface-from-project.test.ts` — assert `POST /api/design-systems/from-project` validates path, streams progress via SSE, and adoption report is served
- [x] Run both test suites → **RED confirmed**

### 🟩 GREEN: Implement workflow + API
- [x] **3G.1** Add `runFromProject(sessionId, { projectPath, name?, id? })` to `WorkflowOrchestrator`
- [x] **3G.2** Synthesize DESIGN.md from extracted evidence when absent; reconcile when present
- [x] **3G.3** Generate tokens.css from proposed roles, scaffold code/ primitives, build graph.json
- [x] **3G.4** Register system ONLY after validate passes; on failure stop and register nothing
- [x] **3G.5** Add `POST /api/design-systems/from-project` with path validation
- [x] **3G.6** Wire stage progress through WorkflowStore + SSE (`GET /api/design-systems/:id/workflow-stream`)
- [x] **3G.7** Serve adoption report via surface API
- [x] Run both test suites → **GREEN**

---

## 4. Surface API (RED → GREEN)

### 🟥 RED: Write surface API tests
- [x] **4R.1** Write test asserting ds-from-project workflow status (terminal state + failing stage/reason) is exposed
- [x] **4R.2** Write test asserting adoption report is served for a completed workflow
- [x] Run → **RED confirmed**

### 🟩 GREEN: Implement surface API exposure
- [x] **4G.1** Expose workflow status endpoint for ds-from-project
- [x] **4G.2** Serve adoption report for completed workflows
- [x] Run → **GREEN**

---
## 5. CLI (RED → GREEN)

### 🟥 RED: Write CLI tests
- [x] **5R.1** Write `importProjectDesign.test.ts` — assert in-process orchestrator driver returns report, registers system, errors on invalid path
- [x] **5R.2** Write `ds-import-project.test.ts` — assert `ds import project <path>` prints stage progress + report
- [x] **5R.3** Assert `--json` emits structured report on stdout
- [x] **5R.4** Assert `--gate` ⇒ non-zero exit on validation failure / needs-manual-fix; zero on all loop-ready
- [x] Run both suites → **RED confirmed**

### 🟩 GREEN: Implement CLI command
- [x] **5G.1** Add `importProjectDesign` to `scaffold.ts` driving orchestrator in-process
- [x] **5G.2** Add `else if (importSrc === 'project')` branch to `cmdDs` in `ds.ts`
- [x] **5G.3** Print stage progress; emit report (`--json` / human summary)
- [x] **5G.4** Honor `--gate` with correct exit codes; error clearly on invalid path
- [x] **5G.5** Document `ds import project <path>` in `docs/cli-commands.md`
- [x] Run both suites → **GREEN**

---

## 6. Frontend (addon) (RED → GREEN)

### 🟥 RED: Write frontend tests
- [x] **6R.1** Write test asserting "From Existing Project" creator path accepts project-path input, starts flow
- [x] **6R.2** Assert component subscribes to workflow SSE and renders live stage progress
- [x] **6R.3** Assert adoption-report triage view classifies loop-ready vs needs-manual-fix with client-only view state
- [x] Run → **RED confirmed**

### 🟩 GREEN: Implement frontend
- [x] **6G.1** Add "From Existing Project" path to System tab creator
- [x] **6G.2** Subscribe to workflow SSE, render live stage progress with intermediate artifacts
- [x] **6G.3** Build adoption-report triage view (loop-ready vs needs-manual-fix, client-only view state)
- [x] Run → **GREEN**

---

## 7. End-to-end verification (RED → GREEN)

### 🟥 RED: Write e2e tests
- [x] **7R.1** Write `from-project-e2e.test.ts` — assert system built from no-DESIGN.md fixture passes validate + classifies all components
- [x] **7R.2** Assert project with DESIGN.md preserves it as canonical, its token values win, divergences recorded
- [x] **7R.3** Assert loop-ready component genuinely passes real lint (countMustFix === 0, no off-token-color)
- [x] **7R.4** Assert needs-manual-fix component genuinely has lint findings
- [x] Run → **RED confirmed**

### 🟩 GREEN: Ensure e2e passes
- [x] **7G.1** Ensure all pipeline stages work end-to-end: extraction → adoption → registration → lint
- [x] **7G.2** Update `CLAUDE.md` CLI overview listing `ds import project`
- [x] Run all backend tests → **GREEN**

---

## 8. Per-DS skills generation (RED → GREEN)

### 🟥 RED: Write skills generation tests
- [ ] **8R.1** Write test asserting `skills/build/SKILL.md` is generated with all 9 required sections: Token Roles table, Type Scale, Spacing Scale, Radius & Depth, Motion, Component Patterns, Anti-Patterns, Reuse vs Author
- [ ] **8R.2** Write test asserting `skills/taste/SKILL.md` is generated with 3 dials in YAML frontmatter (DESIGN_VARIANCE, MOTION_INTENSITY, VISUAL_DENSITY) plus brand fingerprint, visual characteristics, anti-patterns
- [ ] **8R.3** Write test asserting tokens in build skill match tokens.css (no drift between skill role table and actual CSS variables)
- [ ] Run → **RED confirmed**

### 🟩 GREEN: Implement skills generation in runFromProject pipeline
- [ ] **8G.1** Add `"build-skill"` stage to `runFromProject()` after tokens stage — reads DESIGN.md + tokens.css, generates `skills/build/SKILL.md` with 9 sections
- [ ] **8G.2** Add `"taste"` stage after build-skill — extracts taste dials from DESIGN.md, writes `skills/taste/SKILL.md` with YAML frontmatter
- [ ] **8G.3** Insert both new stages between tokens and primitives so the full pipeline is: scan → extract → synthesize DESIGN.md → tokens → build-skill → taste → primitives → adopt → graph → validate
- [ ] Run all tests → **GREEN**
