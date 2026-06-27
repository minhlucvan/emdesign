# CLI Feedback: emdesign Design-Engineering CLI

> Date: 2026-06-27
> Workspace: `examples/blank` (Atelier design system, react-tailwind framework)
> CLI source: `packages/cli/`

---

## 0. Target Workflow — The Main Scenarios the CLI Must Serve

These are the primary user workflows the CLI should be organized around:

| # | Scenario | Current CLI Path | Status |
|---|----------|-----------------|--------|
| 1 | **Init a project** | `emdesign init <framework>` | ✅ Clean |
| 2 | **Start the server** | `emdesign serve` / `emdesign up` | ✅ Clean |
| 3 | **Build the knowledge graph** | `emdesign graph build` | ✅ Clean |
| 4 | **Create a design system** | `emdesign ds create <id>` | ✅ Clean |
| 5 | **Update a design system** | ❌ No `ds update` — must edit files | 🔴 Missing |
| 6 | **Explore a design system** | `emdesign explore ds\|tokens\|primitives\|rules` | ✅ Clean |
| 7 | **Explore components / stories** | `emdesign explore components` / `discover` | ✅ Clean |
| 8 | **Get design context for a component** | `emdesign design <comp>` | ⚠️ Ambiguous name (see §3) |
| 9 | **Create a component** | `emdesign generate <name> --source` | ⚠️ Needs inline `--content` |
| 10 | **Create a page/view** | ❌ No view composition command | 🔴 Missing |
| 11 | **Lint a component** | `emdesign doctor lint <comp>` / `emdesign lint <comp>` | ✅ Clean |
| 12 | **Full doctor test** | `emdesign doctor all <comp>` | ⚠️ Blocks on failures |
| 13 | **Explore component structure** | `emdesign explore hierarchy <name>` / `graph context` | ✅ Clean |
| 14 | **Trace impact after a change** | `emdesign graph impact <node>` | ⚠️ Node ID format unclear (see §3) |
| 15 | **Promote to reusable** | `emdesign capture <comp>` | ✅ Clean |

**Design principle**: Every scenario should be discoverable through the command hierarchy. The `ds` namespace is for design system operations; the top-level is for project-wide operations.

| Category | Command | Status | Notes |
|----------|---------|--------|-------|
| **Workspace** | `init <framework>` | ✅ | Scaffolds new project |
| | `attach` | ✅ | Links existing project |
| | `update` | ✅ | Refreshes templates |
| | `serve` | ⚠️ | Starts HTTP bridge (needs `@emdesign/session`) |
| | `up` | ⚠️ | Starts everything (bridge + Storybook + WS) |
| | `health` | ✅ | Pings the server |
| **Design System** | `ds list` | ✅ | Lists all DS |
| | `ds create <id> --mode blank` | ✅ | Skeleton + primitives from atelier |
| | `ds create --mode brief\|extract\|import` | ⚠️ | Modes exist in backend but CLI ergonomics need agent |
| | `ds use <id>` | ✅ | Switches active DS, rewires tokens.css, rebuilds graph |
| | `ds validate <id>` | ✅ | Token contract validation via DSR engine |
| | `ds grade <id>` | ⚠️ | Hangs on large systems (no timeout) |
| | `ds scaffold <id>` | ✅ | Copies primitives from base |
| | `ds customize <id>` | ⚠️ | Has `--id` parsing bug (see §3) |
| | `ds conflicts <id>` | ✅ | Lists orphan/unused tokens |
| | `ds history <id>` | ✅ | Shows snapshots |
| | `ds bases` | ✅ | Lists vendored bases |
| | `ds base-detail <id>` | ✅ | Shows base details |
| **Component** | `design <comp> [instr]` | ✅ | Produces comprehensive agent prompt + graph context |
| | `generate <name> --source\|--stdin` | ✅ | Writes + lints component |
| | `doctor lint <comp>` | ✅ | Fast token-lint check |
| | `doctor visual <comp>` | ⚠️ | Needs Storybook running |
| | `doctor charters <comp>` | ⚠️ | Finds story but composite scoring flawed |
| | `doctor react <comp>` | ⚠️ | Falls back to pass if external API down |
| | `doctor all <comp>` | ⚠️ | Blocks on visual timeout if no Storybook |
| | `capture <comp>` | ✅ | Promotes to components/ with header |
| | `vision <comp>` | ⚠️ | Needs Storybook + external AI provider |
| **Browse** | `discover` | ✅ | Lists all stories |
| | `doc <target>` | ✅ | Comprehensive documentation |
| **Graph** | `graph build` | ✅ | Rebuilds knowledge graph |
| | `graph context <node>` | ✅ | Full node context |
| | `graph impact <node>` | ⚠️ | Node ID format ambiguous |
| | `graph where-to-fix` | ✅ | Pinpoints fix location |
| | `graph guidance --intent` | ✅ | Consistency brief |
| | `graph query --label\|--from\|--to` | ✅ | Flexible graph queries |
| **Explore** | `explore overview` | ✅ | Workspace summary |
| | `explore tokens\|primitives\|components` | ✅ | Rich formatted output |
| | `explore hierarchy <name>` | ✅ | Composition tree |
| | `explore rules\|charters\|sections` | ✅ | All DS metadata |
| | `explore stats` | ✅ | Graph node/edge counts |
| | `--json` on all explore topics | ✅ | Structured output |

