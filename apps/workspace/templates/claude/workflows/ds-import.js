// ds-import.js
// Import a DESIGN.md from a URL or awesome-design-md and scaffold it
// into a complete design system with rich preview.
// Steps: design -> generate preview -> extract tokens -> scaffold primitives -> validate
//
// Usage: workflow('ds-import', { source, id?, name?, description? })
//   source - one of:
//     'awesome/{brand}'  -- import from awesome-design-md (e.g. 'awesome/airbnb')
//     'https://...'       -- fetch DESIGN.md from a raw URL
//     '/path/to/file.md'  -- local file path
//   id     - optional kebab-case id (auto-derived from source if omitted)
//   name   - optional display name
//   description - optional description
export const meta = {
  name: 'ds-import',
  description: 'Import DESIGN.md from URL/file/awesome, scaffold a complete design system, and generate rich preview.',
  phases: [
    { title: 'Design', detail: 'Fetch and analyze DESIGN.md from source' },
    { title: 'Preview', detail: 'Generate or fetch design preview HTML' },
    { title: 'Extract tokens', detail: 'Extract tokens.css and manifest.json from design' },
    { title: 'Decompose primitives', detail: 'Decompose preview HTML into standalone primitives' },
    { title: 'Validate', detail: 'Validate design system completeness' },
    { title: 'Reconstruct overview', detail: 'Reconstruct preview as React overview page, verify ≥98% visual similarity' },
  ],
}

const parsedArgs = typeof args === 'string' ? JSON.parse(args) : (args || {})
const { source, id: explicitId, name, description } = parsedArgs
if (!source) throw new Error('ds-import: source is required')

const tmpDir = '.claude/tmp'
const mdPath = tmpDir + '/import-designd.md'
const dsDir = 'design-systems'

// ===== DESIGN =====
phase('Design')
log('[ds-import] Importing from: ' + source)

let brand = ''
let fetchedName = name || ''
let fetchedDescription = description || ''
let dsId = explicitId || ''
let dsPath = ''
let tasteDials = { variance: 5, motion: 5, density: 5 }

