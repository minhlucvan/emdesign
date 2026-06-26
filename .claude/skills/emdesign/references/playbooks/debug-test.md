# Playbook: Debug & Test

**Goal:** Diagnose and fix visual diffs, lint errors, test failures, or quality issues.

**When to use:** A component fails visual test, lint, or evaluation. Something looks wrong.

---

## Scenario A: Visual test shows a diff

The component changed from its baseline screenshot.

### 1. See what changed

```tool
test_component component="TargetComponent" tests=["visual"]
```

The result includes `changedPixels`. A large diff > 100px likely means a real regression.

### 2. Get a vision critique

Have an LLM look at the screenshot and tell you what changed:
```tool
vision_review mode="critique" component="TargetComponent" provider="claude"
```

### 3. Compare against reference (if available)

If you have a reference/design image:
```tool
vision_review mode="compare" component="TargetComponent" referenceImagePath="/path/to/reference.png"
```

### 4. Fix the component and re-test

```tool
generate_component mode="edit" name="TargetComponent" source="(fixed source)"
test_component component="TargetComponent" tests=["visual"]
```

If the baseline itself is wrong, update it by running the test and accepting the new screenshot as baseline.

---

## Scenario B: Lint errors (P0 findings)

The component violates design system rules.

### 1. Run lint to see all findings

```tool
lint_component name="TargetComponent"
```

Findings are grouped P0 → P1 → P2. P0 are blockers.

### 2. Trace each P0 to its source

```tool
query_knowledge_graph mode="where_to_fix" artifact="TargetComponent" findingId="(finding-id)"
```

Returns the exact file:line + the correct token/role to use instead.

### 3. Fix

```tool
generate_component mode="edit" name="TargetComponent" source="(fixed source)"
```

### 4. Re-lint to confirm

```tool
lint_component name="TargetComponent"
```

Repeat until P0 = 0.

---

## Scenario C: Knowledge graph shows unexpected impacts

Before making a change, you want to know what else it affects.

```tool
query_knowledge_graph mode="impact" node="atelier/--color-accent"
```

Shows all artifacts depending on that token. If you're changing it, you know what to update.

---

## Scenario D: Component isn't rendering in Storybook

### 1. Check the story file exists

```tool
discover_components source="generated" filter="TargetComponent"
```

### 2. Get the preview URL

Check if the component preview URL resolves:
```tool
test_component component="TargetComponent" tests=["visual"]
```
The `preview` field in the result gives you the Storybook URL.

### 3. Check for syntax errors

Read the generated source and story files. Common issues:
- Missing export in story file
- Import path error (`@ds/Button` not `../../Button`)
- TypeScript syntax error

---

## Debugging principles

1. **Isolate the variable** — change one thing at a time between test runs
2. **Fix at the source** — use `query_knowledge_graph mode="where_to_fix"` to find the root cause, not the symptom
3. **Re-run everything after each fix** — a fix that solves the visual diff may introduce a lint error
4. **When stuck, get a vision review** — `vision_review` with `provider="claude"` often catches what automation misses
