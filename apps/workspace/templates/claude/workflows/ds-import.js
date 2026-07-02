// ds-import.js
// Orchestrate the ds-import-* DAG: fetch -> prepare -> preview -> decompose ->
// per-component sub-workflows (RED/GREEN) -> sections -> overview -> verify.
//
// Usage: workflow('ds-import', { source, id?, name? })
//   source: "awesome/<brand>" | "git/<url>" | "project/<path>"

export const meta = {
  name: 'ds-import',
  description: 'Import DS: fetch -> prepare -> preview -> decompose -> per-component sub-workflows -> sections -> overview -> verify.',
  phases: [
    { title: 'Fetch & prepare', detail: 'Fetch DESIGN.md, generate tokens/css, skills, build-context' },
    { title: 'Preview & decompose', detail: 'Fetch preview HTML, decompose into sections + component specs' },
    { title: 'Build primitives', detail: 'Per-component sub-workflows (RED/GREEN isolated per component)' },
    { title: 'Build sections', detail: 'Compose section stories from primitives' },
    { title: 'Compose overview', detail: 'Build and verify Showcase.stories.tsx' },
    { title: 'Final verify', detail: 'Run all tests, fix until pass' },
  ],
}

// ── Args ──────────────────────────────────────────────────────────────
const parsedArgs = typeof args === 'string' ? JSON.parse(args) : (args || {})
const { source, id: explicitId, name, cwd } = parsedArgs
if (!source) throw new Error('[ds-import] source is required')

const BASE = cwd || process.cwd()
// Monorepo root is parent of the example dir (when running from examples/<name>/)
const MONOREPO = BASE.replace(/\/examples\/[^/]+$/, '')
const WORKFLOWS = MONOREPO + '/apps/workspace/templates/claude/workflows'
const brand = source.replace('awesome/', '')
const dsId = explicitId || brand.toLowerCase().replace(/[^a-z0-9-]/g, '-')
const dsName = name || dsId
const dsPath = BASE + '/design-systems/' + dsId
const codeDir = dsPath + '/code'
const testsDir = dsPath + '/__tests__'

// ==========================================================================
// Phase 1: Fetch & prepare
// ==========================================================================
phase('Fetch & prepare')
log('[ds-import] Phase 1: Fetch + prepare for "' + dsName + '" (' + dsId + ')')

// 1a. Fetch the DESIGN.md
log('[ds-import] Running ds-import:fetch sub-workflow...')
const fetchResult = await workflow({
  scriptPath: WORKFLOWS + '/ds-import-fetch.js'
}, { source, id: dsId, name: dsName })

const resolvedId = fetchResult?.dsId || dsId
const resolvedPath = fetchResult?.dsPath || dsPath
log('[ds-import] Fetch result: id=' + resolvedId + ', path=' + resolvedPath)

// 1b. Prepare: generate tokens.css, skills, build-context
log('[ds-import] Running ds-import:prepare sub-workflow...')
const prepareResult = await workflow({
  scriptPath: WORKFLOWS + '/ds-import-prepare.js'
}, {
  dsId: resolvedId,
  dsPath: resolvedPath,
  mdPath: fetchResult?.mdPath || resolvedPath + '/DESIGN.md',
  fetchedName: dsName,
})

const tokensPath = prepareResult?.tokensPath || resolvedPath + '/tokens.css'
const manifestPath = prepareResult?.manifestPath || resolvedPath + '/manifest.json'
log('[ds-import] Prepare complete: tokens=' + tokensPath + ', manifest=' + manifestPath)

// ==========================================================================
// Phase 2: Preview & decompose
// ==========================================================================
phase('Preview & decompose')
log('[ds-import] Phase 2: Fetch preview + decompose into sections/component specs')

// 2a. Fetch reference preview HTML
log('[ds-import] Running ds-import:preview sub-workflow...')
const previewResult = await workflow({
  scriptPath: WORKFLOWS + '/ds-import-preview.js'
}, {
  dsId: resolvedId,
  dsPath: resolvedPath,
  source: source,
  brand: brand,
})

const previewPath = previewResult?.previewPath || resolvedPath + '/reference-example.html'
log('[ds-import] Preview: ' + previewPath)

// 2b. Decompose preview into sections + component specs
log('[ds-import] Running ds-import:decompose-preview sub-workflow...')
const decomposeResult = await workflow({
  scriptPath: WORKFLOWS + '/ds-import-decompose-preview.js'
}, {
  dsId: resolvedId,
  dsPath: resolvedPath,
  previewPath: previewPath,
})

const sections = decomposeResult?.sections || []
const componentSpecs = decomposeResult?.componentSpecs || []
log('[ds-import] Decompose: ' + (sections.length) + ' sections, ' + (componentSpecs.length) + ' component specs')

if (componentSpecs.length === 0 && sections.length === 0) {
  log('[ds-import] WARNING: No components or sections found. Using fallback defaults.')
}

// ==========================================================================
// Phase 3: Build primitives — each component as a SEPARATE SUB-WORKFLOW
// ==========================================================================
phase('Build primitives')
log('[ds-import] Phase 3: Building ' + componentSpecs.length + ' primitives (each as sub-workflow)')

