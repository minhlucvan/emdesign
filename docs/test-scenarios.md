# e2e Test Scenarios — Playwright BDD Test Plan

> **Feature-level test scenarios organized by capability area.**
> Written in Gherkin-style Given/When/Then for conversion into Playwright tests.
> Each scenario is a single, independently runnable test.

---

## 1. Project Initialization

### 1.1 Blank project scaffold

```gherkin
Feature: Project Initialization
  As a developer starting a new project
  I want to scaffold a blank emdesign workspace
  So that I can begin creating design systems and components

Scenario: Init creates the expected directory structure
  Given a fresh temp directory
  When I run `emdesign init react-tailwind <dir>`
  Then the exit code is 0
  And the directory contains:
    - emdesign.config.json
    - CLAUDE.md
    - .claude/agents/
    - .claude/commands/mds/
    - .claude/workflows/
    - .storybook/main.ts
    - .storybook/preview.tsx
    - design-systems/atelier/DESIGN.md
    - design-systems/atelier/tokens.css
    - design-systems/atelier/code/
    - tailwind.config.js
    - package.json
  And src/generated/ exists and is empty
  And src/components/ exists and is empty

Scenario: Init refuses invalid framework
  Given a fresh temp directory
  When I run `emdesign init nonexistent-framework <dir>`
  Then the exit code is non-zero
  And the error message mentions "Unknown framework"

Scenario: Attach detects existing Storybook
  Given a directory with an existing Storybook setup
  When I run `emdesign attach <dir>`
  Then emdesign.config.json is created
  And @emdesign/addon is added to .storybook/main.ts
  And .claude/ is created
  And design-systems/atelier/ is seeded

Scenario: Attach fails without Storybook
  Given a directory without .storybook/
  When I run `emdesign attach <dir>`
  Then the exit code is non-zero
  And the error mentions "No Storybook found"
```

---

## 2. Design System Browser & Customization

### 2.1 Catalog browsing

```gherkin
Feature: Design System Catalog
  As a user creating a new design system
  I want to browse available base design systems
  So that I can choose a starting point

Scenario: List all bases via API
  Given the emdesign backend is running
  When I fetch GET /api/bases
  Then the response has a "bases" array
  And the array contains at least 10 entries
  And each entry has: id, ref, name, category

Scenario: List base categories with counts
  Given the emdesign backend is running
  When I fetch GET /api/bases/categories
  Then the response has a "categories" array
  And each category has: name, count
  And the sum of counts equals the total number of bases

Scenario: Get base detail
  Given the emdesign backend is running
  When I fetch GET /api/bases/brutalist/detail
  Then the response has: id, name, hasPreview, tokens, fonts, accentColor
  And tokens includes color entries with role, kind, value
  And fonts includes display and body properties
  And accentColor is a valid hex color

Scenario: Base detail returns 404 for unknown base
  Given the emdesign backend is running
  When I fetch GET /api/bases/nonexistent/detail
  Then the status code is 404
  And the response has an "error" field

Scenario: Serve base preview HTML
  Given the emdesign backend is running
  When I fetch GET /api/bases/after-hours/preview
  Then the status code is 200
  And the Content-Type is text/html
  And the body contains HTML markup

Scenario: Preview with CSS overrides
  Given the emdesign backend is running
  When I fetch GET /api/bases/after-hours/preview?color-accent=ff0000
  Then the response body contains `<style id="emdesign-overrides">`
  And the style block contains `--color-accent: ff0000;`

Scenario: Preview returns 404 for base without reference example
  Given the emdesign backend is running
  When I fetch GET /api/bases/stitch/preview
  Then the status code is 404
```

### 2.2 Customization & creation

```gherkin
Feature: Design System Customization
  As a user who picked a base
  I want to customize colors, fonts, and shape
  So that the resulting system fits my brand

Scenario: Customize base via API
  Given the emdesign backend is running
  And a clean test environment
  When I POST /api/design-systems/customize with:
    | baseRef       | open-design/brutalist          |
    | id            | test-custom                    |
    | name          | Test Custom                    |
    | customizations.accentColor   | #ff6600            |
    | customizations.headlineFont  | Inter              |
    | customizations.roundness     | 4px                |
  Then the status code is 200
  And the response has: id, apply, note
  And id equals "test-custom"
  And design-systems/test-custom/ exists on disk
  And design-systems/test-custom/tokens.css contains `--color-accent: #ff6600`
  And design-systems/test-custom/tokens.css contains `--font-display: "Inter"`
  And design-systems/test-custom/tokens.css contains `--radius: 4px`

