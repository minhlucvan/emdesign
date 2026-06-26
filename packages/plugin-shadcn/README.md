# @emdesign/plugin-shadcn

The **shadcn/ui plugin** — adds component-catalog codegen guidance and lint rules for shadcn/ui
components. Stacks on `@emdesign/plugin-react` + `@emdesign/plugin-tailwindcss`.

## Role in the system

`plugin-shadcn` extends emdesign with awareness of the shadcn/ui component library. It provides:

- Codegen guidance for shadcn/ui component patterns in agent prompts
- Lint rules that ensure shadcn/ui components are used on-system (token roles, not raw values)
- Component-catalog integration for the knowledge graph

## Related

- `@emdesign/plugin-api` — the plugin interface this implements
- `@emdesign/plugin-react` — the React framework adapter it extends
- `@emdesign/plugin-tailwindcss` — the Tailwind styling adapter it extends
