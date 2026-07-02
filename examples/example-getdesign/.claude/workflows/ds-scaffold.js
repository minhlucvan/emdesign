// ds-scaffold.js
// Core scaffold workflow: turn any DESIGN.md into a complete design system.
// Generates: manifest.json, tokens.css, code/ primitives, graph.json, validated rules.
//
// Usage: workflow('ds-scaffold', { id, designMdPath, source?, name?, description?, dials? })
//   id             - kebab-case id for the new design system
//   designMdPath   - path to a local DESIGN.md file (can be set up by ds-import)
//   source         - optional source attribution (e.g. 'awesome/airbnb')
//   name           - optional display name (defaults from DESIGN.md frontmatter)
//   description    - optional description (defaults from DESIGN.md frontmatter)
//   dials          - optional { variance, motion, density } from ds-taste-profile
export const meta = {
  name: 'ds-scaffold',
  description: 'Scaffold a complete design system from DESIGN.md: manifest, tokens.css, code/ primitives, graph, validation.',
  phases: [
    { title: 'Parse', detail: 'Parse DESIGN.md frontmatter + sections' },
    { title: 'Read taste', detail: 'Load design taste profile for generation guidance' },
    { title: 'Generate tokens', detail: 'Build tokens.css from colors, typography, spacing' },
    { title: 'Scaffold primitives', detail: 'Generate code/ primitives (Button, Input, Card, Badge…)' },
    { title: 'Build graph', detail: 'Build knowledge graph.json for the design system' },
    { title: 'Validate', detail: 'Run ds validate --strict' },
  ],
}

const _args = typeof args === "string" ? JSON.parse(args) : (args || {});

const { id, designMdPath, source, name: displayName, description: displayDesc, dials: tasteDials } = _args
if (!id) throw new Error('ds-scaffold: id is required')
if (!designMdPath) throw new Error('ds-scaffold: designMdPath is required')

const dsDir = `design-systems/${id}`

phase('Parse')
log(`[ds-scaffold] Parsing DESIGN.md for "${id}" from ${designMdPath}`)

