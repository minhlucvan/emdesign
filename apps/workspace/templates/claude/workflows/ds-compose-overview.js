// ds-compose-overview.js
// Section-based overview composition with Red-Green per primitive.
// 1. Analyze reference-example.html (or DESIGN.md) -> discover sections + needed primitives
// 2. For each section: discover primitives -> Red-Green each missing primitive -> compose section story
// 3. Compose Showcase.stories.tsx from section stories
// 4. Verify all __tests__/* pass
//
// Usage: workflow('ds-compose-overview', { dsId, dsPath, maxAttempts? })

export const meta = {
  name: 'ds-compose-overview',
  description: 'Section-based Red-Green: analyze page, discover sections, create missing primitives with tests, compose Showcase.stories.tsx.',
  phases: [
    { title: 'Analyze', detail: 'Read reference HTML or DESIGN.md, discover sections and needed primitives' },
    { title: 'Build sections', detail: 'Per-section: Red-Green missing primitives, compose section story' },
    { title: 'Compose Showcase', detail: 'RED: test -> GREEN: Showcase -> verify loop' },
    { title: 'Verify all', detail: 'Run all __tests__/*, fix failures, retry' },
  ],
}

const _args = typeof args === 'string' ? JSON.parse(args) : (args || {})
const { dsId, dsPath, maxAttempts = 3 } = _args
if (!dsId || !dsPath) throw new Error('ds-compose-overview: dsId and dsPath are required')

const codeDir = dsPath + '/code'
const testsDir = dsPath + '/__tests__'
const previewPath = dsPath + '/reference-example.html'
const designMdPath = dsPath + '/DESIGN.md'

log('[ds-compose] Composing overview for "' + dsId + '" at ' + dsPath)

// ==========================================================================
// Phase 1: Analyze
// ==========================================================================
phase('Analyze')
log('[ds-compose] Phase 1: Analyzing reference to discover sections')

const analyzeResult = await agent(
  'You are analyzing a design system reference page and component library to discover sections.\n\n' +
  'Read the following files if they exist:\n' +
  '1. Reference preview HTML at ' + previewPath + ' (if available)\n' +
  '2. DESIGN.md at ' + designMdPath + '\n' +
  '3. Tokens at ' + dsPath + '/tokens.css\n' +
  '4. List existing components: run "ls ' + codeDir + '/" to see what primitives already exist\n\n' +
  'Your task: Identify the visual sections of this design system overview page.\n' +
  'Each section is a visual block (Hero, Color Palette, Typography, Spacing, etc.) ' +
  'and each section needs specific React primitives to render.\n\n' +
  'For each section, determine:\n' +
  '- What React primitives it needs (e.g. ColorPalette needs: Swatch, Stack, Heading, Text)\n' +
  '- Which of those already exist in ' + codeDir + '/\n' +
  '- Which are missing and need to be created\n\n' +
  'Return a JSON object with a "sections" array:\n' +
  '{ "sections": [{ "name": "Hero", "type": "hero", "description": "...", "htmlContext": "...", ' +
  '"neededPrimitives": ["Button","Heading","Text"], "existingPrimitives": ["Button"], "missingPrimitives": ["Heading","Text"] }] }\n\n' +
  'If reference-example.html does not exist, use the DESIGN.md to infer sections.\n' +
  'At minimum include: Hero, ColorPalette, Typography, Spacing, ComponentDemos.\n' +
  'Keep neededPrimitives focused - only what is actually needed for rendering.',
  { label: 'analyze:' + dsId, phase: 'Analyze', schema: {
    type: 'object',
    properties: {
      sections: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            type: { type: 'string' },
            description: { type: 'string' },
            htmlContext: { type: 'string' },
            neededPrimitives: { type: 'array', items: { type: 'string' } },
            existingPrimitives: { type: 'array', items: { type: 'string' } },
            missingPrimitives: { type: 'array', items: { type: 'string' } },
          },
          required: ['name', 'type', 'neededPrimitives', 'existingPrimitives', 'missingPrimitives'],
        },
      },
    },
    required: ['sections'],
  }}
)

const sections = analyzeResult?.sections ?? []
if (!sections || sections.length === 0) {
  throw new Error('[ds-compose] No sections detected from reference')
}

