# ADDED Requirements

### Requirement: Detect hardcoded CSS colors in Tailwind class strings and rendered DOM
The system SHALL detect raw hex colors (`#xxx`, `#xxxxxx`), `rgb()`/`rgba()` functions, and named CSS colors (e.g., `red`, `blue`) used as arbitrary values in Tailwind class strings (e.g., `text-[#333]`, `bg-[#ff0000]`, `border-[rgb(220,38,38)]`) and recommend the equivalent `--color-*` token-bound utility. The system SHALL ALSO detect hardcoded colors in the rendered DOM (e.g., colors injected via `style={{}}`) by comparing computed style values against the design system's declared `--color-*` token values, and flag mismatches with a recommendation for the matching token-bound utility.

#### Scenario: Hex color in arbitrary value
- **WHEN** a `.tsx` source file contains `className="text-[#2563eb]"` or similar
- **THEN** the rule flags the element with severity P1 and provides fix text recommending the `text-` token-bound utility whose `--color-*` token value exactly matches the hex color in the class string; if no exact match exists, the rule SHALL recommend the token with the smallest Euclidean distance in sRGB space (ties broken alphabetically by token name)

#### Scenario: RGB function in arbitrary value
- **WHEN** a source file contains `className="bg-[rgb(220,38,38)]"` or similar
- **THEN** the rule flags the element with severity P1 and provides fix text recommending the `bg-` token-bound utility whose `--color-*` token value exactly matches the RGB color; if no exact match exists, the rule SHALL recommend the token with the smallest Euclidean distance in sRGB space (ties broken alphabetically by token name)

#### Scenario: Named CSS color
- **WHEN** a source file contains `className="border-[red]"` or similar named CSS color usage
- **THEN** the rule flags the element and recommends the appropriate `border-border` token-bound utility

#### Scenario: Legitimate use of CSS variable binding
- **WHEN** an arbitrary value references a CSS variable (`text-[var(--my-custom)]`) rather than a raw color
- **THEN** the rule SHALL NOT flag it (CSS variables are acceptable design-system references)

#### Scenario: Flag resolution via rendered snapshot
- **WHEN** the rendered DOM snapshot shows a computed text color in hex/rgb that does not match any `--color-*` token value
- **THEN** the rendered-domain color rule flags the element — this catches colors injected via `style={{}}` that source-level parsing misses
