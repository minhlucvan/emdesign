# Playbook: Build Component

**Goal:** Build a new, on-system component from an intent.

**When to use:** User asks for a new component. Always start here.

---

## Step 1: Understand the design system

```tool
get_design_context componentName="TargetComponent" instruction="(user's intent — what this component does)"
```

Read the output carefully:
- What **primitives** exist (Button, Card, Input, Badge, Heading, Stack…)
- What **token roles** are available (surface, accent, text, rounded…)
- What **anti-patterns** to avoid
- What **codegen patterns** to follow

---

## Step 2: Check what already exists

```tool
discover_components source="all" filter="related-name"
```

Might find an existing component you can reuse or extend instead of building from scratch.

---

## Step 3: Query the graph for build guidance

```tool
query_knowledge_graph mode="build_guidance" name="TargetComponent" intent="(user's intent)"
```

Returns: composable primitives, relevant tokens, governing rules.

---

## Step 4: Write the component source

Plan the component structure first:
- Which primitives from `@ds` to compose
- Which semantic token classes to use
- What props to expose

**Non-negotiable rules:**
- `import { Button, Card, Heading } from "@ds/Button"` — always import from `@ds`
- Use `bg-surface`, `text-accent`, `rounded`, `p-4`, `gap-3` — semantic token classes only
- No inline styles (`style={{}}`), no raw hex (`#333`), no hardcoded spacing
- Headings get the display font family
- Real copy, not filler ("User profile" not "Feature one")

Then create:
```tool
generate_component mode="create" name="TargetComponent" source="(full .tsx source)" story="(optional CSF story)"
```

Always include a `Default` story export so it renders in Storybook.

---

## Step 5: Test immediately

```tool
test_component component="TargetComponent" tests=["visual"]
```

If the test fails or shows a diff, fix before proceeding.

---

## Step 6: Lint for consistency

```tool
lint_component name="TargetComponent"
```

Fix all P0 (blocker) findings. Use the graph to trace where:
```tool
query_knowledge_graph mode="where_to_fix" artifact="TargetComponent" findingId="(finding id from lint)"
```

---

## Step 7: Iterate until clean

If lint or visual test found issues:
```tool
generate_component mode="edit" name="TargetComponent" source="(fixed source)"
test_component component="TargetComponent"
lint_component name="TargetComponent"
```

Repeat until both pass.

---

## Step 8: Hand off to evaluate-review

Once lint is clean and visual test passes, the component is ready for evaluation.
See [`evaluate-review`](evaluate-review.md).