log('[ds-compose] Found ' + sections.length + ' sections:')
for (const s of sections) {
  log('  ' + s.name + ': ' + s.missingPrimitives.length + ' missing, ' + s.existingPrimitives.length + ' existing')
}

// ==========================================================================
// Phase 2: Build sections - per-section Red-Green for missing primitives
// ==========================================================================
phase('Build sections')
log('[ds-compose] Phase 2: Building sections with Red-Green per primitive')

async function buildPrimitive(name, sectionType) {
  log('[ds-compose]   Primitive "' + name + '": checking...')

  const exists = await agent(
    'Check if the file ' + codeDir + '/' + name + '.tsx exists.\n' +
    'Run: ls ' + codeDir + '/' + name + '.tsx 2>/dev/null || echo "NOT_FOUND"\n' +
    'If the file exists, read its first 10 lines and report its content summary.\n' +
    'Otherwise return "NOT_FOUND".',
    { label: 'check:' + name, phase: 'Build sections', schema: {
      type: 'object', properties: {
        exists: { type: 'boolean' },
        summary: { type: 'string' },
      }, required: ['exists'],
    }}
  )

  if (exists?.exists) {
    log('[ds-compose]   "' + name + '" exists - reusing')
    return { name, status: 'reused' }
  }

  log('[ds-compose]   RED "' + name + '" missing - creating with Red-Green')

  // RED: write failing test first
  const redResult = await agent(
    'You are writing a RED (failing) test for a new React primitive "' + name + '" in the "' + dsId + '" design system.\n\n' +
    'The primitive will be used in the "' + sectionType + '" section of the overview page.\n' +
    'Read ' + dsPath + '/tokens.css to understand available CSS variables.\n' +
    'Read ' + designMdPath + ' for design context.\n\n' +
    'Write a vitest test file at ' + testsDir + '/' + name + '.test.ts that tests:\n\n' +
    '1. Component exists - the .tsx file exists at ' + codeDir + '/' + name + '.tsx\n' +
    '2. Lint passes - checkLint from @emdesign/testbed, expect mustFix === 0\n' +
    '3. Token binding - source code uses var(--token-*) references, no raw hex values (except common colors)\n' +
    '4. Behavior (if interactive) - checkBehavior from @emdesign/testbed\n\n' +
    'The test will FAIL because the component does not exist yet - that is the RED phase.\n' +
    'Write the test file using the Write tool.\n' +
    'Return: { testFile: string, testCount: number }',
    { label: 'red:' + name, phase: 'Build sections', schema: {
      type: 'object', properties: {
        testFile: { type: 'string' },
        testCount: { type: 'number' },
      }, required: ['testFile'],
    }}
  )
  log('[ds-compose]   RED test written: ' + (redResult?.testFile ?? 'N/A'))

  // Verify RED: run the test to confirm it fails
  log('[ds-compose]   Verifying RED phase for "' + name + '"...')
  const redVerify = await agent(
    'Run the test for "' + name + '" to confirm it FAILS (RED phase).\n\n' +
    'Steps:\n' +
    '1. Run: npx vitest run ' + testsDir + '/' + name + '.test.ts 2>&1 || true\n' +
    '2. Check the output - must FAIL (the component does not exist yet)\n' +
    '3. Confirm the failure is an import/not-found error, not a test syntax error\n\n' +
    'Return: { redConfirmed: true/false, failureType: string, output: string }',
    { label: 'red-verify:' + name, phase: 'Build sections', schema: {
      type: 'object', properties: {
        redConfirmed: { type: 'boolean' },
        failureType: { type: 'string' },
      }, required: ['redConfirmed'],
    }}
  )
  if (redVerify?.redConfirmed) {
    log('[ds-compose]   RED confirmed: failure=' + (redVerify?.failureType ?? 'unknown'))
  } else {
    log('[ds-compose]   WARNING: RED not confirmed for "' + name + '"')
  }

  // GREEN: create the component
  log('[ds-compose]   GREEN: creating "' + name + '"')
  const greenResult = await agent(
    'You are creating the GREEN phase for primitive "' + name + '" in the "' + dsId + '" design system.\n\n' +
    'This primitive is needed for the "' + sectionType + '" section.\n' +
    'Read ' + dsPath + '/tokens.css for CSS variables and ' + designMdPath + ' for design context.\n\n' +
    'Create ' + codeDir + '/' + name + '.tsx as a React functional component that:\n\n' +
    '1. Uses only var(--token-*) CSS variables - NO raw hex values\n' +
    '2. Accepts className?: string prop\n' +
    '3. Has a JSDoc comment explaining the component\n' +
    '4. Uses inline React.CSSProperties (not Tailwind classes, not external CSS)\n' +
    '5. Exports as named export matching the filename\n\n' +
    'Write the file using the Write tool.\n' +
    'Return: { filePath: string, description: string }',
    { label: 'green:' + name, phase: 'Build sections', schema: {
      type: 'object', properties: {
        filePath: { type: 'string' },
        description: { type: 'string' },
      }, required: ['filePath'],
    }}
  )
  log('[ds-compose]   GREEN created: ' + (greenResult?.filePath ?? 'N/A'))

  // Verify GREEN: run the test - must PASS now
  log('[ds-compose]   Verifying GREEN phase for "' + name + '"...')
  const verifyResult = await agent(
    'Run the test for "' + name + '" and report results.\n\n' +
    'Steps:\n' +
    '1. Run: npx vitest run ' + testsDir + '/' + name + '.test.ts 2>&1 || true\n' +
    '2. Check if tests passed or failed\n' +
    '3. If FAILED, read the output, fix the component at ' + codeDir + '/' + name + '.tsx, and re-run\n' +
    '4. Repeat until all pass or max 3 attempts\n\n' +
    'Return: { passed: true/false, details: "summary" }',
    { label: 'green-verify:' + name, phase: 'Build sections', schema: {
      type: 'object', properties: {
        passed: { type: 'boolean' },
        details: { type: 'string' },
      }, required: ['passed'],
    }}
  )

  if (verifyResult?.passed) {
    log('[ds-compose]   GREEN confirmed for "' + name + '"')
  } else {
    log('[ds-compose]   GREEN failed for "' + name + '": ' + (verifyResult?.details ?? 'unknown'))
  }

  return { name, status: verifyResult?.passed ? 'created' : 'failed' }
}

