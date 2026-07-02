// ds-extract-tokens.js
// Generate tokens.css, manifest.json, and taste profile from an imported DESIGN.md.
// Called after ds-fetch has downloaded the DESIGN.md and preview HTML.
//
// Usage: workflow('ds-extract-tokens', { dsId, dsPath, mdPath, name, description, tasteDials? })
//   dsId        - kebab-case design system id
//   dsPath      - path to the design system directory
//   mdPath      - path to the imported DESIGN.md file
//   name        - display name for the design system
//   description - optional description
//   tasteDials  - optional { variance, motion, density } overrides
//
// Returns: { tokensPath, manifestPath, tasteDials, codeCount }

export const meta = {
  name: 'ds-extract-tokens',
  description: 'Extract tokens.css, manifest.json, and taste profile from an imported DESIGN.md.',
  phases: [
    { title: 'Taste profile', detail: 'Read and save design taste dials' },
    { title: 'Generate tokens', detail: 'Create tokens.css and manifest.json' },
    { title: 'Setup primitives', detail: 'Prepare code/ directory and copy DESIGN.md' },
  ],
}

const _args = typeof args === 'string' ? JSON.parse(args) : (args || {})
const { dsId, dsPath, mdPath, name, description, tasteDials: inputDials } = _args
if (!dsId || !dsPath || !mdPath) throw new Error('ds-extract-tokens: dsId, dsPath, and mdPath are required')

let tasteDials = inputDials || { variance: 5, motion: 5, density: 5 }

// ===== TASTE PROFILE =====
phase('Taste profile')
log('[ds-extract-tokens] Analyzing design taste')

const tasteResult = await agent(
  'Read the DESIGN.md at "' + mdPath + '" and generate a taste profile.\n\n' +
  'Extract:\n1. DESIGN_VARIANCE (1-10): bold/opinionated. 1-3=conventional, 4-6=characterful, 7-10=bold\n' +
  '2. MOTION_INTENSITY (1-10): 1-3=static, 4-6=purposeful, 7-10=expressive\n' +
  '3. VISUAL_DENSITY (1-10): 1-3=airy, 4-6=balanced, 7-10=compact\n' +
  '4. Brand fingerprint\n5. Visual characteristics\n6. Anti-patterns\n\n' +
  'Return as structured data.',
  {
    label: 'taste:' + dsId, phase: 'Taste profile',
    schema: { type: 'object', properties: {
      VARIANCE: { type: 'number', minimum: 1, maximum: 10 },
      MOTION: { type: 'number', minimum: 1, maximum: 10 },
      DENSITY: { type: 'number', minimum: 1, maximum: 10 },
      brandFingerprint: { type: 'string' }, visualCharacteristics: { type: 'string' }, antiPatterns: { type: 'string' },
    }, required: ['VARIANCE', 'MOTION', 'DENSITY'] },
  }
)

if (tasteResult) {
  tasteDials = { variance: tasteResult.VARIANCE, motion: tasteResult.MOTION, density: tasteResult.DENSITY }
  log('[ds-extract-tokens] Taste: V' + tasteDials.variance + ' M' + tasteDials.motion + ' D' + tasteDials.density)

  const tasteYaml = [
    '---',
    'name: ' + dsId + '-taste',
    'description: Taste profile for ' + name,
    'dials:',
    '  DESIGN_VARIANCE: ' + tasteDials.variance,
    '  MOTION_INTENSITY: ' + tasteDials.motion,
    '  VISUAL_DENSITY: ' + tasteDials.density,
    '---',
  ].join('\n')

  await agent(
    'Save taste skill.\n1. Run: mkdir -p ' + dsPath + '/skills/taste\n' +
    '2. Write to ' + dsPath + '/skills/taste/SKILL.md using Write tool:\n\n' +
    tasteYaml + '\n\n# ' + name + ' Taste Profile\n...\nReturn "done".',
    { label: 'saveTaste:' + dsId, phase: 'Taste profile' }
  )
}

// ===== GENERATE TOKENS + MANIFEST =====
phase('Generate tokens')
log('[ds-extract-tokens] Generating tokens.css and manifest.json for "' + dsId + '"')

await agent(
  'Set up design system directory "' + dsId + '".\n' +
  'Steps:\n1. Run: mkdir -p "' + dsPath + '/code"\n' +
  '2. Run: cp "' + mdPath + '" "' + dsPath + '/DESIGN.md"\n' +
  '3. Read DESIGN.md and generate tokens.css with proper CSS custom properties.\n' +
  '   Include: --color-surface, --color-accent, --color-text, --color-text-muted,\n' +
  '   --color-border, --color-success, --color-warn, --color-danger,\n' +
  '   --font-sans, --font-display, --font-mono, --radius, --space-*, --shadow-*\n' +
  '4. Write manifest.json with id="' + dsId + '", name="' + name + '"\n' +
  '   description="' + (description || '') + '"\n' +
  '5. Verify: test -f "' + dsPath + '/DESIGN.md" && test -f "' + dsPath + '/tokens.css"\nReturn "done".',
  { label: 'setup:' + dsId, phase: 'Generate tokens' }
)
log('[ds-extract-tokens] Directory ready: ' + dsPath)

// Count code/ files
let codeCount = 0
try {
  const count = await $`ls ${dsPath}/code/*.tsx 2>/dev/null | wc -l`
  codeCount = parseInt(count.trim() || '0')
} catch { /* */ }

return {
  tokensPath: dsPath + '/tokens.css',
  manifestPath: dsPath + '/manifest.json',
  tasteDials,
  codeCount,
}
