// ds-import.js
// Top-level orchestrator for the ds-import-* DAG.
//
// Simplified pipeline (taste merged into prepare, no recursion, single verify pass):
//   fetch → prepare (HARD GATE, incl. taste dials + build-context.txt)
//        → preview → decompose-preview → craft-primitives
//        → build-sections (parallel, one agent per section, no inline verify)
//        → verify-sections (parallel, cap=4, SINGLE verification point)
//        → build-overview → verify-overview
//
// CLI surface:
//   workflow('ds-import', { source, id?, name?, description? })
//     source: 'awesome/<brand>' | 'http(s)://...' | '/abs/path'
//
// Returns:
//   { id, name, path, previewPath, tokens, primitives, validated, overviewScore, taste }

export const meta = {
  name: 'ds-import',
  description: 'Import DESIGN.md into a complete, validated design system with visual verification.',
  phases: [
    { title: 'Fetch', detail: 'Fetch DESIGN.md from source' },
    { title: 'Prepare', detail: 'HARD GATE: settle DS contract + taste + build-context.txt' },
    { title: 'Preview', detail: 'Fetch/generate reference-example.html' },
    { title: 'Decompose', detail: 'Decompose preview into sections + component specs' },
    { title: 'Craft primitives', detail: 'Parallel primitive authoring with reuse-before-author' },
    { title: 'Build sections', detail: 'Parallel section composition (no recursion, no inline verify)' },
    { title: 'Verify sections', detail: 'Single parallel visual-diff pass across sections (cap=4)' },
    { title: 'Compose', detail: 'Build Overview.tsx + stories' },
    { title: 'Verify overview', detail: 'Single full-page visual diff' },
  ],
}

// ── Inline helpers
function parsedArgs(raw) {
  if (raw == null) return {}
  if (typeof raw === 'string') { try { return JSON.parse(raw) } catch { return {} } }
  if (typeof raw === 'object') return raw
  return {}
}
const WF = 'apps/workspace/templates/claude/workflows/'
function wf(name) { return { scriptPath: WF + name + '.js' } }

const _args = parsedArgs(args)
const { source, id: explicitId, name, description } = _args
if (!source) throw new Error('ds-import: source is required')

// ============================================================
// PHASE 1: FETCH
// ============================================================
phase('Fetch')
log('[ds-import] source=' + source)

const fetchResult = await workflow(wf('ds-import-fetch'), { source, id: explicitId, name, description })
const { dsId, dsPath, mdPath, fetchedName, fetchedDescription, brand } = fetchResult
log('[ds-import] DS: id="' + dsId + '", name="' + fetchedName + '"')

// ============================================================
// PHASE 2: PREPARE — HARD GATE (incl. taste + build-context.txt)
// ============================================================
phase('Prepare')
log('[ds-import] Settling DS contract + taste')

const prepareResult = await workflow(wf('ds-import-prepare'), {
  dsId, dsPath, mdPath, fetchedName, fetchedDescription,
})
log('[ds-import] Contract settled. Taste: V' + prepareResult.taste.VARIANCE +
  ' M' + prepareResult.taste.MOTION + ' D' + prepareResult.taste.DENSITY)

// ============================================================
// PHASE 3: PREVIEW (standalone — taste merged into prepare)
// ============================================================
phase('Preview')
log('[ds-import] Fetching/generating preview')

const previewResult = await workflow(wf('ds-import-preview'), {
  dsId, dsPath, source, brand,
})
log('[ds-import] Preview: ' + previewResult.previewPath + ' (' + previewResult.previewBytes + ' bytes)')

// ============================================================
// PHASE 4: DECOMPOSE PREVIEW
// ============================================================
phase('Decompose')
log('[ds-import] Decomposing preview')

const decomposeResult = await workflow(wf('ds-import-decompose-preview'), {
  dsId, dsPath, previewPath: previewResult.previewPath,
})
const { sections, componentSpecs } = decomposeResult
log('[ds-import] Sections=' + sections.length + ' componentSpecs=' + componentSpecs.length)

