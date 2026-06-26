# Playbook: Ship

**Goal:** Promote a generated, evaluated component into a reusable, documented, git-tracked component.

**When to use:** Component has passed the quality gate (evaluate_component returns "ship"). This is the FINAL step.

---

## Prerequisites

Before shipping, confirm:

- [ ] `lint_component` passes with 0 P0 findings
- [ ] `test_component` visual diff passes (status: "pass" or baseline established)
- [ ] `evaluate_component` returns `decision: "ship"` (composite >= threshold && mustFix === 0)
- [ ] All variants/stories render correctly
- [ ] Component is complete — no TODOs, no placeholder content

---

## Step 1: Final quality check

Run the full gate one more time to confirm:
```tool
lint_component name="TargetComponent"
test_component component="TargetComponent" tests=["visual"]
```

```tool
evaluate_component
  scores={ visual: 1.0, tokens: 1.0, vision: 1.0, llm: 1.0 }
  mustFix=0
  threshold=0.8
  component="TargetComponent"
  evidenceSlug="target-component-ship"
```

Only proceed if `decision === "ship"`.

---

## Step 2: Capture the component

```tool
capture_component name="TargetComponent"
```

This does:
1. Copies generated file to `src/components/<Name>/<Name>.tsx`
2. Copies story to `src/components/<Name>/<Name>.stories.tsx`
3. Prepends a documentation header
4. Git-adds the new files

---

## Step 3: Verify the capture

```tool
discover_components source="components" filter="TargetComponent"
test_component component="TargetComponent" tests=["visual"]
```

---

## Step 4: Rebuild the knowledge graph

So the graph reflects the new captured component:
```tool
rebuild_graph
```

---

## What NOT to do

- ❌ Don't ship without running `evaluate_component` — visual check alone is not enough
- ❌ Don't ship with P0 lint findings — they're blockers by definition
- ❌ Don't ship without capturing — generated files are ephemeral, captured files are permanent
- ❌ Don't modify captured files directly — always go through the generate → test → evaluate → capture loop