// Helper: parse frontmatter
function parseFm(content, existingName, existingDesc) {
  let n = existingName, d = existingDesc
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/)
  if (fmMatch) {
    for (const line of fmMatch[1].split('\n')) {
      const m = line.match(/^(\w+):\s*(.+)$/)
      if (m) {
        const val = m[2].replace(/^["']|["']$/g, '')
        if (m[1] === 'name') n = n || val
        if (m[1] === 'description') d = d || val
        if (m[1] === 'category' && !existingDesc) d = d || val
      }
    }
  }
  return { name: n, description: d }
}

if (source.startsWith('awesome/')) {
  brand = source.replace('awesome/', '')
  const url = 'https://raw.githubusercontent.com/voltagent/awesome-design-md/main/design-md/' + brand + '/DESIGN.md'
  log('[ds-import] Fetching from awesome-design-md: ' + brand)

  const fetchResult = await agent(
    'Fetch DESIGN.md using curl and save to ' + mdPath + '.\n' +
    'Steps:\n1. Run: mkdir -p ' + tmpDir + '\n2. Run: curl -sL ' + url + ' -o ' + mdPath + '\n' +
    '3. Verify: wc -c < ' + mdPath + '\n4. Read and return the complete file content',
    { label: 'fetch:' + brand, phase: 'Fetch' }
  )
  const content = String(fetchResult || '')
  if (content.length < 10) throw new Error('[ds-import] Empty response for ' + brand)
  const parsed = parseFm(content, fetchedName, fetchedDescription)
  fetchedName = parsed.name; fetchedDescription = parsed.description
  dsId = explicitId || brand.toLowerCase().replace(/[^a-z0-9-]/g, '-')
  log('[ds-import] Fetched (' + content.length + ' chars)')

} else if (source.startsWith('http://') || source.startsWith('https://')) {
  log('[ds-import] Fetching from URL: ' + source)
  const fetchResult = await agent(
    'Fetch DESIGN.md from URL using curl.\n' +
    'Steps:\n1. Run: mkdir -p ' + tmpDir + '\n2. Run: curl -sL "' + source + '" -o ' + mdPath + '\n' +
    '3. Verify: wc -c < ' + mdPath + '\n4. Read and return the complete content',
    { label: 'fetch:url', phase: 'Fetch' }
  )
  const content = String(fetchResult || '')
  if (content.length < 10) throw new Error('[ds-import] Empty response from URL')
  const urlMatch = source.match(/\/([^/]+?)(?:\.md)?$/)
  fetchedName = fetchedName || (urlMatch ? urlMatch[1] : 'imported')
  const parsed = parseFm(content, fetchedName, fetchedDescription)
  fetchedName = parsed.name; fetchedDescription = parsed.description
  dsId = explicitId || fetchedName.toLowerCase().replace(/[^a-z0-9-]/g, '-')
  log('[ds-import] Fetched (' + content.length + ' chars)')

} else {
  log('[ds-import] Using local file: ' + source)
  const fetchResult = await agent(
    'Read local DESIGN.md and copy to ' + mdPath + '.\n' +
    'Steps:\n1. Run: mkdir -p ' + tmpDir + '\n2. Run: cp "' + source + '" ' + mdPath + '\n' +
    '3. Read and return the complete file content',
    { label: 'fetch:local', phase: 'Fetch' }
  )
  const content = String(fetchResult || '')
  if (!content) throw new Error('[ds-import] Failed to read: ' + source)
  const fileMatch = source.match(/\/([^/]+?)(?:\.md)?$/)
  fetchedName = fetchedName || (fileMatch ? fileMatch[1] : 'imported')
  const parsed = parseFm(content, fetchedName, fetchedDescription)
  fetchedName = parsed.name; fetchedDescription = parsed.description
  dsId = explicitId || fetchedName.toLowerCase().replace(/[^a-z0-9-]/g, '-')
  log('[ds-import] Loaded (' + content.length + ' chars)')
}

log('[ds-import] DS: id="' + dsId + '", name="' + fetchedName + '"')
dsPath = dsDir + '/' + dsId

// ===== PREVIEW =====
phase('Preview')
log('[ds-import] Fetching preview')

if (source.startsWith('awesome/')) {
  const previewUrl = 'https://getdesign.md/design-md/' + brand + '/preview.html'
  const previewPath = dsPath + '/reference-example.html'
  const previewResult = await agent(
    'Fetch design preview from URL and save it.\n' +
    'Steps:\n1. Run: curl -sL "' + previewUrl + '" -o "' + previewPath + '"\n' +
    '2. Verify: wc -c < "' + previewPath + '"\n' +
    '3. Read and confirm the preview file content\nReturn "ok" with file size.',
    { label: 'preview-fetch:' + dsId, phase: 'Preview' }
  )
  log('[ds-import] Preview fetched: ' + String(previewResult || '').slice(0, 80))
} else {
  // For non-awesome sources, generate preview from design
  const previewPath = dsPath + '/reference-example.html'
  await agent(
    'Generate rich preview HTML for DS "' + dsId + '".\n' +
    'Read DESIGN.md and tokens.css, create a self-contained preview HTML.\n' +
    'Write to "' + previewPath + '" via Write tool.\nReturn "done".',
    { label: 'preview-gen:' + dsId, phase: 'Preview' }
  )
  log('[ds-import] Preview generated')
}

// ===== EXTRACT TOKENS =====
phase('Extract tokens')
log('[ds-import] Extracting tokens from design')

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
  log('[ds-import] Taste: V' + tasteDials.variance + ' M' + tasteDials.motion + ' D' + tasteDials.density)

  const tasteYaml = [
    '---',
    'name: ' + dsId + '-taste',
    'description: Taste profile for ' + fetchedName,
    'dials:',
    '  DESIGN_VARIANCE: ' + tasteDials.variance,
    '  MOTION_INTENSITY: ' + tasteDials.motion,
    '  VISUAL_DENSITY: ' + tasteDials.density,
    '---',
  ].join('\n')

  await agent(
    'Save taste skill.\n1. Run: mkdir -p ' + dsPath + '/skills/taste\n' +
    '2. Write to ' + dsPath + '/skills/taste/SKILL.md using Write tool:\n\n' +
    tasteYaml + '\n\n# ' + fetchedName + ' Taste Profile\n...\nReturn "done".',
    { label: 'saveTaste:' + dsId, phase: 'Taste profile' }
  )
}

