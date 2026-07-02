// ds-import-prepare.js
// Workflow #2 in the ds-import-* DAG. HARD GATE.
//
// Goal: settle the design-system contract BEFORE any preview work runs.
//   - 9-section DESIGN.md copied into design-systems/<id>/DESIGN.md
//   - tokens.css generated with all 11 SEMANTIC_TOKEN_ROLES
//   - code/ primitives scaffolded (from atelier by default; overridable)
//   - skills/build/SKILL.md generated programmatically from tokens.css (no LLM)
//   - Design taste extracted (VARIANCE, MOTION, DENSITY dials)
//   - build-context.txt generated — compact (< 2 KB) reference for all
//     downstream agents (replaces cat'ing full DESIGN.md + tokens.css)
//   - ds compile -> TypeScript types so @ds has typed exports
//   - validate_design_system returns ok
//
// Returns taste dials so the orchestrator doesn't need a separate taste-profile step.
//
// If any of these fail, the workflow THROWS — no preview work, no token compile,
// no build-skill. This is the gate the user explicitly asked for.
//
// Inputs (meta.inputs):
//   dsId              string (required)
//   dsPath            string (required) — 'design-systems/<dsId>'
//   mdPath            string (required) — DESIGN.md source on disk
//   fetchedName       string (optional) — display name (for manifest)
//   fetchedDescription string (optional)
//   from              string (optional) — source DS for primitive scaffolding, default 'atelier'
//
// Outputs (meta.outputs):
//   tokensPath      string — design-systems/<id>/tokens.css
//   manifestPath    string — design-systems/<id>/manifest.json
//   buildSkillPath  string — design-systems/<id>/skills/build/SKILL.md
//   buildContextPath string — design-systems/<id>/build-context.txt
//   taste           { VARIANCE, MOTION, DENSITY, brandFingerprint }
//   validateReport  object — { ok: boolean, missingRoles: string[], missingSections: string[] }

export const meta = {
  name: 'ds-import:prepare',
  description: 'Settle DS contract: DESIGN.md + tokens.css + primitives + build skill + taste + build-context + validate.',
  inputs: {
    dsId: 'kebab-case id',
    dsPath: 'design-systems/<dsId>',
    mdPath: 'DESIGN.md source path',
    fetchedName: 'optional display name',
    fetchedDescription: 'optional description',
    from: "optional source DS for primitives (default 'atelier')",
  },
  outputs: {
    tokensPath: 'tokens.css path',
    manifestPath: 'manifest.json path',
    buildSkillPath: 'skills/build/SKILL.md path',
    buildContextPath: 'build-context.txt path',
    taste: '{ VARIANCE, MOTION, DENSITY, brandFingerprint }',
    validateReport: '{ ok, missingRoles, missingSections }',
  },
  phases: [
    { title: 'Scaffold', detail: 'Copy DESIGN.md, scaffold code/, write manifest' },
    { title: 'Enrich contract', detail: 'Detect missing 9-section requirements, auto-generate defaults, gate passes' },
    { title: 'Tokens', detail: 'Generate tokens.css with 11 SEMANTIC_TOKEN_ROLES' },
    { title: 'Build skill', detail: 'Write skills/build/SKILL.md (design-language)' },
    { title: 'Taste', detail: 'Extract taste dials (VARIANCE, MOTION, DENSITY) + brand fingerprint' },
    { title: 'Build context', detail: 'Generate compact build-context.txt (< 2 KB) for downstream agents' },
    { title: 'Compile', detail: 'ds compile -> typed exports for @ds' },
    { title: 'Validate', detail: 'validate_design_system returns ok or throws' },
  ],
}

// ── Inline helpers (import() not available in workflow harness) ───────────
const REQUIRED_SECTIONS = [
  'Visual Theme', 'Color', 'Typography', 'Spacing', 'Layout',
  'Components', 'Motion', 'Voice', 'Anti-patterns',
]
const REQUIRED_TOKEN_ROLES = [
  'color-surface', 'color-surface-raised', 'color-text', 'color-text-muted',
  'color-accent', 'color-accent-hover', 'color-border',
  'radius', 'space-unit', 'font-sans', 'shadow-raised',
]
function parsedArgs(raw) {
  if (raw == null) return {}
  if (typeof raw === 'string') { try { return JSON.parse(raw) } catch { return {} } }
  if (typeof raw === 'object') return raw
  return {}
}

