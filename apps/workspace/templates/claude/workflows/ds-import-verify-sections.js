// ds-import-verify-sections.js
// Workflow #10 in the ds-import-* DAG.
//
// Verifies each section against its preview crop in PARALLEL, capped at
// VERIFY_CONCURRENCY=4. Distinct storyIds per section — Storybook serves them
// concurrently. This replaces the sequential per-section loop in
// This replaces the sequential per-section loop that was the single biggest
// wall-clock bottleneck.
//
// Inputs (meta.inputs):
//   dsId       string (required)
//   dsPath     string (required)
//   sectionSpecs  Array<{name, selector}> (required)
//   storybookUrl string (optional)
//
// Outputs (meta.outputs):
//   sectionScores  Array<{name, score, passed, iterations, componentFile}>

export const meta = {
  name: 'ds-import:verify-sections',
  description: 'Parallel section visual-diff (cap=4); distinct storyIds, no Storybook contention.',
  inputs: {
    dsId: 'kebab-case id',
    dsPath: 'design-systems/<dsId>',
    sectionSpecs: 'Array<{name, selector}>',
    storybookUrl: 'optional override',
  },
  outputs: {
    sectionScores: 'Array<{name, score, passed, iterations, componentFile}>',
  },
  phases: [
    { title: 'Storybook check', detail: 'Wait for HMR settle + verify Storybook is up' },
    { title: 'Diff sections', detail: 'Parallel visual-diff across sections (cap=4)' },
  ],
}

// ── Inline helpers (import() not available in workflow harness) ───────────
const THRESHOLD = 98
const MAX_ITERATIONS = 4
const VERIFY_CONCURRENCY = 4
const DEFAULT_STORYBOOK_URL = 'http://localhost:6006'
function parsedArgs(raw) {
  if (raw == null) return {}
  if (typeof raw === 'string') { try { return JSON.parse(raw) } catch { return {} } }
  if (typeof raw === 'object') return raw
  return {}
}
function _storybookUrl(a) { return a.storybookUrl || DEFAULT_STORYBOOK_URL }
function slugify(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9-]/g, '') }
function sectionStoryId(n) { return 'pages-overview--section-' + slugify(n) }
async function pLimit(limit, thunks) {
  if (!Array.isArray(thunks)) return []
  const cap = Math.max(1, limit || 1), results = new Array(thunks.length)
  let next = 0
  async function worker() {
    while (true) {
      const i = next++
      if (i >= thunks.length) return
      try { results[i] = await thunks[i]() } catch { results[i] = null }
    }
  }
  const workers = []
  for (let w = 0; w < Math.min(cap, thunks.length); w++) workers.push(worker())
  await Promise.all(workers)
  return results
}

const _args = parsedArgs(args)
const dsId = _args.dsId
const dsPath = _args.dsPath
const sectionSpecs = Array.isArray(_args.sectionSpecs) ? _args.sectionSpecs : []
const STORYBOOK_URL = _storybookUrl(_args)
if (!dsId || !dsPath) {
  throw new Error('ds-import:verify-sections: dsId and dsPath are required')
}
if (sectionSpecs.length === 0) {
  log('[ds-import:verify-sections] No sections — nothing to verify')
  return { sectionScores: [] }
}

const previewPath = dsPath + '/reference-example.html'
const codeDir = dsPath + '/code'

log('[ds-import:verify-sections] Verifying ' + sectionSpecs.length + ' sections (cap=' + VERIFY_CONCURRENCY + ')')

// ============================================================
// PHASE 1: STORYBOOK CHECK — single health probe before fan-out
// ============================================================
phase('Storybook check')

const sbCheck = await agent(
  'Wait for Storybook HMR to settle, then verify it is up.\n\n' +
  'Steps:\n' +
  '1. Touch the manifest to trigger HMR: touch "' + dsPath + '/manifest.json" 2>&1\n' +
  '2. Wait briefly: sleep 2\n' +
  '3. Check Storybook: curl -s -o /dev/null -w "%{http_code}" ' + STORYBOOK_URL + '/iframe.html 2>&1 || echo "0"\n\n' +
  'Return "ready" if HTTP 200; "failed" otherwise.',
  { label: 'sb-check:sections', phase: 'Storybook check' }
)

const storybookReady = String(sbCheck || '').toLowerCase().includes('ready')
if (!storybookReady) {
  log('[ds-import:verify-sections] Storybook unavailable — skipping all section verify')
  return {
    sectionScores: sectionSpecs.map(s => ({
      name: s.name, score: 0, passed: false, iterations: 0,
      componentFile: 'Overview' + s.name + '.tsx',
    })),
  }
}

// ============================================================
// PHASE 2: DIFF SECTIONS — parallel, bounded
// ============================================================
phase('Diff sections')

const diffTasks = sectionSpecs.map((section) => async () => {
  const storyId = sectionStoryId(section.name)
  const componentFile = 'Overview' + section.name + '.tsx'
  const outputPath = codeDir + '/' + componentFile
  let bestScore = 0
  let iterations = 0
  let fixHistory = []

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    iterations = i + 1

    const diffResult = await agent(
      'Visual diff for section "' + section.name + '" (iter ' + iterations + ').\n\n' +
      'Command: emdesign visual-diff "' + previewPath + '" "' +
      STORYBOOK_URL + '/iframe.html?id=' + storyId + '&viewMode=story" ' +
      '--viewport 1280x720 --json 2>&1\n\n' +
      'Return JSON: { "score": NUMBER, "feedback": ARRAY }',
      {
        label: 'diff-section:' + section.name + '-iter' + iterations, phase: 'Diff sections',
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
    const feedback = diffResult?.feedback ?? []
    bestScore = Math.max(bestScore, currentScore)
    log('[ds-import:verify-sections] ' + section.name + ' iter ' + iterations + ': ' +
      currentScore.toFixed(1) + '%' + (currentScore >= THRESHOLD ? ' ✅' : ' ❌'))

    if (currentScore >= THRESHOLD) break

    if (i < MAX_ITERATIONS - 1 && feedback.length > 0) {
      fixHistory = fixHistory.concat(feedback.slice(0, 5))
      await agent(
        'Fix section "' + section.name + '" (score: ' + currentScore.toFixed(1) + '%, target: ' + THRESHOLD + '%).\n\n' +
        'DOM differences:\n' + JSON.stringify(feedback.slice(0, 10), null, 2) + '\n\n' +
        'Fix:\n- "' + outputPath + '"\n- Any primitive in "' + codeDir + '/" that needs adjustment\n\n' +
        'Match preview at "' + previewPath + '" selector: ' + section.selector + '\n' +
        'Previously attempted fixes: ' + JSON.stringify(fixHistory.slice(-3)) + '\n\n' +
        'Return "fixed".',
        { label: 'fix-section:' + section.name + '-iter' + iterations, phase: 'Diff sections' }
      )
    }
  }

  return { name: section.name, score: bestScore, passed: bestScore >= THRESHOLD, iterations, componentFile }
})

const results = await pLimit(VERIFY_CONCURRENCY, diffTasks)
const sectionScores = []
for (const r of results) {
  if (r) sectionScores.push(r)
}

const passed = sectionScores.filter(s => s.passed).length
log('[ds-import:verify-sections] ' + passed + '/' + sectionScores.length + ' sections passed')

return { sectionScores }