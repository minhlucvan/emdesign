# MCP Tool Reference

All tools available at `http://localhost:4321/mcp`. Connect any MCP-capable agent (Claude Code, Cursor, Copilot).

---

## `get_design_context`
**Understand the design system before building.** Returns the full DESIGN.md contract, available tokens, primitives, codegen rules, and anti-patterns.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `componentName` | string | no | Component you intend to build (for contextual guidance) |
| `instruction` | string | no | What the component should do (for tailored context) |

**Example:** `{ componentName: "UserCard", instruction: "A card showing user avatar, name, and role" }`

---

## `generate_component`
**Create a NEW component or EDIT an existing one.** Writes .tsx source + optional CSF story, auto-lints.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `mode` | "create" \| "edit" | yes | Create new or edit existing |
| `name` | string | yes | PascalCase component name |
| `source` | string | yes | Full .tsx source. Import from "@ds" |
| `story` | string | no | CSF story content |

**Rules:**
- Import primitives from `@ds` — `import { Button } from "@ds/Button"`
- Use semantic token classes only: `bg-surface`, `text-accent`, `rounded`, etc.
- No inline styles, no raw hex colors, no hardcoded spacing
- Story title format: `Generated/<Name>`

---

## `test_component`
**Run visual diffs and render snapshots.** Screenshots vs baseline with pixelmatch diff.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `component` | string | yes | Component name |
| `tests` | ("visual" \| "snapshot")[] | no | Tests to run (default: ["visual"]) |

**Returns:** `{ visual: { status, changedPixels, screenshotPath }, preview: "http://..." }`

---

## `lint_component`
**Check design-system consistency.** Token binding compliance + anti-slop rules.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | yes | Component name |

**Returns:** Findings grouped by severity (P0, P1, P2). P0 = blocker.

---

## `evaluate_component`
**Run the full quality gate.** Combines all feedback sources into a composite score.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `scores` | object | no | `{ visual?, tokens?, vision?, llm?, a11y? }` (0–1) |
| `mustFix` | number | yes | Count of P0 blocker issues |
| `threshold` | number | no | Minimum composite to ship (default: 0.8) |
| `component` | string | no | For per-component ratchet tracking |
| `evidenceSlug` | string | no | Persist this round as evidence |

**Returns:** `{ composite, decision: "ship" | "continue", ... }`

---

## `manage_design_system`
**All design system operations in one tool.**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `action` | "create" \| "apply" \| "validate" \| "grade" \| "scaffold" \| "conflicts" \| "history" \| "list" \| "list_bases" | yes | What to do |
| `id` | string | varies | DS ID (required for most actions) |
| `name` | string | no | Display name (for create) |
| `mode` | "blank" \| "brief" \| "import" \| "extract" | no | Creation mode |
| `from` | string | no | Source base/template |
| `snapshot` | boolean | no | Commit snapshot (for history) |

---

## `query_knowledge_graph`
**Query the design system knowledge graph.** Five query modes.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `mode` | "where_to_fix" \| "impact" \| "context" \| "build_guidance" \| "query" | yes | Query mode |
| `artifact` | string | for where_to_fix | Component/artifact name |
| `findingId` | string | for where_to_fix | Lint finding ID |
| `node` | string | for impact/context | Graph node ID |
| `name` | string | for build_guidance | New component name |
| `intent` | string | no | Component intent |
| `label`/`edgeLabel`/`from`/`to`/`where` | various | for query | Generic query filters |

---

## `rebuild_graph`
**Rebuild the knowledge graph from scratch.** Run after adding components, tokens, or primitives.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | no | DS ID (default: active) |

---

## `vision_review`
**Vision-based visual critique** using an LLM (Claude, Gemini, Minimax).

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `mode` | "critique" \| "compare" \| "upload_reference" | yes | What to do |
| `component` | string | yes | Component name |
| `provider` | "claude" \| "gemini" \| "minimax" | no | LLM provider |
| `referenceImagePath` | string | for compare/upload | Reference image path |
| `ensembleProviders` | array | no | Multi-provider ensemble |

---

## `handle_change_request`
**Process the panel change-request queue.**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `action` | "poll" \| "resolve" \| "changed_stories" | yes | What to do |
| `id` | string | for resolve | Request ID |
| `status` | "done" \| "error" | for resolve | Resolution |
| `note` | string | no | Resolution note |
| `since` | string | for changed_stories | Git ref (default: HEAD~1) |

---

## `discover_components`
**Discover available components, stories, and design systems.**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `source` | "generated" \| "components" \| "primitives" \| "all" \| "design_systems" | no | What to list |
| `filter` | string | no | Text search filter |

---

## `get_component_documentation`
**Get comprehensive docs for a component or story.**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `target` | string | yes | Component name or story ID |

---

## `capture_component`
**Promote generated → reusable, git-tracked component.** Final step after passing evaluation.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | yes | Component name |
