---
name: build
description: Build the Miro design system — compile tokens, generate TypeScript types, export artifacts, and version the release.
when: After customizing or updating the Miro design system, before consuming tokens programmatically in components or screens.
workflow: build
commands: [ds compile, ds export, ds validate --strict, ds version, ds changelog]
---

# Build Skill — Miro Design System

## Purpose

Transform the Miro design system's `tokens.css` into **typed, importable, versioned artifacts** that components and screens can consume safely. Enforces token contract completeness and semantic versioning.

## Workflow

```
1. Validate    → ds validate --strict   (ensure every required token role exists)
2. Compile     → ds compile             (generate TypeScript types + CSS output)
3. Export      → ds export              (package as npm-ready directory)
4. Version     → ds version <bump>      (major/minor/patch)
5. Changelog   → ds changelog --snapshot (record the release)
```

## Steps

### 1. Validate — "Is the token contract complete?"

```bash
emdesign ds validate miro --strict
```

Fails if any required token role is missing. Use `--strict` every time — a missing role means broken types downstream.

### 2. Compile — "Generate TypeScript types"

```bash
emdesign ds compile miro [--out <dir>]
```

Reads `design-systems/miro/tokens.css`, parses all `--token-name: value` pairs, groups by category (color, type, spacing, size, shadow, radius, font), and generates typed constants and union types.

### 3. Export — "Make it consumable"

```bash
emdesign ds export miro [--out <dir>]
```

Writes `tokens.ts`, `types.ts`, `tokens.css`, and `package.json` to the output directory (default: `design-systems/miro/dist/`).

### 4. Version Bump — "Track changes"

```bash
emdesign ds version miro <major|minor|patch>
```

Follows semver:
- **patch** — token value fix, new optional token
- **minor** — new required token, new primitive
- **major** — breaking token rename, removed token

### 5. Changelog — "Record what changed"

```bash
emdesign ds changelog miro --snapshot
```

Takes a snapshot of the current token state and appends to version history in `design-systems/miro/CHANGELOG.md`.

## Command Reference

| Command | Purpose | Speed |
|---------|---------|-------|
| `ds validate miro --strict` | Token contract check | ~50ms |
| `ds compile miro` | Generate TypeScript + CSS | ~100ms |
| `ds export miro` | Package as npm-ready directory | ~100ms |
| `ds version miro <bump>` | Semantic version bump | ~50ms |
| `ds changelog miro` | Show or create changelog | ~50ms |

## Common Pitfalls

- **Don't compile before the DS is stable** — premature compilation means regenerating types on every change.
- **`--strict` is the minimum** — always use it before compilation. Non-strict validation can pass but produce incomplete types.
- **Compiled output is disposable** — it lives in `dist/`, is gitignored, and is always regenerated from source. Never edit compiled files directly.
- **Version bump is for consumers** — bump only when other packages depend on the DS. Don't bump on every edit.
