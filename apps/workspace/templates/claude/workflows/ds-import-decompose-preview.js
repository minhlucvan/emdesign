// ds-import-decompose-preview.js
// Workflow #6 in the ds-import-* DAG.
//
// Reads the preview HTML and returns a structured decomposition:
//   sections[]         — visual sections of the page (Hero, Color Palette, etc.)
//   componentSpecs[]   — cross-section-deduped primitive specs to author
//
// Runs ONCE before :build-element and :build-section fan out.
//
// Inputs (meta.inputs):
//   dsId        string (required)
//   dsPath      string (required)
//   previewPath string (required) — design-systems/<id>/reference-example.html
//
// Outputs (meta.outputs):
//   sections        Array<{name, selector, description, keyComponents[]}>
//   componentSpecs  Array<{name, htmlContext, description, _sectionCount}>
//                   — deduped across sections; _sectionCount > 1 means used in multiple places
//   totalSections   number

export const meta = {
  name: 'ds-import:decompose-preview',
  description: 'Read preview HTML, decompose into sections + cross-section-deduped component specs.',
  inputs: {
    dsId: 'kebab-case id',
    dsPath: 'design-systems/<dsId>',
    previewPath: 'reference-example.html path',
  },
  outputs: {
    sections: 'Array<{name, selector, description, keyComponents[]}>',
    componentSpecs: 'deduped primitive specs',
    totalSections: 'number',
  },
  phases: [
    { title: 'Discover', detail: 'Find all visual sections in preview' },
    { title: 'Analyze sections', detail: 'Per-section analysis (existing/missing primitives)' },
    { title: 'Merge', detail: 'Cross-section dedupe of missing primitive specs' },
  ],
}

// ── Inline helpers (import() not available in workflow harness) ───────────
function parsedArgs(raw) {
  if (raw == null) return {}
  if (typeof raw === 'string') { try { return JSON.parse(raw) } catch { return {} } }
  if (typeof raw === 'object') return raw
  return {}
}
function nameKey(_n) { return String(_n || '').toLowerCase().replace(/[^a-z0-9]/g, '') }
function dedupeBy(items, keyField) {
  if (!Array.isArray(items)) return []
  const seen = new Set(), out = []
  for (const it of items) {
    if (!it || typeof it !== 'object') continue
    const k = nameKey(it[keyField || 'name'])
    if (!k || seen.has(k)) continue
    seen.add(k); out.push(it)
  }
  return out
}

const _args = parsedArgs(args)
const dsId = _args.dsId
const dsPath = _args.dsPath
const previewPath = _args.previewPath
if (!dsId || !dsPath || !previewPath) {
  throw new Error('ds-import:decompose-preview: dsId, dsPath, and previewPath are required')
}

const codeDir = dsPath + '/code'
const tokensPath = dsPath + '/tokens.css'

// ============================================================
// PHASE 1: DISCOVER — section list from preview
// ============================================================
phase('Discover')
log('[ds-import:decompose-preview] Discovering sections from preview')

const discovery = await agent(
  'Analyze the preview HTML at "' + previewPath + '" and identify every distinct visual section.\n\n' +
  'Look for: <header>, <nav>, <main>, <footer>, <section>, <article>, <aside>,\n' +
  'and <div> with distinct background/padding.\n' +
  'Also elements with id attributes (id="palette", id="typography").\n\n' +
  'Group elements that belong together visually. Read top to bottom.\n\n' +
  'For each section: name, CSS selector, description, keyComponents.\n\n' +
  'Return { "sections": [{ "name": string, "selector": string, "description": string, "keyComponents": string[] }] }',
  {
    label: 'discover:' + dsId, phase: 'Discover',
    schema: {
      type: 'object',
      properties: {
        sections: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              selector: { type: 'string' },
              description: { type: 'string' },
              keyComponents: { type: 'array', items: { type: 'string' } },
            },
            required: ['name', 'selector'],
          },
        },
      },
      required: ['sections'],
    },
  }
)

const sections = (discovery?.sections ?? []).filter(Boolean)
log('[ds-import:decompose-preview] Discovered ' + sections.length + ' sections')
for (const s of sections) {
  log('  - ' + s.name + ' [' + ((s.keyComponents || []).join(', ') || '?') + ']')
}

// ============================================================
// PHASE 2: ANALYZE — per-section primitive inventory (PARALLEL)
// ============================================================
phase('Analyze sections')
log('[ds-import:decompose-preview] Per-section analysis (parallel across ' + sections.length + ')')

const sectionAnalyses = await parallel(sections.map(section => () =>
  agent(
    'Analyze the "' + section.name + '" section of the preview for "' + dsId + '".\n\n' +
    'Preview: "' + previewPath + '"\nSelector: ' + section.selector + '\n' +
    'Description: ' + (section.description || '') + '\n\n' +
    'Step 1: Read the section HTML from the preview using the selector.\n' +
    'Step 2: List existing .tsx files in "' + codeDir + '":\n' +
    '  Run: ls "' + codeDir + '"/*.tsx 2>&1\n' +
    'Step 3: Identify UI components in this section.\n' +
    '  - Existing components: import from "@ds/<Name>"\n' +
    '  - Missing components: must be crafted as new primitives\n' +
    'Step 4: Determine layout type (stack / grid / sidebar / custom).\n\n' +
    'Return: { "existingPrimitives": string[], "missingPrimitives": [{name,htmlContext,description}], "layoutType": string, "sectionStructure": string }',
    {
      label: 'analyze:' + section.name, phase: 'Analyze sections',
      schema: {
        type: 'object',
        properties: {
          existingPrimitives: { type: 'array', items: { type: 'string' } },
          missingPrimitives: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                htmlContext: { type: 'string' },
                description: { type: 'string' },
              },
              required: ['name'],
            },
          },
          layoutType: { type: 'string' },
          sectionStructure: { type: 'string' },
        },
        required: ['existingPrimitives', 'missingPrimitives', 'layoutType'],
      },
    }
  )
))

// ============================================================
// PHASE 3: MERGE — cross-section dedupe of missing primitives
// ============================================================
phase('Merge')
const allMissing = []
const seen = new Set()
for (const a of sectionAnalyses) {
  for (const p of a?.missingPrimitives || []) {
    if (!p?.name) continue
    const k = (p.name || '').toLowerCase().replace(/[^a-z0-9]/g, '')
    if (!k || seen.has(k)) continue
    seen.add(k)
    allMissing.push({
      name: p.name,
      htmlContext: p.htmlContext || '',
      description: p.description || '',
    })
  }
}
const componentSpecs = dedupeBy(allMissing, 'name')
log('[ds-import:decompose-preview] Component specs (deduped): ' + componentSpecs.length)

return {
  sections,
  componentSpecs,
  totalSections: sections.length,
}