// ============================================================
// PHASE 5: CRAFT PRIMITIVES (parallel, reuse-before-author)
// ============================================================
phase('Craft primitives')
log('[ds-import] Crafting ' + componentSpecs.length + ' primitives')

const craftResult = await workflow(wf('ds-import-craft-primitives'), {
  dsId, dsPath, previewPath: previewResult.previewPath, componentSpecs,
})
log('[ds-import] Primitives: reused=' + craftResult.reusedCount + ' authored=' + craftResult.authoredCount)

// ============================================================
// PHASE 6: BUILD SECTIONS (parallel, ONE agent per section, NO inline verify)
// ============================================================
phase('Build sections')
log('[ds-import] Building ' + sections.length + ' sections (parallel, no recursion)')

const sectionResults = await parallel(sections.map(section => () =>
  workflow(wf('ds-import-build-section'), { dsId, dsPath, section })
))
log('[ds-import] Sections built: ' + sectionResults.filter(Boolean).length + '/' + sections.length)

// ============================================================
// PHASE 7: VERIFY SECTIONS (single parallel visual-diff, cap=4)
// ============================================================
phase('Verify sections')
log('[ds-import] Verifying sections (single pass, cap=4)')

const verifySectionsResult = await workflow(wf('ds-import-verify-sections'), {
  dsId, dsPath, sectionSpecs: sections, storybookUrl: 'http://localhost:6006',
})
const passedCount = verifySectionsResult.sectionScores.filter(s => s.passed).length
log('[ds-import] Sections verified: ' + passedCount + '/' + sections.length + ' passed')

// ============================================================
// PHASE 8: COMPOSE OVERVIEW
// ============================================================
phase('Compose')
log('[ds-import] Composing Overview')

const composeResult = await workflow(wf('ds-import-build-overview'), {
  dsId, dsPath, sectionResults: verifySectionsResult.sectionScores,
})
log('[ds-import] Overview: ' + composeResult.overviewFile + ' (avg score: ' + composeResult.avgScore + '%)')

// ============================================================
// PHASE 9: VERIFY OVERVIEW (single full-page diff)
// ============================================================
phase('Verify overview')
log('[ds-import] Verifying Overview')

let overviewScore = null
try {
  const verifyOverviewResult = await workflow(wf('ds-import-verify-overview'), {
    dsId, dsPath, storybookUrl: 'http://localhost:6006',
  })
  overviewScore = verifyOverviewResult.overallScore
  if (verifyOverviewResult.passed) {
    log('[ds-import] ✅ Overview PASSED at ' + overviewScore.toFixed(1) + '%')
  } else if (overviewScore > 0) {
    log('[ds-import] ⚠️  Overview at ' + overviewScore.toFixed(1) + '% — below 98% threshold')
  } else {
    log('[ds-import] Overview verification skipped (Storybook unavailable)')
  }
} catch (e) {
  log('[ds-import] Overview verification failed: ' + (e.message || 'unknown'))
  overviewScore = null
}

// ============================================================
// Graph build + cleanup (CLI commands, not agents)
// ============================================================
log('[ds-import] Run: emdesign graph build "' + dsId + '" 2>&1')
log('[ds-import] Cleanup: rm -f "' + mdPath + '"')

log('[ds-import] ✅ Complete: "' + dsId + '"')

// ============================================================
// Return shape — preserves CLI caller contract
// ============================================================
return {
  id: dsId,
  name: fetchedName,
  path: dsPath,
  previewPath: previewResult.previewPath,
  tokens: prepareResult.tokensPath,
  primitives: craftResult?.codeFiles?.length ?? 0,
  validated: prepareResult?.validateReport?.ok ?? false,
  overviewScore,
  taste: prepareResult.taste,
  sections: sectionResults.length,
  sectionScores: verifySectionsResult.sectionScores,
}
