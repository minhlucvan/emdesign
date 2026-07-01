// ds-import-build-overview.js
// Workflow #11 in the ds-import-* DAG.
//
// Composes all section components into the Overview page (Overview.tsx +
// Overview.stories.tsx). One-shot — runs after :verify-sections.
//
// Inputs (meta.inputs):
//   dsId           string (required)
//   dsPath         string (required)
//   sectionResults Array<{name, score?, passed?, componentFile?}> (required)
//
// Outputs (meta.outputs):
//   overviewFile  string — code/Overview.tsx
//   storiesFile   string — code/Overview.stories.tsx
//   sectionCount  number
//   sections      Array<{name, score, passed}>
//   avgScore      number

export const meta = {
  name: 'ds-import:build-overview',
  description: 'Compose section components into Overview.tsx + stories.',
  inputs: {
    dsId: 'kebab-case id',
    dsPath: 'design-systems/<dsId>',
    sectionResults: 'Array<{name, score, passed, componentFile}>',
  },
  outputs: {
    overviewFile: 'code/Overview.tsx',
    storiesFile: 'code/Overview.stories.tsx',
    sectionCount: 'count',
    sections: 'Array<{name, score, passed}>',
    avgScore: 'average score',
  },
  phases: [
    { title: 'Compose', detail: 'Create Overview.tsx with all sections' },
    { title: 'Stories', detail: 'Create Overview.stories.tsx' },
  ],
}

// ── Inline helpers (import() not available in workflow harness) ───────────
function parsedArgs(raw) {
  if (raw == null) return {}
  if (typeof raw === 'string') { try { return JSON.parse(raw) } catch { return {} } }
  if (typeof raw === 'object') return raw
  return {}
}

const _args = parsedArgs(args)
const dsId = _args.dsId
const dsPath = _args.dsPath
const sectionResults = Array.isArray(_args.sectionResults) ? _args.sectionResults : []
if (!dsId || !dsPath) {
  throw new Error('ds-import:build-overview: dsId and dsPath are required')
}

const codeDir = dsPath + '/code'
const overviewPath = codeDir + '/Overview.tsx'
const storiesPath = codeDir + '/Overview.stories.tsx'

const passedSections = sectionResults.filter(s => s && (s.componentFile || s.name)).map(s => ({
  name: s.sectionName || s.name,
  file: s.componentFile || ('Overview' + (s.sectionName || s.name) + '.tsx'),
  score: s.score ?? 0,
  passed: s.passed ?? false,
}))

log('[ds-import:build-overview] Composing ' + passedSections.length + ' sections for "' + dsId + '"')
for (const s of passedSections) {
  log('  ' + (s.passed ? '✅' : '⚠️') + ' ' + s.name + ' (' + s.score + '%)')
}

// ============================================================
// PHASE 1: COMPOSE — Overview.tsx
// ============================================================
phase('Compose')

await agent(
  'Create the Overview page for DS "' + dsId + '" by composing all section components.\n\n' +
  'Available section components in "' + codeDir + '":\n' +
  passedSections.map(s => '  - ' + s.file + ' (score: ' + s.score + '%)').join('\n') + '\n\n' +
  'Step 1: Write "' + overviewPath + '":\n' +
  '  - Import all Overview* components from their files (e.g. "./OverviewHero")\n' +
  '  - Render them in the SAME ORDER as the sections appear in the preview\n' +
  '  - Use a clean vertical layout with the page stretching full height\n' +
  '  - Use bg-surface for page background\n' +
  '  - No raw hex colors anywhere — only token classes and CSS vars\n\n' +
  'Step 2: Ensure the component is exported as a named export "Overview" ' +
  'with an optional className prop interface.\n\n' +
  'Write to "' + overviewPath + '" via Write tool.\n' +
  'Return "OK" with component count.',
  { label: 'compose:' + dsId, phase: 'Compose' }
)

log('[ds-import:build-overview] ' + overviewPath + ' written')

// ============================================================
// PHASE 2: STORIES — Overview.stories.tsx
// ============================================================
phase('Stories')

await agent(
  'Create the Storybook story for the Overview page of DS "' + dsId + '".\n\n' +
  'Read "' + overviewPath + '" to understand the component.\n\n' +
  'Write "' + storiesPath + '" with:\n' +
  '  - title: "Pages/Overview"\n' +
  '  - component: Overview\n' +
  '  - parameters: { layout: "fullscreen" }\n' +
  '  - tags: ["autodocs"]\n' +
  '  - A Default story rendering the Overview component\n\n' +
  'Use the Write tool. Return "OK".',
  { label: 'stories:' + dsId, phase: 'Stories' }
)

log('[ds-import:build-overview] ' + storiesPath + ' written')

// Verify files exist
const overviewCheck = await agent(
  'Verify the Overview files were created.\n' +
  'Run: ls -la "' + overviewPath + '" "' + storiesPath + '" 2>&1\n' +
  'Return file sizes.',
  { label: 'verify:' + dsId, phase: 'Stories' }
)

log('[ds-import:build-overview] Files: ' + String(overviewCheck || '').slice(0, 200))

const avgScore = passedSections.length > 0
  ? Math.round(passedSections.reduce((sum, s) => sum + (s.score || 0), 0) / passedSections.length * 100) / 100
  : 0

return {
  overviewFile: overviewPath,
  storiesFile: storiesPath,
  sectionCount: passedSections.length,
  sections: passedSections.map(s => ({ name: s.name, score: s.score, passed: s.passed })),
  avgScore,
}