const primitiveResults = []
if (componentSpecs.length > 0) {
  // Each primitive gets its OWN ISOLATED sub-workflow via ds-import:build-element
  const thunks = componentSpecs.map((spec) => () =>
    workflow({
      scriptPath: WORKFLOWS + '/ds-import-build-element.js'
    }, {
      dsId: resolvedId,
      dsPath: resolvedPath,
      element: {
        name: spec.name,
        selector: spec.selector || '',
        description: spec.description || spec.htmlContext || '',
      },
      kind: 'component',
    })
  )

  // Run all per-component sub-workflows in parallel (capped by runtime)
  const results = await parallel(thunks)
  for (let i = 0; i < results.length; i++) {
    const r = results[i]
    if (r?.built) {
      primitiveResults.push({ name: componentSpecs[i].name, status: 'built', file: r.outputFile })
      log('[ds-import]   Component "' + componentSpecs[i].name + '" built: ' + r.outputFile)
    } else {
      primitiveResults.push({ name: componentSpecs[i].name, status: 'failed' })
      log('[ds-import]   Component "' + componentSpecs[i].name + '" FAILED')
    }
  }
}

// Also craft primitives via ds-import-craft-primitives for the full pipeline
if (componentSpecs.length > 0) {
  log('[ds-import] Running ds-import:craft-primitives sub-workflow (parallel authoring)...')
  const craftResult = await workflow({
    scriptPath: WORKFLOWS + '/ds-import-craft-primitives.js'
  }, {
    dsId: resolvedId,
    dsPath: resolvedPath,
    previewPath: previewPath,
    componentSpecs: componentSpecs,
  })
  log('[ds-import] Craft result: ' + (craftResult?.authoredCount || 0) + ' authored, ' + (craftResult?.reusedCount || 0) + ' reused')
}

// ==========================================================================
// Phase 4: Build sections
// ==========================================================================
phase('Build sections')
log('[ds-import] Phase 4: Building ' + sections.length + ' section stories')

if (sections.length > 0) {
  const sectionResult = await workflow({
    scriptPath: WORKFLOWS + '/ds-import-build-section.js'
  }, {
    dsId: resolvedId,
    dsPath: resolvedPath,
    sections: sections,
    codeDir: codeDir,
  })
  log('[ds-import] Sections built: ' + (sectionResult?.builtCount || 0) + '/' + sections.length)

  // Verify sections
  log('[ds-import] Verifying sections...')
  await workflow({
    scriptPath: WORKFLOWS + '/ds-import-verify-sections.js'
  }, {
    dsId: resolvedId,
    dsPath: resolvedPath,
  })
}

// ==========================================================================
// Phase 5: Compose overview
// ==========================================================================
phase('Compose overview')
log('[ds-import] Phase 5: Composing overview')

const overviewResult = await workflow({
  scriptPath: WORKFLOWS + '/ds-import-build-overview.js'
}, {
  dsId: resolvedId,
  dsPath: resolvedPath,
  sections: sections,
})

log('[ds-import] Overview: ' + (overviewResult?.overviewFile || resolvedPath + '/code/Showcase.stories.tsx'))

// Verify overview
log('[ds-import] Verifying overview...')
await workflow({
  scriptPath: WORKFLOWS + '/ds-import-verify-overview.js'
}, {
  dsId: resolvedId,
  dsPath: resolvedPath,
})

// ==========================================================================
// Phase 6: Final verify
// ==========================================================================
phase('Final verify')
log('[ds-import] Phase 6: Running final verification')

// Verify leaves
log('[ds-import] Verifying leaves...')
const leavesResult = await workflow({
  scriptPath: WORKFLOWS + '/ds-import-verify-leaves.js'
}, {
  dsId: resolvedId,
  dsPath: resolvedPath,
})

// Final test run
log('[ds-import] Running all tests...')
const testResult = await agent(
  'Run all tests for the "' + resolvedId + '" design system and report results.\n\n' +
  'Steps:\n' +
  '1. Run: npx vitest run ' + testsDir + '/ 2>&1 || true\n' +
  '2. Count passing/failing\n' +
  '3. If any fail, fix and re-run\n\n' +
  'Return: { passed: boolean, total: number, passedCount: number, failed: string[], fixed: string[] }',
  { label: 'final-verify:' + resolvedId, phase: 'Final verify', schema: {
    type: 'object', properties: {
      passed: { type: 'boolean' },
      total: { type: 'number' },
      passedCount: { type: 'number' },
      failed: { type: 'array', items: { type: 'string' } },
      fixed: { type: 'array', items: { type: 'string' } },
    }, required: ['passed'],
  }}
)

const allPassed = testResult?.passed ?? false
log('[ds-import] Final tests: ' + (allPassed ? 'ALL PASSING' : 'SOME FAILING'))

// ==========================================================================
// Summary
// ==========================================================================
log('')
log('[ds-import] ===== IMPORT COMPLETE: ' + dsName + ' =====')
log('[ds-import]   Design system: ' + resolvedPath)
log('[ds-import]   Components: ' + primitiveResults.filter(r => r.status === 'built').length + ' built, ' +
  primitiveResults.filter(r => r.status === 'failed').length + ' failed')
log('[ds-import]   Sections: ' + sections.length)
log('[ds-import]   Overview: ' + resolvedPath + '/code/Showcase.stories.tsx')
log('[ds-import]   Tests: ' + (allPassed ? 'ALL PASSING' : 'SOME FAILING'))
log('[ds-import]   Status: ' + (allPassed ? 'READY' : 'NEEDS FIXES'))

return {
  id: resolvedId,
  name: dsName,
  path: resolvedPath,
  primitivesBuilt: primitiveResults.filter(r => r.status === 'built').length,
  primitivesFailed: primitiveResults.filter(r => r.status === 'failed').length,
  sectionsCount: sections.length,
  allTestsPass: allPassed,
  status: allPassed ? 'ready' : 'needs-fixes',
}