// ===== DECOMPOSE PRIMITIVES =====
phase('Decompose primitives')
log('[ds-import] Decomposing preview HTML into primitives for "' + dsId + '"')

// Setup: create DS directory, copy DESIGN.md, generate tokens.css + manifest
try {
  await agent(
    'Set up design system directory "' + dsId + '".\n' +
    'Steps:\n1. Run: mkdir -p "' + dsPath + '/code"\n' +
    '2. Run: cp "' + mdPath + '" "' + dsPath + '/DESIGN.md"\n' +
    '3. Read DESIGN.md and generate tokens.css with proper CSS custom properties.\n' +
    '4. Write manifest.json with id="' + dsId + '", name="' + fetchedName + '"\n' +
    '5. Verify: test -f "' + dsPath + '/DESIGN.md" && test -f "' + dsPath + '/tokens.css"\nReturn "done".',
    { label: 'setup:' + dsId, phase: 'Decompose primitives' }
  )
  log('[ds-import] Directory ready: ' + dsPath)
} catch (e) {
  throw new Error('[ds-decompose] Setup failed: ' + e.message)
}

// Analyze preview HTML to discover components
log('[ds-import] Analyzing preview for components')
const componentList = await agent(
  'Read the preview HTML at "' + dsPath + '/reference-example.html" and the DESIGN.md at "' + dsPath + '/DESIGN.md".\n' +
  'Identify all reusable UI components visible in the preview (Button, Card, Input, Badge, Nav, etc.).\n' +
  'For each component, describe its variants (sizes, colors, states) and the HTML structure.\n' +
  'Return a JSON array of component objects: [{name: string, variants: string, htmlContext: string}]',
  {
    label: 'analyze:' + dsId, phase: 'Decompose primitives',
    schema: {
      type: 'object',
      properties: {
        components: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              variants: { type: 'string' },
              htmlContext: { type: 'string' },
            },
            required: ['name'],
          },
        },
      },
      required: ['components'],
    },
  }
)

const components = (componentList?.components ?? []).filter(Boolean)
log('[ds-import] Found ' + components.length + ' components to decompose')

if (components.length === 0) {
  log('[ds-import] No components detected from preview — using defaults')
  components.push(
    { name: 'Button', variants: 'primary/secondary/ghost, md/lg', htmlContext: 'CTA buttons' },
    { name: 'Card', variants: 'default, with header/footer', htmlContext: 'content cards' },
  )
}

// Decompose each component: one agent per component, using craft component workflow
const componentResults = await pipeline(
  components,
  (comp) => agent(
    'Decompose the "' + comp.name + '" component from the design system preview.\n\n' +
    'Context:\n' +
    '- Preview HTML: "' + dsPath + '/reference-example.html"\n' +
    '- DESIGN.md: "' + dsPath + '/DESIGN.md"\n' +
    '- tokens.css: "' + dsPath + '/tokens.css"\n' +
    '- Variants: ' + (comp.variants || 'default') + '\n' +
    '- HTML context: ' + (comp.htmlContext || '') + '\n\n' +
    'Extract the "' + comp.name + '" component from the preview HTML into a standalone React .tsx component.\n' +
    'Use ONLY semantic token classes (bg-surface, text-accent, rounded, etc.) from tokens.css.\n' +
    'Use the craft component workflow approach:\n' +
    '1. Read the preview HTML to understand the component structure and visual design\n' +
    '2. Create a well-structured React component with all variants\n' +
    '3. Use tokens for all visual properties (no hardcoded colors/spacing)\n' +
    '4. Write to "' + dsPath + '/code/' + comp.name + '.tsx"\n\n' +
    'Return "OK" with the component name.',
    { label: 'decompose:' + comp.name, phase: 'Decompose primitives' }
  ),
)

const decomposed = componentResults.filter(Boolean)
log('[ds-import] Decomposed ' + decomposed.length + '/' + components.length + ' components')

