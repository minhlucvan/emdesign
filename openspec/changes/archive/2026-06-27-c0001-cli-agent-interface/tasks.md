# Tasks — c0001-cli-agent-interface

## Task 1: Audit current MCP and CLI surface

**Verify:** `node scripts/audit-commands.js` (or manual inspection) produces a gap analysis: every MCP tool in `packages/mcp-server/src/mcp.ts` mapped to either an existing CLI command or a new one to create.

**Steps:**
1. Read every MCP tool definition in `packages/mcp-server/src/mcp.ts` — catalog tool name, arguments, return shape, backend function calls
2. Read every CLI command in `packages/cli/src/cli.ts` — catalog name, flags, behavior
3. Produce a mapping: MCP tool → CLI command (existing) or MCP tool → needs-new-CLI-command
4. Identify backend exports that need to be added to `packages/backend/src/index.ts`

**Exit:** Clear mapping document. Estimate: ~18 MCP tools → ~36 new CLI command variants.

---

## Task 2: Add missing backend exports

**Verify:** `packages/backend/src/index.ts` exports every function that MCP tools use but CLI doesn't yet expose.

**Steps:**
1. Identify backend functions only consumed by MCP server (from Task 1 audit)
2. Add them to `packages/backend/src/index.ts` if not already exported
3. Specifically check: `collectScores` (partially exported), `renderSnapshot`, `spatialAudit`, `standardCritique`, graph query helpers, charter evaluation helpers

**Exit:** `grep` shows all required backend functions are exported from `packages/backend/src/index.ts`.

---

## Task 3: Implement `--json` output helper in CLI

**Verify:** A `formatJson(data)` helper exists and is used by all new commands. A `CliResponse` type is defined.

**Steps:**
1. Add `formatJson(data, opts?)` → writes JSON to stdout, human-readable to stderr
2. Add `gateExit(result)` → calls `process.exit(1)` on gate failure
3. Add `resolveCmd(store, paths, cmd)` → returns `{ serverUp, result }` with the proxy-or-embed pattern
4. Document the pattern in a comment at the top of `cli.ts`

**Exit:** Helper functions exist and are unit-testable (or at least manually verified with a simple command).

---

## Task 4: Implement new CLI commands — Design context & discovery

**Verify:** `emdesign design-context --json`, `emdesign discover --source all --json`, and `emdesign documentation <target> --json` all return valid JSON.

**Steps:**
1. `design-context` — already exists, add `--json` flag support
2. `discover` — new command wrapping `fetchStorybookIndex` + `runtimeFor().list()` with `--source` and `--filter` flags
3. `documentation` — new command wrapping MCP's `get_component_documentation` logic

**Exit:** Manual test of each command produces valid JSON on stdout, human text on stderr.

---

## Task 5: Implement new CLI commands — Generate, lint, test

**Verify:** `emdesign generate`, `emdesign lint`, `emdesign test`, `emdesign visual-test`, `emdesign render-lint` all work with `--json`.

**Steps:**
1. `generate` — exists but needs `--stdin` support for input source; add `--story` flag; add `--json` to output
2. `lint` — exists, add `--json` and `--gate`
3. `test` — new command combining visual + snapshot tests (from MCP `test_component`)
4. `visual-test` — exists, add `--json` and `--gate`
5. `render-lint` — exists, add `--json` and fix `--themes` parsing

**Exit:** Each command with `--json` outputs valid JSON. Gate commands with `--gate` exit 1 on failure.

---

## Task 6: Implement new CLI commands — Score, critique, capture

**Verify:** `emdesign score`, `emdesign vision-critique`, `emdesign vision-compare`, `emdesign capture`, `emdesign capture-baseline`, `emdesign eval-charters`, `emdesign doctor` all work with `--json`.

**Steps:**
1. `score` — exists, add `--component` for auto-collect, add `--evidence`, add `--gate`
2. `vision-critique` — exists, add `--json`
3. `vision-compare` — exists, add `--json`
4. `capture` — exists, add `--baseline` flag, add `--json`
5. `capture-baseline` — new command wrapping MCP `capture_baseline`
6. `eval-charters` — new command wrapping MCP `evaluate_story_charters`
7. `doctor` — new command wrapping MCP `run_react_doctor`
8. `spatial-audit` — new command wrapping MCP `spatial_audit`

**Exit:** Each command with `--json` produces valid JSON.

---

## Task 7: Implement new CLI commands — Change requests

**Verify:** `emdesign change-request poll`, `emdesign change-request resolve <id>`, `emdesign change-request changed-stories`, `emdesign change-request all --json` all work.

**Steps:**
1. Implement `change-request` as a subcommand group
   - `poll` → wraps `store.nextQueued()`
   - `resolve <id>` → wraps `store.setChangeRequestStatus()`
   - `changed-stories` → wraps `git diff --name-only`
   - `all` → returns all pending/active requests

**Exit:** Manual test with a test change request in `.emdesign/state.json`.

---

## Task 8: Implement new CLI commands — Graph operations

**Verify:** `emdesign graph build`, `emdesign graph where-to-fix`, `emdesign graph impact`, `emdesign graph context`, `emdesign graph guidance`, `emdesign graph query` all work with `--json`.

