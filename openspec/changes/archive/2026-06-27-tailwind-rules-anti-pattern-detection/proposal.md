---
name: "tailwind-rules-anti-pattern-detection"
---

## Why

The `@emdesign/plugin-tailwindcss` currently ships only one rule (`tailwind-token-binding`) — a doctor-level check that primitives bind to token roles. Tailwind CSS has a rich ecosystem of anti-patterns (hardcoded colors/values, missing dark variants, utility pile-on, arbitrary value overuse, non-standard spacing) that silently degrade design-system consistency. Without detection, these patterns pass the gate and become technical debt — committed, token-untethered code that never gets refactored.

Adding a comprehensive, category-organized rule set to `plugin-tailwindcss` enables agent-driven detection of bad Tailwind patterns — with actionable fix guidance — before they land in the codebase.

## What Changes

1. **New rule modules under `plugin-tailwindcss/src/rules/`** — organized by execution domain, following the precedent set by `plugin-core`'s `doctor/` and `rendered/` directories:
   - `doctor/` — logical DS checks specific to Tailwind (spacing scale alignment, breakpoint hygiene)
   - `rendered/` — DOM-based checks from render probes (utility density, missing dark variants)
   - `source/` — source-level lint on `.tsx` class strings (hardcoded colors, arbitrary value overuse, `!important` hackery)

2. **New `renderedDoctorRules()` hook** — the plugin currently has no rendered rules; this adds them.

3. **Auto-fix guidance** — each rule's `fix` field provides actionable, context-aware fix text (not generic boilerplate), steering the agent toward the correct token-bound alternative.

4. **Rule registration** — `plugin-tailwindcss` exports its rule arrays, composed into the plugin's `renderedDoctorRules()` and `doctorRules()` hooks, so `composeStack` auto-discovers them alongside `plugin-core` rules.

## Capabilities

### New Capabilities
- `tailwind-color-discipline`: Detect and flag hardcoded CSS colors in Tailwind class strings (`text-[#333]`, `bg-[#f00]`, custom hex in arbitrary values) — recommend the equivalent `--color-*` token-bound class.
- `tailwind-spacing-hygiene`: Flag spacing values (w-, h-, m-, p-, gap-) that don't align to the design system's `--space-unit` scale.
- `tailwind-dark-theme`: Detect elements with color utilities that lack corresponding `dark:` variant classes.
- `tailwind-utility-density`: Flag elements with excessive class counts (>10 utilities on one element) that should be extracted into a component or composition.
- `tailwind-arbitrary-values`: Flag arbitrary value usage (`h-[…]`, `w-[…]`, etc.) where a design-system token alternative exists.
- `tailwind-responsive-breakpoints`: Flag use of non-standard or ad-hoc responsive breakpoints (`max-md:`, `max-2xl:`, custom `min-[…]`) not in the design system's breakpoint contract.
- `tailwind-interactive-states`: Flag interactive elements (button, a, input) missing focus/active/hover state variants.
- `tailwind-important-modifier`: Flag `!` prefix modifier usage (`!m-0`, `!flex`) as an escape hatch indicating specificity design issues — with fix text recommending restructured selectors.
- `tailwind-token-binding` (existing): Retain the existing doctor rule; no behavioral changes are introduced by this change.

### Modified Capabilities
- *(none — this introduces new capabilities without changing existing spec-level behavior)*

## Impact

- **`packages/plugin-tailwindcss/`** — new `src/rules/` directory with organized rule modules; updated `src/index.ts` to export hooks.
- **`packages/plugin-core/`** — no changes (this is additive in tailwind plugin, not core).
- **`packages/dsr/`** — no changes (existing `DesignReviewRule` / `RenderedReviewRule` types sufficient).
- **`packages/plugin-api/`** — no changes (existing hooks already support these rule types).
- **`packages/backend/`** — no changes (`composeStack` auto-discovers new rules via `renderedDoctorRules()`/`doctorRules()` hooks).
