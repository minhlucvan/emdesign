// ds-import-build-section.js
// Simplified section builder — ONE agent per section does read + compose.
// No inline verify (verification is centralized in :verify-sections).
// No recursive sub-element building (uses @ds/ primitives + existing code/).
//
// Called by the orchestrator's parallel fan-out across sections.
//
// Inputs (meta.inputs):
//   dsId          string (required)
//   dsPath        string (required)
//   section       {name, selector, description, keyComponents[]} (required)
//
// Outputs (meta.outputs):
//   sectionName   string
//   componentFile string — 'Overview<Name>.tsx'
//   outputPath    string
//   built         boolean

export const meta = {
  name: 'ds-import:build-section',
  description: 'Build a single section by composing existing primitives (no inline verify, no recursion).',
  inputs: {
    dsId: 'kebab-case id',
    dsPath: 'design-systems/<dsId>',
    section: '{name, selector, description, keyComponents[]}',
  },
  outputs: {
    sectionName: 'name',
    componentFile: 'Overview<Name>.tsx',
    outputPath: 'absolute path',
    built: 'true if composed successfully',
  },
  phases: [
    { title: 'Read section', detail: 'Read preview HTML + check existing code/ primitives' },
    { title: 'Compose', detail: 'Author Overview<Name>.tsx from existing primitives' },
  ],
}

// ── Inline helpers
function parsedArgs(raw) {
  if (raw == null) return {}
  if (typeof raw === 'string') { try { return JSON.parse(raw) } catch { return {} } }
  if (typeof raw === 'object') return raw
  return {}
}

const _args = parsedArgs(args)
const dsId = _args.dsId
const dsPath = _args.dsPath
const section = _args.section
if (!dsId || !dsPath || !section) {
  throw new Error('ds-import:build-section: dsId, dsPath, and section are required')
}

const previewPath = dsPath + '/reference-example.html'
const buildContextPath = dsPath + '/build-context.txt'
const codeDir = dsPath + '/code'

const outputFile = 'Overview' + section.name + '.tsx'
const outputPath = codeDir + '/' + outputFile

log('[ds-import:build-section] "' + section.name + '" for DS "' + dsId + '"')

// ============================================================
// PHASE 1: READ SECTION — understand structure + check primitives
// ============================================================
phase('Read section')

const sectionInfo = await agent(
  'Analyze the "' + section.name + '" section of the preview for DS "' + dsId + '".\n\n' +
  'Step 1: Read the section from the preview at "' + previewPath + '".\n' +
  '  The section is identified by selector: ' + (section.selector || 'body') + '\n\n' +
  'Step 2: List existing primitives in "' + codeDir + '":\n' +
  '  Run: ls "' + codeDir + '"/*.tsx 2>&1\n' +
  '  Read any files that match UI components visible in this section.\n\n' +
  'Step 3: Identify which UI components are used in this section:\n' +
  '  - Existing primitives -> import from "@ds/<Name>"\n' +
  '  - Missing components -> note them (they were created in :craft-primitives step)\n\n' +
  'Expected components: ' + ((section.keyComponents || []).join(', ') || 'unknown') + '\n\n' +
  'Return JSON: {\n' +
  '  "existingPrimitives": ["Button", ...],\n' +
  '  "layoutType": "stack" | "grid" | "sidebar" | "custom",\n' +
  '  "sectionStructure": "how components are laid out"\n' +
  '}',
  {
    label: 'read-section:' + section.name, phase: 'Read section',
    schema: {
      type: 'object',
      properties: {
        existingPrimitives: { type: 'array', items: { type: 'string' } },
        layoutType: { type: 'string' },
        sectionStructure: { type: 'string' },
      },
      required: ['existingPrimitives', 'layoutType'],
    },
  }
)

const existingPrims = sectionInfo?.existingPrimitives ?? []
log('[ds-import:build-section] Primitives: ' + (existingPrims.join(', ') || '(none)'))

// ============================================================
// PHASE 2: COMPOSE — write Overview<Name>.tsx
// ============================================================
phase('Compose')

await agent(
  'Create the React component Overview' + section.name + ' for DS "' + dsId + '".\n\n' +
  'CONTEXT:\n' +
  '- cat "' + buildContextPath + '"  — compact design reference (read this first)\n' +
  '- cat "' + previewPath + '"         — reference visual\n' +
  '- ls "' + codeDir + '"/*.tsx        — available primitives\n\n' +
  'Layout: ' + (sectionInfo?.layoutType || 'stack') + '\n' +
  'Structure: ' + (sectionInfo?.sectionStructure || '') + '\n' +
  'Available primitives: ' + existingPrims.join(', ') + '\n' +
  'Selector: ' + (section.selector || 'body') + '\n\n' +
  'Write "' + outputPath + '" with:\n' +
  '1. Import primitives from "@ds/<Name>"\n' +
  '2. Compose them in a ' + (sectionInfo?.layoutType || 'stack') + ' layout matching the preview section\n' +
  '3. Use ONLY semantic token classes — NO raw hex, NO hardcoded spacing\n' +
  '4. Export as named function Overview' + section.name + '\n' +
  '5. Accept className?: string\n\n' +
  'Return "OK" with component name.',
  { label: 'compose-section:' + section.name, phase: 'Compose' }
)

log('[ds-import:build-section] ✅ Built: ' + outputFile)

return {
  sectionName: section.name,
  componentFile: outputFile,
  outputPath,
  built: true,
}
