# ADDED Requirements

### Requirement: Detect non-standard responsive breakpoint usage
The system SHALL detect use of Tailwind responsive breakpoint prefixes (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`) and flag arbitrary min/max breakpoint syntax (`min-[…]:`, `max-[…]:`) on principle, even when the arbitrary value matches a named prefix's pixel value. The system SHALL ALSO detect responsive breakpoint values that are not declared in the design system's breakpoint contract (e.g., `max-*` suffixes or non-contract pixel values in arbitrary syntax).

#### Scenario: Standard breakpoint used
- **WHEN** an element uses `md:flex` and `md:` is defined in the design system's breakpoint spec
- **THEN** the rule passes — the breakpoint is contract-approved

#### Scenario: Arbitrary min-width breakpoint matches DS
- **WHEN** an element uses `min-[768px]:flex` and the design system has a breakpoint that resolves to 768px
- **THEN** the rule flags the element with severity P2 and fix text suggesting the standard `md:flex` or equivalent named prefix

#### Scenario: max-md or max-* suffix usage
- **WHEN** an element uses `max-md:` or `max-xl:` or `max-2xl:` prefix
- **THEN** the rule flags the element with severity P1 and fix text explaining that `max-*` variants are not in Tailwind's standard responsive API and should be replaced with the `container` query or a custom approach

#### Scenario: Arbitrary custom breakpoint
- **WHEN** an element uses `min-[900px]:` and the design system has no declared breakpoint whose value exactly matches 900px
- **THEN** the rule flags with severity P2 suggesting either adding 900px to the breakpoint contract or using the nearest DS breakpoint

#### Scenario: No breakpoint spec in design system
- **WHEN** the design system's DESIGN.md has no "Breakpoints" section or responsive spec
- **THEN** the rule produces pass=true with a detail noting "no breakpoint contract defined"