const sectionResults = await parallel(sections.map((section) => () =>
  (async () => {
    log('[ds-compose] Section "' + section.name + '": ' + section.missingPrimitives.length + ' primitives to create')

    const primitiveResults = []
    for (const prim of section.missingPrimitives) {
      const result = await buildPrimitive(prim, section.type)
      primitiveResults.push(result)
    }

    log('[ds-compose]   Composing section story for "' + section.name + '"')
    const sectionStory = await agent(
      'You are creating a Storybook story for the "' + section.name + '" section of the "' + dsId + '" design system overview.\n\n' +
      'Existing primitives in ' + codeDir + '/: ' + [...section.existingPrimitives, ...section.missingPrimitives].join(', ') + '\n\n' +
      'Read ' + dsPath + '/tokens.css for CSS variable references.\n' +
      'Read ' + designMdPath + ' for design context.\n\n' +
      'Create a React story file at ' + codeDir + '/' + section.name + '.stories.tsx that:\n\n' +
      '1. Imports needed primitives from ./ (e.g. import { Button, Heading, Text } from ./index)\n' +
      '2. Renders a section that visually matches what "' + section.name + '" should look like\n' +
      '3. Uses var(--token-*) for ALL styling - no raw hex values\n' +
      '4. Is self-contained (one story, one component)\n' +
      '5. Exports with title: Design System/' + dsId + '/' + section.name + '\n\n' +
      'The section should use the existing primitives from code/ to compose the visual section.\n' +
      'Match the layout described in: ' + (section.htmlContext || section.description) + '\n\n' +
      'Write the file using the Write tool.\n' +
      'Return: { storyFile: string, name: string }',
      { label: 'story:' + section.name, phase: 'Build sections', schema: {
        type: 'object', properties: {
          storyFile: { type: 'string' },
        }, required: ['storyFile'],
      }}
    )

    log('[ds-compose]   Section story: ' + (sectionStory?.storyFile ?? 'N/A'))
    return { name: section.name, primitives: primitiveResults, storyFile: sectionStory?.storyFile }
  })()
))

