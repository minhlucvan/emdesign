# ADDED Requirements

### Requirement: Detect arbitrary value overuse where design-system tokens exist
The system SHALL detect Tailwind arbitrary value expressions (`text-[…]`, `w-[…]`, `h-[…]`, `bg-[…]`, `p-[…]`, `m-[…]`, `gap-[…]`, `shadow-[…]`, `rounded-[…]`, `leading-[…]`, `tracking-[…]`, `font-[…]`) and flag them when a design-system token alternative exists for the same property.

#### Scenario: Arbitrary value with token alternative
- **WHEN** a source file contains `className="w-[24px]"` or `className="p-[16px]"` but the design system has a spacing-scale token whose value matches
- **THEN** the rule flags the element with severity P2 and fix text recommending the token-bound utility (e.g., `w-6` for `w-[24px]` with 8px unit)

#### Scenario: Arbitrary value with no token alternative
- **WHEN** an arbitrary value uses a value that has no equivalent in the design system token scale (e.g., `w-[193px]` for a specific layout constraint)
- **THEN** the rule SHALL NOT flag the usage (no token alternative exists)

#### Scenario: CSS variable reference in arbitrary value
- **WHEN** an arbitrary value references a CSS variable (`shadow-[var(--shadow-raised)]`, `duration-[var(--motion-fast)]`)
- **THEN** the rule SHALL NOT flag the usage (variable references are the preferred binding pattern for non-utility-mapped tokens)

#### Scenario: Arbitrary value on non-token-mapped property
- **WHEN** an arbitrary value is used on a CSS property that has no corresponding token in the design system (e.g., `min-h-[500px]` for a minimum-height constraint on a specific view)
- **THEN** the rule SHALL NOT flag the usage

#### Scenario: Dynamic class expressions beyond regex parsing
- **WHEN** a source file contains a dynamic class expression (e.g., `className={clsx('bg-surface', condition && 'p-4')}` or a ternary expression) whose concrete values cannot be determined through line-oriented regex class-string parsing
- **THEN** the source-level rule produces a P2 advisory finding noting the presence of a dynamic expression pattern that may conceal arbitrary values
