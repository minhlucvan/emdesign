// ds-taste-profile.js
// Turn a free-text prompt into a taste-driven DESIGN.md with 9 sections,
// three-dial profile, and per-system taste skill.
//
// Usage: workflow('ds-taste-profile', { prompt, id?, name?, category? })
//   prompt - free-text description of the desired design system
//   id     - optional kebab-case id (auto-derived from prompt)
//   name   - optional display name (auto-derived)
export const meta = {
  name: 'ds-taste-profile',
  description: 'Turn a free-text prompt into a taste-driven DESIGN.md with 9 sections, three-dial profile, and per-system taste skill.',
  phases: [
    { title: 'Design Read', detail: 'Analyze prompt for system kind, audience, vibe, constraints' },
    { title: 'Set Dials', detail: 'Map brief to DESIGN_VARIANCE, MOTION_INTENSITY, VISUAL_DENSITY' },
    { title: 'Author DESIGN.md', detail: 'Generate all 9 sections with taste-aware decisions' },
    { title: 'Save Taste Skill', detail: 'Write per-system taste profile for future use' },
  ],
}

const { prompt, id: explicitId, name: explicitName, category: explicitCategory } = args
if (!prompt) throw new Error('ds-taste-profile: prompt is required')

const dsId = explicitId || prompt.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40)
const dsDir = `design-systems/${dsId}`

phase('Design Read')
log(`[ds-taste-profile] Analyzing prompt: "${prompt.slice(0, 100)}${prompt.length > 100 ? '…' : ''}"`)

// Phase 1: Design Read — analyze the prompt
const readResult = await agent(
  `You are a design taste analyst. Analyze this prompt for a design system and produce a structured design read.

Prompt: "${prompt}"

Extract these signals:
1. **System kind** — what type of system is this? (editorial, SaaS, e-commerce, dashboard, portfolio, brand, docs, general)
2. **Audience** — who is this for? (consumers, enterprise, developers, designers, general public, niche)
3. **Vibe words** — 3-5 emotional/visual descriptors extracted from the prompt (e.g. warm, minimal, bold, playful, serious, organic)
4. **Reference signals** — any brands, design systems, URLs, or products mentioned or implied
5. **Quiet constraints** — any implied constraints (accessibility, mobile-first, dark mode, localization, performance)
6. **Visual language** — one sentence capturing the intended visual direction

Then produce a **design read** statement exactly like this format:
"Reading this as: <kind> for <audience>, with a <vibe> language, leaning toward <visual language>."

Example: "Reading this as: editorial system for a literary magazine audience, with a warm paper-and-ink language, leaning toward serif display + generous whitespace + single terracotta accent."`,
  { label: `design-read:${dsId}`, phase: 'Design Read', schema: {
    type: 'object',
    properties: {
      systemKind: { type: 'string' },
      audience: { type: 'string' },
      vibeWords: { type: 'array', items: { type: 'string' } },
      referenceSignals: { type: 'array', items: { type: 'string' } },
      quietConstraints: { type: 'array', items: { type: 'string' } },
      visualLanguage: { type: 'string' },
      designRead: { type: 'string' },
    },
    required: ['systemKind', 'audience', 'vibeWords', 'visualLanguage', 'designRead'],
  }}
)

if (!readResult) throw new Error('[ds-taste-profile] Design read failed')
log(`[ds-taste-profile] ${readResult.designRead}`)

// Derive name from the design read if not provided
const dsName = explicitName || prompt.split(/[,.]/)[0]?.trim() || dsId
const category = explicitCategory || readResult.systemKind === 'editorial' ? 'Editorial' : 'Custom'

phase('Set Dials')
log(`[ds-taste-profile] Mapping design read to three dials`)

