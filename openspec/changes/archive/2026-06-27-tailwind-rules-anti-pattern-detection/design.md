## Context

The `@emdesign/plugin-tailwindcss` package is the styling adapter for the Tailwind CSS framework in the emdesign plugin stack. It currently implements:
- **`codegenInstructions()`** — injects Tailwind-specific styling guidance into agent prompts
- **`classRoles()`** — maps utility suffixes (`surface`, `accent`) to token roles
- **`parseTokens()` / `parseThemes()`** — extracts tokens and theme overrides from `tokens.css`
- **`emitConfig()`** — generates `tailwind.config.js` from the token contract
- **`doctorRules()`** — one rule (`tailwind-token-binding`) checking primitive→token usage

The `plugin-core` package demonstrates a mature rule organization pattern: categories in subdirectories (`color/`, `layout/`, `typography/`, `a11y/`, etc.), each exporting a `CORE_*_RULES` array, aggregated in `src/index.ts`. Rules use two types:
- **`DesignReviewRule`** — logical checks against the `DesignSystem` model (token completeness, naming conventions)
- **`RenderedReviewRule`** — DOM geometry/contrast checks against render-probe snapshots

**Constraints:**
- No new `plugin-api` types needed — existing `DesignReviewRule`, `RenderedReviewRule`, and the old `Rule`/`lintRules()` interface are sufficient
- No changes to `plugin-core` — tailwind-specific rules belong in the tailwind plugin
- Rules must follow the existing `fix`-field pattern for agent-directed auto-fix
- Should integrate with both old-style hooks (`doctorRules`, `renderedDoctorRules`) and the new unified `RuleRegistry` via `rules()` manifests

## Goals / Non-Goals

**Goals:**
1. Create a rule directory structure under `plugin-tailwindcss/src/rules/` matching the `plugin-core` pattern
2. Implement 6 new rule categories covering the anti-patterns defined in the proposal
3. Each rule produces deterministic findings with actionable `fix` text
4. Rules are exposed via the plugin's `renderedDoctorRules()`, `doctorRules()`, and `rules()` hooks
5. Rules compose seamlessly with existing `plugin-core` rules via `composeStack`

**Non-Goals:**
- No changes to the `@emdesign/dsr` rule engine or the `RuleRegistry` — reuse existing infrastructure
- No automated code rewriting (the `fix` field is human/agent-readable guidance, not AST transforms)
- No changes to existing `plugin-core` rules
- No CSS-stylesheet-level detection (rules operate on class strings in source code and/or render-probe DOM snapshots)

## Decisions

### D1. Three rule execution domains, one directory structure
Rather than forcing all rules into one domain, use three sub-directories mirroring usage:
- `src/rules/doctor/` — logical `DesignReviewRule` checks (need a `DesignSystem` model)
- `src/rules/rendered/` — DOM `RenderedReviewRule` checks (need a render-probe snapshot)
- `src/rules/source/` — source-level `Rule` checks (need the `.tsx` source string)

**Rationale:** The three domains have different context requirements. A spacing-hygiene rule needs the DS's `--space-unit` token (doctor). A utility-density rule needs the rendered DOM to count classes per element (rendered). A hardcoded-color rule can run purely on the source string (source). Separating them avoids confusion about which context is available.

**Trade-off:** Source rules use the older `Rule` interface (from `@emdesign/dsr`), not `RenderedReviewRule`. This is acceptable because the `lintRules()` hook in `composeStack` already handles `Rule` registration.

### D2. Spec-first for class-string parsing (regex-based, not AST)
Source-level rules parse the class attribute string using line-oriented regex, not a full AST. The class string in Tailwind is a space-delimited token list — `className="bg-surface text-accent p-4"` — so a simple tokenizer (`className\s*=\s*{?["'\`]…["'\`]` capture + split) is sufficient.

**Rationale:** A full JSX AST parser (e.g. `@typescript-eslint/parser`) would be a heavy dependency for what amounts to word-boundary matching. The plugin currently has zero external parser dependencies. Regex keeps it lightweight and deterministic.

**Trade-off:** Regex misses dynamic class expressions (`clsx(...)`, conditional `&&`). Mitigation: flag the presence of dynamic class expression patterns as `P2` advisory, suggesting template-aware extraction.

### D3. Rendered rules use the existing `RenderedReviewRule` interface
The render-probe snapshot provides `nodes[].classes` as a raw class string — ideal for counting utility density, checking for `dark:` variants, detecting `!important` marker, etc. No new render-probe fields needed.

### D4. Auto-fix via structured `fix` field only
Each rule returns a `ReviewFinding` with a `fix` string. No auto-edit capability is implemented at the rule level. The fix text is structured for agent consumption:
- Template: `Replace "${bad value}" with ${recommended token-based class}. See docs: ${link}.`
- Rationale: The agent consumes the fix, not the type-checker. AST-level auto-fix would double the rule complexity for marginal gain when the agent can apply the fix from natural language.

### D5. Token-resolution helper is shared, not duplicated
The `emitConfig()` function already knows how to map tailwind utility suffixes to `--color-*` tokens. Extract a small `resolve-token.ts` helper that:
- Takes a class suffix → returns the matching `--color-*` token name (or null)
- Takes a spacing value → returns the nearest `--space-unit` multiple
- Takes a breakpoint prefix → validates it against the DS breakpoint contract

This helper is shared across source/doctor/rendered rules.

## Architecture

```
packages/plugin-tailwindcss/src/
├── index.ts                          # exports MedesignPlugin (extended with new hooks)
├── resolve-token.ts                  # shared token-resolution helper (extracted)
└── rules/
    ├── index.ts                      # aggregates all rule arrays, exports them
    ├── doctor/
    │   ├── index.ts                  # aggregates doctor rules
    │   ├── spacing-hygiene.ts        # --space-unit alignment
    │   └── breakpoint-contract.ts    # DS-declared breakpoints exist
    ├── rendered/
    │   ├── index.ts                  # aggregates rendered rules
    │   ├── utility-density.ts        # >10 utilities per element
    │   ├── dark-variants.ts          # missing dark: variants on color classes
    │   ├── interactive-states.ts     # missing focus/hover/active variants
    │   ├── color-discipline.ts       # computed color values vs --color-* tokens
    │   ├── breakpoint-usage.ts       # non-standard breakpoint prefixes in DOM
    │   └── spacing-hygiene.ts        # --space-unit alignment in computed styles
    └── source/
        ├── index.ts                  # aggregates source rules
        ├── hardcoded-colors.ts       # raw hex/rgb in class strings
        ├── arbitrary-values.ts       # arbitrary value overuse
        └── important-modifier.ts     # !important hackery
```

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| False positives from naive class-string parsing (e.g. colors in comments or strings) | Source rules target only `className=` attribute context, not raw strings. Rendered rules use computed styles, not source strings, for color checks. |
| Performance: rendering all stories to check utility density is expensive | Utility-density is `P2` advisory — skipped on fast-check paths. Rendered rules only run during review, not during iteration. |
| Breakpoint contract varies per design system | Rules read breakpoints from `DesignSystem.sections()` (the DESIGN.md spec tables). If no breakpoints spec exists, the rule skips (pass=true). |
| Dark-variant rules are noisy on text-only elements | `dark-variant` rule skips elements that have no color-affecting utilities (only text, no bg/border/ring classes). |