---

## 2. Gaps — What the CLI Can't Do That the Design Loop Needs

### 2.1 Design System Lifecycle

| Gap | Impact | Severity |
|-----|--------|----------|
| **No `ds update` command** — Can't modify an existing system's DESIGN.md, tokens, or primitives through the CLI. Must edit files manually. | Breaking DS changes have no blast-radius check or validation loop | 🔴 High |
| **No `ds diff` or `ds compare`** — Can't compare two design systems side-by-side | Hard to assess migration impact | 🟡 Medium |
| **`ds grade` hangs** — No timeout or progress indicator for long-running validations | Blocks automation pipelines | 🟡 Medium |
| **`ds validate` output format differs from backend** — CLI uses `runtimeFor().validate()` which returns `{ok, diagnostics}` instead of `validateDesignSystem()` which returns `{declared, missingRoles}` | Inconsistent information for the user | 🟢 Low |
| **`ds create --mode brief/extract` not ergonomic** — These modes need agent+vision support but CLI can't pipe into them | Forces manual authoring | 🟡 Medium |

### 2.2 Component Lifecycle

| Gap | Impact | Severity |
|-----|--------|----------|
| **`generate` requires a file or stdin** — No `--content` flag for inline code | Awkward for AI agents that want to pass source directly | 🟡 Medium |
| **No `generate --edit` pipeline** — `--mode edit` exists but there's no diff-based edit flow | Every edit requires passing the full source again | 🟡 Medium |
| **`doctor all` blocks on first failure** — If Storybook is down, visual test hangs 10s before the next kind runs | Slow feedback loop | 🟡 Medium |
| **No `doctor --watch`** — Can't re-run lint automatically on file changes | Manual iteration | 🟢 Low |
| **No component versioning or rollback** — `capture` overwrites without history | Lost work | 🟡 Medium |

### 2.3 Batch / Multi-File Operations

| Gap | Impact | Severity |
|-----|--------|----------|
| **No batch operations** — All commands operate on one component at a time | Building a dashboard with 10+ components requires 10+ CLI calls | 🔴 High |
| **No pipeline/chaining** — Can't pipe `design` output into `generate` into `doctor` into `capture` | Agent must parse output between each step | 🟡 Medium |

### 2.4 State & Session

| Gap | Impact | Severity |
|-----|--------|----------|
| **No persistent state between commands** — `store` resets on each invocation | Current component, last lint score, last critique all lost | 🟡 Medium |
| **No interactive mode** — Can't run a REPL-like session | Agent must spawn a new process per command (~200ms overhead) | 🟢 Low |

---

## 3. API Pain Points

### 3.1 `design` Top-Level Command is Misleading

`emdesign design <comp> <instruction>` prints a **design context prompt** for an AI agent — it doesn't design anything itself. The name suggests it's a design tool. This should be a `ds` subcommand:

```
# Current:
emdesign design StatsCard "A stats card with trend indicator"

# Proposed:
emdesign ds context StatsCard "A stats card with trend indicator"
# or:
emdesign ds prompt StatsCard "A stats card with trend indicator"
```

This also lets us remove the `design-context` legacy alias and keeps the `ds` namespace as the single entry point for everything design-system-related.

### 3.2 Command Parsing

**`ds customize --id` bug** — When `--id` is not specified, `ds.argv[0]` is the subcommand name ('customize'), not the source id:

```ts
// ds.ts line 125 — BUG
id: ds.argv[ds.argv.indexOf('--id') + 1] ?? a1,
// When --id is absent: indexOf returns -1, so argv[0] = 'customize' (subcommand name!)
// Fix: use ds.args.indexOf('--id') instead, or check against positional args
```