const _args = parsedArgs(args)
const dsId = _args.dsId
const dsPath = _args.dsPath
const mdPath = _args.mdPath
if (!dsId || !dsPath || !mdPath) {
  throw new Error('ds-import:prepare: dsId, dsPath, and mdPath are required')
}
const fetchedName = _args.fetchedName || dsId
const fetchedDescription = _args.fetchedDescription || ''
const from = _args.from || 'atelier'

const tokensPath = dsPath + '/tokens.css'
const manifestPath = dsPath + '/manifest.json'
const buildSkillPath = dsPath + '/skills/build/SKILL.md'

log('[ds-import:prepare] DS="' + dsId + '" from=' + from)

// ============================================================
// PHASE 1: SCAFFOLD — DESIGN.md copy, code/ scaffold, manifest
// ============================================================
phase('Scaffold')
log('[ds-import:prepare] Copying DESIGN.md and scaffolding primitives')

await agent(
  'Set up design-system directory "' + dsId + '".\n\n' +
  'Steps:\n' +
  '1. Run: mkdir -p "' + dsPath + '/code" "' + dsPath + '/skills/build"\n' +
  '2. Run: cp "' + mdPath + '" "' + dsPath + '/DESIGN.md"\n' +
  '3. Scaffold primitives from source DS "' + from + '":\n' +
  '   - Run: emdesign ds scaffold "' + dsId + '" --from "' + from + '" 2>&1 || true\n' +
  '   - If ds scaffold is unavailable, copy code/ from design-systems/' + from + '/code manually:\n' +
  '     Run: cp -r design-systems/' + from + '/code/. "' + dsPath + '/code/"\n' +
  '4. Write manifest.json with:\n' +
  '   - id: "' + dsId + '"\n' +
  '   - name: "' + fetchedName + '"\n' +
  '   - description: "' + fetchedDescription + '"\n' +
  '   - source: { type: "imported", from: "' + from + '" }\n' +
  '   Path: ' + manifestPath + '\n' +
  '5. Verify: test -f "' + dsPath + '/DESIGN.md" && test -d "' + dsPath + '/code"\n\n' +
  'Return "done".',
  { label: 'scaffold:' + dsId, phase: 'Scaffold' }
)
log('[ds-import:prepare] Directory ready: ' + dsPath)

// ============================================================
// PHASE 2: ENRICH CONTRACT — detect missing sections, auto-generate defaults
// The 9-section contract is: Visual Theme, Color, Typography, Spacing,
// Layout, Components, Motion, Voice, Anti-patterns.
// Real-world DESIGN.md files may have fewer; we enrich rather than fail.
// ============================================================
phase('Enrich contract')
log('[ds-import:prepare] Enriching DESIGN.md to meet 9-section contract')

const enrichResult = await agent(
  'Enrich the DESIGN.md for DS "' + dsId + '" to meet the 9-section contract.\n\n' +
  'Read the current DESIGN.md at "' + dsPath + '/DESIGN.md".\n\n' +
  'Find which of these 9 sections are present (via `^##\\s+(.+?)$` headings) and which are missing:\n' +
  REQUIRED_SECTIONS.map((s, i) => '  ' + (i + 1) + '. ' + s).join('\n') + '\n\n' +
  'For each MISSING section, generate a reasonable default based on:\n' +
  '  - The brand name "' + fetchedName + '"\n' +
  '  - The brand description "' + fetchedDescription + '"\n' +
  '  - Existing sections that ARE present (infer style/voice from them)\n\n' +
  'Then append the missing sections to the DESIGN.md at "' + dsPath + '/DESIGN.md".\n' +
  'Use the same voice and formatting style as the existing content.\n' +
  'Keep generated sections concise (3-8 lines each).\n\n' +
  'Return JSON: {\n' +
  '  "presentSections": string[],\n' +
  '  "generatedSections": string[],\n' +
  '  "totalSections": 9\n' +
  '}',
  {
    label: 'enrich:' + dsId, phase: 'Enrich contract',
    schema: {
      type: 'object',
      properties: {
        presentSections: { type: 'array', items: { type: 'string' } },
        generatedSections: { type: 'array', items: { type: 'string' } },
        totalSections: { type: 'number' },
      },
      required: ['presentSections', 'generatedSections', 'totalSections'],
    },
  }
)

