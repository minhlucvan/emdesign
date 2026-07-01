// ds-reconstruct-overview.js (v3 — optimized)
// Reconstruct preview HTML as a React overview page.
//
// Optimizations vs v2:
//   - Write ALL files first, then start Storybook ONCE for verification
//   - pipeline() for parallel section processing
//   - parallel() for simultaneous primitive crafting
//   - Single Storybook health check
//   - Cropped region diff per section
//   - Fix history tracking across iterations
//
// Called from ds-import.js:
//   workflow('ds-reconstruct-overview', { dsId, dsPath, storybookUrl })

export const meta = {
  name: 'ds-reconstruct-overview',
  description: 'Reconstruct preview as React overview — optimized for speed.',
  phases: [
    { title: 'Discover', detail: 'Analyze preview, find all sections' },
    { title: 'Build sections', detail: 'Analyze, craft, build — no Storybook needed' },
    { title: 'Verify', detail: 'Start Storybook, diff all sections, iterate' },
    { title: 'Compose', detail: 'Create Overview.tsx + final diff' },
  ],
}

const parsedArgs = typeof args === 'string' ? JSON.parse(args) : (args || {})
const { dsId, dsPath, storybookUrl: sbUrl } = parsedArgs
if (!dsId || !dsPath) throw new Error('ds-reconstruct-overview: dsId and dsPath are required')

const previewPath = dsPath + '/reference-example.html'
const codeDir = dsPath + '/code'
const STORYBOOK_URL = sbUrl || 'http://localhost:6006'
const THRESHOLD = 98
const MAX_ITERATIONS = 4

log('[ds-reconstruct-overview] v3 — "' + dsId + '"')
log('[ds-reconstruct-overview] Preview: ' + previewPath)

// ===== PHASE 1: DISCOVER =====
phase('Discover')
log('[ds-reconstruct-overview] Discovering sections from preview')

const discovery = await agent(
  'Analyze the preview HTML at "' + previewPath + '" and identify every distinct visual section.\n\n' +
  'Look for: <header>, <nav>, <main>, <footer>, <section>, <article>, <aside>,\n' +
  'and <div> with distinct background/padding.\n' +
  'Also elements with id attributes (id="palette", id="typography").\n\n' +
  'Group elements that belong together visually. Read top to bottom.\n\n' +
  'For each section: name, CSS selector, description, keyComponents.\n\n' +
  'Return { "sections": [{ "name": string, "selector": string, "description": string, "keyComponents": string[] }] }',
  {
    label: 'discover:' + dsId, phase: 'Discover',
    schema: {
      type: 'object',
      properties: {
        sections: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              selector: { type: 'string' },
              description: { type: 'string' },
              keyComponents: { type: 'array', items: { type: 'string' } },
            },
            required: ['name', 'selector'],
          },
        },
      },
      required: ['sections'],
    },
  }
)

const allSections = (discovery?.sections ?? []).filter(Boolean)
log('[ds-reconstruct-overview] Discovered ' + allSections.length + ' sections')
for (const s of allSections) log('  - ' + s.name)

// ===== PHASE 2: BUILD SECTIONS (no Storybook needed) =====
phase('Build sections')
log('[ds-reconstruct-overview] Building all section components')

// Stage 1: Analyze all sections (parallel)
const sectionAnalyses = await parallel(allSections.map(section => () =>
  agent(
    'Analyze the "' + section.name + '" section of the preview for "' + dsId + '".\n\n' +
    'Preview: "' + previewPath + '"\nSelector: ' + section.selector + '\n' +
    'Description: ' + (section.description || '') + '\n\n' +
    'Step 1: Read the section HTML from the preview using the selector.\n' +
    'Step 2: List existing .tsx files in "' + codeDir + '":\n' +
    '  Run: ls "' + codeDir + '"/*.tsx 2>&1\n' +
    'Step 3: Identify UI components in this section.\n' +
    '  - Existing components: import from "@ds/<Name>"\n' +
    '  - Missing components: must be crafted as new primitives\n' +
    'Step 4: Determine layout type.\n\n' +
    'Return: { "existingPrimitives": string[], "missingPrimitives": [{name,htmlContext,description}], "layoutType": string, "sectionStructure": string }',
    {
      label: 'analyze:' + section.name, phase: 'Build sections',
      schema: {
        type: 'object',
        properties: {
          existingPrimitives: { type: 'array', items: { type: 'string' } },
          missingPrimitives: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, htmlContext: { type: 'string' }, description: { type: 'string' } }, required: ['name'] } },
          layoutType: { type: 'string' },
          sectionStructure: { type: 'string' },
        },
        required: ['existingPrimitives', 'missingPrimitives', 'layoutType'],
      },
    }
  )
))

