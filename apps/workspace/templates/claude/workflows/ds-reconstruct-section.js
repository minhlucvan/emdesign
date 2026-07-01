// ds-reconstruct-section.js
// Reconstruct a single preview section as a React component.
//
// For each section:
//   1. Read the section's HTML from the preview by selector
//   2. Identify UI components → check existing primitives → create missing ones
//   3. Build the section React component composing primitives
//   4. Render in Storybook → visual-diff against cropped section
//   5. Iterate if score < 98% (max 4 iterations)
//
// Called via pipeline from ds-reconstruct-overview:
//   workflow('ds-reconstruct-section', { dsId, dsPath, section, storybookUrl })

export const meta = {
  name: 'ds-reconstruct-section',
  description: 'Reconstruct a single preview section as a React component with visual verification.',
  phases: [
    { title: 'Read section', detail: 'Read section HTML, check existing primitives' },
    { title: 'Craft missing', detail: 'Create missing primitives found in this section' },
    { title: 'Build component', detail: 'Create section React component with primitives' },
    { title: 'Verify', detail: 'Render, visual-diff, iterate until ≥98%' },
  ],
}

const parsedArgs = typeof args === 'string' ? JSON.parse(args) : (args || {})
const { dsId, dsPath, section, storybookUrl: sbUrl } = parsedArgs
if (!dsId || !dsPath || !section) throw new Error('ds-reconstruct-section: dsId, dsPath, and section are required')

const previewPath = dsPath + '/reference-example.html'
const codeDir = dsPath + '/code'
const STORYBOOK_URL = sbUrl || 'http://localhost:6006'
const THRESHOLD = 98
const MAX_ITERATIONS = 4

// Build a story ID for this section — each section gets its own story
const sectionId = section.name.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase()
const storyId = 'pages-overview--section-' + sectionId

log('[ds-reconstruct-section] Reconstructing: "' + section.name + '" for DS "' + dsId + '"')
log('[ds-reconstruct-section] Selector: ' + section.selector)

// ===== PHASE 1: Read section + check primitives =====
phase('Read section')
log('[ds-reconstruct-section] Reading section HTML and checking existing primitives')

const sectionInfo = await agent(
  'Analyze the "' + section.name + '" section of the preview for DS "' + dsId + '".\n\n' +
  'Step 1: Read the section from the preview at "' + previewPath + '".\n' +
  '  The section is identified by selector: ' + section.selector + '\n' +
  '  Extract the section HTML and understand its structure.\n\n' +
  'Step 2: List existing primitives in "' + codeDir + '":\n' +
  '  Run: ls "' + codeDir + '"/*.tsx 2>&1\n' +
  '  Read any files that match UI components visible in this section.\n\n' +
  'Step 3: Identify which UI components are used in this section:\n' +
  '  - Check each one against existing primitives\n' +
  '  - Components that exist → can be imported from "@ds/<Name>"\n' +
  '  - Components that DON'T exist → must be crafted\n\n' +
  'Description: ' + (section.description || '') + '\n' +
  'Expected components: ' + ((section.keyComponents || []).join(', ') || 'unknown') + '\n\n' +
  'Return JSON: {\n' +
  '  "existingPrimitives": ["Button", ...],\n' +
  '  "missingPrimitives": [{ "name": string, "htmlContext": string, "description": string }],\n' +
  '  "sectionStructure": "description of how components are laid out",\n' +
  '  "layoutType": "stack" | "grid" | "sidebar" | "custom"\n' +
  '}',
  {
    label: 'read-section:' + sectionId, phase: 'Read section',
    schema: {
      type: 'object',
      properties: {
        existingPrimitives: { type: 'array', items: { type: 'string' } },
        missingPrimitives: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              htmlContext: { type: 'string' },
              description: { type: 'string' },
            },
            required: ['name'],
          },
        },
        sectionStructure: { type: 'string' },
        layoutType: { type: 'string', enum: ['stack', 'grid', 'sidebar', 'custom'] },
      },
      required: ['existingPrimitives', 'missingPrimitives', 'layoutType'],
    },
  }
)