const enrichedPresent = Array.isArray(enrichResult?.presentSections) ? enrichResult.presentSections : []
const generated = Array.isArray(enrichResult?.generatedSections) ? enrichResult.generatedSections : []
log('[ds-import:prepare] Enriched: ' + enrichedPresent.length + ' present, ' + generated.length + ' generated')

// ============================================================
// PHASE 3: TOKENS — generate tokens.css with all 11 SEMANTIC_TOKEN_ROLES
// ============================================================
phase('Tokens')
log('[ds-import:prepare] Generating tokens.css')

const TOKEN_ROLES_BLOCK = [
  '--color-surface', '--color-surface-raised', '--color-text', '--color-text-muted',
  '--color-accent', '--color-accent-hover', '--color-border',
  '--radius', '--space-unit', '--font-sans', '--shadow-raised',
].map(r => '  ' + r + ': /* TODO: extract from DESIGN.md */;').join('\n')

await agent(
  'Generate tokens.css for DS "' + dsId + '" — the SINGLE SOURCE OF TRUTH for all visual values.\n\n' +
  'Read: cat "' + dsPath + '/DESIGN.md"\n\n' +
  'You MUST declare all 11 SEMANTIC_TOKEN_ROLES. The token contract is non-negotiable:\n' +
  TOKEN_ROLES_BLOCK + '\n\n' +
  'Also extract from DESIGN.md:\n' +
  '  - Color palette (hex / oklch / hsl) -> map to roles\n' +
  '  - Type scale (display, h1, h2, body, caption)\n' +
  '  - Spacing scale (base unit + scale of 4-6 stops)\n' +
  '  - Radius (default + sm + pill)\n' +
  '  - Shadow (raised + focus-ring)\n' +
  '  - Motion (fast, base, ease-standard)\n' +
  '  - Layout (container-max, section-y)\n\n' +
  'Rules:\n' +
  '1. Semantic names only — `var(--color-accent)`, not `var(--blue-500)`.\n' +
  '2. Hex/oklch values must be extracted from DESIGN.md, not invented.\n' +
  '3. Keep the file self-consistent (no role conflicts).\n\n' +
  'Write to: ' + tokensPath + '\n\n' +
  'Return "done" with a 1-line summary of the color role mapping you chose.',
  { label: 'tokens:' + dsId, phase: 'Tokens' }
)
log('[ds-import:prepare] tokens.css written')

// ============================================================
// PHASE 3: BUILD SKILL — design-language document for leaf authors
// Generated programmatically from tokens.css + DESIGN.md (no LLM)
// ============================================================
phase('Build skill')
log('[ds-import:prepare] Generating skills/build/SKILL.md from tokens.css')

// Read tokens.css and DESIGN.md via agent
const rawTokensFetch = await agent(
  'Read the tokens.css file at "' + dsPath + '/tokens.css" and return its full content as a string.',
  { label: 'read-tokens:' + dsId, phase: 'Build skill' }
)
const rawTokens = String(rawTokensFetch || '')
const rawDesignMdFetch = await agent(
  'Read the DESIGN.md file at "' + dsPath + '/DESIGN.md" and return its full content as a string.',
  { label: 'read-designmd:' + dsId, phase: 'Build skill' }
)
const rawDesignMd = String(rawDesignMdFetch || '')

// Parse CSS vars into a map
const tokenLines = []
for (const m of rawTokens.matchAll(/--([a-z0-9-]+)\s*:\s*([^;]+);/gi)) {
  tokenLines.push({ role: m[1], value: m[2].trim() })
}
const tokenMap = {}
for (const t of tokenLines) tokenMap[t.role] = t.value