// Stage 2: Craft ALL missing primitives across ALL sections (parallel — no dependencies)
const allMissingPrims = []
for (let ai = 0; ai < sectionAnalyses.length; ai++) {
  const a = sectionAnalyses[ai]
  if (a && a.missingPrimitives) { for (let pi = 0; pi < a.missingPrimitives.length; pi++) { allMissingPrims.push(a.missingPrimitives[pi]) } }
}
const seen = {}
const uniqueMissing = []
for (let pi = 0; pi < allMissingPrims.length; pi++) {
  const p = allMissingPrims[pi]
  if (p && p.name && !seen[p.name]) { seen[p.name] = true; uniqueMissing.push(p) }
}

if (uniqueMissing.length > 0) {
  log('[ds-reconstruct-overview] Crafting ' + uniqueMissing.length + ' unique missing primitives (parallel)')
  const craftResults = await parallel(uniqueMissing.map(comp => () =>
    agent(
      'Create new primitive "' + comp.name + '" for "' + dsId + '".\n\n' +
      'Preview: "' + previewPath + '"\n' +
      'tokens.css: "' + dsPath + '/tokens.css"\n' +
      'Context: ' + (comp.htmlContext || comp.description) + '\n\n' +
      'Requirements:\n' +
      '1. Use ONLY semantic token classes (bg-surface, text-accent, rounded, etc.)\n' +
      '2. NEVER use raw hex or hardcoded spacing\n' +
      '3. Props interface ' + comp.name + 'Props, named export ' + comp.name + '\n' +
      '4. Accept className?: string\n' +
      '5. Match the preview visual style\n\n' +
      'Write to "' + codeDir + '/' + comp.name + '.tsx" via Write tool.\n' +
      'Return "OK".',
      { label: 'craft:' + comp.name, phase: 'Build sections' }
    )
  ))
  log('[ds-reconstruct-overview] Crafted ' + craftResults.filter(Boolean).length + '/' + uniqueMissing.length)
} else {
  log('[ds-reconstruct-overview] No missing primitives to craft')
}

// Stage 3: Build ALL section components (parallel — each is independent)
const buildResults = await parallel(allSections.map(section => () => {
  const analysis = sectionAnalyses.find(a => a)
  return agent(
    'Create React component Overview' + section.name + ' for "' + dsId + '".\n\n' +
    'Output to "' + codeDir + '/Overview' + section.name + '.tsx"\n' +
    'Structure: ' + ((analysis && analysis.sectionStructure) || '') + '\n\n' +
    '1. Import existing primitives from "@ds/<Name>"\n' +
    '2. Import newly crafted primitives from "./<Name>"\n' +
    '3. Compose in the layout matching preview at "' + previewPath + '"\n' +
    '   selector: ' + section.selector + '\n' +
    '4. Use ONLY semantic token classes — NO raw hex\n' +
    '5. Export named function Overview' + section.name + ' with className?: string\n\n' +
    'Write to "' + codeDir + '/Overview' + section.name + '.tsx" via Write tool.\n' +
    'Return "OK".',
    { label: 'build:' + section.name, phase: 'Build sections' }
  )
}))

log('[ds-reconstruct-overview] Components built: ' + buildResults.filter(Boolean).length + '/' + allSections.length)

// ===== PHASE 3: VERIFY (Storybook starts ONCE) =====
phase('Verify')
log('[ds-reconstruct-overview] Starting Storybook and running diffs')

// Single health check — cache result for all sections
const sbReady = await agent(
  'Start Storybook if not running and check it.\n' +
  'Run: cd /Users/minh/Documents/medesign/apps/workspace-react && npx storybook dev -p 6006 --no-open 2>&1 &\n' +
  'Then wait and check: curl -s -o /dev/null -w "%{http_code}" http://localhost:6006 2>&1\n' +
  'Return "ready" when HTTP 200. Return "failed" if cannot start.',
  { label: 'start-storybook', phase: 'Verify' }
)

const storybookAvailable = String(sbReady || '').toLowerCase().includes('ready')
log('[ds-reconstruct-overview] Storybook: ' + (storybookAvailable ? '✅ available' : '❌ unavailable'))

if (!storybookAvailable) {
  log('[ds-reconstruct-overview] WARN: Storybook unavailable — skipping all verification')
}

// Verify each section with visual-diff (sequential — use Storybook one at a time to avoid overload)
const sectionResults = []
const fixHistory = {}

