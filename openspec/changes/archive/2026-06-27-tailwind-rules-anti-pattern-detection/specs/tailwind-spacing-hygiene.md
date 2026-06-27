# ADDED Requirements

### Requirement: Detect spacing utilities not aligned to `--space-unit`
The system SHALL detect spacing utility values (`w-`, `h-`, `m-`, `mt-`, `mr-`, `mb-`, `ml-`, `mx-`, `my-`, `p-`, `pt-`, `pr-`, `pb-`, `pl-`, `px-`, `py-`, `gap-`, `gap-x-`, `gap-y-`, `space-x-`, `space-y-`) whose pixel values are not multiples of the design system's declared `--space-unit` token.

#### Scenario: Spacing value not on scale
- **WHEN** a rendered element has a margin, padding, gap, or fixed width/height that resolves to a pixel value not aligning to the DS `--space-unit` multiple (e.g., 13px when unit is 8px)
- **THEN** the rendered-domain rule flags the element with severity P2 and fix text recommending the nearest on-scale value

#### Scenario: No `--space-unit` declared
- **WHEN** the design system has no `--space-unit` token
- **THEN** the doctor-domain rule produces a P3 (informational) finding noting the missing token, and all spacing-hygiene checks produce pass=true (skipped)

#### Scenario: Custom spacing token used correctly
- **WHEN** an element uses an arbitrary spacing value that references a custom CSS variable (e.g., `w-[var(--sidebar-width)]`)
- **THEN** the rule SHALL NOT flag it (variable reference indicates intentional non-scale sizing)

#### Scenario: Zero spacing values
- **WHEN** a spacing value is 0px (e.g., `p-0`, `m-0`)
- **THEN** the rule SHALL NOT flag it (zero is always on-scale)
