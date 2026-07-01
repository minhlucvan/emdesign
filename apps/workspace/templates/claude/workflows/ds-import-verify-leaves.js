// ds-import-verify-leaves.js
// Workflow #9 in the ds-import-* DAG.
//
// Verifies each leaf (component) against its preview crop in PARALLEL, capped
// at VERIFY_CONCURRENCY=4 (Playwright-per-agent bound). Distinct storyIds per
// leaf so Storybook can serve them concurrently.
//
// Inputs (meta.inputs):
//   dsId       string (required)
//   dsPath     string (required)
//   leafSpecs  Array<{name, selector?}> (required) — primitives/elements to verify
//   storybookUrl string (optional)
//
// Outputs (meta.outputs):
//   leafScores  Array<{name, score, passed, iterations}>

export const meta = {
  name: 'ds-import:verify-leaves',
  description: 'Parallel leaf visual-diff (cap=4); each leaf has its own storyId.',
  inputs: {
    dsId: 'kebab-case id',
    dsPath: 'design-systems/<dsId>',
    leafSpecs: 'Array<{name, selector?}>',
    storybookUrl: 'optional override',
  },
  outputs: {
    leafScores: 'Array<{name, score, passed, iterations}>',
  },
  phases: [
    { title: 'Storybook check', detail: 'Wait for HMR settle + verify Storybook is up' },
    { title: 'Diff leaves', detail: 'Parallel visual-diff across leaves (cap=4)' },
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
function componentStoryId(n) { return 'components-' + slugify(n) + '--default' }
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
const leafSpecs = Array.isArray(_args.leafSpecs) ? _args.leafSpecs : []
const STORYBOOK_URL = _storybookUrl(_args)
if (!dsId || !dsPath) {
  throw new Error('ds-import:verify-leaves: dsId and dsPath are required')
}
if (leafSpecs.length === 0) {
  log('[ds-import:verify-leaves] No leaves — nothing to verify')
  return { leafScores: [] }
}

const previewPath = dsPath + '/reference-example.html'

log('[ds-import:verify-leaves] Verifying ' + leafSpecs.length + ' leaves (cap=' + VERIFY_CONCURRENCY + ')')

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
  { label: 'sb-check:leaves', phase: 'Storybook check' }
)

const storybookReady = String(sbCheck || '').toLowerCase().includes('ready')
if (!storybookReady) {
  log('[ds-import:verify-leaves] Storybook unavailable — skipping all leaf verify')
  return {
    leafScores: leafSpecs.map(l => ({ name: l.name, score: 0, passed: false, iterations: 0 })),
  }
}

// ============================================================
// PHASE 2: DIFF LEAVES — parallel, bounded
// ============================================================
phase('Diff leaves')

const leafScores = []

const diffTasks = leafSpecs.map((leaf) => async () => {
  const storyId = componentStoryId(leaf.name)
  let bestScore = 0
  let iterations = 0
  let fixHistory = []

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    iterations = i + 1

    const diffResult = await agent(
      'Visual diff for leaf "' + leaf.name + '" (iter ' + iterations + ').\n\n' +
      'Command: emdesign visual-diff "' + previewPath + '" "' +
      STORYBOOK_URL + '/iframe.html?id=' + storyId + '&viewMode=story" ' +
      '--viewport 1280x720 --json 2>&1\n\n' +
      'Return JSON: { "score": NUMBER, "feedback": ARRAY }',
      {
        label: 'diff-leaf:' + leaf.name + '-iter' + iterations, phase: 'Diff leaves',
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
    log('[ds-import:verify-leaves] ' + leaf.name + ' iter ' + iterations + ': ' +
      currentScore.toFixed(1) + '%' + (currentScore >= THRESHOLD ? ' ✅' : ' ❌'))

    if (currentScore >= THRESHOLD) break

    if (i < MAX_ITERATIONS - 1) {
      const feedback = diffResult?.feedback ?? []
      fixHistory = fixHistory.concat(feedback.slice(0, 5))
      await agent(
        'Fix leaf "' + leaf.name + '" (score: ' + currentScore.toFixed(1) + '%, target: ' + THRESHOLD + '%).\n\n' +
        'Fix "' + dsPath + '/code/' + leaf.name + '.tsx" to match the preview at "' +
        previewPath + '" selector: ' + (leaf.selector || '.leaf-' + leaf.name.toLowerCase()) + '\n' +
        'Previously attempted fixes: ' + JSON.stringify(fixHistory.slice(-3)) + '\n\n' +
        'Return "fixed".',
        { label: 'fix-leaf:' + leaf.name + '-iter' + iterations, phase: 'Diff leaves' }
      )
    }
  }

  return { name: leaf.name, score: bestScore, passed: bestScore >= THRESHOLD, iterations }
})

const results = await pLimit(VERIFY_CONCURRENCY, diffTasks)
for (const r of results) {
  if (r) leafScores.push(r)
}

const passed = leafScores.filter(s => s.passed).length
log('[ds-import:verify-leaves] ' + passed + '/' + leafScores.length + ' leaves passed')

return { leafScores }