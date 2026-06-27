# ADDED Requirements

### Requirement: Detect `!important` modifier usage
The system SHALL detect Tailwind `!` prefix modifier usage (e.g., `!m-0`, `!flex`, `!text-accent`) in class strings and flag it as an escape hatch that indicates specificity design issues, with fix text recommending restructured selectors or higher-specificity token utilities instead of `!important`.

#### Scenario: Important modifier on a utility
- **WHEN** a source file contains `className="!m-0 flex"` or `className="p-4 !text-accent"`
- **THEN** the rule flags the element with severity P2 and provides fix text recommending removal of the `!` prefix and adjustment of selector specificity (e.g., parent scoping or direct child selectors)

#### Scenario: Important modifier with var() reference
- **WHEN** a source file contains `className="w-[var(--sidebar-width)] !important"` where the `!` is part of a legitimate override pattern whose value references a custom CSS variable
- **THEN** the rule flags the usage with severity P3 (informational) noting that while the `!` modifier overrides specificity rules, the `var()` reference is the preferred binding pattern — the fix text suggests documenting the override rationale

#### Scenario: Non-important utilities
- **WHEN** a class string contains no `!` prefix on any utility
- **THEN** the rule passes without findings

#### Scenario: Important on non-utility value
- **WHEN** a CSS-in-JS or style attribute uses `!important` in a property value rather than a Tailwind `!` prefix modifier
- **THEN** the rule SHALL NOT flag the usage (out of scope for class-string parsing)
