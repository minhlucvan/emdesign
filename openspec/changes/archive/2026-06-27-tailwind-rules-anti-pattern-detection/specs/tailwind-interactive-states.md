# ADDED Requirements

### Requirement: Detect interactive elements missing state variants
The system SHALL detect interactive elements (button, a, input, select, textarea, or elements with interactive roles) that lack `hover:`, `focus:`, `focus-visible:`, and/or `active:` variant classes for their color-affecting utilities.

#### Scenario: Button missing hover variant
- **WHEN** a `<button>` element has `className="bg-accent text-white p-2 rounded"` but no `hover:bg-accent-hover` or similar hover variant
- **THEN** the rule flags the element with severity P2 and fix text suggesting addition of `hover:bg-accent-hover`

#### Scenario: Link missing focus-visible variant
- **WHEN** an `<a>` element has color utilities but no `focus-visible:ring-*` or `focus-visible:outline-*` class
- **THEN** the rule flags the element with severity P1 and fix text recommending a focus-visible ring utility

#### Scenario: Element with all state variants
- **WHEN** a button has `className="bg-accent hover:bg-accent-hover focus-visible:ring-2 active:bg-accent-muted"`
- **THEN** the rule passes — all required state variants are present

#### Scenario: Non-interactive element
- **WHEN** an element is a `<div>` or `<span>` with no interactive role, event handlers, or interactive classes
- **THEN** the rule SHALL NOT flag the element

#### Scenario: disabled element
- **WHEN** an interactive element has the `disabled` class, `disabled` attribute, or `pointer-events-none` class
- **THEN** the rule SHALL NOT flag the element for missing state variants (disabled state overrides interaction)
