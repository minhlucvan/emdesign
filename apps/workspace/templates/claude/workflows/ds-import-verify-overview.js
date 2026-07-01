// ds-import-verify-overview.js
// Workflow #12 in the ds-import-* DAG.
//
// Single full-page visual diff of the composed Overview.tsx against the
// reference preview. Runs after :build-overview + :verify-sections.
// Optional — skipped if Storybook is unavailable.
//
// Inputs (meta.inputs):
//   dsId          string (required)
//   dsPath        string (required)
//   storybookUrl  string (optional)
//
// Outputs (meta.outputs):
//   overallScore  number — best visual-diff score
//   passed        boolean — >= THRESHOLD
//   iterations    number

export const meta = {
  name: 'ds-import:verify-overview',
  description: 'Single full-page visual diff of the composed Overview against the preview.',
  inputs: {
    dsId: 'kebab-case id',
    dsPath: 'design-systems/<dsId>',
    storybookUrl: 'optional override',
  },
  outputs: {
    overallScore: 'best visual-diff score',
    passed: '>= THRESHOLD',
    iterations: 'iterations used',
  },
  phases: [
    { title: 'Storybook check', detail: 'Verify Storybook is up' },
    { title: 'Full-page diff', detail: 'Diff Overview.tsx vs preview' },
  ],
}

// ── Inline helpers (import() not available in workflow harness) ───────────
const THRESHOLD = 98
const MAX_ITERATIONS = 4
const DEFAULT_STORYBOOK_URL = 'http://localhost:6006'
const OVERVIEW_STORY_ID = 'pages-overview--default'
function parsedArgs(raw) {
  if (raw == null) return {}
  if (typeof raw === 'string') { try { return JSON.parse(raw) } catch { return {} } }
  if (typeof raw === 'object') return raw
  return {}
}
function _storybookUrl(a) { return a.storybookUrl || DEFAULT_STORYBOOK_URL }

const _args = parsedArgs(args)
const dsId = _args.dsId
const dsPath = _args.dsPath
const STORYBOOK_URL = _storybookUrl(_args)
if (!dsId || !dsPath) {
  throw new Error('ds-import:verify-overview: dsId and dsPath are required')
}

const previewPath = dsPath + '/reference-example.html'
const codeDir = dsPath + '/code'

log('[ds-import:verify-overview] Full-page visual diff for "' + dsId + '"')

// ============================================================
// PHASE 1: STORYBOOK CHECK
// ============================================================
phase('Storybook check')

const sbCheck = await agent(
  'Check if Storybook is running at ' + STORYBOOK_URL + '.\n' +
  'Run: curl -s -o /dev/null -w "%{http_code}" ' + STORYBOOK_URL + '/iframe.html 2>&1 || echo "0"\n' +
  'Return "ready" if HTTP 200.',
  { label: 'sb-check:overview', phase: 'Storybook check' }
)

const storybookReady = String(sbCheck || '').toLowerCase().includes('ready')
if (!storybookReady) {
  log('[ds-import:verify-overview] Storybook unavailable — skipping full-page diff')
  return { overallScore: 0, passed: false, iterations: 0 }
}

// ============================================================
// PHASE 2: FULL-PAGE DIFF
// ============================================================
phase('Full-page diff')

let bestScore = 0
let iterations = 0

for (let i = 0; i < MAX_ITERATIONS; i++) {
  iterations = i + 1
  log('[ds-import:verify-overview] Iter ' + iterations + '/' + MAX_ITERATIONS)

  const diffResult = await agent(
    'Run final full-page visual diff.\n\n' +
    'Command: emdesign visual-diff "' + previewPath + '" "' +
    STORYBOOK_URL + '/iframe.html?id=' + OVERVIEW_STORY_ID + '&viewMode=story" ' +
    '--viewport 1280x720 --json 2>&1\n\n' +
    'Return JSON: { "score": NUMBER, "feedback": ARRAY }',
    {
      label: 'diff-overview:iter' + iterations, phase: 'Full-page diff',
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
  log('[ds-import:verify-overview] Score: ' + currentScore.toFixed(1) + '%' +
    (currentScore >= THRESHOLD ? ' ✅' : ' ❌'))

  if (currentScore >= THRESHOLD) break

  if (i < MAX_ITERATIONS - 1) {
    const feedback = diffResult?.feedback ?? []
    await agent(
      'Fix Overview page (score: ' + currentScore.toFixed(1) + '%, target: ' + THRESHOLD + '%).\n\n' +
      'Fix:\n- "' + codeDir + '/Overview.tsx"\n- Any Overview<Name>.tsx in "' + codeDir + '/"\n' +
      'Match preview at "' + previewPath + '"\n\n' +
      'Differences:\n' + JSON.stringify(feedback.slice(0, 10), null, 2) + '\n\n' +
      'Return "fixed".',
      { label: 'fix-overview:iter' + iterations, phase: 'Full-page diff' }
    )
  }
}

const passed = bestScore >= THRESHOLD
log('[ds-import:verify-overview] Final: ' + bestScore.toFixed(1) + '% (' + (passed ? 'PASS' : 'BELOW THRESHOLD') + ')')

return {
  overallScore: bestScore,
  passed,
  iterations,
}