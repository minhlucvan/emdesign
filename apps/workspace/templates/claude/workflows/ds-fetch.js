// ds-fetch.js
// Fetch DESIGN.md from a source and save to a temp location.
// Also fetches/generates the reference preview HTML.
//
// Usage: workflow('ds-fetch', { source, id?, name?, description? })
//   source - one of:
//     'awesome/{brand}'  -- import from awesome-design-md
//     'https://...'       -- fetch DESIGN.md from a raw URL
//     '/path/to/file.md'  -- local file path
//   id     - optional kebab-case id (auto-derived from source if omitted)
//   name   - optional display name
//   description - optional description
//
// Returns: { mdPath, previewPath, dsId, name, description, brand, tasteDials }

export const meta = {
  name: 'ds-fetch',
  description: 'Fetch DESIGN.md and preview HTML from a source (awesome, URL, or local).',
  phases: [
    { title: 'Fetch DESIGN.md', detail: 'Download or copy the design contract' },
    { title: 'Fetch preview', detail: 'Get or generate the reference preview HTML' },
  ],
}

const parsedArgs = typeof args === 'string' ? JSON.parse(args) : (args || {})
const { source, id: explicitId, name, description } = parsedArgs
if (!source) throw new Error('ds-fetch: source is required')

const tmpDir = '.claude/tmp'
const mdPath = tmpDir + '/import-designd.md'
const dsDir = 'design-systems'

// ===== FETCH DESIGN.md =====
phase('Fetch DESIGN.md')
log('[ds-fetch] Importing from: ' + source)

let brand = ''
let fetchedName = name || ''
let fetchedDescription = description || ''
let dsId = explicitId || ''
let tasteDials = { variance: 5, motion: 5, density: 5 }

// Helper: parse frontmatter
function parseFm(content, existingName, existingDesc) {
  let n = existingName, d = existingDesc
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/)
  if (fmMatch) {
    for (const line of fmMatch[1].split('\n')) {
      const m = line.match(/^(\w+):\s*(.+)$/)
      if (m) {
        const val = m[2].replace(/^["']|["']$/g, '')
        if (m[1] === 'name') n = n || val
        if (m[1] === 'description') d = d || val
        if (m[1] === 'category' && !existingDesc) d = d || val
      }
    }
  }
  return { name: n, description: d }
}

if (source.startsWith('awesome/')) {
  brand = source.replace('awesome/', '')
  const url = 'https://raw.githubusercontent.com/voltagent/awesome-design-md/main/design-md/' + brand + '/DESIGN.md'
  log('[ds-fetch] Fetching from awesome-design-md: ' + brand)

  const fetchResult = await agent(
    'Fetch DESIGN.md using curl and save to ' + mdPath + '.\n' +
    'Steps:\n1. Run: mkdir -p ' + tmpDir + '\n2. Run: curl -sL ' + url + ' -o ' + mdPath + '\n' +
    '3. Verify: wc -c < ' + mdPath + '\n4. Read and return the complete file content',
    { label: 'fetch:' + brand, phase: 'Fetch DESIGN.md' }
  )
  const content = String(fetchResult || '')
  if (content.length < 10) throw new Error('[ds-fetch] Empty response for ' + brand)
  const parsed = parseFm(content, fetchedName, fetchedDescription)
  fetchedName = parsed.name; fetchedDescription = parsed.description
  dsId = explicitId || brand.toLowerCase().replace(/[^a-z0-9-]/g, '-')
  log('[ds-fetch] Fetched (' + content.length + ' chars)')

} else if (source.startsWith('http://') || source.startsWith('https://')) {
  log('[ds-fetch] Fetching from URL: ' + source)
  const fetchResult = await agent(
    'Fetch DESIGN.md from URL using curl.\n' +
    'Steps:\n1. Run: mkdir -p ' + tmpDir + '\n2. Run: curl -sL "' + source + '" -o ' + mdPath + '\n' +
    '3. Verify: wc -c < ' + mdPath + '\n4. Read and return the complete content',
    { label: 'fetch:url', phase: 'Fetch DESIGN.md' }
  )
  const content = String(fetchResult || '')
  if (content.length < 10) throw new Error('[ds-fetch] Empty response from URL')
  const urlMatch = source.match(/\/([^/]+?)(?:\.md)?$/)
  fetchedName = fetchedName || (urlMatch ? urlMatch[1] : 'imported')
  const parsed = parseFm(content, fetchedName, fetchedDescription)
  fetchedName = parsed.name; fetchedDescription = parsed.description
  dsId = explicitId || fetchedName.toLowerCase().replace(/[^a-z0-9-]/g, '-')
  log('[ds-fetch] Fetched (' + content.length + ' chars)')

} else {
  log('[ds-fetch] Using local file: ' + source)
  const fetchResult = await agent(
    'Read local DESIGN.md and copy to ' + mdPath + '.\n' +
    'Steps:\n1. Run: mkdir -p ' + tmpDir + '\n2. Run: cp "' + source + '" ' + mdPath + '\n' +
    '3. Read and return the complete file content',
    { label: 'fetch:local', phase: 'Fetch DESIGN.md' }
  )
  const content = String(fetchResult || '')
  if (!content) throw new Error('[ds-fetch] Failed to read: ' + source)
  const fileMatch = source.match(/\/([^/]+?)(?:\.md)?$/)
  fetchedName = fetchedName || (fileMatch ? fileMatch[1] : 'imported')
  const parsed = parseFm(content, fetchedName, fetchedDescription)
  fetchedName = parsed.name; fetchedDescription = parsed.description
  dsId = explicitId || fetchedName.toLowerCase().replace(/[^a-z0-9-]/g, '-')
  log('[ds-fetch] Loaded (' + content.length + ' chars)')
}

log('[ds-fetch] DS: id="' + dsId + '", name="' + fetchedName + '"')

// ===== FETCH PREVIEW =====
phase('Fetch preview')
log('[ds-fetch] Fetching preview')

const dsPath = dsDir + '/' + dsId
const previewPath = dsPath + '/reference-example.html'

if (source.startsWith('awesome/')) {
  const previewUrl = 'https://getdesign.md/design-md/' + brand + '/preview.html'
  const previewResult = await agent(
    'Fetch design preview from URL and save it.\n' +
    'Steps:\n1. Run: curl -sL "' + previewUrl + '" -o "' + previewPath + '"\n' +
    '2. Verify: wc -c < "' + previewPath + '"\n' +
    '3. Read and confirm the preview file content\nReturn "ok" with file size.',
    { label: 'preview-fetch:' + dsId, phase: 'Fetch preview' }
  )
  log('[ds-fetch] Preview fetched: ' + String(previewResult || '').slice(0, 80))
} else {
  await agent(
    'Generate rich preview HTML for DS "' + dsId + '".\n' +
    'Read DESIGN.md at "' + mdPath + '", create a self-contained preview HTML.\n' +
    'Write to "' + previewPath + '" via Write tool.\nReturn "done".',
    { label: 'preview-gen:' + dsId, phase: 'Fetch preview' }
  )
  log('[ds-fetch] Preview generated')
}

return {
  mdPath,
  previewPath,
  dsPath,
  dsId,
  name: fetchedName,
  description: fetchedDescription,
  brand,
  tasteDials,
}