Scenario: Customize requires baseRef
  Given the emdesign backend is running
  When I POST /api/design-systems/customize with empty body
  Then the status code is 400
  And the error mentions "baseRef"

Scenario: Customize applies the new system immediately
  Given the emdesign backend is running
  When I POST /api/design-systems/customize with valid payload
  Then the response's apply.id equals the new system id
  And GET /api/state returns activeDesignSystem matching the new id

Scenario: List user-created systems
  Given the emdesign backend is running
  And a customized system exists
  When I fetch GET /api/design-systems
  Then the response includes a systems array
  And the customized system appears in the list
```

---

## 3. Component Generation & Agent Loop

### 3.1 Generate component via MCP

```gherkin
Feature: Component Generation
  As an agent or user
  I want to generate a new component
  So that it appears in src/generated/ and is lint-checked

Scenario: Get design context
  Given the emdesign backend is running
  And an active design system is set
  When I call MCP tool get_design_context with:
    | componentName | TestComponent          |
    | instruction   | A simple hero section  |
  Then the response contains:
    - DESIGN.md excerpt
    - token list
    - primitive list
    - codegen instructions

Scenario: Generate a new component
  Given the emdesign backend is running
  When I call MCP tool generate_component with:
    | mode   | create                     |
    | name   | TestHero                   |
    | source | (valid React + token code) |
  Then the lint report is included
  And the file src/generated/TestHero.tsx exists
  And the file src/generated/TestHero.stories.tsx exists (if story provided)

Scenario: Generated component with lint violations
  Given the emdesign backend is running
  When I call generate_component with source containing raw hex colors
  Then the lint report contains P0 findings
  And lintPassing in the store is false

Scenario: Edit existing component
  Given the emdesign backend is running
  And a generated component TestHero exists
  When I call generate_component with mode "edit" and new source
  Then the component source is updated on disk
  And lint re-runs on the new source

Scenario: Lint component via MCP
  Given the emdesign backend is running
  And a generated component exists
  When I call MCP tool lint_component with:
    | name | TestHero |
  Then the response contains:
    - report string with findings
    - mustFix count
    - tokenScore (0-1)
    - findings count
```

### 3.2 Visual testing

```gherkin
Feature: Visual Regression Testing
  As a developer
  I want to screenshot components and diff against baselines
  So that I can catch visual regressions

Scenario: First run establishes baseline
  Given Storybook is running on :6006
  And no baseline exists for component TestHero
  When I call MCP tool test_component with:
    | component | TestHero |
    | tests     | ["visual"] |
  Then the visual.status is "new"
  And a baseline PNG is stored

Scenario: Second run passes if unchanged
  Given a baseline exists for TestHero
  When I call test_component with | component | TestHero |
  Then the visual.status is "pass"
  And visual.changedPixels is 0

Scenario: Visual diff detects change
  Given a baseline exists for TestHero
  When I modify the component source
  And call test_component with | component | TestHero |
  Then the visual.status is "changed"
  And visual.changedPixels is > 0

Scenario: Render snapshot extraction
  Given Storybook is running on :6006
  When I call MCP tool test_component with:
    | component | TestHero |
    | tests     | ["snapshot"] |
  Then the snapshot has nodes array
  And nodes contain selector, tag, box, styles
```

### 3.3 Vision critique

```gherkin
Feature: Vision Critique
  As a reviewer
  I want to get LLM-based visual scores for a component
  So that I can catch subjective design issues

Scenario: Vision critique returns scores
  Given Storybook is running
  And a vision provider is configured
  When I call MCP tool vision_review with:
    | mode      | critique     |
    | component | TestHero     |
  Then the response contains:
    - visionScore (0-1)
    - axes: hierarchy, balance, spacingRhythm, onBrand, polish
    - mustFix count

Scenario: Vision critique without provider falls back gracefully
  Given no vision provider is configured
  When I call vision_review
  Then an error or fallback message is returned
```

---

## 4. Critique Gate

### 4.1 Score computation

```gherkin
Feature: Critique Gate
  As the quality gate
  I want to compute composite scores and enforce thresholds
  So that only high-quality components pass

Scenario: Gate ships perfect component
  Given the emdesign backend is running
  When I call MCP tool evaluate_component with:
    | scores.tokens  | 1.0   |
    | scores.visual  | 1.0   |
    | scores.vision  | 0.9   |
    | scores.llm     | 0.9   |
    | mustFix        | 0     |
  Then the decision is "ship"
  And composite >= 0.8
  And unsatisfiedConditions is empty

