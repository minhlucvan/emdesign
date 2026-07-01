// ds-import-preview.js
// Workflow #5 in the ds-import-* DAG.
//
// Fetch the preview.html for the DS — either from the upstream source (when the
// source is 'awesome/<brand>') or by generating one from DESIGN.md + tokens.css
// (for local / URL sources). Writes to design-systems/<id>/reference-example.html.
//
// Runs in PARALLEL with :taste-profile and :craft-primitives after :prepare.
//
// Inputs (meta.inputs):
//   dsId     string (required)
//   dsPath   string (required)
//   source   string (required) — same source format as :fetch (used to detect awesome/*)
//   brand    string (optional) — if already known from :fetch
//
// Outputs (meta.outputs):
//   previewPath  string — design-systems/<id>/reference-example.html
//   previewBytes number — file size in bytes
//   generated    boolean — true if generated, false if fetched

export const meta = {
  name: 'ds-import:preview',
  description: 'Fetch or generate reference-example.html for the DS.',
  inputs: {
    dsId: 'kebab-case id',
    dsPath: 'design-systems/<dsId>',
    source: "awesome/<brand> | http(s)://... | /abs/path",
    brand: 'optional pre-resolved brand (when called from :fetch)',
  },
  outputs: {
    previewPath: 'reference-example.html path',
    previewBytes: 'file size',
    generated: 'true if generated, false if fetched',
  },
  phases: [
    { title: 'Resolve', detail: 'Detect awesome vs local/URL source' },
    { title: 'Fetch or Generate', detail: 'Produce preview HTML at design-systems/<id>/reference-example.html' },
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
const source = _args.source
if (!dsId || !dsPath || !source) {
  throw new Error('ds-import:preview: dsId, dsPath, and source are required')
}

const previewPath = dsPath + '/reference-example.html'
const brand = _args.brand || (source.startsWith('awesome/') ? source.replace('awesome/', '') : '')

phase('Resolve')
log('[ds-import:preview] source=' + source + ' brand=' + (brand || '(none)'))

let previewBytes = 0
let generated = false

if (brand) {
  // Fetch from getdesign.md preview endpoint
  phase('Fetch or Generate')
  const previewUrl = 'https://getdesign.md/design-md/' + brand + '/preview.html'
  log('[ds-import:preview] Fetching from getdesign.md: ' + previewUrl)

  const fetchResult = await agent(
    'Fetch design preview from URL and save it.\n' +
    'Steps:\n1. Run: mkdir -p "' + dsPath + '"\n' +
    '2. Run: curl -sL "' + previewUrl + '" -o "' + previewPath + '"\n' +
    '3. Verify: wc -c < "' + previewPath + '"\n' +
    '4. Read and confirm the preview file content\nReturn "ok" with file size.',
    { label: 'preview-fetch:' + dsId, phase: 'Fetch or Generate' }
  )
  const out = String(fetchResult || '')
  const m = out.match(/(\d+)/)
  previewBytes = m ? parseInt(m[1], 10) : 0
  log('[ds-import:preview] Preview fetched: ' + out.slice(0, 80))
} else {
  // Generate from DESIGN.md + tokens.css
  phase('Fetch or Generate')
  log('[ds-import:preview] Generating preview from design')
  const genResult = await agent(
    'Generate rich preview HTML for DS "' + dsId + '".\n\n' +
    'Read DESIGN.md and tokens.css, create a self-contained preview HTML.\n' +
    'Write to "' + previewPath + '" via Write tool.\n' +
    'Include: hero, color swatches, type scale, spacing scale, tokens table.\n' +
    'Return JSON: { "size": NUMBER }',
    {
      label: 'preview-gen:' + dsId, phase: 'Fetch or Generate',
      schema: {
        type: 'object',
        properties: { size: { type: 'number' } },
        required: ['size'],
      },
    }
  )
  previewBytes = genResult?.size ?? 0
  generated = true
  log('[ds-import:preview] Preview generated: ' + previewBytes + ' bytes')
}

return {
  previewPath,
  previewBytes,
  generated,
}