const existingPrims = sectionInfo?.existingPrimitives ?? []
const missingPrims = (sectionInfo?.missingPrimitives ?? []).filter(Boolean)
const layoutType = sectionInfo?.layoutType || 'stack'

log('[ds-reconstruct-section] Existing primitives: ' + existingPrims.join(', '))
log('[ds-reconstruct-section] Missing primitives to craft: ' + missingPrims.length)

// ===== PHASE 2: Craft missing primitives =====
phase('Craft missing')
if (missingPrims.length > 0) {
  log('[ds-reconstruct-section] Crafting ' + missingPrims.length + ' missing primitive(s)')

  const craftResults = await pipeline(
    missingPrims,
    (comp) => agent(
      'Create a new primitive component "' + comp.name + '" for DS "' + dsId + '".\n\n' +
      'Context:\n' +
      '- Preview: "' + previewPath + '"\n' +
      '- Section: ' + section.name + ' (selector: ' + section.selector + ')\n' +
      '- tokens.css: "' + dsPath + '/tokens.css"\n' +
      '- This component appears in the preview as: ' + (comp.htmlContext || comp.description) + '\n\n' +
      'Requirements:\n' +
      '1. Use ONLY semantic token classes (bg-surface, text-accent, rounded, etc.)\n' +
      '2. NEVER use raw hex colors or hardcoded spacing values\n' +
      '3. Have a Props interface named ' + comp.name + 'Props\n' +
      '4. Be a named export function ' + comp.name + '\n' +
      '5. Accept className?: string in props\n' +
      '6. Match the visual style shown in the preview\n\n' +
      'Write to "' + codeDir + '/' + comp.name + '.tsx" via Write tool.\n' +
      'Return "OK" with component name and props interface.',
      { label: 'craft:' + comp.name, phase: 'Craft missing' }
    ),
  )
  log('[ds-reconstruct-section] Crafted ' + craftResults.filter(Boolean).length + '/' + missingPrims.length + ' primitives')
} else {
  log('[ds-reconstruct-section] All primitives already exist — nothing to craft')
}

// ===== PHASE 3: Build section component =====
phase('Build component')
log('[ds-reconstruct-section] Building section React component')

const buildResult = await agent(
  'Create the React component Overview' + section.name + ' for DS "' + dsId + '".\n\n' +
  'Context:\n' +
  '- Preview section: ' + section.name + ' (selector: ' + section.selector + ')\n' +
  '- Layout: ' + layoutType + '\n' +
  '- Structure: ' + (sectionInfo?.sectionStructure || '') + '\n' +
  '- Existing primitives: ' + existingPrims.join(', ') + '\n' +
  '- Newly crafted primitives: ' + missingPrims.map(p => p.name).join(', ') + '\n' +
  '- Preview HTML: "' + previewPath + '"\n' +
  '- tokens.css: "' + dsPath + '/tokens.css"\n\n' +
  'Write "' + codeDir + '/Overview' + section.name + '.tsx" with:\n' +
  '1. Import existing primitives from "@ds/<Name>"\n' +
  '2. Import newly crafted primitives from "./<Name>"\n' +
  '3. Compose them in a ' + layoutType + ' layout matching the preview section\n' +
  '4. Use ONLY semantic token classes — NO raw hex or hardcoded values\n' +
  '5. Export as named function Overview' + section.name + '\n' +
  '6. Accept className?: string in props\n\n' +
  'Return "OK" with component name.',
  { label: 'build-section:' + sectionId, phase: 'Build component' }
)

log('[ds-reconstruct-section] Component built: Overview' + section.name + '.tsx')

// ===== PHASE 4: Verify =====
phase('Verify')
log('[ds-reconstruct-section] Running visual verification (target: ' + THRESHOLD + '%)')

