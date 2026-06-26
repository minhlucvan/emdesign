# Playbook: Manage Design System

**Goal:** Create, switch, validate, grade, or maintain design systems.

**When to use:** You need a new design system, or need to inspect/improve an existing one.

---

## Action: List available design systems

```tool
manage_design_system action="list"
```

See also prebuilt bases you can clone:
```tool
manage_design_system action="list_bases"
```

---

## Action: Switch active design system

```tool
manage_design_system action="apply" id="my-design-system"
```

This rewires `@ds` alias + tokens.css + rebuilds the graph. All existing components re-skin automatically.

---

## Action: Validate a design system

Check the token contract and structural invariants:
```tool
manage_design_system action="validate" id="my-design-system"
```

Returns `ok: true/false` + diagnostics. Fix any failures.

---

## Action: Grade a design system

Quality score against the open-design rubric:
```tool
manage_design_system action="grade" id="my-design-system"
```

Returns scorecard + letter grade + whether it meets the quality bar.

---

## Action: Find conflicts

Detect duplicate roles, orphan tokens, dangling theme overrides:
```tool
manage_design_system action="conflicts" id="my-design-system"
```

---

## Action: Create a new design system

From scratch:
```tool
manage_design_system action="create" id="my-system" name="My System" mode="blank"
```

From a brief (AI generates the contract):
```tool
manage_design_system action="create" id="my-system" name="My System" mode="brief"
```

From a prebuilt base:
```tool
manage_design_system action="create" id="my-system" name="My System" mode="import" from="open-design/brutalist"
```

---

## Action: Scaffold primitives

Copy the base primitive set (Button, Card, Input, etc.) into a design system:
```tool
manage_design_system action="scaffold" id="my-system"
```

From a specific source:
```tool
manage_design_system action="scaffold" id="my-system" from="atelier"
```

---

## Action: View version history

```tool
manage_design_system action="history" id="my-system"
```

Commit a snapshot:
```tool
manage_design_system action="history" id="my-system" snapshot=true
```

---

## After any DS change: Rebuild the graph

```tool
rebuild_graph id="my-system"
```

This ensures the knowledge graph reflects the current state. Always do this after creating, updating, or validating a design system.

---

## Then: Re-discover

After switching or creating a design system, re-explore what's available:
```tool
discover_components source="primitives"
get_design_context
```