Scenario: Gate blocks when mustFix > 0
  Given the emdesign backend is running
  When I call evaluate_component with:
    | scores.tokens  | 0.95  |
    | scores.visual  | 1.0   |
    | mustFix        | 2     |
  Then the decision is "revise"
  And unsatisfiedConditions contains "mustFix"

Scenario: Gate blocks below threshold
  Given the emdesign backend is running
  When I call evaluate_component with:
    | scores.tokens  | 0.3   |
    | scores.visual  | 0.3   |
    | mustFix        | 0     |
  Then the decision is "revise"
  And unsatisfiedConditions mentions "below threshold"

Scenario: Gate blocks source below floor
  Given the emdesign backend is running
  When I call evaluate_component with:
    | scores.visual  | 0.2   |
    | mustFix        | 0     |
  Then the decision is "revise"
  And unsatisfiedConditions mentions "below floor"

Scenario: Gate with auto-collect (no manual scores)
  Given the emdesign backend is running
  And a generated component TestHero exists
  When I call evaluate_component with:
    | component | TestHero |
    | mustFix   | 0        |
  Then scores are auto-collected from lint + visual
  And a decision is returned
```

### 4.2 Baseline ratchet

```gherkin
Feature: Quality Ratchet
  As the quality gate
  I want to prevent quality regression across iterations
  So that components never get worse

Scenario: Ratchet stores baseline on first ship
  Given a component with no prior baseline
  When I call scoreComponent with passing scores
  Then a baseline is written to baselines.json
  And baseline.composite matches the shipped composite
  And baseline.perSource matches the shipped per-source scores

Scenario: Ratchet blocks composite regression
  Given a component with baseline composite = 0.9
  When I call scoreComponent with composite = 0.7
  Then the decision is "revise"
  And unsatisfiedConditions mentions "regression"

Scenario: Ratchet blocks per-source regression
  Given a component with baseline tokens = 0.9
  When I call scoreComponent with tokens = 0.7 and higher composite
  Then the decision is "revise"
  And unsatisfiedConditions mentions "per-source regression"

Scenario: Ratchet allows improvement
  Given a component with baseline composite = 0.8
  When I call scoreComponent with composite = 0.95
  Then the decision is "ship"
  And the baseline is updated to 0.95
```

---

## 5. Story Charters

### 5.1 Charter evaluation

```gherkin
Feature: Story Charters
  As a component author
  I want to define assertions inline in CSF
  So that structural properties are validated per story

Scenario: Evaluate charters via MCP
  Given Storybook is running
  And a component with charters defined in its CSF
  When I call MCP tool evaluate_story_charters with:
    | component | TestComponent |
  Then the response contains:
    - component name
    - results array
    - chartersFound or note

Scenario: Charter passes when assertion holds
  Given a CSF with charter: "button renders with text"
  When the story is rendered
  And the button element has text content
  Then the charter result is pass

Scenario: Charter fails when assertion breaks
  Given a CSF with charter: "loading state shows spinner"
  When the story renders in loading state
  And the spinner element is missing
  Then the charter result is fail
  And the failure message describes what was expected
```

### 5.2 Charter types and integration

```gherkin
Feature: Charter Types and Integration
  As a power user
  I want to define component-level and story-level charters
  So that assertions are scoped correctly

Scenario: Component-level charter runs on all stories
  Given a CSF with component-level charter: "has heading"
  When any story of that component renders
  Then the charter is evaluated
  And results are sent via the Storybook channel

Scenario: Story-level charter runs only on that story
  Given a CSF with story-level charter: "title visible" on Story Default
  When another story renders
  Then "title visible" is NOT evaluated
  When the Default story renders
  Then "title visible" IS evaluated

Scenario: No charters defined returns empty result
  Given a story with no charters in its CSF
  When the story renders
  Then the charter result has total = 0
  And allPass = true

Scenario: Charters tab appears in Storybook
  Given Storybook is running with @emdesign/addon
  When I navigate to the Charters tab
  Then the tab shows "Charters" title
  And it displays charter results for the current story
```

---

## 6. Capture Pipeline

### 6.1 Component capture

```gherkin
Feature: Component Capture
  As a developer
  I want to promote generated components to captured
  So that they become reusable, git-tracked assets

Scenario: Capture component promotes files
  Given a generated component TestHero.tsx exists
  When I call MCP tool capture_component with:
    | name | TestHero |
  Then the component is copied to src/components/TestHero/
  And src/components/TestHero/TestHero.tsx exists
  And src/components/TestHero/TestHero.stories.tsx exists
  And doc header is prepended

Scenario: Capture with baseline seeds visual baseline
  Given a generated component TestHero.tsx exists
  When I call MCP tool capture_component_with_baseline with:
    | name | TestHero |
  Then src/components/TestHero/ is created
  And a .baseline.png is stored in __screenshots__/