**`doctor` kind parsing ambiguity** — The first positional arg can be a check kind OR a component name. The parser uses a `KINDS` set to disambiguate, but if someone names a component the same as a check kind ('visual', 'react'), it breaks:

```ts
// doctor.ts line 182-193
const KINDS = new Set(['lint', 'visual', 'snapshot', 'spatial', 'charters', 'react']);
if (KINDS.has(first)) { kind = first; component = second; }
```

### 3.2 Output Inconsistencies

| Issue | Example |
|-------|---------|
| **Some output goes to stdout, some to stderr** | `generate` writes status to stderr, `doctor` writes summary to stderr, JSON output to stdout |
| **Error shapes differ** | `formatError()` produces `{ok: false, error}`, but some commands use `console.error()`, others use `process.stderr.write()` |
| **`--json` response envelope is inconsistent** | Most wrap in `{ok: true, data}`, but `ds create` outputs the result directly without the envelope |
| **No standard error code for specific failure modes** | Lint failure, visual failure, and missing component all exit 1 with `--gate` |

### 3.3 Missing Useful Flags

| Command | Missing Flag | Why |
|---------|-------------|-----|
| `generate` | `--content` | Inline source instead of file/stdin |
| `doctor` | `--timeout` | Per-kind timeout override |
| `ds create` | `--description` | Set description without editing manifest |
| `ds validate` | `--strict` | Warnings as errors |
| `discover` | `--jsonl` | JSON lines format for streaming |
| All commands | `--quiet` | Suppress stderr, only stdout (for machine consumption) |

### 3.4 General UX

- **Help text is nice but thin** — `emdesign --help` doesn't show `ds` subcommands or their flags
- **No shell completion** — No `--completion` flag for bash/zsh autocomplete
- **No `--version`** — Can't check which version of the CLI is installed
- **Flag values after `=` not supported** — Must use space-separated (`--name foo`, not `--name=foo`)
- **Error messages are inconsistent** — Some show usage hints, others just `process.exit(1)` with no context

---

## 4. What a Comprehensive Dashboard Workflow Needs from the CLI

To build a **comprehensive dashboard** (Sidebar, Header, StatCards, DataTable, Charts, etc.), the CLI needs:

### 4.1 Design System Requirements

A dashboard-appropriate design system differs from Atelier (editorial):
- **More color tokens**: Surface variants (sidebar, header, interactive rows), text tiers (primary, secondary, disabled, inverse), chart colors (series colors, gradients)
- **Denser spacing scale**: Tighter grid for data-dense layouts
- **Component specs for data widgets**: DataTable (sortable columns, pagination, row states), Chart container, StatCard, FilterBar, Pagination
- **Dark mode support**: Dashboard apps commonly have light/dark toggle

**Current status**: Atelier is an editorial system. For a dashboard, we'd need to create a new system (e.g., "Operational" or "Dashboard") with broader token coverage.

### 4.2 Component Building Requirements

| Need | Current CLI State | Gap |
|------|------------------|-----|
| Create StatsCard | ✅ `design` + `generate` works | None |
| Create Sidebar | ✅ Would work | None |
| Create DataTable | ✅ Would work | Complex component — needs multi-step |
| Create Header/Nav | ✅ Would work | None |
| Compose into Dashboard | ❌ No view/page composition | 🔴 `design` generates prompts but no tree composition |
| Batch generate 5+ components | ❌ One at a time | 🔴 No batch mode |
| Reuse existing components | ✅ `explore` + `graph` shows them | None |
| Check visual regression | ⚠️ Needs Storybook running | Normal for CI |
| Ship all components | ❌ One `capture` per component | 🟡 No bulk capture |
| Version tracking | ❌ No component history | 🟡 No rollback |

### 4.3 Priority CLI Improvements for Dashboard Work

| Priority | Improvement | Workaround |
|----------|-------------|------------|
| 🔴 P0 | Batch/multi-component operations | Shell scripts wrapping the CLI |
| 🔴 P0 | Design system with dashboard tokens | Create new DS manually |
| 🟡 P1 | `ds update` for incremental DS changes | Edit files manually |
| 🟡 P1 | `generate` inline `--content` flag | Use temp files |
| 🟡 P1 | View/page composition (component tree) | Manual assembly |
| 🟢 P2 | `doctor --timeout` flag | Set env vars |
| 🟢 P2 | Component versioning in capture | Manual git tracking |
| 🟢 P2 | Non-blocking `doctor all` (run kinds in parallel, report partial results) | Run doctor per-kind |

