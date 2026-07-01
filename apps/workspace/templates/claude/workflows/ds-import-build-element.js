// ds-import-build-element.js
// Simplified leaf builder — ONE agent per element reads the preview + authors the component.
// No inline verify (verification is centralized in :verify-sections / :verify-leaves).
// No recursive sub-element calls (flat spec from :decompose-preview).
//
// Called by :craft-primitives or standalone for one-off component authoring.
//
// Inputs (meta.inputs):
//   dsId          string (required)
//   dsPath        string (required)
//   element       {name, selector, description} (required)
//   kind          'section' | 'component' (default 'component')
//
// Outputs (meta.outputs):
//   elementName   string
//   outputFile    string
//   outputPath    string
//   built         boolean

export const meta = {
  name: 'ds-import:build-element',
  description: 'Author a single element from preview as a React component (no inline verify, no recursion).',
  inputs: {
    dsId: 'kebab-case id',
    dsPath: 'design-systems/<dsId>',
    element: '{name, selector, description}',
    kind: "'section' | 'component'",
  },
  outputs: {
    elementName: 'name',
    outputFile: 'filename',
    outputPath: 'absolute path',
    built: 'true if authored',
  },
  phases: [
    { title: 'Read', detail: 'Read element HTML from preview, check existing primitives' },
    { title: 'Build', detail: 'Author the React component' },
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
const element = _args.element
const kind = _args.kind || 'component'
if (!dsId || !dsPath || !element) {
  throw new Error('ds-import:build-element: dsId, dsPath, and element are required')
}

const previewPath = dsPath + '/reference-example.html'
const buildContextPath = dsPath + '/build-context.txt'
const codeDir = dsPath + '/code'

const isSection = kind === 'section'
const outputFile = (isSection ? 'Overview' : '') + element.name + '.tsx'
const outputPath = codeDir + '/' + outputFile

log('[ds-import:build-element] ' + (isSection ? 'SECTION' : 'COMPONENT') +
  ' "' + element.name + '" → ' + outputFile)

// ============================================================
// PHASE 1: READ — understand element + check primitives
// ============================================================
phase('Read')

const analysis = await agent(
  'Analyze the "' + element.name + '" element for DS "' + dsId + '".\n\n' +
  'Preview: "' + previewPath + '"\n' +
  'Selector: ' + (element.selector || 'body') + '\n' +
  'Description: ' + (element.description || '') + '\n\n' +
  'Step 1: Read the element HTML from the preview using the selector.\n\n' +
  'Step 2: List existing primitives in "' + codeDir + '":\n' +
  '  Run: ls "' + codeDir + '"/*.tsx 2>&1\n\n' +
  'Step 3: Determine layout type and how this element is composed.\n' +
  '  - Use existing primitives from "@ds/<Name>" where possible.\n\n' +
  'Return JSON: {\n' +
  '  "existingPrimitives": ["Button", ...],\n' +
  '  "layoutType": "stack" | "grid" | "sidebar" | "custom",\n' +
  '  "structure": "description of composition"\n' +
  '}',
  {
    label: 'read:' + element.name, phase: 'Read',
    schema: {
      type: 'object',
      properties: {
        existingPrimitives: { type: 'array', items: { type: 'string' } },
        layoutType: { type: 'string' },
        structure: { type: 'string' },
      },
      required: ['existingPrimitives', 'layoutType'],
    },
  }
)

const existingPrims = analysis?.existingPrimitives ?? []
log('[ds-import:build-element] Primitives: ' + (existingPrims.join(', ') || '(none)'))

// ============================================================
// PHASE 2: BUILD — author the component
// ============================================================
phase('Build')

await agent(
  'Create the React component ' + (isSection ? 'Overview' : '') + element.name + ' for DS "' + dsId + '".\n\n' +
  'CONTEXT:\n' +
  '- cat "' + buildContextPath + '"  — compact design reference (read this first)\n' +
  '- cat "' + previewPath + '"         — reference visual\n' +
  '- ls "' + codeDir + '"/*.tsx        — siblings to compose with\n\n' +
  'Output file: "' + outputPath + '"\n' +
  'Kind: ' + (isSection ? 'Section (Overview sub-component)' : 'Primitive (reusable component)') + '\n' +
  'Layout: ' + (analysis?.layoutType || 'stack') + '\n' +
  'Available primitives: ' + existingPrims.join(', ') + '\n\n' +
  'REQUIREMENTS:\n' +
  '1. Use ONLY semantic token classes — NO raw hex, NO hardcoded spacing\n' +
  '2. Export as named function ' + (isSection ? 'Overview' : '') + element.name + '\n' +
  '3. Props interface with className?: string\n' +
  '4. Match the visual style shown in the preview\n\n' +
  'Write to "' + outputPath + '" via Write tool.\n' +
  'Return "OK" with component name.',
  { label: 'build:' + element.name, phase: 'Build' }
)

log('[ds-import:build-element] ✅ Built: ' + outputFile)

return {
  elementName: element.name,
  outputFile,
  outputPath,
  built: true,
}
