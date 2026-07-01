// ds-reconstruct-element.js
// Reconstruct a single element from the preview as a React component.
//
// This is a RECURSIVE workflow — an element may contain sub-elements,
// and each sub-element is reconstructed by calling this same workflow.
// At every level, the pattern is identical:
//   1. Read the element's HTML from the preview
//   2. Identify sub-elements → recurse into each one
//   3. Check existing primitives → reuse or craft
//   4. Build the React component composing sub-elements
//   5. Visual-diff → iterate until ≥98%
//
// kind: "section" → writes Overview<Name>.tsx (page-level)
//       "component" → writes <Name>.tsx (reusable primitive)
//
// Called recursively:
//   workflow('ds-reconstruct-element', { dsId, dsPath, element, kind, depth })

export const meta = {
  name: 'ds-reconstruct-element',
  description: 'Recursively reconstruct any element from preview as a React component with visual verification.',
  phases: [
    { title: 'Read', detail: 'Read element HTML, find sub-elements, check primitives' },
    { title: 'Recurse', detail: 'Recursively reconstruct sub-elements' },
    { title: 'Build', detail: 'Create React component composing sub-elements' },
    { title: 'Verify', detail: 'Render, visual-diff, iterate until ≥98%' },
  ],
}

const parsedArgs = typeof args === 'string' ? JSON.parse(args) : (args || {})
const { dsId, dsPath, element, kind, storybookUrl: sbUrl, depth = 0 } = parsedArgs
if (!dsId || !dsPath || !element) throw new Error('ds-reconstruct-element: dsId, dsPath, and element are required')

const previewPath = dsPath + '/reference-example.html'
const codeDir = dsPath + '/code'
const STORYBOOK_URL = sbUrl || 'http://localhost:6006'
const THRESHOLD = 98
const MAX_ITERATIONS = 4
const INDENT = '  '.repeat(depth)

// Determine output file name
const isSection = kind === 'section'
const outputName = isSection ? 'Overview' + element.name : element.name
const outputFile = outputName + '.tsx'
const outputPath = codeDir + '/' + outputFile

log(INDENT + '[ds-reconstruct-element] ' + (isSection ? 'SECTION' : 'COMPONENT') + ' "' + element.name + '" (depth ' + depth + ')')
log(INDENT + '  Output: ' + outputPath)

// ===== PHASE 1: Read element + find sub-elements + check primitives =====
phase('Read')

const analysis = await agent(
  INDENT + 'Analyze the "' + element.name + '" element of the preview for DS "' + dsId + '".\n\n' +
  'Preview: "' + previewPath + '"\n' +
  'Selector: ' + (element.selector || 'body') + '\n' +
  'Description: ' + (element.description || '') + '\n\n' +
  'Step 1: Read the section HTML from the preview using the selector.\n\n' +
  'Step 2: List existing primitives in "' + codeDir + '":\n' +
  '  Run: ls "' + codeDir + '"/*.tsx 2>&1\n\n' +
  'Step 3: Identify sub-elements inside this section — UI components that\n' +
  '  could be extracted as reusable primitives (Button, Card, Input, Badge,\n' +
  '  PriceCard, FeatureList, NavLink, etc.). For each one, check if a\n' +
  '  corresponding primitive already exists in code/.\n\n' +
  'Step 4: Determine the layout structure — how sub-elements are arranged.\n\n' +
  'Return JSON: {\n' +
  '  "existingPrimitives": ["Button", ...],\n' +
  '  "subElements": [{ "name": string, "selector": string, "description": string }],\n' +
  '    — sub-elements that need their OWN reconstruction (will be recursed into)\n' +
  '  "layoutType": "stack" | "grid" | "sidebar" | "custom",\n' +
  '  "structure": "description of how this element is composed"\n' +
  '}',
  {
    label: 'read:' + element.name + '-' + depth, phase: 'Read',
    schema: {
      type: 'object',
      properties: {
        existingPrimitives: { type: 'array', items: { type: 'string' } },
        subElements: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              selector: { type: 'string' },
              description: { type: 'string' },
            },
            required: ['name'],
          },
        },
        layoutType: { type: 'string' },
        structure: { type: 'string' },
      },
      required: ['existingPrimitives', 'subElements'],
    },
  }
)

const existingPrims = analysis?.existingPrimitives ?? []
const subElements = (analysis?.subElements ?? []).filter(Boolean)
const layoutType = analysis?.layoutType || 'stack'

log(INDENT + '  Existing primitives: ' + existingPrims.join(', ') || '(none)')
log(INDENT + '  Sub-elements to recurse: ' + subElements.length)

// ===== PHASE 2: Recursively reconstruct sub-elements =====
if (subElements.length > 0) {
  phase('Recurse')
  log(INDENT + '  Recursing into ' + subElements.length + ' sub-element(s)')

  const subResults = await pipeline(
    subElements,
    (subEl) => workflow('ds-reconstruct-element', {
      dsId,
      dsPath,
      element: subEl,
      kind: 'component',  // sub-elements become reusable primitives
      storybookUrl: STORYBOOK_URL,
      depth: depth + 1,
    }),
  )

  const crafted = subResults.filter(Boolean).filter((r) => r?.crafted)
  log(INDENT + '  Sub-elements completed: ' + crafted.length + '/' + subElements.length + ' crafted')
}