---

## 5. Bugs Found

| ID | Bug | File | Impact |
|----|-----|------|--------|
| B1 | `ds customize --id` resolves to subcommand name when absent | `ds.ts:125` | Creates system with wrong ID |
| B2 | `doctor charters` produces no numeric score → composite stays 0 | `doctor.ts:168-192` | Charters check always fails gate |
| B3 | `ds grade` has no timeout — can hang indefinitely | `ds.ts:70` | Blocks CI pipelines |
| B4 | `ds validate` output format differs from `validateDesignSystem()` | `ds.ts:62` | Missing declared token count / missing roles in output |

---

## 6. Recommendations

### Short-term (fix bugs, small wins)

1. **Fix B1** (`ds customize --id`): Use `ds.args.indexOf` instead of `ds.argv.indexOf` so the subcommand name isn't picked up
2. **Fix B2** (charters score): Add `scores.charters = findings.length > 0 ? 1 : 0` or similar to give charters a numeric score
3. **Add `--timeout`** to `doctor` and `ds grade` commands
4. **Add `--content` flag** to `generate` for inline source
5. **Add `--version` flag** (read from package.json)
6. **Consolidate error output** — all errors should use `formatError()` for consistent `{ok: false}` shape

### Medium-term (pipeline improvements)

7. **Add `ds update`** command — edit DESIGN.md, tokens.css, manifest, revalidate, rebuild graph
8. **Add `--json` response envelope** consistency — all commands should wrap in `{ok, data, meta}`
9. **Add batch mode** — accept multiple component names or a directory of files
10. **Add `doctor --parallel`** — run kinds concurrently, report partial aggregates

### Long-term (dashboard workflow)

11. **View composition** — `compose` command that takes a component tree spec and builds the view
12. **Dashboard template** — `init dashboard` that scaffolds a project with a dashboard DS
13. **Automatic Storybook story generation** — `generate --stories` that writes CSF based on component props
14. **Component registry with versioning** — track captured component versions in the graph

---

## Appendix: Quick Reference

### Running the CLI

```bash
# From the monorepo root:
npx tsx packages/cli/src/cli.ts <command>

# From an emdesign workspace:
npx tsx /path/to/medesign/packages/cli/src/cli.ts <command>
```

### Universal Flags

| Flag | Behavior |
|------|----------|
| `--json` | Structured JSON on stdout |
| `--gate` | Exit code = verdict (0 = pass, 1 = fail) |

### Design System Commands

```bash
emdesign ds list                                          # List all DS
emdesign ds create <id> --mode blank --from <base>        # Create skeleton
emdesign ds use <id>                                      # Switch active DS
emdesign ds validate [id] [--gate]                        # Validate tokens
emdesign ds grade [id] [--gate]                           # Grade quality
emdesign ds scaffold <id> --from <base>                   # Copy primitives
emdesign ds customize <id> --color #hex --font <family>   # Clone + tweak
emdesign ds conflicts [id]                                # List token conflicts
emdesign ds history [id] [--snapshot]                     # Version history
emdesign ds bases                                         # List vendored bases
emdesign ds base-detail <id>                              # Base details
```

### Component Commands

```bash
emdesign design <name> "instruction"                      # Design context prompt
emdesign generate <name> --source <file> --story <file>   # Write + lint component
emdesign generate <name> --stdin --stdin-story            # Pipe component content
emdesign doctor lint <component>                          # Fast token lint
emdesign doctor visual <component>                        # Visual diff
emdesign doctor charters <component>                      # Story charter check
emdesign doctor react <component>                         # React analysis
emdesign doctor all <component> --gate                    # Full check
emdesign capture <component> [--baseline]                 # Promote to reusable
emdesign vision <component>                               # AI visual critique
```

### Graph Commands

```bash
emdesign graph build [ds-id]                              # Rebuild graph
emdesign graph context <node-id>                          # Node context
emdesign graph impact <node-id>                           # Blast radius
emdesign graph where-to-fix <artifact> <finding>          # Fix location
emdesign graph guidance [name] --intent <text>            # Consistency brief
emdesign graph query --label token --where '{"kind":"color"}'  # Query
```

### Explore Commands

```bash
emdesign explore [overview|ds|tokens|primitives|components|hierarchy|rules|charters|sections|stats]
emdesign explore hierarchy <name>                         # Composition tree
emdesign explore tokens --json                            # Structured output
```
