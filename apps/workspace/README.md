# @emdesign/workspace

The **workspace core** — the abstract, framework-agnostic installer (`init`/`attach`), the canonical
`.claude/` template (commands, agents, skills, workflows), the `emdesign.config.json` schema, and
the framework registry.

## Role in the system

`@emdesign/workspace` is the abstract base that every framework-specific workspace builds on. It:

- **`init <framework>`** — scaffolds a new emdesign project from scratch (Storybook + workspace)
- **`attach`** — adds emdesign to an existing Storybook project (additive + idempotent)
- Defines the `emdesign.config.json` schema that targets engines at the workspace
- Hosts the **framework registry** — maps `react-tailwind`, `vue`, `svelte`, etc. to their providers

## Framework-agnostic

The engines (server, CLI, addon, graph) are framework-blind. Only the `FrameworkAdapter` is
per-framework. `@emdesign/workspace-react` implements the React/Tailwind provider; Vue, Svelte,
Web Components, and Angular are stubbed.

## Related

- `@emdesign/workspace-react` — the React/Tailwind provider (dogfood instance)
- `@emdesign/cli` — CLI that runs `init`/`attach`
- `docs/workspace.md` — full workspace documentation