// Phase 2: Set Dials — map the design read to three dial values
const dialsResult = await agent(
  `You are a design taste engineer. Map this design read to the three dials.

Design Read: "${readResult.designRead}"

Vibe words: ${(readResult.vibeWords || []).join(', ')}
Audience: ${readResult.audience}
System kind: ${readResult.systemKind}

Use the following mapping guide:

**DESIGN_VARIANCE (1-10)** — How opinionated are token values?
- 1-3: Conventional, safe, standard (enterprise, docs, public-sector)
- 4-6: Characterful, one distinctive move (editorial, SaaS, consumer)
- 7-8: Bold, unusual combos (creative, brand-forward)
- 9-10: Avant-garde, provocative (experimental, agency)

**MOTION_INTENSITY (1-10)** — How much motion?
- 1-3: Static or minimal (docs, enterprise, accessibility-first)
- 4-6: Purposeful micro-interactions (SaaS, editorial)
- 7-8: Expressive, scroll-driven (creative, brand)
- 9-10: Cinematic, kinetic (experimental, portfolio)

**VISUAL_DENSITY (1-10)** — How much information per view?
- 1-3: Airy, generous whitespace (editorial, portfolio, brand)
- 4-6: Balanced, comfortable (SaaS, consumer)
- 7-8: Compact, efficient (dashboard, enterprise, data-rich)
- 9-10: Dense, power-user (admin, monitoring)

For each dial, provide:
1. The numeric value (1-10)
2. A one-sentence justification for why this value fits

Key principle: If the prompt doesn't strongly suggest high variance, default to 4-6. Do not inflate dials.`,
  { label: `dials:${dsId}`, phase: 'Set Dials', schema: {
    type: 'object',
    properties: {
      DESIGN_VARIANCE: { type: 'number', minimum: 1, maximum: 10 },
      MOTION_INTENSITY: { type: 'number', minimum: 1, maximum: 10 },
      VISUAL_DENSITY: { type: 'number', minimum: 1, maximum: 10 },
      varianceJustification: { type: 'string' },
      motionJustification: { type: 'string' },
      densityJustification: { type: 'string' },
    },
    required: ['DESIGN_VARIANCE', 'MOTION_INTENSITY', 'VISUAL_DENSITY'],
  }}
)

if (!dialsResult) throw new Error('[ds-taste-profile] Dial mapping failed')
log(`[ds-taste-profile] Dials: V${dialsResult.DESIGN_VARIANCE} / M${dialsResult.MOTION_INTENSITY} / D${dialsResult.VISUAL_DENSITY}`)

phase('Author DESIGN.md')
log(`[ds-taste-profile] Generating 9-section DESIGN.md with taste guidance`)

