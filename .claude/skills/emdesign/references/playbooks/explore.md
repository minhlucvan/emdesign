# Playbook: Explore

**Goal:** Understand the codebase — what components exist, what the design system looks like, what tokens/primitives are available.

**When to use:** Start of a new task, onboarding, or whenever you need to understand the system state.

---

## Step 1: List available design systems

```tool
manage_design_system action="list"
```

See what design systems exist and which is active.

---

## Step 2: Discover components and stories

```tool
discover_components source="all"
```

Filter by source if you know where to look:
```tool
discover_components source="generated"
discover_components source="components"
discover_components source="primitives"
```

Search by name:
```tool
discover_components source="all" filter="button"
```

---

## Step 3: Get detailed component documentation

Once you find a component of interest:
```tool
get_component_documentation target="Button"
get_component_documentation target="generated-button--default"
```

---

## Step 4: Understand the active design system

```tool
get_design_context
```

For a specific component intent:
```tool
get_design_context componentName="UserProfile" instruction="A profile card with avatar, name, and bio"
```

---

## Step 5: Query the knowledge graph

See how things connect:
```tool
query_knowledge_graph mode="context" node="atelier/Button"
query_knowledge_graph mode="impact" node="atelier/--color-accent"
```

---

## Output

You should now know:
- What design system is active and its key tokens
- What components exist (generated, captured, primitives)
- How the graph connects components to tokens
- The design system contract (DESIGN.md rules)
