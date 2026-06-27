# CLI Command Tree

## ADDED — Comprehensive CLI command tree

The CLI (`@emdesign/cli`, bin `emdesign`) exposes every agent-facing tool as a first-class subcommand. Every subcommand supports `--json` / `--format json` for structured machine output. Commands used as quality gates support `--gate` (exit 1 on failure).

### Top-level commands

```
emdesign
├── design-context [name] [instruction]    # Compose the design context prompt
├── generate <name>                        # Create or edit a generated component
│   ├── --mode create|edit
│   ├── --source <file>                    # .tsx source file path
│   ├── --story <file>                     # .stories.tsx file path
│   ├── --stdin                            # Read source from stdin
│   └── --json
├── lint <component>                       # Consistency lint (token binding + anti-slop)
│   ├── --gate                             # Exit 1 on any P0
│   └── --json
├── test <component>                       # Run visual diffs and/or render snapshots
│   ├── --tests visual,snapshot            # Comma-separated test types
│   ├── --gate
│   └── --json
├── visual-test <component>               # Visual regression (screenshot + pixelmatch)
│   ├── --gate
│   └── --json
├── render-lint <component>               # Render-probe DOM snapshots
│   ├── --themes light,dark
│   └── --json
├── spatial-audit <component>             # Geometry charter checks
│   ├── --story <name>
│   ├── --theme light|dark
│   └── --json
├── score [scores-json]                    # Critique gate decision
│   ├── --gate
│   ├── --component <name>                # Auto-collect scores from lint + visual
│   ├── --threshold 0.8
│   ├── --evidence <slug>
│   └── --json
├── vision-critique <component>           # Vision-based visual critique
│   ├── --provider claude|gemini|minimax
│   ├── --mode standard|regression|reference
│   └── --json
├── vision-compare <component> <ref>      # Vision critique vs reference image
│   ├── --provider claude|gemini|minimax
│   └── --json
├── capture <component>                   # Promote generated to reusable
│   ├── --baseline                        # Also seed visual baseline
│   └── --json
├── capture-baseline <component>          # Seed baseline for already-captured component
├── discover                              # List components, stories, design systems
│   ├── --source generated|components|primitives|all|design_systems
│   ├── --filter <text>
│   └── --json
├── documentation <target>                # Get component/story documentation
│   └── --json
├── doc <component>                       # Alias for documentation
│   └── --json
├── change-request                        # Process the change-request queue
│   ├── poll                              # Drain next request
│   ├── resolve <id> --status done|error   # Mark request resolved
│   └── changed-stories [--since HEAD~1]  # Recently changed story files
│   └── all --json                        # List all pending/active requests
├── eval-charters <component>             # Evaluate story-level charters
│   ├── --story <name>
│   └── --json
├── doctor <component>                    # Run react-doctor scan
│   └── --json
│
├── ds                                    # Design system management
│   ├── create <id> [--mode blank|brief|import|extract] [--from <base>] [--name <display>]
│   ├── use <id>                          # Switch active design system
│   ├── validate [id]                     # Validate token contract
│   ├── grade [id] [--gate]
│   ├── scaffold <id> [--from <base>]
│   ├── conflicts [id]
│   ├── history [id] [--snapshot]
│   ├── list
│   ├── bases
│   ├── base-detail <id> [--json]
│   ├── preview-html <id>
│   └── customize <id> [--name <name>]
│
├── graph                                 # Knowledge graph operations
│   ├── build [id]                        # Rebuild graph from scratch
│   ├── where-to-fix <artifact> <finding> # Trace lint finding to source
│   ├── impact <node>                     # Find what a change would affect
│   ├── context <node>                    # Explore node neighborhood
│   ├── guidance <name> [--intent <text>] # Build guidance for new component
│   └── query [--label <l>] [--from <n>] [--to <n>] [--where <json>]
│
├── tailwind-config [id]                  # Generate tailwind.config.js from DS
│
├── serve                                 # Start HTTP bridge + state server (for addon panel)
│   ├── --port 4321
│   └── --storybook                       # Also start Storybook
│
├── up                                    # Start everything (serve + storybook)
│
├── use <id>                             # Shortcut for ds use
│
├── init <framework> [dir]               # Initialize a new workspace
├── attach [dir]                         # Attach emdesign to existing project
├── update [dir]                         # Update workspace templates
│
├── session                              # Session management (if @emdesign/session available)
│   ├── list
│   ├── create <type> [--instruction "..."]
│   └── cancel <id>
│
├── service                              # Service management (if @emdesign/session available)
│   ├── start <type>
│   ├── stop <type>
│   ├── restart <type>
│   └── status
│
├── frameworks                           # List available frameworks
├── plugins                              # List registered plugins
├── evidence <slug> [--file <path>]      # Record/read evidence
│
├── health                               # Health check
│   └── --json
└── help [command]                       # Detailed help for any command
```

### JSON output contract

Every command that supports `--json` outputs a single JSON object (or array) to stdout. Stderr is reserved for human-readable progress/logs. The top-level shape:

```json
{
  "ok": true,
  "data": { /* command-specific result */ },
  "meta": {
    "took": 1234,
    "warnings": ["optional warning"]
  }
}
```

For gate commands (`--gate`), the exit code is the verdict (0 = pass, 1 = fail) and the JSON includes a `gate` field:

```json
{
  "ok": true,
  "gate": "pass",
  "data": { "composite": 0.94, "mustFix": 0, "decision": "ship" }
}
```

### Stdin streaming

Commands that accept large input (DESIGN.md, component source) accept `--stdin` to read from stdin instead of argv. Input is read until EOF. The `generate` command with `--mode edit --stdin` streams the new source in, making it practical for agents to pipe generated content.

### Gate convention

Commands usable as quality gates (`lint`, `visual-test`, `score`, `ds grade`, `ds validate`) accept `--gate`. When `--gate` is set:
- Exit 0 = pass
- Exit 1 = fail
- Human-readable result on stderr
- JSON result on stdout (if `--json` also set)
