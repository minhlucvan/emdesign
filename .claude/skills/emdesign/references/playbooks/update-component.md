# Playbook: Update Component

**Goal:** Modify an existing generated component — fix bugs, apply change requests, improve design.

**When to use:** User wants changes to an existing component (via change request or direct instruction).

---

## Step 1: Understand the existing component

```tool
get_component_documentation target="TargetComponent"
```

If knowledge graph is available, get the full context:
```tool
query_knowledge_graph mode="context" node="art/TargetComponent"
```

---

## Step 2: Read the current source

Read the file at `apps/workspace-react/src/generated/TargetComponent.tsx` (and its story at `*.stories.tsx`) to understand the current implementation.

---

## Step 3: Check for change requests

If responding to a panel change request:
```tool
handle_change_request action="poll"
```

Work through the intent. If it's a design-system-level change (new token, new primitive), surface it to the user — don't silently mutate the system.

---

## Step 4: Edit the component

```tool
generate_component mode="edit" name="TargetComponent" source="(revised source)" story="(revised story if needed)"
```

The tool auto-lints. Address any P0 findings immediately.

---

## Step 5: Verify the fix

```tool
test_component component="TargetComponent" tests=["visual"]
lint_component name="TargetComponent"
```

---

## Step 6: Resolve the change request (if applicable)

```tool
handle_change_request action="resolve" id="(request id)" status="done"
```

---

## Step 7: Iterate

If tests or lint fail, fix and re-run:
```tool
generate_component mode="edit" name="TargetComponent" source="(fixed source)"
test_component component="TargetComponent"
lint_component name="TargetComponent"
```

## Tips

- **Small, atomic changes** — one concern per edit. Don't refactor while fixing.
- **Re-run tests after every edit** — regression can sneak in.
- **Use the graph to trace impacts** — `query_knowledge_graph mode="impact" node="..."` to see what else your change affects.
- **If the fix needs a new token or primitive**, surface it to the user. Don't hardcode off-system values.