// Read DESIGN.md and extract frontmatter
let frontmatter = {}
let description = displayDesc ?? ''
let dsName = displayName ?? id
try {
  const raw = await $`cat ${designMdPath}`
  // Extract YAML frontmatter between --- markers
  const fmMatch = raw.match(/^---\n([\s\S]*?)\n---/)
  if (fmMatch) {
    const yaml = fmMatch[1]
    // Parse key-value pairs from the loose YAML
    for (const line of yaml.split('\n')) {
      const m = line.match(/^(\w+):\s*(.+)$/)
      if (m) frontmatter[m[1]] = m[2].replace(/^["']|["']$/g, '')
    }
    dsName = displayName || frontmatter.name || id
    description = displayDesc || frontmatter.description || ''
  }
  log(`[ds-scaffold] Name: ${dsName}, Description: ${description ? description.slice(0, 60) + '…' : 'none'}`)
} catch (e) {
  log(`[ds-scaffold] Could not parse DESIGN.md: ${e.message}`)
}

// Create the design system directory
try {
  await $`mkdir -p ${dsDir}`
  log(`[ds-scaffold] Created directory: ${dsDir}`)
} catch (e) {
  throw new Error(`[ds-scaffold] Failed to create directory: ${e.message}`)
}

phase('Read taste')
log(`[ds-scaffold] Reading design taste profile`)

// Load taste context — check per-system skill first, then core reference
let tasteContext = ''
let dials = tasteDials || { variance: 5, motion: 5, density: 5 }

if (!tasteDials) {
  try {
    const tasteSkill = await $`cat ${dsDir}/skills/taste/SKILL.md 2>/dev/null`
    if (tasteSkill) {
      const vMatch = tasteSkill.match(/DESIGN_VARIANCE:\s*(\d+)/)
      const mMatch = tasteSkill.match(/MOTION_INTENSITY:\s*(\d+)/)
      const dMatch = tasteSkill.match(/VISUAL_DENSITY:\s*(\d+)/)
      if (vMatch) dials.variance = parseInt(vMatch[1])
      if (mMatch) dials.motion = parseInt(mMatch[1])
      if (dMatch) dials.density = parseInt(dMatch[1])
      tasteContext = tasteSkill
      log(`[ds-scaffold] Found per-system taste skill: V${dials.variance} / M${dials.motion} / D${dials.density}`)
    }
  } catch { /* no per-system skill */ }

  if (!tasteContext) {
    try {
      tasteContext = await $`cat .claude/skills/design-taste/THE_DIALS.md 2>/dev/null`
      log(`[ds-scaffold] Using core design-taste reference`)
    } catch {
      log(`[ds-scaffold] No taste reference — defaults V${dials.variance} / M${dials.motion} / D${dials.density}`)
    }
  }
} else {
  log(`[ds-scaffold] Using caller dials: V${dials.variance} / M${dials.motion} / D${dials.density}`)
}

// Build taste prompt snippet
const tasteDesc = {
  variance: dials.variance <= 3 ? 'Conventional, safe, standard' : dials.variance <= 6 ? 'Characterful, one distinctive move' : 'Bold, experimental, opinionated',
  motion: dials.motion <= 3 ? 'Static, minimal animation' : dials.motion <= 6 ? 'Purposeful micro-interactions' : 'Expressive, animated',
  density: dials.density <= 3 ? 'Airy, generous whitespace' : dials.density <= 6 ? 'Balanced, comfortable' : 'Compact, efficient',
}
const tastePrompt = `## Design Taste Context
Dial settings: V${dials.variance} (${tasteDesc.variance}) / M${dials.motion} (${tasteDesc.motion}) / D${dials.density} (${tasteDesc.density})
- VARIANCE guides: ${dials.variance <= 3 ? 'Conventional radii (4-6px), safe contrast, standard spacing' : dials.variance <= 6 ? 'Characterful radius (8-12px), one distinctive accent move' : 'Bold radii (16px+ or 0px), high contrast, expressive choices'}
- MOTION guides: ${dials.motion <= 3 ? 'Fast transitions (100ms), linear easing, minimal animation' : dials.motion <= 6 ? 'Purposeful 200ms ease, state transitions' : 'Expressive 300ms+ spring physics, scroll-triggered'}
- DENSITY guides: ${dials.density <= 3 ? 'Spacious (8px unit, 18px+ body, 48px+ padding)' : dials.density <= 6 ? 'Balanced (6px unit, 16px body, 32px padding)' : 'Compact (4px unit, 14px body, 16px padding)'}

${tasteContext ? `## Taste Reference\n${tasteContext.slice(0, 800)}` : ''}`

phase('Generate tokens')
log(`[ds-scaffold] Building tokens.css from DESIGN.md`)

// Use agent to generate tokens.css from the DESIGN.md content
const tokensResult = await agent(
  `You are scaffolding a design system at "${dsDir}/${id}".

Read the DESIGN.md at "${designMdPath}" and generate a complete tokens.css file.

${tastePrompt}

Rules:
- Map frontmatter colors to --color-* variables (primary → accent, background → surface, text → text, etc.)
- Include all semantic token roles: --color-accent, --color-surface, --color-text, --color-text-muted, --color-border, --color-success, --color-warning, --color-danger
- Add typography tokens: --font-sans, --font-display, --font-mono, --font-size-xs through --font-size-xxl
- Add spacing tokens: --space-xs through --space-2xl derived from a spacing unit
- Add radius token: --radius
- Add shadow tokens: --shadow-sm, --shadow-md, --shadow-lg
- Each token needs a value, a description /* as comment */, and semantic grouping

Output ONLY the tokens.css content. No explanation, no markdown wrapping.

Example format:
\`\`\`css
:root {
  /* === Colors === */
  --color-accent: #6366f1;  /* Primary accent — buttons, links, active states */
  --color-surface: #ffffff;  /* Page background */
  --color-text: #111111;     /* Primary text */
  /* ... */
}
\`\`\``,
  { label: `tokens:${id}`, phase: 'Generate tokens', schema: { type: 'object', properties: { tokensCss: { type: 'string' } }, required: ['tokensCss'] } }
)

if (!tokensResult?.tokensCss) {
  log(`[ds-scaffold] ⚠️  Token generation failed, using default atelier template`)
  // Fallback: copy atelier's tokens.css
  try {
    const atelierTokens = await $`cat design-systems/atelier/tokens.css 2>/dev/null`
    if (atelierTokens) {
      // Replace atelier CSS with generic scaffold
      const genericTokens = atelierTokens.replace(/atelier/g, id)
      await $`cat > ${dsDir}/tokens.css << 'CSSEOF'
${genericTokens}
CSSEOF`
      log(`[ds-scaffold] Copied atelier tokens.css as base`)
    }
  } catch { /* no fallback */ }
} else {
  await $`cat > ${dsDir}/tokens.css << 'CSSEOF'
${tokensResult.tokensCss}
CSSEOF`
  log(`[ds-scaffold] ✅ tokens.css generated (${tokensResult.tokensCss.length} chars)`)
}

// Write DESIGN.md to the design system directory
try {
  await $`cp ${designMdPath} ${dsDir}/DESIGN.md`
  log(`[ds-scaffold] Copied DESIGN.md to ${dsDir}/DESIGN.md`)
} catch (e) {
  log(`[ds-scaffold] Failed to copy DESIGN.md: ${e.message}`)
}

// Write manifest.json
const manifest = {
  id,
  name: dsName,
  description,
  version: '0.1.0',
  category: frontmatter.category || 'Custom',
  source: source ? { type: source, upstream: source } : undefined,
  updatedAt: new Date().toISOString(),
}
await $`cat > ${dsDir}/manifest.json << 'JSONEOF'
${JSON.stringify(manifest, null, 2)}
JSONEOF`
log(`[ds-scaffold] ✅ manifest.json written`)

phase('Scaffold primitives')
log(`[ds-scaffold] Generating code/ primitives`)

// Generate primitive components using agent
const primitivesResult = await agent(
  `You are scaffolding primitive React components for a design system at "${dsDir}/code/".

The DESIGN.md is at "${designMdPath}" and tokens are in "${dsDir}/tokens.css".

${tastePrompt}

Read the tokens.css to understand the available colors, fonts, and spacing.

Generate these primitive React components as .tsx files:
1. **Button.tsx** — variants: primary, secondary, ghost, outline. Sizes: sm, md, lg. Support disabled, loading states.
2. **Input.tsx** — text input with label, error state, disabled state, placeholder styling
3. **Card.tsx** — container with optional header, body, footer sections. Elevation variants.
4. **Badge.tsx** — small label/tag with color variants (accent, success, warning, danger, neutral)

Each component MUST:
- Use inline Tailwind-style className or style objects referencing the CSS custom properties
- Use the tokens from tokens.css (e.g., colors via style={{ color: 'var(--color-accent)' }}, etc.)
- Export proper TypeScript types
- Be a well-structured, production-quality React component
- Include a brief JSDoc comment

Write each file to "${dsDir}/code/{Name}.tsx". Use \`cat > file << 'EOF'\` to write each one.

Return the list of files created.`,
  { label: `primitives:${id}`, phase: 'Scaffold primitives', schema: { type: 'object', properties: { files: { type: 'array', items: { type: 'string' } } }, required: ['files'] } }
)

if (primitivesResult?.files?.length) {
  log(`[ds-scaffold] ✅ Primitives generated: ${primitivesResult.files.join(', ')}`)
} else {
  log(`[ds-scaffold] ⚠️  No primitives generated — will build graph without them`)
}

// Create code/ directory if not exists (agent might have created files already)
try {
  await $`mkdir -p ${dsDir}/code`
} catch { /* */ }

// Count created files
let codeCount = 0
try {
  const count = await $`ls ${dsDir}/code/*.tsx 2>/dev/null | wc -l`
  codeCount = parseInt(count.trim() || '0')
  log(`[ds-scaffold] ${codeCount} primitive component(s) in code/`)
} catch { /* */ }

phase('Build graph')
log(`[ds-scaffold] Building knowledge graph`)

// Build the knowledge graph
try {
  const graphResult = await $`emdesign test graph 2>/dev/null --json || echo "graph_unavailable"`
  if (graphResult.trim() !== 'graph_unavailable') {
    log(`[ds-scaffold] ✅ Knowledge graph built`)
  } else {
    log(`[ds-scaffold] ⚠️  Graph build skipped (graph may not be available in this context)`)
  }
} catch (e) {
  log(`[ds-scaffold] ⚠️  Graph build skipped: ${e.message}`)
}

phase('Validate')
log(`[ds-scaffold] Validating design system`)

// Validate the design system
let validationPassed = false
let validationErrors = 0
try {
  const validationResult = await $`emdesign test validate ${id} --json 2>/dev/null`
  const parsed = JSON.parse(validationResult)
  if (parsed.ok) {
    validationPassed = true
    log(`[ds-scaffold] ✅ Validation passed`)
  } else {
    validationErrors = parsed.data?.errors?.length ?? 1
    log(`[ds-scaffold] ⚠️  Validation: ${validationErrors} issue(s)`)
  }
} catch (e) {
  log(`[ds-scaffold] ⚠️  Validation command unavailable: ${e.message}`)
}

// Summary
log(`[ds-scaffold] ✅ Design system "${id}" scaffold complete`)
log(`[ds-scaffold]   Location: ${dsDir}/`)
log(`[ds-scaffold]   Tokens: ${dsDir}/tokens.css`)
log(`[ds-scaffold]   Primitives: ${codeCount} components in code/`)
log(`[ds-scaffold]   Validated: ${validationPassed ? '✅' : '⚠️  issues'}`)

return {
  id,
  name: dsName,
  path: dsDir,
  tokens: `${dsDir}/tokens.css`,
  primitives: codeCount,
  validated: validationPassed,
  validationErrors,
}
