# ADDED Requirements

### Requirement: Detect elements missing dark: variant for color utilities
The system SHALL detect elements that use Tailwind color utilities (`text-`, `bg-`, `border-`, `ring-`, `outline-`, `divide-`, `from-`, `via-`, `to-`, `accent-`, `caret-`, `fill-`, `stroke-`) without a corresponding `dark:` variant when the design system declares a dark theme.

#### Scenario: Color utility without dark variant
- **WHEN** an element has `className="bg-surface text-accent"` but NO `dark:bg-surface dark:text-accent` or equivalent
- **THEN** the rule flags the element with severity P1 and fix text suggesting the addition of `dark:` prefixed variants

#### Scenario: No dark theme declared
- **WHEN** the design system has no `[data-theme="dark"]` block in `tokens.css`
- **THEN** all dark-variant rules produce pass=true (no dark theme to worry about)

#### Scenario: Element with only structural (non-color) utilities
- **WHEN** an element uses only structural utilities (flex, grid, padding, margin without color) or display utilities
- **THEN** the rule SHALL NOT flag it (no contrast risk)

#### Scenario: Partial dark variant coverage
- **WHEN** an element has `className="bg-surface text-accent dark:bg-surface-raised"` (missing `dark:text-accent`)
- **THEN** the rule flags only the color utility missing the `dark:` variant, not the entire element