const successfulSections = sectionResults.filter(s => s?.storyFile)
log('[ds-compose] ' + successfulSections.length + '/' + sections.length + ' sections completed')

// ==========================================================================
// Phase 3: Compose Showcase
// ==========================================================================
phase('Compose Showcase')
log('[ds-compose] Phase 3: Composing Showcase.stories.tsx')

const sectionPaths = successfulSections
  .map(s => s.storyFile)
  .filter(Boolean)
  .map(f => f.replace(codeDir + '/', '').replace('.stories.tsx', ''))
  .map(name => codeDir + '/' + name + '.stories.tsx')

const greenResult = await agent(
  'You are creating the Showcase.stories.tsx for "' + dsId + '" design system.\n\n' +
  'The following section stories were created:\n' +
  sectionPaths.map(f => '  - ' + f).join('\n') + '\n\n' +
  'Read each section story file to understand what it renders.\n' +
  'Read ' + dsPath + '/tokens.css for token references.\n' +
  'Read ' + dsPath + '/reference-example.html if it exists for layout reference.\n\n' +
  'Create ' + codeDir + '/Showcase.stories.tsx that:\n\n' +
  '1. Imports each section as a React component from its .stories.tsx file\n' +
  '2. Arranges sections in order matching the reference-example.html layout\n' +
  '3. Wraps everything in a full-page layout using var(--color-surface) background\n' +
  '4. Uses var(--token-*) for ALL styling - no raw hex values\n' +
  '5. Exports as: title: Design System/' + dsId + '\n' +
  '6. Matches the reference visual layout as closely as possible\n\n' +
  'IMPORTANT: Write the file using the Write tool.\n' +
  'Return: { filePath: string }',
  { label: 'green-showcase:' + dsId, phase: 'Compose Showcase', schema: {
    type: 'object', properties: {
      filePath: { type: 'string' },
    }, required: ['filePath'],
  }}
)

log('[ds-compose] Showcase: ' + (greenResult?.filePath ?? 'N/A'))

// ==========================================================================
// Phase 4: Verify all tests
// ==========================================================================
phase('Verify all')
log('[ds-compose] Phase 4: Running all tests')

let allPassed = false
let verifyAttempts = 0

while (!allPassed && verifyAttempts < maxAttempts) {
  verifyAttempts++
  log('[ds-compose] Test run ' + verifyAttempts + '/' + maxAttempts)

  const verifyResult = await agent(
    'Run all design system tests and report results.\n\n' +
    'Steps:\n' +
    '1. Run: npx vitest run ' + testsDir + '/ 2>&1 || true\n' +
    '2. Read the output\n' +
    '3. Report: did all pass? how many? which failed?\n\n' +
    'If tests FAILED:\n' +
    '- Read the failure output\n' +
    '- Fix the issue (component or test)\n' +
    '- Re-run until all pass\n\n' +
    'Return: { passed: true/false, total: number, passedCount: number, failed: string[] }',
    { label: 'verify-all:' + dsId, phase: 'Verify all', schema: {
      type: 'object', properties: {
        passed: { type: 'boolean' },
        total: { type: 'number' },
        passedCount: { type: 'number' },
        failed: { type: 'array', items: { type: 'string' } },
      }, required: ['passed'],
    }}
  )

  allPassed = verifyResult?.passed ?? false
  if (allPassed) {
    log('[ds-compose] All ' + (verifyResult?.passedCount ?? '?') + ' tests passed')
  } else {
    log('[ds-compose] ' + (verifyResult?.failed?.length ?? '?') + ' tests failed, attempt ' + verifyAttempts)
  }
}

// ==========================================================================
// Summary
// ==========================================================================
log('[ds-compose] Complete: "' + dsId + '"')
log('[ds-compose]   Sections: ' + successfulSections.length + '/' + sections.length)
log('[ds-compose]   Showcase: ' + (greenResult?.filePath ?? 'N/A'))
log('[ds-compose]   Tests: ' + (allPassed ? 'all passing' : 'some failing'))

return {
  overviewFile: greenResult?.filePath,
  sections: successfulSections.map(s => s.name),
  visualPassed: allPassed,
  testsPassed: allPassed,
}
