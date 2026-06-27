# emdesign Example: __NAME__

An emdesign example workspace. Generated from the canonical example template.

## Setup

```bash
npx emdesign use atelier      # activate a design system
npm run storybook              # start Storybook on :6006
npm run backend                # start the emdesign backend (separate terminal)
```

## Structure

- `src/generated/` — components being built (by the agent loop)
- `src/components/` — captured, reusable components
- `design-systems/` — design system contracts (atelier + custom)
- `.claude/` — agent workflows and skills (synced from engine templates)
- `__screenshots__/` — visual test baselines
