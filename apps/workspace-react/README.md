# @emdesign/workspace-react

The **React/Tailwind workspace** — the Storybook + emdesign addon dogfood instance, and the source
template for `emdesign init react-tailwind`.

## Role in the system

This is the reference implementation of a emdesign workspace. It:

- Hosts Storybook on `:6006` with the emdesign addon panel
- Wires Tailwind CSS to the active design system's CSS custom properties
- Is the source for `emdesign init react-tailwind` templates
- Runs visual tests via Playwright test-runner
- Is where generated components land (in `src/generated/`) and captured components live (in `src/components/`)

## Commands

```bash
npm run storybook          # Dev server on :6006
npm run build-storybook    # Static build
npm run test:visual        # Playwright visual snapshots
```

## Related

- `@emdesign/workspace` — the abstract workspace core it builds on
- `@emdesign/addon` — the Storybook addon panel it hosts
- `docs/workspace.md` — workspace architecture documentation
