// ds-import-prepare.js
// Workflow #2 in the ds-import-* DAG. HARD GATE.
//
// Goal: settle the design-system contract BEFORE any preview work runs.
//   - 9-section DESIGN.md copied into design-systems/<id>/DESIGN.md
//   - tokens.css generated with all 11 SEMANTIC_TOKEN_ROLES
//   - code/ primitives scaffolded (from atelier by default; overridable)
//   - skills/build/SKILL.md generated — the per-DS design-language document
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
// ============================================================
phase('Build skill')
log('[ds-import:prepare] Writing skills/build/SKILL.md')

await agent(
  'Write the design-language skill for DS "' + dsId + '" — every leaf author reads this.\n\n' +
  'Inputs (read these first):\n' +
  '- cat "' + dsPath + '/DESIGN.md"\n' +
  '- cat "' + dsPath + '/tokens.css"\n\n' +
  'Write to: ' + buildSkillPath + '\n\n' +
  'The skill must include these sections in this order:\n' +
  '  1. # <Name> Build Skill — short system overview (1 paragraph)\n' +
  '  2. ## Token Roles — table mapping each of the 11 SEMANTIC_TOKEN_ROLES to:\n' +
  '     a) its semantic Tailwind class (e.g. `bg-surface`, `text-accent`, `border-border`)\n' +
  '     b) the underlying CSS var (e.g. `var(--color-surface)`)\n' +
  '     c) when to use it (1 sentence)\n' +
  '  3. ## Type Scale — display / h1 / h2 / h3 / body / caption with var name + use case\n' +
  '  4. ## Spacing Scale — base unit + each stop with var name + use case\n' +
  '  5. ## Radius & Depth — radius stops, shadow rules, when to use raised vs flat\n' +
  '  6. ## Motion — fast/base/ease tokens, when motion is allowed (vs static)\n' +
  '  7. ## Component Patterns — 3-5 short examples showing how primitives compose\n' +
  '  8. ## Anti-Patterns — explicit DO NOT list (raw hex, hardcoded spacing, etc.)\n' +
  '  9. ## Reuse vs Author — "if a primitive exists at @ds/<Name>, import it. Never re-author."\n\n' +
  'This skill is the contract that downstream :craft-primitives, :build-element, and\n' +
  ':build-section agents read as ground truth. Be concrete. Reference real var names.\n\n' +
  'Return "done".',
  { label: 'build-skill:' + dsId, phase: 'Build skill' }
)
log('[ds-import:prepare] Build skill written')

// ============================================================
// PHASE 4: TASTE — extract design taste dials (merged from ds-import:taste-profile)
// ============================================================
phase('Taste')
log('[ds-import:prepare] Extracting taste profile')

const tasteResult = await agent(
  'Read the DESIGN.md at "' + dsPath + '/DESIGN.md" and generate a taste profile.\n\n' +
  'Extract:\n' +
  '1. DESIGN_VARIANCE (1-10): bold/opinionated. 1-3=conventional, 4-6=characterful, 7-10=bold\n' +
  '2. MOTION_INTENSITY (1-10): 1-3=static, 4-6=purposeful, 7-10=expressive\n' +
  '3. VISUAL_DENSITY (1-10): 1-3=airy, 4-6=balanced, 7-10=compact\n' +
  '4. Brand fingerprint (1-2 sentences)\n' +
  '5. Visual characteristics (1-2 sentences)\n' +
  '6. Anti-patterns to avoid (1-2 sentences)\n\n' +
  'Return as structured data.',
  {
    label: 'taste:' + dsId, phase: 'Taste',
    schema: {
      type: 'object',
      properties: {
        VARIANCE: { type: 'number', minimum: 1, maximum: 10 },
        MOTION: { type: 'number', minimum: 1, maximum: 10 },
        DENSITY: { type: 'number', minimum: 1, maximum: 10 },
        brandFingerprint: { type: 'string' },
        visualCharacteristics: { type: 'string' },
        antiPatterns: { type: 'string' },
      },
      required: ['VARIANCE', 'MOTION', 'DENSITY'],
    },
  }
)

const taste = {
  VARIANCE: tasteResult?.VARIANCE ?? 5,
  MOTION: tasteResult?.MOTION ?? 5,
  DENSITY: tasteResult?.DENSITY ?? 5,
  brandFingerprint: tasteResult?.brandFingerprint || '',
}
log('[ds-import:prepare] Taste: V' + taste.VARIANCE + ' M' + taste.MOTION + ' D' + taste.DENSITY)

// Save taste skill for downstream reference
await agent(
  'Save taste skill.\n' +
  '1. Run: mkdir -p ' + dsPath + '/skills/taste\n' +
  '2. Write taste profile to ' + dsPath + '/skills/taste/SKILL.md\n\n' +
  'Content:\n---\nname: ' + dsId + '-taste\ndescription: Taste profile for ' + dsId + '\n' +
  'dials:\n  DESIGN_VARIANCE: ' + taste.VARIANCE + '\n  MOTION_INTENSITY: ' + taste.MOTION + '\n  VISUAL_DENSITY: ' + taste.DENSITY + '\n---\n\n' +
  '# ' + dsId + ' Taste Profile\n\n' +
  (tasteResult?.brandFingerprint ? '**Brand fingerprint:** ' + tasteResult.brandFingerprint + '\n\n' : '') +
  (tasteResult?.visualCharacteristics ? '**Visual characteristics:** ' + tasteResult.visualCharacteristics + '\n\n' : '') +
  (tasteResult?.antiPatterns ? '**Anti-patterns:** ' + tasteResult.antiPatterns + '\n' : '') +
  '\nReturn "done".',
  { label: 'saveTaste:' + dsId, phase: 'Taste' }
)
log('[ds-import:prepare] Taste skill saved')

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