Scenario: Capture fails for non-existent component
  Given no generated component named NonExistent
  When I call capture_component with name "NonExistent"
  Then the response contains an error
```

---

## 7. Backend API

### 7.1 HTTP endpoints

```gherkin
Feature: Backend HTTP API
  As the Storybook addon
  I want reliable HTTP endpoints
  So that the UI stays in sync with the backend state

Scenario: Health endpoint returns server status
  Given the emdesign backend is running
  When I fetch GET /api/health
  Then the status code is 200
  And the response has: ok, name, version, activeDesignSystem

Scenario: State endpoint returns current state
  Given the emdesign backend is running
  When I fetch GET /api/state
  Then the status code is 200
  And the response has: activeDesignSystem, currentComponent,
    changeRequests, lastDiff, lintPassing, lastCritique

Scenario: Submit intent enqueues change request
  Given the emdesign backend is running
  When I POST /api/intent with:
    | type        | create-component   |
    | instruction | Create a hero      |
    | payload     | { name: "Hero" }  |
  Then the response is the updated state
  And changeRequests array has 1 new entry with status "queued"

Scenario: Visual test via HTTP
  Given Storybook is running
  And the emdesign backend is running
  When I POST /api/visual-test with:
    | component | TestHero |
  Then the response has status
```

### 7.2 MCP tools

```gherkin
Feature: MCP Tool Surface
  As an agent
  I want a consistent, discoverable set of MCP tools
  So that I can drive the design loop

Scenario: Discover components lists generated files
  Given generated components exist
  When I call MCP tool discover_components with:
    | source | generated |
  Then the response is a JSON array
  And each entry has: id, previewUrl

Scenario: Rebuild graph produces stats
  Given a design system exists
  When I call MCP tool rebuild_graph with:
    | id | atelier |
  Then the response contains node and edge counts

Scenario: Query knowledge graph
  Given the graph is built
  When I call MCP tool query_knowledge_graph with:
    | mode     | query                |
    | label    | primitive            |
  Then the response contains matching graph nodes
```

---

## 8. Edge Cases & Error Handling

### 8.1 Resilience

```gherkin
Feature: Error Resilience
  As the system
  I want to handle failures gracefully
  So that the user gets clear error messages

Scenario: Backend handles missing Storybook
  Given Storybook is not running
  When I call test_component
  Then the visual.status is "error"
  And no uncaught exception occurs

Scenario: Visual test for empty component name
  Given the emdesign backend is running
  When I call test_component with:
    | component | "" |
  Then the visual.status is "error"

Scenario: Lint non-existent component
  Given no component with name NonExistent
  When I call lint_component with:
    | name | NonExistent |
  Then the tool returns an error about file not found

Scenario: Generate with invalid component name
  Given the backend is running
  When I call generate_component with:
    | name   | ""       |
    | source | (valid)  |
  Then the response contains an error

Scenario: Backend down gives clear error in addon
  Given the emdesign backend is NOT running
  When the Storybook addon tries to fetch state
  Then the UI shows "Backend not reachable" error banner
  And the addon does not crash
```

---

## Summary

| Feature Area | Scenarios | Priority |
|---|---|---|
| Project Initialization | 4 | P0 |
| Design System Browser & Customization | 7 | P0 |
| Component Generation & Agent Loop | 5 | P0 |
| Critique Gate | 7 | P0 |
| Visual Testing | 4 | P0 |
| Story Charters | 5 | P1 |
| Capture Pipeline | 3 | P1 |
| Backend API (HTTP + MCP) | 5 | P1 |
| Error Handling | 5 | P0 |
| **Total** | **45** | |

## Running the tests

Once implemented as Playwright tests:

```bash
# Start dependencies
npx storybook dev -p 6006
npx tsx packages/cli/src/cli.ts serve

# Run all e2e tests
npx playwright test --config e2e/playwright.config.ts

# Run by feature area
npx playwright test --grep "Design System Catalog"
npx playwright test --grep "Critique Gate"

# Run smoke tests
npx playwright test --grep "P0"
```

### Suggested file structure

```
e2e/
├── playwright.config.ts
├── fixtures/
│   └── test-components.ts       # Helper to generate test components
├── specs/
│   ├── 01-init.spec.ts
│   ├── 02-ds-browser.spec.ts
│   ├── 03-component-gen.spec.ts
│   ├── 04-critique-gate.spec.ts
│   ├── 05-charters.spec.ts
│   ├── 06-capture.spec.ts
│   ├── 07-api.spec.ts
│   └── 08-error-handling.spec.ts
```