let bestScore = 0
let iterations = 0

for (let i = 0; i < MAX_ITERATIONS; i++) {
  iterations = i + 1
  log('[ds-reconstruct-section] Iteration ' + iterations + '/' + MAX_ITERATIONS)

  // Check Storybook health
  const sbCheck = await agent(
    'Check if Storybook is running at ' + STORYBOOK_URL + '.\n' +
    'Run: curl -s -o /dev/null -w "%{http_code}" ' + STORYBOOK_URL + '/iframe.html 2>&1 || echo "0"\n' +
    'Return "ready" if HTTP 200.',
    { label: 'health:' + sectionId, phase: 'Verify' }
  )

  const storybookReady = String(sbCheck || '').toLowerCase().includes('ready')
  if (!storybookReady) {
    log('[ds-reconstruct-section] Storybook not available — skipping visual verify')
    bestScore = 0
    break
  }

  // Visual-diff: section cropped from preview vs Storybook-rendered section
  const diffResult = await agent(
    'Run visual diff for the "' + section.name + '" section.\n\n' +
    'Command: emdesign visual-diff "' + previewPath + '" "' +
    STORYBOOK_URL + '/iframe.html?id=' + storyId + '&viewMode=story" ' +
    '--viewport 1280x720 --json 2>&1\n\n' +
    'Parse the JSON. Extract "overallScore" and "feedback".\n' +
    'Return JSON: { "score": NUMBER, "feedback": ARRAY }',
    {
      label: 'diff:' + sectionId + '-iter' + iterations, phase: 'Verify',
      schema: {
        type: 'object',
        properties: {
          score: { type: 'number' },
          feedback: { type: 'array', items: { type: 'object' } },
        },
        required: ['score'],
      },
    }
  )

  const currentScore = diffResult?.score ?? 0
  const diffFeedback = diffResult?.feedback ?? []
  bestScore = Math.max(bestScore, currentScore)

  log('[ds-reconstruct-section] Score: ' + currentScore.toFixed(1) + '%' +
    (currentScore >= THRESHOLD ? ' ✅ PASS' : ' ❌ BELOW THRESHOLD'))

  if (currentScore >= THRESHOLD) {
    log('[ds-reconstruct-section] ✅ Achieved ' + currentScore.toFixed(1) + '% in ' + iterations + ' iteration(s)')
    break
  }

  if (i < MAX_ITERATIONS - 1 && diffFeedback.length > 0) {
    const fixResult = await agent(
      'Fix visual diff issues for section "' + section.name + '" (score: ' +
      currentScore.toFixed(1) + '%, target: ' + THRESHOLD + '%).\n\n' +
      'DOM differences found:\n' +
      JSON.stringify(diffFeedback.slice(0, 10), null, 2) + '\n\n' +
      'Fix the issues in:\n' +
      '- "' + codeDir + '/Overview' + section.name + '.tsx"\n' +
      '- Any primitive files in "' + codeDir + '/" that need adjustment\n\n' +
      'Match the preview at "' + previewPath + '" selector: ' + section.selector + '\n' +
      'After fixing, restart Storybook to pick up changes.\n' +
      'Return "fixed" with list of files changed.',
      { label: 'fix:' + sectionId + '-iter' + iterations, phase: 'Verify' }
    )
    log('[ds-reconstruct-section] Fix round ' + iterations + ': ' + String(fixResult || '').slice(0, 100))
  }
}

log('[ds-reconstruct-section] Final: "' + section.name + '" = ' + bestScore.toFixed(1) + '% after ' + iterations + ' iteration(s)')

return {
  sectionName: section.name,
  componentFile: 'Overview' + section.name + '.tsx',
  score: bestScore,
  iterations,
  passed: bestScore >= THRESHOLD,
  existingPrimitives: existingPrims,
  primitivesCrafted: missingPrims.map(p => p.name),
}
