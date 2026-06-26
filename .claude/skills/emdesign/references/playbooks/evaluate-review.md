# Playbook: Evaluate & Review

**Goal:** Run the full quality gate on a component before shipping. Combines lint, visual, vision, and LLM critique into a composite score.

**When to use:** After building/updating a component, before shipping.

---

## Step 1: Collect feedback sources

### 1a. Lint score
```tool
lint_component name="TargetComponent"
```
From the P0/P1/P2 findings, derive a `tokens` score (0–1). All P0 = mustFix count > 0.

### 1b. Visual test
```tool
test_component component="TargetComponent" tests=["visual"]
```
From the diff result, derive a `visual` score (0–1). `status === "pass"` = 1.0, `"changed"` = lower based on pixel count.

### 1c. Vision critique (LLM looks at the screenshot)
```tool
vision_review mode="critique" component="TargetComponent" provider="claude"
```
Use the returned `visionScore` (0–1).

---

## Step 2: Run the quality gate

```tool
evaluate_component
  scores={ visual: 1.0, tokens: 0.85, vision: 0.9, llm: 0.95 }
  mustFix=0
  threshold=0.8
  component="TargetComponent"
```

Include `evidenceSlug` to persist this round:
```tool
evaluate_component
  scores={ ... }
  mustFix=0
  threshold=0.8
  component="TargetComponent"
  evidenceSlug="target-component-v1"
```

---

## Step 3: Interpret the decision

| Condition | Decision | Action |
|-----------|----------|--------|
| `composite >= 0.8 && mustFix === 0` | **ship** ✅ | Ready for capture |
| `composite < 0.8` | **continue** 🔄 | Fix weak areas, re-evaluate |
| `mustFix > 0` | **continue** 🔴 | Fix blockers first |

---

## Step 4: Fix and re-evaluate

If the result is "continue":
1. Check which score is lowest
2. Fix it:
   - Low `tokens` → `lint_component`, fix token violations, use `query_knowledge_graph mode="where_to_fix"`
   - Low `visual` → `test_component`, fix visual regressions
   - Low `vision` → `vision_review`, then fix what it flags
3. Re-test and re-evaluate

---

## Step 5: Generate the critique report for the user

Summarize the findings:
- Composite score
- Per-source breakdown
- Decision (ship/continue)
- Key findings from each source
- Screenshot paths for visual reference

---

## Design review checklist

Before calling the gate done, verify:
- [ ] Token roles only — no raw hex or off-system values
- [ ] Primitives imported from `@ds`, not local copies
- [ ] All component states covered (loading, empty, error, active)
- [ ] Responsive behavior works
- [ ] Accessibility — proper ARIA labels, keyboard navigation
- [ ] Story covers all variants
