# @emdesign/doctor

The **design-system doctor** — rule-based production-readiness linting over the `@emdesign/dsr` +
`@emdesign/graph` data model. Reports findings with severity, fix, and location, plus an `X/Y rules
passed` grade.

## Role in the system

`ds doctor` (via CLI) or `grade_design_system` (via MCP) scans a design system and answers: *is this
production-ready?* The grade is intentionally minimal; the **findings are the product** — each comes
with a concrete fix and where to apply it.

## Usage

```bash
emdesign ds doctor <id>                # Print findings + grade
emdesign ds doctor <id> --gate         # Exit 1 if any P0/P1 remains (CI gate)
```

## Rule extensibility

Rules are `DesignReviewRule` objects contributed by each plugin in the stack:

- **core** — token-contract, sections, type-scale depth, components-with-states, anti-slop, primitives
- **plugin-css** — CSS theming completeness, contrast AA
- **plugin-react** — story/variant coverage
- **plugin-tailwindcss** — token binding in primitives

## Related

- `@emdesign/dsr` — the rule engine and review context
- `@emdesign/plugin-api` — how plugins contribute rules
- `docs/doctor.md` — full documentation
