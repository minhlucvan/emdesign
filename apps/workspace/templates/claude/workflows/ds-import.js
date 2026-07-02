// ds-import.js
// Import a DESIGN.md from awesome-design-md, scaffold primitives, and delegate
// overview composition to ds-compose-overview (Red-Green: tests first, then overview).
//
// Uses agent() calls so it works in the Workflow runtime (no $ shell commands).
//
// Usage: workflow('ds-import', { source, id?, name? })
//   source: "awesome/<brand>" | "git/<url>" | "project/<path>"

export const meta = {
  name: 'ds-import',
  description: 'Import DESIGN.md from awesome-design-md, scaffold primitives, delegate overview to ds-compose-overview.',
  phases: [
    { title: 'Fetch & tokens', detail: 'Fetch DESIGN.md, extract tokens.css, write manifest' },
    { title: 'Generate skills', detail: 'Generate skills/build/SKILL.md + skills/taste/SKILL.md' },
    { title: 'Craft primitives', detail: 'Generate code/ React components from DESIGN.md' },
    { title: 'Compose overview', detail: 'Delegate to ds-compose-overview (Red-Green workflow)' },
  ],
}

const parsedArgs = typeof args === 'string' ? JSON.parse(args) : (args || {})
const { source, id: explicitId, name } = parsedArgs
if (!source) throw new Error('ds-import: source is required')

const AWESOME_MD = 'https://raw.githubusercontent.com/voltagent/awesome-design-md/main'
const brand = source.replace('awesome/', '')
const dsId = explicitId || brand.toLowerCase().replace(/[^a-z0-9-]/g, '-')
const dsName = name || dsId
const dsDir = `design-systems/${dsId}`
const codeDir = `${dsDir}/code`

log(`[ds-import] Importing "${dsName}" (${dsId}) from ${source}`)

// ═══════════════════════════════════════════════════════════════════════
// Phase 1: Fetch DESIGN.md + extract tokens + manifest
// ═══════════════════════════════════════════════════════════════════════
phase('Fetch & tokens')

const designMdUrl = `${AWESOME_MD}/design-md/${brand}/DESIGN.md`
log(`[ds-import] Fetching DESIGN.md from ${designMdUrl}`)

const fetchResult = await agent(
  `Fetch a DESIGN.md and generate a design system from it.

Source URL: ${designMdUrl}
DS id: ${dsId}
DS name: ${dsName}
Output dir: ${dsDir}

Steps:
1. Run: mkdir -p ${dsDir} ${codeDir}
2. Fetch the DESIGN.md from the URL using curl, save to ${dsDir}/DESIGN.md
3. Read the DESIGN.md and analyze its YAML frontmatter (colors, typography, spacing, rounded sections)
4. Generate a complete tokens.css at ${dsDir}/tokens.css with ALL values from the frontmatter. Include semantic aliases (--color-text, --color-surface, --color-accent, etc.)
5. Generate manifest.json at ${dsDir}/manifest.json with schemaVersion, id, name, source attribution, file listing
6. Do NOT generate components yet (that's the next phase)

Return a JSON summary of what was created: { tokens: number, colors: number, fonts: string[], spacing: string[] }`,
  { label: `fetch:${dsId}`, phase: 'Fetch & tokens', schema: {
    type: 'object',
    properties: {
      tokens: { type: 'number' },
      colors: { type: 'number' },
      fonts: { type: 'array', items: { type: 'string' } },
      spacing: { type: 'array', items: { type: 'string' } },
    },
    required: ['tokens'],
  }}
)

log(`[ds-import] Token count: ${fetchResult?.tokens ?? '?'}`)

// ═══════════════════════════════════════════════════════════════════════
// Phase 1.5: Generate per-DS skills (build skill + taste profile)
// ═══════════════════════════════════════════════════════════════════════
phase('Generate skills')
log('[ds-import] Generating skills/build/SKILL.md and skills/taste/SKILL.md')

await agent(
  `Generate the design-language build skill and taste profile for DS "${dsId}" at ${dsDir}.

Inputs (read these first):
- cat "${dsDir}/DESIGN.md"
- cat "${dsDir}/tokens.css"

Write to:
1. ${dsDir}/skills/build/SKILL.md — the build skill with these 8 sections:
   # <Name> Build Skill
   ## Token Roles — table each SEMANTIC_TOKEN_ROLE with Tailwind class + CSS var + usage
   ## Type Scale — display / h1 / h2 / h3 / body / caption
   ## Spacing Scale — base unit + each stop
   ## Radius & Depth — radius stops, shadow rules
   ## Motion — fast/base/ease tokens
   ## Component Patterns — 3-5 examples
   ## Anti-Patterns — explicit DO NOT list
   ## Reuse vs Author — "if @ds/<Name> exists, import, don't re-author"

2. ${dsDir}/skills/taste/SKILL.md — the taste profile with YAML frontmatter:
   ---
   name: ${dsId}-taste
   dials:
     DESIGN_VARIANCE: <1-10>
     MOTION_INTENSITY: <1-10>
     VISUAL_DENSITY: <1-10>
   ---
   # ${dsId} Taste Profile
   **Brand fingerprint:** <1-2 sentences>
   **Visual characteristics:** <1-2 sentences>
   **Anti-patterns:** <1-2 sentences>

Return "done".`,
  { label: `skills:${dsId}`, phase: 'Generate skills' }
)
log(`[ds-import] Skills generated for "${dsId}"`)

// ═══════════════════════════════════════════════════════════════════════
// Phase 2: Craft React primitives — RED/GREEN per primitive
// ═══════════════════════════════════════════════════════════════════════
phase('Craft primitives')
log('[ds-import] RED/GREEN: React primitive components')