// Graph
try {
  await agent('Build graph: emdesign graph build 2>&1', { label: 'graph:' + dsId, phase: 'Decompose primitives' })
  log('[ds-import] Graph built')
} catch (e) { log('[ds-import] Graph skip: ' + e.message) }

// ===== VALIDATE =====
phase('Validate')
log('[ds-import] Validating design system')
let valPass = false
try {
  const v = await agent(
    'Validate: emdesign ds validate "' + dsId + '" --strict --json 2>&1',
    { label: 'val:' + dsId, phase: 'Validate' }
  )
  const s = String(v || '')
  try { valPass = JSON.parse(s).ok || false } catch { valPass = s.includes('"ok": true') || s.includes('passed') }
  log('[ds-import] Validation: ' + (valPass ? 'passed' : 'issues'))
} catch { log('[ds-import] Validation unavailable') }

// ===== GENERATE PREVIEW =====
phase('Generate preview')
log('[ds-import] Building preview for "' + dsId + '"')

const outPath = dsPath + '/reference-example.html'
const previewResult = await agent(
  'Build rich self-contained preview HTML for DS "' + dsId + '".\n\n' +
  '1. Read: cat "' + dsPath + '/tokens.css", cat "' + dsPath + '/DESIGN.md", cat "' + dsPath + '/manifest.json"\n' +
  '2. Create HTML with sections:\n' +
  '   - Hero (name, desc)\n   - Color palette grid\n   - Typography samples\n' +
  '   - Spacing scale bars\n   - Tokens table (grouped by category)\n   - Design DNA (3 dial bars)\n' +
  '   - Primitives list\n   - Footer\n' +
  '3. Design: clean, modern, white bg, rounded cards, Inter font via CDN, all CSS inline\n' +
  '4. Write to "' + outPath + '" via Write tool\n' +
  '5. Run: wc -c < "' + outPath + '"\n' +
  'Return JSON: { "filePath":"' + outPath + '", "size": NUMBER }',
  {
    label: 'preview:' + dsId, phase: 'Generate preview',
    schema: { type: 'object', properties: { filePath: { type: 'string' }, size: { type: 'number' } }, required: ['filePath'] }
  }
)

if (previewResult?.size > 0) {
  log('[ds-import] Preview: ' + outPath + ' (' + previewResult.size + ' bytes)')
} else {
  log('[ds-import] Preview fallback')
  try {
    await agent(
      'Write minimal preview HTML to "' + outPath + '" via Write tool.\n' +
      'Include hero, color swatches, tokens table. Return "done".',
      { label: 'preview-fb:' + dsId, phase: 'Generate preview' }
    )
  } catch { /* */ }
}

// ===== RECONSTRUCT OVERVIEW (delegated to sub-workflow) =====
phase('Reconstruct overview')
log('[ds-import] Delegating overview reconstruction to ds-reconstruct-overview workflow')

let overviewScore = null
try {
  const overviewResult = await workflow('ds-reconstruct-overview', {
    dsId,
    dsPath,
    storybookUrl: process.env.EMDESIGN_STORYBOOK_URL || 'http://localhost:6006',
  })
  overviewScore = overviewResult?.overviewScore ?? null
  if (overviewResult?.passed) {
    log('[ds-import] ✅ Overview page PASSED at ' + overviewScore + '% (' + (overviewResult.iterations || 1) + ' iteration(s))')
  } else if (overviewScore !== null) {
    log('[ds-import] ⚠️  Overview page at ' + overviewScore + '% — below 98% threshold')
  } else {
    log('[ds-import] Overview reconstruction skipped (Storybook unavailable)')
  }
} catch (e) {
  log('[ds-import] Overview reconstruction unavailable: ' + (e.message || 'unknown error'))
  overviewScore = null
}

// Cleanup
try { await agent('Cleanup: rm -f ' + mdPath, { label: 'cleanup', phase: 'Scaffold' }) } catch { /* */ }

log('[ds-import] Complete: "' + dsId + '"')

return {
  id: dsId,
  name: fetchedName,
  path: dsPath,
  previewPath: outPath,
  tokens: dsPath + '/tokens.css',
  primitives: codeCount,
  validated: valPass,
  overviewScore,
}
