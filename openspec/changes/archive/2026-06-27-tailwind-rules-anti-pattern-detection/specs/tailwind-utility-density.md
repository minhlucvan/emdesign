# ADDED Requirements

### Requirement: Detect elements with excessive Tailwind utility class density
The system SHALL flag elements whose rendered class string contains more than a configurable threshold of Tailwind utility classes (default: 10), indicating the element may benefit from component extraction or composition.

#### Scenario: Element exceeds default utility threshold
- **WHEN** a rendered DOM node has `className` with 12 or more distinct Tailwind utility classes (e.g., `flex items-center justify-between p-4 bg-surface rounded shadow-lg gap-2 text-sm font-medium text-accent hover:bg-accent-hover`)
- **THEN** the rule flags the element with severity P2 and fix text suggesting extraction into a named sub-component or composition

#### Scenario: Element at or below threshold
- **WHEN** an element has 8 Tailwind utility classes
- **THEN** the rule passes without findings

#### Scenario: Non-Tailwind classes excluded from count
- **WHEN** an element's class string includes custom CSS classes (not matching standard Tailwind patterns) alongside Tailwind utilities
- **THEN** only the Tailwind utility classes count toward the threshold; custom classes are excluded

#### Scenario: Configurable threshold
- **WHEN** the design system's `DESIGN.md` specifies a custom utility density limit
- **THEN** the rule SHALL use that custom threshold instead of the default 10
