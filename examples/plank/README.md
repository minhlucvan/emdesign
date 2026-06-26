# Plank — emdesign Example Project

> A freshly scaffolded emdesign project, customized from the **After Hours** base
> via the Design System Browser's customization flow.

This example demonstrates what a project looks like after:
1. `emdesign init react-tailwind` — scaffold the workspace
2. Browsing the Catalog in the **System** tab
3. Selecting **After Hours** as the base
4. Customizing: accent color → `#c7512e`, headline font → `Inter`,
   roundness → `12px`
5. Naming the system `plank`
6. One agent-generated component (`HeroSection`) in `src/generated/`

## Structure

```
examples/plank/
├── emdesign.config.json          # Project config
├── .emdesign/
│   ├── state.json                # Shared state store
│   ├── baselines.json            # Visual baseline scores
│   └── active-ds                 # Active design system marker
├── design-systems/
│   └── plank/                    # The customized design system
│       ├── DESIGN.md             # Design contract
│       ├── tokens.css            # Token values (customized)
│       ├── manifest.json         # System metadata
│       └── code/                 # Reusable primitives
├── src/
│   ├── generated/                # Agent-generated components
│   │   ├── HeroSection.tsx
│   │   └── HeroSection.stories.tsx
│   └── components/               # Captured components (empty)
├── tailwind.config.js            # Token-bound Tailwind config
└── README.md                     # This file
```

## What to Look At

| File | Why |
|------|-----|
| `design-systems/plank/tokens.css` | Customized tokens — accent, fonts, radius differ from base |
| `src/generated/HeroSection.tsx` | Agent-generated component using `@ds` primitives and token classes |
| `.emdesign/state.json` | The shared state store between addon and agent |
| `emdesign.config.json` | The project configuration |

## How This Was Created

```bash
emdesign init react-tailwind
# Open Storybook, go to System > Catalog
# Pick "After Hours" → "Use as template"
# Step 1: id=plank, name=Plank
# Step 2: accent=#c7512e, variant=tonal-spot
# Step 3: headline=Inter, body=Inter
# Step 4: roundness=12px, spacing=8px
# Step 5: Create
```