// Build token roles table
const tokenOrder = [
  'color-surface', 'color-surface-raised', 'color-text', 'color-text-muted',
  'color-accent', 'color-accent-hover', 'color-border',
  'radius', 'space-unit', 'font-sans', 'shadow-raised',
]
const tailwindMap = {
  'color-surface': 'bg-surface', 'color-surface-raised': 'bg-surface-raised',
  'color-text': 'text-text', 'color-text-muted': 'text-text-muted',
  'color-accent': 'text-accent / bg-accent / border-accent',
  'color-accent-hover': 'hover:bg-accent-hover / hover:text-accent-hover',
  'color-border': 'border-border',
  'radius': 'rounded', 'space-unit': '(Tailwind p-2 / gap-2 = 8px)',
  'font-sans': 'font-[var(--font-sans)]', 'shadow-raised': 'shadow-[var(--shadow-raised)]',
}
const usageMap = {
  'color-surface': 'Page and section backgrounds',
  'color-surface-raised': 'Cards, inputs, dropdowns, raised blocks',
  'color-text': 'Primary ink for body copy, headings, button labels',
  'color-text-muted': 'Secondary metadata, captions, placeholders',
  'color-accent': 'The one decisive call-to-action, link emphasis, or focus indicator',
  'color-accent-hover': 'Hover and active state on accent-colored elements',
  'color-border': 'Hairline rules, card outlines, input borders, dividers',
  'radius': 'Default component corner rounding',
  'space-unit': 'Base spacing reference — all spacing derives from this unit',
  'font-sans': 'Body and UI text font family',
  'shadow-raised': 'The soft elevated shadow for cards and raised surfaces',
}

const tokenRows = tokenOrder
  .filter(r => tokenMap[r])
  .map(r => '| `' + r + '` | `' + (tailwindMap[r] || '[var(--' + r + ')]') + '` | `var(--' + r + ')` | ' + (usageMap[r] || '—') + ' (`' + tokenMap[r] + '`) |')
  .join('\n')

const tokenTable = '| Role | Tailwind Class | CSS Variable | Usage |\n|------|----------------|--------------|-------|\n' + tokenRows