// Phase 3: Author DESIGN.md — generate all 9 sections driven by dials
const designMdResult = await agent(
  `You are a design system author with impeccable taste. Generate a complete DESIGN.md for a design system.

## Design Read
${readResult.designRead}

## Three Dials
- DESIGN_VARIANCE: ${dialsResult.DESIGN_VARIANCE}/10 — ${dialsResult.varianceJustification}
- MOTION_INTENSITY: ${dialsResult.MOTION_INTENSITY}/10 — ${dialsResult.motionJustification}
- VISUAL_DENSITY: ${dialsResult.VISUAL_DENSITY}/10 — ${dialsResult.densityJustification}

## Vibe Words
${(readResult.vibeWords || []).join(', ')}

## Audience
${readResult.audience}

## Constraints
${(readResult.quietConstraints || []).join(', ') || 'None'}

## Requirements
Generate a complete DESIGN.md with exactly these 9 sections. Each section must be opinionated and specific — no filler, no "depends on context," no "could be this or that."

### Section 1: Visual Theme (3-5 sentences)
An opinionated description of the system's visual character. Should feel like a real brand guideline, not an AI paragraph. Lead with the emotional quality, then describe the key visual moves.

### Section 2: Color (exact hex values)
Define the palette with exact hex values:
- \`--color-surface\` — page background
- \`--color-surface-raised\` — card/raised surface
- \`--color-text\` — primary text
- \`--color-text-muted\` — secondary text
- \`--color-accent\` — primary accent
- \`--color-accent-hover\` — accent hover state
- \`--color-border\` — borders and dividers
- \`--color-success\`, \`--color-warning\`, \`--color-danger\` — status colors

Explain WHY each color was chosen and what role it plays in the system. At the bottom, list WCAG contrast ratios for the primary pairings.

### Section 3: Typography (specific font names)
Define the type stack:
- Display font — for headings (name the actual font)
- Body font — for running text
- Mono font — for code

Include a type scale table with at least 7 sizes (xs through 4xl), each with: size, weight, line-height, usage.

### Section 4: Spacing (exact values)
Define the spacing scale derived from the density dial:
- Base unit: ${dialsResult.VISUAL_DENSITY <= 3 ? '8px' : dialsResult.VISUAL_DENSITY <= 6 ? '6px' : '4px'}
- Scale from xs (base/2) to 2xl (base * 8)
- Section padding, card padding, component gap

### Section 5: Layout
Composition philosophy. Grid system (columns, gutter, margin). Breakpoints. Container max-widths.

### Section 6: Components (specifications)
Define the key components the system needs and their token bindings:
- Button (primary, secondary, ghost — sizes, states, radius)
- Input (text input — padding, border, focus state)
- Card (container — padding, elevation, radius)
- Badge (label — color variants, sizing)
- Navigation (tabs or links — active state, spacing)

Each component must specify which token roles it binds to (e.g., Button background → \`--color-accent\`).

### Section 7: Motion
Durations and easings derived from the motion dial (${dialsResult.MOTION_INTENSITY}/10):
- Default duration: ${dialsResult.MOTION_INTENSITY <= 2 ? '100ms' : dialsResult.MOTION_INTENSITY <= 5 ? '200ms' : dialsResult.MOTION_INTENSITY <= 7 ? '300ms' : '500ms'}
- Default easing: ${dialsResult.MOTION_INTENSITY <= 2 ? 'linear' : dialsResult.MOTION_INTENSITY <= 5 ? 'ease-out' : 'spring(0.3, 0.8, 0.1, 1)'}
- What properties animate (opacity, transform, color, box-shadow)
- Stagger delays and enter/exit patterns

### Section 8: Voice (3-5 sentences)
The verbal and tonal character of the system. How labels, error messages, and microcopy should sound. Derived from the audience (${readResult.audience}) and design vocabulary.

### Section 9: Anti-patterns (5+ rules)
What this system deliberately avoids. Each anti-pattern explains WHY it violates the system's taste. Examples:
- "No purple gradients — they contradict our warm paper palette"
- "No centered hero layouts — our variance dial (${dialsResult.DESIGN_VARIANCE}) demands asymmetry"
- "No emoji icons — use geometric glyphs or nothing"
- "No accent overuse — limit accent to primary CTAs and active states only"

## Output Format
Write the complete DESIGN.md as a markdown file. Use \`---\` frontmatter:
\`\`\`yaml
---
name: "${dsName}"
category: "${category}"
description: "${readResult.visualLanguage}"
version: "0.1.0"
---
\`\`\`

Then the 9 sections with ### headings.

Output the file content ONLY. No extra commentary.`,
  { label: `design-md:${dsId}`, phase: 'Author DESIGN.md', schema: {
    type: 'object',
    properties: {
      designMd: { type: 'string' },
      sections: { type: 'array', items: { type: 'string' } },
    },
    required: ['designMd'],
  }}
)

if (!designMdResult?.designMd) throw new Error('[ds-taste-profile] DESIGN.md generation failed')

// Write DESIGN.md to disk
try {
  await $`mkdir -p ${dsDir}`
  await $`cat > ${dsDir}/DESIGN.md << 'MDEOF'
${designMdResult.designMd}
MDEOF`
  log(`[ds-taste-profile] ✅ DESIGN.md written to ${dsDir}/DESIGN.md (${designMdResult.designMd.length} chars)`)
  log(`[ds-taste-profile]   Sections: ${(designMdResult.sections || []).join(', ')}`)
} catch (e) {
  throw new Error(`[ds-taste-profile] Failed to write DESIGN.md: ${e.message}`)
}

