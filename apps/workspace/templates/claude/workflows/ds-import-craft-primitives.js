// ds-import-craft-primitives.js
// Workflow #3 in the ds-import-* DAG.
//
// Author primitives for the deduped componentSpecs[] from :decompose-preview.
// Each spec runs in parallel. Each spec first runs a graph_query pre-flight to
// check for reuse-before-author (per page-architect skill); only if the
// primitive is genuinely missing from the graph does an author agent run.
//
// Per-spec fan-out is bounded by VERIFY_CONCURRENCY=4 (Playwright-safe).
//
// Inputs (meta.inputs):
//   dsId            string (required)
//   dsPath          string (required)
//   previewPath     string (required) — design-systems/<id>/reference-example.html
//   componentSpecs  Array<{name, htmlContext, description}> (required)
//
// Outputs (meta.outputs):
//   codeFiles     string[] — paths written (deduped by name)
//   reusedCount   number   — primitives reused from existing graph
//   authoredCount number   — primitives newly authored

export const meta = {
  name: 'ds-import:craft-primitives',
  description: 'Parallel primitive authoring with graph_query reuse-before-author pre-flight.',
  inputs: {
    dsId: 'kebab-case id',
    dsPath: 'design-systems/<dsId>',
    previewPath: 'reference-example.html path',
    componentSpecs: 'Array<{name, htmlContext, description}>',
  },
  outputs: {
    codeFiles: 'paths written',
    reusedCount: 'reused from graph',
    authoredCount: 'newly authored',
  },
  phases: [
    { title: 'Reuse pre-flight', detail: 'graph_query per spec — skip if already in graph' },
    { title: 'Author', detail: 'Parallel authoring of missing primitives (cap=4)' },
  ],
}

// ── Inline helpers (import() not available in workflow harness) ───────────
const VERIFY_CONCURRENCY = 4
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
const previewPath = _args.previewPath
const componentSpecs = Array.isArray(_args.componentSpecs) ? _args.componentSpecs : []
if (!dsId || !dsPath || !previewPath) {
  throw new Error('ds-import:craft-primitives: dsId, dsPath, and previewPath are required')
}
if (componentSpecs.length === 0) {
  log('[ds-import:craft-primitives] No component specs — nothing to author')
  return { codeFiles: [], reusedCount: 0, authoredCount: 0 }
}

const codeDir = dsPath + '/code'
const buildContextPath = dsPath + '/build-context.txt'
const tokensPath = dsPath + '/tokens.css'

// Dedup at the spec layer (case-insensitive + alpha-only key) so two parallel
// agents never race to write the same file.
const specs = dedupeBy(componentSpecs, 'name')
log('[ds-import:craft-primitives] Authoring ' + specs.length + ' primitives (parallel, cap=' + VERIFY_CONCURRENCY + ')')

// ============================================================
// PHASE 1: REUSE PRE-FLIGHT — graph_query per spec
// ============================================================
phase('Reuse pre-flight')

const reuseResults = await parallel(specs.map(spec => () =>
  agent(
    'Reuse-before-author check for primitive "' + spec.name + '".\n\n' +
    'Run: emdesign graph query --label primitive --filter "name=' + spec.name + '" --json 2>&1\n\n' +
    'If a primitive with name="' + spec.name + '" already exists in the graph, return REUSE.\n' +
    'If missing, return AUTHOR.\n\n' +
    'Return JSON: { "name": "' + spec.name + '", "decision": "REUSE" | "AUTHOR", "reason": "1 sentence" }',
    {
      label: 'reuse-check:' + spec.name, phase: 'Reuse pre-flight',
      schema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          decision: { type: 'string', enum: ['REUSE', 'AUTHOR'] },
          reason: { type: 'string' },
        },
        required: ['name', 'decision'],
      },
    }
  )
))

const toAuthor = []
const toReuse = []
for (let i = 0; i < specs.length; i++) {
  const r = reuseResults[i]
  if (r?.decision === 'REUSE') toReuse.push(specs[i])
  else toAuthor.push(specs[i])
}
log('[ds-import:craft-primitives] Reuse=' + toReuse.length + ' Author=' + toAuthor.length)

// ============================================================
// PHASE 2: AUTHOR — parallel, bounded
// ============================================================
phase('Author')

const codeFiles = []
if (toAuthor.length > 0) {
  const authorResults = await pLimit(VERIFY_CONCURRENCY, toAuthor.map(comp => () =>
    agent(
      'Author primitive "' + comp.name + '" for DS "' + dsId + '".\n\n' +
      'CONTEXT (read in order):\n' +
      '1. cat "' + buildContextPath + '"  — compact design reference (read this first)\n' +
      '2. cat "' + previewPath + '"        — reference visual\n' +
      '3. ls "' + codeDir + '"/*.tsx       — existing primitives to reuse\n\n' +
      'This primitive appears in the preview as: ' + (comp.htmlContext || comp.description || '(see preview)') + '\n\n' +
      'REQUIREMENTS:\n' +
      '1. Use ONLY semantic token classes per build/SKILL.md (bg-surface, text-accent, rounded, etc.)\n' +
      '2. NEVER use raw hex colors or hardcoded spacing values\n' +
      '3. Props interface ' + comp.name + 'Props\n' +
      '4. Named export ' + comp.name + '\n' +
      '5. Accept className?: string in props\n' +
      '6. Match the visual style shown in the preview\n' +
      '7. If a similar primitive already exists in "' + codeDir + '", REUSE it instead of re-authoring\n\n' +
      'Write to "' + codeDir + '/' + comp.name + '.tsx" via Write tool.\n' +
      'Return "OK" with component name.',
      { label: 'craft:' + comp.name, phase: 'Author' }
    )
  ))

  for (let i = 0; i < toAuthor.length; i++) {
    if (authorResults[i]) codeFiles.push(codeDir + '/' + toAuthor[i].name + '.tsx')
  }
  log('[ds-import:craft-primitives] Authored ' + codeFiles.length + '/' + toAuthor.length + ' primitives')
} else {
  log('[ds-import:craft-primitives] Nothing to author — all primitives reused')
}

// If reused, the path still exists at @ds/<Name> via the existing code/ copy.
// We don't have to write — but the path is the import alias.
for (const r of toReuse) codeFiles.push('@ds/' + r.name)

return {
  codeFiles,
  reusedCount: toReuse.length,
  authoredCount: codeFiles.filter(p => p.startsWith(codeDir)).length,
}