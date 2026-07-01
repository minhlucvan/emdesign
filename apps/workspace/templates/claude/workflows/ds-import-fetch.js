// ds-import-fetch.js
// Workflow #1 in the ds-import-* DAG.
//
// Fetch DESIGN.md from one of three sources and produce the canonical
// (dsId, dsPath, mdPath, fetchedName, fetchedDescription) record that every
// downstream workflow consumes. Owns frontmatter parsing + slug derivation.
//
// Inputs (meta.inputs):
//   source      string (required) — 'awesome/<brand>' | 'http(s)://...' | '/abs/path'
//   id          string (optional) — explicit kebab-case ds id; auto-derived if omitted
//   name        string (optional) — display name; falls back to frontmatter, then filename
//   description string (optional) — description; falls back to frontmatter
//
// Outputs (meta.outputs):
//   dsId              string  — resolved kebab-case id
//   dsPath            string  — 'design-systems/<dsId>'
//   mdPath            string  — '.claude/tmp/import-designd.md'
//   fetchedName       string  — display name
//   fetchedDescription string — description

export const meta = {
  name: 'ds-import:fetch',
  description: 'Fetch DESIGN.md from URL/awesome/local; parse frontmatter; resolve dsId.',
  inputs: {
    source: 'awesome/<brand> | http(s)://... | /abs/path',
    id: 'optional kebab-case id',
    name: 'optional display name',
    description: 'optional description',
  },
  outputs: {
    dsId: 'kebab-case id',
    dsPath: 'design-systems/<dsId>',
    mdPath: '.claude/tmp/import-designd.md',
    fetchedName: 'display name',
    fetchedDescription: 'description',
  },
  phases: [
    { title: 'Fetch', detail: 'Resolve source -> DESIGN.md on disk' },
    { title: 'Parse', detail: 'Frontmatter -> name, description, id' },
  ],
}

// ── Inline helpers (import() not available in workflow harness) ───────────
function parsedArgs(raw) {
  if (raw == null) return {}
  if (typeof raw === 'string') { try { return JSON.parse(raw) } catch { return {} } }
  if (typeof raw === 'object') return raw
  return {}
}
function parseFrontmatter(content, fallbackName = '', fallbackDescription = '') {
  let name = fallbackName, description = fallbackDescription
  const fm = String(content || '').match(/^---\n([\s\S]*?)\n---/)
  if (!fm) return { name, description }
  for (const line of fm[1].split('\n')) {
    const m = line.match(/^(\w+):\s*(.+)$/)
    if (!m) continue
    const val = m[2].replace(/^["']|["']$/g, '')
    if (m[1] === 'name' && !name) name = val
    if (m[1] === 'description' && !description) description = val
    if (m[1] === 'category' && !description) description = val
  }
  return { name, description }
}

const _args = parsedArgs(args)
const { source, id: explicitId, name, description } = _args
if (!source) throw new Error('ds-import:fetch: source is required')

const tmpDir = '.claude/tmp'
const mdPath = tmpDir + '/import-designd.md'
const dsDir = 'design-systems'

phase('Fetch')
log('[ds-import:fetch] source=' + source)

let fetchedName = name || ''
let fetchedDescription = description || ''
let dsId = explicitId || ''
let brand = ''

if (source.startsWith('awesome/')) {
  brand = source.replace('awesome/', '')
  const url = 'https://raw.githubusercontent.com/voltagent/awesome-design-md/main/design-md/' + brand + '/DESIGN.md'
  log('[ds-import:fetch] Fetching from awesome-design-md: ' + brand)

  const fetchResult = await agent(
    'Fetch DESIGN.md using curl and save to ' + mdPath + '.\n' +
    'Steps:\n1. Run: mkdir -p ' + tmpDir + '\n2. Run: curl -sL ' + url + ' -o ' + mdPath + '\n' +
    '3. Verify: wc -c < ' + mdPath + '\n4. Read and return the complete file content',
    { label: 'fetch:' + brand, phase: 'Fetch' }
  )
  const content = String(fetchResult || '')
  if (content.length < 10) throw new Error('[ds-import:fetch] Empty response for ' + brand)
  const parsed = parseFrontmatter(content, fetchedName, fetchedDescription)
  fetchedName = parsed.name
  fetchedDescription = parsed.description
  dsId = explicitId || brand.toLowerCase().replace(/[^a-z0-9-]/g, '-')
  log('[ds-import:fetch] Fetched (' + content.length + ' chars)')

} else if (source.startsWith('http://') || source.startsWith('https://')) {
  log('[ds-import:fetch] Fetching from URL: ' + source)
  const fetchResult = await agent(
    'Fetch DESIGN.md from URL using curl.\n' +
    'Steps:\n1. Run: mkdir -p ' + tmpDir + '\n2. Run: curl -sL "' + source + '" -o ' + mdPath + '\n' +
    '3. Verify: wc -c < ' + mdPath + '\n4. Read and return the complete content',
    { label: 'fetch:url', phase: 'Fetch' }
  )
  const content = String(fetchResult || '')
  if (content.length < 10) throw new Error('[ds-import:fetch] Empty response from URL')
  const urlMatch = source.match(/\/([^/]+?)(?:\.md)?$/)
  fetchedName = fetchedName || (urlMatch ? urlMatch[1] : 'imported')
  const parsed = parseFrontmatter(content, fetchedName, fetchedDescription)
  fetchedName = parsed.name
  fetchedDescription = parsed.description
  dsId = explicitId || fetchedName.toLowerCase().replace(/[^a-z0-9-]/g, '-')
  log('[ds-import:fetch] Fetched (' + content.length + ' chars)')

} else {
  log('[ds-import:fetch] Using local file: ' + source)
  const fetchResult = await agent(
    'Read local DESIGN.md and copy to ' + mdPath + '.\n' +
    'Steps:\n1. Run: mkdir -p ' + tmpDir + '\n2. Run: cp "' + source + '" ' + mdPath + '\n' +
    '3. Read and return the complete content',
    { label: 'fetch:local', phase: 'Fetch' }
  )
  const content = String(fetchResult || '')
  if (!content) throw new Error('[ds-import:fetch] Failed to read: ' + source)
  const fileMatch = source.match(/\/([^/]+?)(?:\.md)?$/)
  fetchedName = fetchedName || (fileMatch ? fileMatch[1] : 'imported')
  const parsed = parseFrontmatter(content, fetchedName, fetchedDescription)
  fetchedName = parsed.name
  fetchedDescription = parsed.description
  dsId = explicitId || fetchedName.toLowerCase().replace(/[^a-z0-9-]/g, '-')
  log('[ds-import:fetch] Loaded (' + content.length + ' chars)')
}

phase('Parse')
log('[ds-import:fetch] DS: id="' + dsId + '", name="' + fetchedName + '"')
const dsPath = dsDir + '/' + dsId

return {
  dsId,
  dsPath,
  mdPath,
  fetchedName,
  fetchedDescription,
  source,
  brand,
}