// ds-compose-overview.js
// Compose all completed section components into the Overview page.
// Takes the list of section results from ds-reconstruct-section pipeline,
// creates Overview.tsx importing all sections, and Overview.stories.tsx.
//
// Called by ds-reconstruct-overview:
//   workflow('ds-compose-overview', { dsId, dsPath, sectionResults })

export const meta = {
  name: 'ds-compose-overview',
  description: 'Compose section components into Overview.tsx + stories.',
  phases: [
    { title: 'Compose', detail: 'Create Overview.tsx with all sections' },
    { title: 'Stories', detail: 'Create Overview.stories.tsx' },
  ],
}

const parsedArgs = typeof args === 'string' ? JSON.parse(args) : (args || {})
const { dsId, dsPath, sectionResults } = parsedArgs
if (!dsId || !dsPath || !sectionResults) throw new Error('ds-compose-overview: dsId, dsPath, and sectionResults are required')

const codeDir = dsPath + '/code'
const passedSections = sectionResults.filter((s: any) => s && s.componentFile).map((s: any) => ({
  name: s.sectionName,
  file: s.componentFile,
  score: s.score ?? 0,
  passed: s.passed ?? false,
}))

log('[ds-compose-overview] Composing ' + passedSections.length + ' sections into Overview page for "' + dsId + '"')
for (const s of passedSections) {
  const icon = s.passed ? '✅' : '⚠️'
  log('  ' + icon + ' ' + s.name + ' (' + s.score + '%)')
}

// ===== COMPOSE =====
phase('Compose')
log('[ds-compose-overview] Creating Overview.tsx')

const composeResult = await agent(
  'Create the Overview page for DS "' + dsId + '" by composing all section components.\n\n' +
  'Available section components in "' + codeDir + '":\n' +
  passedSections.map(s => '  - Overview' + s.name + '.tsx (score: ' + s.score + '%)').join('\n') + '\n\n' +
  'Step 1: Write "' + codeDir + '/Overview.tsx":\n' +
  '  - Import all Overview* components from their files (e.g. "./OverviewHero")\n' +
  '  - Render them in the SAME ORDER as the sections appear in the preview\n' +
  '  - Use a clean vertical layout with the page stretching full height\n' +
  '  - Use bg-surface for page background\n' +
  '  - No raw hex colors anywhere — only token classes and CSS vars\n\n' +
  'Step 2: Ensure the component is exported as a named export "Overview" ' +
  'with an optional className prop interface.\n\n' +
  'Write to "' + codeDir + '/Overview.tsx" via Write tool.\n' +
  'Return "OK" with component count.',
  { label: 'compose:' + dsId, phase: 'Compose' }
)

log('[ds-compose-overview] Overview.tsx written')

// ===== STORIES =====
phase('Stories')
log('[ds-compose-overview] Creating Overview.stories.tsx')

const storiesResult = await agent(
  'Create the Storybook story for the Overview page of DS "' + dsId + '".\n\n' +
  'Read "' + codeDir + '/Overview.tsx" to understand the component.\n\n' +
  'Write "' + codeDir + '/Overview.stories.tsx" with:\n' +
  '  - title: "Pages/Overview"\n' +
  '  - component: Overview\n' +
  '  - parameters: { layout: "fullscreen" }\n' +
  '  - tags: ["autodocs"]\n' +
  '  - A Default story rendering the Overview component\n\n' +
  'Use the Write tool. Return "OK".',
  { label: 'stories:' + dsId, phase: 'Stories' }
)

log('[ds-compose-overview] Overview.stories.tsx written')

// Verify files exist
const overviewCheck = await agent(
  'Verify the Overview files were created.\n' +
  'Run: ls -la "' + codeDir + '/Overview.tsx" "' + codeDir + '/Overview.stories.tsx" 2>&1\n' +
  'Return file sizes.',
  { label: 'verify:' + dsId, phase: 'Stories' }
)

log('[ds-compose-overview] Files: ' + String(overviewCheck || '').slice(0, 200))

return {
  overviewFile: codeDir + '/Overview.tsx',
  storiesFile: codeDir + '/Overview.stories.tsx',
  sectionCount: passedSections.length,
  sections: passedSections.map(s => ({ name: s.name, score: s.score, passed: s.passed })),
  avgScore: passedSections.length > 0
    ? Math.round(passedSections.reduce((sum, s) => sum + s.score, 0) / passedSections.length * 100) / 100
    : 0,
}