**Steps:**
1. `graph build [id]` — exists
2. `graph where-to-fix <artifact> <finding>` — new, wraps graph's `whereToFix`
3. `graph impact <node>` — new, wraps `findAffected`
4. `graph context <node>` — new, wraps `getContext`
5. `graph guidance <name> [--intent]` — new, wraps `consistencyBrief`
6. `graph query [--label] [--from] [--to] [--where]` — new, wraps graph `query`

**Exit:** Each subcommand with `--json` produces valid JSON.

---

## Task 9: Implement new CLI commands — DS extras & tailwind

**Verify:** `emdesign ds grade`, `emdesign ds conflicts`, `emdesign ds history`, `emdesign ds base-detail`, `emdesign ds preview-html`, `emdesign ds customize`, `emdesign tailwind-config` all work.

**Steps:**
1. `ds grade` — exists, add `--gate` and `--json`
2. `ds conflicts` — exists, add `--json`
3. `ds history` — exists, add `--json`
4. `ds base-detail` — new, wraps `baseDetail`
5. `ds preview-html` — new, wraps `basePreviewHtml`
6. `ds customize` — new, wraps `customizeDesignSystem`
7. `tailwind-config` — new, wraps MCP `generate_tailwind_config`

**Exit:** Each command with `--json` produces valid JSON.

---

## Task 10: Remove MCP server package

**Verify:** `packages/mcp-server/` directory deleted, no imports of `@emdesign/mcp-server` remain anywhere in the codebase, `npm install` works without it.

**Steps:**
1. Delete `packages/mcp-server/` directory
2. Remove `@emdesign/mcp-server` from `packages/cli/package.json` dependencies
3. Remove `@emdesign/mcp-server` from root `package.json` workspaces (if listed)
4. Remove all `import` of `@emdesign/mcp-server` from `packages/cli/src/cli.ts`:
   - Remove `createMcpServer` import and `createMcpHttpRouter` import
   - Remove MCP stdio connection in `mcp` command (delete the entire case)
   - Remove MCP HTTP mount in `serve` command
   - Remove MCP server creation in `up` command
5. Run `npm install` to verify clean dependency graph

**Exit:** `grep -r '@emdesign/mcp-server' .` returns nothing. `npm install` succeeds.

---

## Task 11: Update gates and workflow scripts

**Verify:** `scripts/gates/lint.sh`, `scripts/gates/visual.sh`, `scripts/gates/build.sh` all use the new CLI. Workflow `.js` files replace MCP tool calls with CLI subprocess calls.

**Steps:**
1. Update `scripts/gates/lint.sh`: `emdesign lint "$1" --gate`
2. Update `scripts/gates/visual.sh`: `emdesign visual-test "$1" --gate`
3. Review all workflow scripts in `.claude/workflows/*.js` for MCP tool references
4. Replace MCP tool calls with `agent('run emdesign <cmd> --json', ...)` subprocess calls
5. Review `/mds:*` command files for MCP tool references

**Exit:** All gates and workflows work without a running MCP server.

---

## Task 12: Update documentation

**Verify:** `docs/agent-integration.md` describes CLI-based integration. No MCP references remain in agent-facing docs.

**Steps:**
1. Rewrite `docs/agent-integration.md`:
   - Remove all MCP configuration sections (`.mcp.json`, `claude mcp add`, etc.)
   - Document CLI-based integration pattern
   - Document `--json` output format
   - Document gate convention
   - Add troubleshooting section for CLI
2. Update `docs/architecture.md`:
   - Remove MCP server box from architecture diagram
   - Update "Two ways to drive" to describe CLI-only path
3. Update `docs/harness-engine.md`:
   - Replace MCP references with CLI references
4. Update `CONTRIBUTING.md` if it references MCP

**Exit:** All docs are internally consistent and MCP-free.

---

## Task 13: Remove MCP from serve/up commands

**Verify:** `emdesign serve` no longer mounts an MCP HTTP endpoint. `emdesign up` no longer starts an MCP stdio server. The `/mcp` route returns 404.

**Steps:**
1. In `serve`: remove the `createMcpHttpRouter` call and mounting
2. In `up`: remove the `createMcpServer` call and stdio connection
3. Remove the `mcp` command case entirely from `cli.ts`
4. Add deprecation note if anyone tries `emdesign mcp`

**Exit:** Start `emdesign serve`, curl `localhost:4321/mcp` → 404. `emdesign mcp` → help message saying it's removed.

---

## Task 14: Integration test — full workflow without MCP

**Verify:** A complete loop (design-context → generate → lint → visual-test → score) works using only CLI subprocess calls, with no MCP server and no HTTP server running.

**Steps:**
1. Ensure Storybook is running (needed for visual tests)
2. Run: `emdesign design-context --json`
3. Run: `emdesign generate Button --mode create --stdin --json` (pipe test source)
4. Run: `emdesign lint Button --json --gate`
5. Run: `emdesign visual-test Button --json`
6. Run: `emdesign score --component Button --json --gate`
7. Verify all commands return valid JSON and correct exit codes

**Exit:** All commands succeed without a running `emdesign serve` process.
