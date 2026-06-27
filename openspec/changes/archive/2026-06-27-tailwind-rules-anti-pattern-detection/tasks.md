## 1. Scaffold rule structure and shared helpers

- [ ] 1.1 Create `src/rules/` directory tree with `doctor/`, `rendered/`, `source/` subdirectories, each with an `index.ts` aggregator
- [ ] 1.2 Extract `resolve-token.ts` helper: function to map a Tailwind utility suffix to the corresponding `--color-*` token name and spacing value to nearest `--space-unit` multiple
- [ ] 1.3 Create `src/rules/index.ts` that aggregates `doctor/`, `rendered/`, and `source/` rule arrays and exports them
- [ ] 1.4 Update `src/index.ts` to wire new rule arrays into the plugin's `doctorRules()`, `renderedDoctorRules()`, and `rules()` hooks

## 2. Implement source-level rules (class string parsing)

- [ ] 2.1 Implement `hardcoded-colors.ts`: source-level rule detecting raw hex/rgb/named colors in Tailwind arbitrary values (`text-[#333]`, `bg-[rgb(220,38,38)]`, `border-[red]`) — skip CSS variable references
- [ ] 2.2 Implement `arbitrary-values.ts`: source-level rule detecting arbitrary value expressions (`w-[…]`, `p-[…]`, `m-[…]`, `gap-[…]`, `rounded-[…]`) where a design-system token alternative exists — skip var() references
- [ ] 2.3 Implement `important-modifier.ts`: source-level rule detecting `!` prefix modifier usage (`!m-0`, `!flex`) — flag as escape hatch that indicates specificity design issues

## 3. Implement doctor-level rules (design system model checks)

- [ ] 3.1 Implement `spacing-hygiene.ts`: doctor rule checking that `--space-unit` is declared — rendered-domain spacing checks produce "skipped" if absent
- [ ] 3.2 Implement `breakpoint-contract.ts`: doctor rule checking that the DESIGN.md breakpoints section is populated — rendered-domain breakpoint checks use this as a gate

## 4. Implement rendered rules (DOM snapshot checks)

- [ ] 4.1 Implement `utility-density.ts`: rendered rule counting Tailwind utility classes per element node (from `node.classes`), flagging >10 (or configurable threshold) with component extraction fix text
- [ ] 4.2 Implement `dark-variants.ts`: rendered rule scanning elements with color utilities and checking for `dark:` prefixed equivalents — skip elements with only structural/display utilities; handle partial coverage per-utility
- [ ] 4.3 Implement `interactive-states.ts`: rendered rule checking interactive elements (button, a, input, select, textarea) for `hover:`, `focus:`, `focus-visible:`, and `active:` variant classes on their color utilities — skip disabled elements

## 5. Implement remaining rendered + doctor rules

- [ ] 5.1 Implement `color-discipline.ts` (rendered): rendered rule checking computed color values against known `--color-*` token values — catches colors injected via `style={{}}` that source-level parsing misses
- [ ] 5.2 Implement `breakpoint-usage.ts` (rendered): rendered rule scanning for `max-*` and `min-[…]:` breakpoint prefixes — flag non-standard/usages; skip if no breakpoint contract exists
- [ ] 5.3 Implement spacing-hygiene (rendered): rendered rule checking computed `margin`, `padding`, `gap`, `width`, `height` pixel values against `--space-unit` multiples — skip zero and var() values

## 6. Test and verify

- [ ] 6.1 Add unit tests for `resolve-token.ts` helper covering all color mappings, spacing calculations, and breakpoint validation
- [ ] 6.2 Add unit tests for `hardcoded-colors.ts` with sample class strings including hex, rgb, named colors, and CSS variable references
- [ ] 6.3 Add unit tests for `dark-variants.ts` with sample render snapshots covering full coverage, partial coverage, no dark theme, and non-color elements
- [ ] 6.4 Add integration test with `composeStack` verifying the plugin's `renderedDoctorRules()`, `doctorRules()`, and `rules()` all return the expected number of rules
- [ ] 6.5 Run full type-check (`tsc -p tsconfig.json`) on `@emdesign/plugin-tailwindcss` — verify no type errors