const PRIMITIVES = [
  { name: 'Button', desc: 'variants: primary/secondary/ghost. Sizes: sm/md/lg. Disabled state.' },
  { name: 'Card', desc: 'container with border, padding, rounded corners. Variants: default, elevated.' },
  { name: 'Input', desc: 'text input with label, placeholder, focus/error states.' },
  { name: 'Badge', desc: 'small label with color variants (accent, success, warn, danger).' },
  { name: 'Heading', desc: 'h1-h6 using --font-display with proper sizes from the type scale.' },
  { name: 'Text', desc: 'body text using --font-sans. Variants: body, body-sm, caption, code.' },
  { name: 'Link', desc: 'anchor styled with --color-link, hover state.' },
  { name: 'Stack', desc: 'flex layout wrapper. Variants: row, col with gap prop.' },
  { name: 'Swatch', desc: 'color swatch showing a token value with label and hex.' },
]

let createdCount = 0

for (const p of PRIMITIVES) {
  const filePath = `${codeDir}/${p.name}.tsx`
  // Check if already exists
  const exists = String(await $`test -f "${filePath}" && echo "yes" || echo "no"`).trim()
  if (exists === 'yes') {
    log(`[ds-import]  ${p.name}.tsx already exists — skipping`)
    continue
  }

  // RED: write a failing test
  log(`[ds-import]  🔴 RED: ${p.name}`)
  await agent(
    `Write a VITEST test file for a React component "${p.name}" that does NOT exist yet.

The component will live at "${filePath}".
The test file goes at "${dsDir}/__tests__/${p.name}.test.ts".

The test should import the component (which doesn't exist yet — the import will fail = RED confirmed).
Write a test that checks:
- It renders without crashing (render from @testing-library/react)
- It accepts basic props
- It uses CSS variables (check the source for var(--token-*) patterns)

The component description: ${p.desc}
Design system: "${dsName}" at ${dsDir}

Read the DESIGN.md at ${dsDir}/DESIGN.md and tokens.css at ${dsDir}/tokens.css first.
Write the test to "${dsDir}/__tests__/${p.name}.test.ts".

Then run: npx vitest run "${dsDir}/__tests__/${p.name}.test.ts" 2>&1
Confirm the test FAILS (RED confirmed). Return "RED confirmed: test failed".`,
    { label: `red:${dsId}/${p.name}`, phase: 'Craft primitives' }
  )

  // GREEN: implement the component
  log(`[ds-import]  🟩 GREEN: ${p.name}`)
  await agent(
    `Implement the React component "${p.name}" for design system "${dsName}" at ${dsDir}.

Read these first:
- cat "${dsDir}/DESIGN.md"
- cat "${dsDir}/tokens.css"
- cat "${dsDir}/skills/build/SKILL.md"

The component "${p.name}" description: ${p.desc}

Write to: ${filePath}

Requirements:
- Use CSS variables (var(--token-*)) for ALL colors, spacing, typography
- Never hardcode hex values or pixel values
- Use React.forwardRef for form elements
- Add proper TypeScript prop interfaces with JSDoc
- Add displayName
- Include hover/focus/active interactive states where applicable
- Default type="button" for Button

Then run: npx vitest run "${dsDir}/__tests__/${p.name}.test.ts" 2>&1
If tests fail, fix the component and re-run until GREEN.

Return JSON: { file: "${p.name}.tsx", green: true }`,
    { label: `green:${dsId}/${p.name}`, phase: 'Craft primitives', schema: {
      type: 'object', properties: { file: { type: 'string' }, green: { type: 'boolean' } }, required: ['file'],
    }}
  )
  createdCount++
}

// Write barrel export
const indexContent = PRIMITIVES.map(p =>
  `export { ${p.name} } from './${p.name}';\nexport type { ${p.name}Props } from './${p.name}';`
).join('\n')
await $`mkdir -p "${codeDir}" && echo '${indexContent}' > "${codeDir}/index.ts"`
log(`[ds-import] Created ${createdCount} primitive(s) via RED/GREEN, index.ts re-exports all`)

// ═══════════════════════════════════════════════════════════════════════
// Phase 3: Delegate overview to ds-compose-overview (Red-Green)
// ═══════════════════════════════════════════════════════════════════════
phase('Compose overview')
log('[ds-import] Delegating overview to ds-compose-overview (Red-Green)')

const overviewResult = await workflow({scriptPath: 'apps/workspace/templates/claude/workflows/ds-compose-overview.js'}, {
  dsId,
  dsPath: dsDir,
  maxAttempts: 3,
})

log(`[ds-import] Overview: ${overviewResult?.overviewFile ?? 'N/A'}`)
log(`[ds-import]   Tests: ${overviewResult?.testFile ?? 'N/A'} (${overviewResult?.testsPassed ? 'pass' : 'fail'})`)

// ═══════════════════════════════════════════════════════════════════════
// Summary
// ═══════════════════════════════════════════════════════════════════════
log(`[ds-import] ✅ Complete: "${dsName}" (${dsId})`)
log(`[ds-import]   Tokens: ${dsDir}/tokens.css (${fetchResult?.tokens ?? '?'} tokens)`)
log(`[ds-import]   Primitives: ${componentCount} components in ${codeDir}/`)
log(`[ds-import]   Overview: ${overviewResult?.overviewFile ?? 'N/A'}`)
log(`[ds-import]   Tests: ${overviewResult?.testFile ?? 'none'}`)

return {
  id: dsId,
  name: dsName,
  path: dsDir,
  tokens: fetchResult?.tokens ?? 0,
  primitives: componentCount,
  overviewFile: overviewResult?.overviewFile,
  testFile: overviewResult?.testFile,
  testsPassed: overviewResult?.testsPassed,
}
