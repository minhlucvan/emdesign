---
name: "inital-spec-for-the-project"
---

# emdesign — Design-Engineering Engine

## What

**emdesign** is a design-engineering engine: a headless Studio backend that drives **Storybook as its front end**. An idea or change request flows through an agent plus the backend's MCP/HTTP tools into on-system, visually-tested React components committed to the repo.

## Why

Design engineering today is siloed. Designers produce static mockups in Figma/Sketch; engineers hand-code them with inevitable drift. The loop — design → handoff → implement → review → fix — is slow, manual, and loses intent at every transfer. emdesign closes this loop:

- **One contract** — a `DESIGN.md` file is the single source of truth for every visual decision
- **Code-first, not mockup-first** — components are generated, linted, and visually tested against that contract
- **Self-correcting** — four independent feedback sources (lint, visual diff, vision critique, LLM critique) feed a deterministic gate that decides "ship" or "revise"
- **Knowledge-driven** — a property graph of the whole design system lets the agent answer where-to-fix, impact analysis, and consistency briefs without hallucinating

## Scope

| In scope | Out of scope |
|---|---|
| Design system authoring (9-section DESIGN.md + tokens.css + code/ primitives) | Pixel-perfect Figma import |
| MCP-based agent tool surface for component generation | Visual editor (drag-and-drop UI builder) |
| Consistency lint (anti-slop, token-contract self-check) | Production hosting / deployment |
| Visual regression testing (Playwright + pixelmatch) | Design tooling outside the Storybook panel |
| Four-source critique gate (rule, visual, vision, LLM) | Multi-user collaboration / conflict resolution |
| Knowledge graph (labeled property graph of design system entities) | Versioned design history beyond git |
| CLI + HTTP + MCP server | Standalone mobile/desktop app outside Storybook |
| Framework adapters (react-tailwind implemented; Vue, Svelte, etc. stubbed) | Auto-layout / constraint-based design engine |
| Storybook addon panel (chat, capture, visual diff) | Accessibility audit beyond lint hints |

## Assumptions

1. The project already has or will scaffold Storybook as its component development environment
2. Tailwind CSS is the styling layer (for the default react-tailwind adapter)
3. A design system is authored as a local directory (`design-systems/<id>/`) — no cloud service dependency
4. The agent (Claude Code) connects via MCP; human interaction happens through the Storybook addon panel
5. Quality is enforced by a deterministic gate, not subjective taste — but the gate weights are configurable
6. Components are React/Tailwind by default; other frameworks are supported via `FrameworkAdapter` stubs
7. Visual testing requires Chromium (Playwright) — browser-in-Docker or local install assumed

## Success criteria

- An agent can generate a component from a textual description
- A generated component passes all four feedback sources (rule, visual, vision, LLM) in the critique gate
- A passed component can be captured into the repo via capture_reusable_component
- The design system contract is the single source of truth — swapping a design system re-skins the entire UI
- No raw hex colors or off-token values survive the consistency lint gate
- The property graph correctly answers "where is this token used?" and "what breaks if I change this?"
- The whole system runs locally with `npm run dev` (Storybook + backend)