// ===== PHASE 3: Build the component =====
phase('Build')
log(INDENT + '  Building component: ' + outputFile)

const buildResult = await agent(
  INDENT + 'Create the React component ' + outputName + ' for DS "' + dsId + '".\n\n' +
  'Output file: "' + outputPath + '"\n' +
  'Kind: ' + (isSection ? 'Section (page-level, part of Overview)' : 'Primitive (reusable component)') + '\n' +
  'Layout: ' + layoutType + '\n' +
  'Structure: ' + (analysis?.structure || '') + '\n' +
  'Existing primitives available: ' + existingPrims.join(', ') + '\n' +
  (subElements.length > 0 ? 'Newly crafted sub-elements in "' + codeDir + '": ' +
    subElements.map(s => s.name).join(', ') + '\n' : '') +
  'Preview: "' + previewPath + '"\n' +
  'Selector: ' + (element.selector || 'body') + '\n' +
  'tokens.css: "' + dsPath + '/tokens.css"\n\n' +
  'Requirements:\n' +
  '1. ' + (isSection ? 'Import sub-elements from "./<Name>"' : 'Import existing primitives from "@ds/<Name>"') + '\n' +
  (isSection && subElements.length > 0 ? '2. Import newly crafted sub-elements from "./<Name>"\n' : '') +
  '2. Compose them in a ' + layoutType + ' layout\n' +
  '3. Use ONLY semantic token classes (bg-surface, text-accent, rounded, etc.)\n' +
  '4. NEVER use raw hex colors or hardcoded spacing values\n' +
  '5. Export as named function ' + outputName + '\n' +
  '6. Have a Props interface with className?: string\n\n' +
  'Write to "' + outputPath + '" via Write tool.\n' +
  'Return "OK" with component name.',
  { label: 'build:' + element.name + '-' + depth, phase: 'Build' }
)

log(INDENT + '  Built: ' + outputFile)

// ===== PHASE 4: Verify =====
phase('Verify')
log(INDENT + '  Running visual verification')

let bestScore = 0
let iterations = 0

for (let i = 0; i < MAX_ITERATIONS; i++) {
  iterations = i + 1
  log(INDENT + '  Iteration ' + iterations + '/' + MAX_ITERATIONS)

  // Storybook health check
  const storybookReady = await agent(
    'Check Storybook at ' + STORYBOOK_URL + '.\n' +
    'Run: curl -s -o /dev/null -w "%{http_code}" ' + STORYBOOK_URL + '/iframe.html 2>&1 || echo "0"\n' +
    'Return "ready" if 200.',
    { label: 'health:' + element.name + '-' + depth, phase: 'Verify' }
  )

  if (!String(storybookReady || '').toLowerCase().includes('ready')) {
    log(INDENT + '  Storybook not available — skip verify')
    break
  }

  // Build the story ID based on kind
  const storyId = isSection
    ? 'pages-overview--section-' + element.name.toLowerCase().replace(/[^a-z0-9-]/g, '')
    : 'components-' + element.name.toLowerCase().replace(/[^a-z0-9-]/g, '') + '--default'

  const diffResult = await agent(
    'Run visual diff for element "' + element.name + '".\n\n' +
    'Command: emdesign visual-diff "' + previewPath + '" "' +
    STORYBOOK_URL + '/iframe.html?id=' + storyId + '&viewMode=story" ' +
    '--viewport 1280x720 --json 2>&1\n\n' +
    'Parse JSON. Return { "score": NUMBER, "feedback": ARRAY }',
    {
      label: 'diff:' + element.name + '-' + depth + '-iter' + iterations, phase: 'Verify',
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
  bestScore = Math.max(bestScore, currentScore)

  log(INDENT + '  Score: ' + currentScore.toFixed(1) + '%' +
    (currentScore >= THRESHOLD ? ' ✅' : ' ❌'))

  if (currentScore >= THRESHOLD) break

  if (i < MAX_ITERATIONS - 1) {
    await agent(
      'Fix visual diff issues for "' + element.name + '" (score: ' +
      currentScore.toFixed(1) + '%, target: ' + THRESHOLD + '%).\n\n' +
      'Fix "' + outputPath + '" to match the preview at "' +
      previewPath + '" selector: ' + (element.selector || 'body') + '\n' +
      'After fixing, restart Storybook.\nReturn "fixed".',
      { label: 'fix:' + element.name + '-' + depth + '-iter' + iterations, phase: 'Verify' }
    )
  }
}

log(INDENT + '  Final: "' + element.name + '" = ' + bestScore.toFixed(1) + '% (' + iterations + ' iter(s))')

return {
  elementName: element.name,
  outputFile,
  outputPath,
  kind,
  score: bestScore,
  iterations,
  passed: bestScore >= THRESHOLD,
  subElementCount: subElements.length,
  crafted: bestScore > 0,
}