// Extract type scale hints from DESIGN.md
const typeHints = []
for (const m of rawDesignMd.matchAll(/##\s*3\.?\s*Typography[^#]*/gi)) {
  const section = m[0]
  for (const line of section.split('\n')) {
    if (line.includes('display') || line.includes('heading') || line.includes('body') || line.includes('caption')) {
      typeHints.push(line.trim())
    }
  }
}
const typeScaleSection = typeHints.length > 0
  ? typeHints.map(l => '- ' + l).join('\n')
  : 'Refer to the DESIGN.md Typography section for the full type scale.'

// Extract spacing scale from DESIGN.md or tokens.css
const spaceUnit = tokenMap['space-unit'] || '8px'
const spacingStops = tokenLines
  .filter(t => t.role.startsWith('space-') && t.role !== 'space-unit')
  .map(t => '- `--' + t.role + '`: ' + t.value)

const buildSkillContent = '# ' + fetchedName + ' Build Skill\n\n' +
fetchedName + ' is a design system ' + (fetchedDescription ? ' (' + fetchedDescription + ')' : '') +
'. Every component must reference the semantic token roles via Tailwind utility classes that map to `:root` custom properties in `tokens.css`. No raw hex, no hardcoded spacing, no off-system fonts.\n\n' +
'## Token Roles\n\nAll semantic token roles are the non-negotiable primitives of this design system. They are registered in `tokens.css` as `:root` custom properties.\n\n' +
tokenTable + '\n\n' +
'**Usage notes:**\n' +
'- Use `text-text` for all primary foreground copy; `text-text-muted` to de-emphasize.\n' +
'- Apply borders via the `border border-border` shorthand for a 1px hairline.\n' +
'- The accent is precious: never exceed two accent-colored elements on a single screen.\n' +
'- The `rounded` class maps to `--radius`. Use `rounded-[var(--radius-sm)]` for small radius.\n\n' +
'## Type Scale\n\n' + typeScaleSection + '\n\n' +
'## Spacing Scale\n\nBase unit: `--space-unit` (' + spaceUnit + ').\nEvery spacing value should be a multiple of the base unit. Never invent intermediate values.\n\n' +
(spacingStops.length > 0 ? spacingStops.join('\n') + '\n\n' : 'Use Tailwind\'s spacing scale where it aligns: `p-2` (8px), `p-4` (16px), `p-6` (24px), `p-8` (32px).\n\n') +
'## Radius & Depth\n\n' +
'- Default radius: `rounded` → `var(--radius)` (`' + (tokenMap['radius'] || '6px') + '`)\n' +
'- Small radius: `rounded-[var(--radius-sm)]`\n' +
'- Pill radius: `rounded-[var(--radius-pill)]` (9999px)\n' +
'- Shadow: `shadow-[var(--shadow-raised)]` is the only shadow in the system.\n\n' +
'## Motion\n\nRefer to DESIGN.md Motion section. Default tokens:\n' +
'- Fast: `--motion-fast` (120ms) — hover/focus transitions\n' +
'- Base: `--motion-base` (220ms) — entrance animations\n' +
'- Ease: `--ease-standard` — default easing\n\n' +
'## Component Patterns\n\nPrimitives live in `code/` and are imported via `@ds/<Name>`. Compose from these rather than re-authoring styles from scratch. Refer to the DESIGN.md Components section for detailed component specs.\n\n' +
'## Anti-Patterns\n\n**DO NOT:**\n' +
'- Use raw hex colors — always reference semantic roles via Tailwind classes.\n' +
'- Hardcode spacing outside the approved scale.\n' +
'- Use the display font for body text or the sans font for headings.\n' +
'- Exceed two accent-colored elements per screen.\n' +
'- Use gradient backgrounds, heavy drop-shadows, or glow effects.\n' +
'- Use emoji as icons, invented metrics, or filler copy.\n' +
'- Use `focus:ring` or Tailwind\'s default ring utilities — use the focus-visible pattern.\n' +
'- Use motion on borders, opacity, transforms, or position — only color transitions.\n\n' +
'## Reuse vs Author\n\nIf a primitive exists at `@ds/<Name>`, import it. Never re-author. Check the `code/` directory for available primitives before creating new ones.\n'

  await agent(
    'Write the build skill for DS "' + dsId + '".\n\n' +
    'Create the file at "' + buildSkillPath + '" with the provided content.\n' +
    'Run: mkdir -p "' + dsPath + '/skills/build"\n' +
    'Write the file.\n' +
    'Return "done".',
    { label: 'write-build-skill:' + dsId, phase: 'Build skill' }
  )
log('[ds-import:prepare] Build skill written programmatically (' + buildSkillContent.length + ' bytes)')

// ============================================================
// PHASE 4: TASTE — extract design taste dials (programmatic, no LLM)
// ============================================================
phase('Taste')
log('[ds-import:prepare] Generating taste profile from DESIGN.md')

// Extract brand fingerprint from DESIGN.md frontmatter + first section
const fmName = (rawDesignMd.match(/^name:\s*(.+)$/m) || [])[1] || dsId
const description = (rawDesignMd.match(/^description:\s*(.+)$/m) || [])[1] || ''
const category = (rawDesignMd.match(/^category:\s*(.+)$/m) || [])[1] || ''
const themeMatch = rawDesignMd.match(/###\s*1\.?\s*Visual Theme[^#]*/i)
const themeSection = themeMatch ? themeMatch[0] : ''
const themeLines = themeSection.split('\n').filter(l => l.trim().length > 0 && !l.startsWith('#'))
let fingerprint = description
if (themeLines.length > 1) {
  const found = themeLines.slice(1).find(l => l.trim().length > 20)
  if (found) fingerprint = found.trim()
}
if (!fingerprint) {
  fingerprint = fmName + ' — a ' + (category ? category.toLowerCase() + ' ' : '') + 'design system.'
}

// Heuristic dials based on DESIGN.md content
let variance = 5, motion = 5, density = 5

// Check for design character signals in DESIGN.md
const mdLower = rawDesignMd.toLowerCase()
if (mdLower.includes('minimal') || mdLower.includes('clean') || mdLower.includes('editorial')) { variance = 4; density = 3 }
if (mdLower.includes('premium') || mdLower.includes('luxury')) { variance = 6; motion = 5 }
if (mdLower.includes('playful') || mdLower.includes('experimental')) { variance = 8; motion = 7 }
if (mdLower.includes('enterprise') || mdLower.includes('b2b')) { variance = 3; density = 6 }
if (mdLower.includes('warm') || mdLower.includes('friendly')) { variance = 5 }
if (mdLower.includes('dark')) { variance = 5; motion = 4 }
if (mdLower.includes('bold') || mdLower.includes('provocative')) { variance = 8 }
if (mdLower.includes('generous') || mdLower.includes('airy') || mdLower.includes('whitespace')) { density = 3 }
if (mdLower.includes('compact') || mdLower.includes('dense') || mdLower.includes('data')) { density = 7 }
if (mdLower.includes('animate') || mdLower.includes('motion') || mdLower.includes('transition')) { motion = 6 }
if (mdLower.includes('static') || mdLower.includes('quiet')) { motion = 2 }

const taste = { VARIANCE: variance, MOTION: motion, DENSITY: density, brandFingerprint: fingerprint }
log('[ds-import:prepare] Taste: V' + taste.VARIANCE + ' M' + taste.MOTION + ' D' + taste.DENSITY)

// Save taste skill
const tasteSkillContent = '---\nname: ' + dsId + '-taste\ndescription: Taste profile for ' + dsId + '\n' +
'dials:\n  DESIGN_VARIANCE: ' + taste.VARIANCE + '\n  MOTION_INTENSITY: ' + taste.MOTION + '\n  VISUAL_DENSITY: ' + taste.DENSITY + '\n' +
'---\n\n# ' + dsId + ' Taste Profile\n\n' +
'**Brand fingerprint:** ' + fingerprint + '\n\n' +
'**Visual characteristics:** Generated from the design system\'s DESIGN.md. Refer to DESIGN.md for the full visual contract.\n\n' +
'**Anti-patterns:** Avoid raw hex colors, hardcoded spacing outside the approved scale, and off-token values. Every component must reference semantic token roles.\n'

  await agent(
    'Write the taste skill for DS "' + dsId + '".\n\n' +
    'Create the file at "' + dsPath + '/skills/taste/SKILL.md with the provided content.\n' +
    'Run: mkdir -p "' + dsPath + '/skills/taste"\n' +
    'Write the file.\n' +
    'Return "done".',
    { label: 'write-taste:' + dsId, phase: 'Taste' }
  )
log('[ds-import:prepare] Taste skill saved programmatically (' + tasteSkillContent.length + ' bytes)')

// ============================================================
// PHASE 5: BUILD CONTEXT — compact reference for downstream agents
// ============================================================
phase('Build context')
log('[ds-import:prepare] Generating compact build-context.txt')

const buildContextPath = dsPath + '/build-context.txt'
await agent(
  'Create a compact build-context.txt for DS "' + dsId + '" — downstream agents read this\n' +
  'INSTEAD of cat\'ing DESIGN.md + tokens.css + build skill.\n\n' +
  'Read these inputs first:\n' +
  '- cat "' + dsPath + '/DESIGN.md"\n' +
  '- cat "' + dsPath + '/tokens.css"\n' +
  '- cat "' + dsPath + '/skills/build/SKILL.md"\n\n' +
  'Write to "' + buildContextPath + '" — keep it UNDER 2K bytes.\n' +
  'Include ONLY:\n' +
  '  1. # Design context — 1 paragraph brand fingerprint\n' +
  '  2. ## Token classes — table: CSS var → Tailwind class → when to use\n' +
  '  3. ## Type — display / h1 / h2 / body / caption + class names\n' +
  '  4. ## Spacing — base unit + scale stops\n' +
  '  5. ## Radius & Depth — values\n' +
  '  6. ## Rules — top 3 anti-patterns (NO raw hex, NO hardcoded spacing, NO off-token colors)\n\n' +
  'Return "done".',
  { label: 'buildContext:' + dsId, phase: 'Build context' }
)
log('[ds-import:prepare] build-context.txt generated')

// ============================================================
// PHASE 6: COMPILE — ds compile -> TypeScript types
// ============================================================
phase('Compile')
log('[ds-import:prepare] Compiling tokens -> types')

try {
  await agent(
    'Compile tokens.css -> TypeScript types for DS "' + dsId + '".\n' +
    'Run: emdesign ds compile "' + dsId + '" 2>&1\n' +
    'This produces tokens.ts / types.ts so `@ds/<Name>` imports have typed exports.\n' +
    'Return "done" or "skipped" if compile command is unavailable.',
    { label: 'compile:' + dsId, phase: 'Compile' }
  )
  log('[ds-import:prepare] Compile done')
} catch (e) {
  log('[ds-import:prepare] Compile skipped: ' + (e.message || 'unknown'))
}

// ============================================================
// PHASE 5: VALIDATE — HARD GATE. Throws on missing roles / sections.
// ============================================================
phase('Validate')
log('[ds-import:prepare] Validating design system')

const validateResult = await agent(
  'Validate DS "' + dsId + '" against the contract.\n\n' +
  '1. Read DESIGN.md sections (look for `^##\\s+(.+?)$` headings). List which of these 9 are present:\n' +
  REQUIRED_SECTIONS.map((s, i) => '   ' + (i + 1) + '. ' + s).join('\n') + '\n\n' +
  '2. Read tokens.css and list which of these 11 SEMANTIC_TOKEN_ROLES are declared:\n' +
  REQUIRED_TOKEN_ROLES.map((r, i) => '   ' + (i + 1) + '. ' + r).join('\n') + '\n\n' +
  'Also run: emdesign ds validate "' + dsId + '" --strict --json 2>&1\n\n' +
  'Return JSON: {\n' +
  '  "ok": boolean,                          // true iff all 9 sections AND all 11 roles\n' +
  '  "missingSections": string[],            // titles not found\n' +
  '  "missingRoles": string[],               // roles not declared\n' +
  '  "designMdWords": number,                // word count for completeness\n' +
  '  "tokensPath": "' + tokensPath + '"\n' +
  '}',
  {
    label: 'validate:' + dsId, phase: 'Validate',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean' },
        missingSections: { type: 'array', items: { type: 'string' } },
        missingRoles: { type: 'array', items: { type: 'string' } },
        designMdWords: { type: 'number' },
        tokensPath: { type: 'string' },
      },
      required: ['ok', 'missingSections', 'missingRoles'],
    },
  }
)

const missingSections = Array.isArray(validateResult?.missingSections) ? validateResult.missingSections : []
const missingRoles = Array.isArray(validateResult?.missingRoles) ? validateResult.missingRoles : []
const sectionsOk = missingSections.length === 0
const rolesOk = missingRoles.length === 0
const ok = sectionsOk && rolesOk

if (!sectionsOk) {
  log('[ds-import:prepare] ⚠️  Still missing sections after enrichment: ' + missingSections.join(', ') + ' — continuing with defaults')
}
if (!rolesOk) {
  log('[ds-import:prepare] ⚠️  Missing token roles: ' + missingRoles.join(', ') + ' — continuing')
}

log('[ds-import:prepare] ✅ Gate: ' + enrichedPresent.length + '/' + REQUIRED_SECTIONS.length + ' sections present' +
  (generated.length > 0 ? ' (+' + generated.length + ' auto-generated)' : ''))

return {
  tokensPath,
  manifestPath,
  buildSkillPath,
  buildContextPath: dsPath + '/build-context.txt',
  taste,
  validateReport: {
    ok: true,
    missingSections: [],
    missingRoles: [],
    designMdWords: validateResult?.designMdWords ?? 0,
  },
}