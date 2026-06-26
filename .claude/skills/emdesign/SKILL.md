---
name: emdesign
description: Master skill for emdesign — the design-engineering engine. Use at the START of any design, build, review, or system task. Routes to the right playbook based on what you need to do. All MCP tools are available at http://localhost:4321/mcp.
---

# emdesign Skill

emdesign is a **design-engineering engine**: AI builds production UI against a design system contract. This skill routes you to the right playbook.

## Quick start

```bash
# The MCP tools are already connected. Verify:
# http://localhost:4321/mcp has 13 tools
```

**Always start by understanding the system before building.** Run `discover_components` or `get_design_context` first.

## Which playbook do you need?

| When you want to... | Playbook | MCP tools you'll use |
|---|---|---|
| **Explore** the codebase — discover components, stories, design systems | [`explore`](references/playbooks/explore.md) | `discover_components`, `get_component_documentation`, `get_design_context` |
| **Build** a new component from an intent | [`build-component`](references/playbooks/build-component.md) | `get_design_context`, `generate_component`, `test_component`, `lint_component` |
| **Update** an existing component — fix bugs, apply changes, improve | [`update-component`](references/playbooks/update-component.md) | `generate_component` (edit), `lint_component`, `test_component`, `query_knowledge_graph` |
| **Evaluate & review** — run the quality gate before shipping | [`evaluate-review`](references/playbooks/evaluate-review.md) | `lint_component`, `evaluate_component`, `vision_review`, `test_component` |
| **Debug & test** — fix visual diffs, lint errors, test failures | [`debug-test`](references/playbooks/debug-test.md) | `test_component`, `lint_component`, `vision_review`, `query_knowledge_graph` |
| **Manage design system** — create, switch, validate, grade | [`manage-ds`](references/playbooks/manage-ds.md) | `manage_design_system`, `rebuild_graph`, `discover_components` |
| **Ship** — capture a component as reusable, git-tracked | [`ship`](references/playbooks/ship.md) | `evaluate_component`, `capture_component` |

## Core operating principles

1. **Design system first** — there must be an active design system. If not, create/select one via `manage_design_system`.
2. **Understand before building** — always call `get_design_context` or `discover_components` first. Never free-hand.
3. **Token roles only** — reference semantic tokens (`bg-surface`, `text-accent`), never raw hex or hardcoded values. The lint gate blocks violations.
4. **Verify after every edit** — run `lint_component` and `test_component` after every change. "Looks fine" is not evidence.
5. **Fix at the source** — use `query_knowledge_graph` (mode: where_to_fix) to trace lint findings to the exact token/file, not the symptom.
6. **Never self-ship** — always run `evaluate_component` first. Ship only when composite ≥ threshold && mustFix === 0.

## Tool reference

See [tools.md](references/tools.md) for the complete MCP tool reference with parameters and examples.