phase('Save Taste Skill')
log(`[ds-taste-profile] Writing per-system taste profile`)

// Phase 4: Save taste profile — write skills/taste/SKILL.md
const tasteSkill = `---
name: ${dsId}-taste
description: Design taste profile for ${dsName} — visual voice, three-dial settings, and brand fingerprint.
dials:
  DESIGN_VARIANCE: ${dialsResult.DESIGN_VARIANCE}
  MOTION_INTENSITY: ${dialsResult.MOTION_INTENSITY}
  VISUAL_DENSITY: ${dialsResult.VISUAL_DENSITY}
brand:
  kind: ${readResult.systemKind}
  audience: ${readResult.audience}
  vibe: [${(readResult.vibeWords || []).map(v => `"${v}"`).join(', ')}]
  visual_language: "${readResult.visualLanguage}"
---

# ${dsName} — Design Taste Profile

Generated from prompt: "${prompt}"

## Design Read
${readResult.designRead}

## Three Dials
- **DESIGN_VARIANCE**: ${dialsResult.DESIGN_VARIANCE}/10 — ${dialsResult.varianceJustification}
- **MOTION_INTENSITY**: ${dialsResult.MOTION_INTENSITY}/10 — ${dialsResult.motionJustification}
- **VISUAL_DENSITY**: ${dialsResult.VISUAL_DENSITY}/10 — ${dialsResult.densityJustification}

## Visual Language
${readResult.visualLanguage}

## What Makes This System Distinctive
- System kind: ${readResult.systemKind}
- Audience: ${readResult.audience}
- Emotional tone: ${(readResult.vibeWords || []).join(', ')}
${readResult.referenceSignals?.length ? `- Reference signals: ${readResult.referenceSignals.join(', ')}` : ''}
${readResult.quietConstraints?.length ? `- Quiet constraints: ${readResult.quietConstraints.join(', ')}` : ''}

## Design Principles for Agents
1. **Taste drives tokens** — every token value should be justifyable from the design read
2. **Stay on-dial** — if VARIANCE is low, don't introduce avant-garde layouts. If DENSITY is high, don't waste space.
3. **Anti-pattern awareness** — this system avoids [refer to DESIGN.md §9 for specifics]
4. **Consistency over cleverness** — one accent, one display face, one spacing philosophy
`

try {
  await $`mkdir -p ${dsDir}/skills/taste`
  await $`cat > ${dsDir}/skills/taste/SKILL.md << 'SKILLEOF'
${tasteSkill}
SKILLEOF`
  log(`[ds-taste-profile] ✅ Taste skill written to ${dsDir}/skills/taste/SKILL.md`)
} catch (e) {
  log(`[ds-taste-profile] ⚠️  Failed to write taste skill: ${e.message}`)
}

log(`[ds-taste-profile] ✅ Complete: "${dsName}" at ${dsDir}/`)
log(`[ds-taste-profile]   DESIGN.md: ${dsDir}/DESIGN.md`)
log(`[ds-taste-profile]   Taste skill: ${dsDir}/skills/taste/SKILL.md`)
log(`[ds-taste-profile]   Dials: V${dialsResult.DESIGN_VARIANCE} / M${dialsResult.MOTION_INTENSITY} / D${dialsResult.VISUAL_DENSITY}`)

return {
  id: dsId,
  name: dsName,
  category,
  path: dsDir,
  designMd: `${dsDir}/DESIGN.md`,
  tasteSkill: `${dsDir}/skills/taste/SKILL.md`,
  dials: {
    variance: dialsResult.DESIGN_VARIANCE,
    motion: dialsResult.MOTION_INTENSITY,
    density: dialsResult.VISUAL_DENSITY,
  },
  designRead: readResult.designRead,
}