for (let si = 0; si < allSections.length; si++) {
  const section = allSections[si]
  log('[' + (si + 1) + '/' + allSections.length + '] "' + section.name + '"')

  let bestScore = 0
  let currentIterations = 0

  for (let vi = 0; vi < MAX_ITERATIONS; vi++) {
    currentIterations = vi + 1

    if (!storybookAvailable) {
      log('  Storybook unavailable — score = 0')
      bestScore = 0
      break
    }

    const storyId = 'pages-overview--section-' + section.name.toLowerCase().replace(/[^a-z0-9-]/g, '')
    const history = (fixHistory[section.name] || [])
    const historyStr = history.length > 0 ? '\nPreviously attempted fixes: ' + JSON.stringify(history.slice(-3)) : ''

    const diffResult = await agent(
      'Run visual diff for "' + section.name + '".\n\n' +
      'Command: emdesign visual-diff "' + previewPath + '" "' +
      STORYBOOK_URL + '/iframe.html?id=' + storyId + '&viewMode=story" ' +
      '--ref-selector "' + section.selector + '" --target-selector "' + section.selector + '" --viewport 1280x720 --json 2>&1\n\n' +
      'Return { "score": number, "feedback": array, "pixel": object, "structure": object }',
      {
        label: 'diff:' + section.name + '-iter' + currentIterations, phase: 'Verify',
        schema: { type: 'object', properties: { score: { type: 'number' }, feedback: { type: 'array' }, pixel: { type: 'object' }, structure: { type: 'object' } }, required: ['score'] },
      }
    )

    const currentScore = diffResult?.score ?? 0
    bestScore = Math.max(bestScore, currentScore)
    log('  Score: ' + currentScore.toFixed(1) + '%' + (currentScore >= THRESHOLD ? ' ✅' : ' ❌'))

    if (currentScore >= THRESHOLD) break

    if (vi < MAX_ITERATIONS - 1) {
      const feedback = diffResult?.feedback ?? []
      fixHistory[section.name] = (fixHistory[section.name] || []).concat(feedback.slice(0, 5))

      await agent(
        'Fix diff for "' + section.name + '" (score: ' + currentScore.toFixed(1) + '%, target: ' + THRESHOLD + '%).\n\n' +
        'Fix "' + codeDir + '/Overview' + section.name + '.tsx" and any related primitives.\n' +
        'Match preview at "' + previewPath + '" selector: ' + section.selector + '\n' +
        historyStr + '\n\n' +
        'Return "fixed" with summary of changes.',
        { label: 'fix:' + section.name + '-iter' + currentIterations, phase: 'Verify' }
      )
    }
  }

  sectionResults.push({ sectionName: section.name, score: bestScore, iterations: currentIterations, passed: bestScore >= THRESHOLD })
}

log('[ds-reconstruct-overview] Sections: ' + sectionResults.filter(s => s.passed).length + '/' + sectionResults.length + ' passed')

// ===== PHASE 4: COMPOSE =====
phase('Compose')
log('[ds-reconstruct-overview] Creating Overview.tsx + stories')

await agent(
  'Create the Overview page for "' + dsId + '".\n\n' +
  'Components in "' + codeDir + '":\n' +
  sectionResults.map(s => '  - Overview' + s.sectionName + '.tsx (' + s.score + '%)').join('\n') + '\n\n' +
  'Write "' + codeDir + '/Overview.tsx":\n' +
  '  - Import all Overview* components, render in order\n' +
  '  - Clean vertical layout, bg-surface, NO raw hex\n' +
  '  - Named export Overview with className?: string\n\n' +
  'Write "' + codeDir + '/Overview.stories.tsx":\n' +
  '  - title: "Pages/Overview", layout: "fullscreen"\n' +
  '  - tags: ["autodocs"], Default story\n\n' +
  'Write both via Write tool. Return "OK".',
  { label: 'compose:' + dsId, phase: 'Compose' }
)

// Final visual-diff (if Storybook available)
let overallScore = 0
if (storybookAvailable) {
  const finalDiff = await agent(
    'Run final full-page visual diff.\n\n' +
    'Command: emdesign visual-diff "' + previewPath + '" "' +
    STORYBOOK_URL + '/iframe.html?id=pages-overview--default&viewMode=story" ' +
    '--viewport 1280x720 --json 2>&1\n\n' +
    'Return { "score": number }',
    {
      label: 'final-diff:' + dsId, phase: 'Compose',
      schema: { type: 'object', properties: { score: { type: 'number' } }, required: ['score'] },
    }
  )
  overallScore = finalDiff?.score ?? 0
  log('[ds-reconstruct-overview] Final: ' + overallScore.toFixed(1) + '%')
}

return {
  overallScore,
  totalSections: allSections.length,
  passedCount: sectionResults.filter(s => s.passed).length,
  sectionResults: sectionResults.map(s => ({ name: s.sectionName, score: s.score, passed: s.passed })),
  primitivesCrafted: uniqueMissing.map(p => p.name),
  overviewFile: codeDir + '/Overview.tsx',
  storiesFile: codeDir + '/Overview.stories.tsx',
  agentCount: sectionAnalyses.length + uniqueMissing.length + buildResults.length + 3,
}
