// _lib/ds-import.js
// Shared utilities for the ds-import-* workflow family.
// Pure functions + small constants; no agent calls, no side effects.
//
// Workflows import these via top-level `import` from sibling files, e.g.:
//   import { parsedArgs, THRESHOLD, ... } from './_lib/ds-import.js'
//
// Note: workflow scripts are run by a custom harness that exposes `agent`,
// `pipeline`, `parallel`, `workflow`, `phase`, `log`, `args`. Imports between
// workflow files are not part of the harness contract — these helpers are
// expected to be inlined (or copied) into each workflow by a thin build step,
// OR each workflow may simply re-export them. For now, treat this file as
// the canonical source of truth and copy helpers per-file when needed.

export const meta = {
  name: '_lib/ds-import',
  description: 'Shared constants and helpers for the ds-import-* workflow family.',
  phases: [{ title: 'Constants', detail: 'Exports for sibling workflows' }],
}

// ============================================================
// Constants
// ============================================================

/** Visual similarity target (% pixel/structure/css match) per section/leaf. */
export const THRESHOLD = 98

/** Max fix/diff iterations per section or leaf. */
export const MAX_ITERATIONS = 4

/** Concurrency cap for parallel verify fan-outs (Playwright per agent). */
export const VERIFY_CONCURRENCY = 4

/** Default Storybook URL; overridable via args.storybookUrl. */
export const DEFAULT_STORYBOOK_URL = 'http://localhost:6006'

// ============================================================
// Arg parsing — every workflow expects the same shape
// ============================================================

/**
 * Normalize the harness `args` argument. The harness may pass either a JSON
 * string (when invoked via CLI) or a plain object (when called from another
 * workflow via `workflow('name', obj)`). Returns {} for nullish input.
 *
 * @param {unknown} raw
 * @returns {Record<string, any>}
 */
export function parsedArgs(raw) {
  if (raw == null) return {}
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) } catch { return {} }
  }
  if (typeof raw === 'object') return raw
  return {}
}

/**
 * Resolve the Storybook URL from args or env, falling back to DEFAULT_STORYBOOK_URL.
 *
 * @param {Record<string, any>} args
 * @returns {string}
 */
export function storybookUrl(args) {
  return args.storybookUrl || process.env.EMDESIGN_STORYBOOK_URL || DEFAULT_STORYBOOK_URL
}

// ============================================================
// Slug / story-id helpers — the same logic appears in 4 files today
// ============================================================

/**
 * Lowercase + strip non-alphanumerics (keep dashes). Mirrors the slug rules
 * used everywhere in the v3 workflows.
 *
 * @param {string} s
 * @returns {string}
 */
export function slugify(s) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9-]/g, '')
}

/**
 * Build a Storybook story id for an Overview section.
 * Format: `pages-overview--section-<slug>`
 *
 * @param {string} sectionName
 * @returns {string}
 */
export function sectionStoryId(sectionName) {
  return 'pages-overview--section-' + slugify(sectionName)
}

/**
 * Build a Storybook story id for a primitive.
 * Format: `components-<slug>--default`
 *
 * @param {string} componentName
 * @returns {string}
 */
export function componentStoryId(componentName) {
  return 'components-' + slugify(componentName) + '--default'
}

/**
 * Story id for the Overview page itself.
 */
export const OVERVIEW_STORY_ID = 'pages-overview--default'

// ============================================================
// Dedup helpers
// ============================================================

/**
 * Lowercase + alpha-only key so "Card" / "card" / "Cards " collapse.
 * Used by `:craft-primitives` to guarantee one writer per primitive name.
 *
 * @param {string} name
 * @returns {string}
 */
export function nameKey(name) {
  return String(name || '').toLowerCase().replace(/[^a-z0-9]/g, '')
}

/**
 * Dedupe a list of specs by a chosen key (default 'name'). Preserves first
 * occurrence's order. Returns a new array.
 *
 * @template T
 * @param {T[]} items
 * @param {string} keyField
 * @returns {T[]}
 */
export function dedupeBy(items, keyField = 'name') {
  if (!Array.isArray(items)) return []
  const seen = new Set()
  const out = []
  for (const it of items) {
    if (!it || typeof it !== 'object') continue
    const k = nameKey(it[keyField])
    if (!k || seen.has(k)) continue
    seen.add(k)
    out.push(it)
  }
  return out
}

/**
 * Flatten + dedupe primitive lists across many sections. Each section
 * analysis returns `{ missingPrimitives: [{name, htmlContext, description}] }`.
 *
 * @param {Array<{missingPrimitives?: any[]}>} analyses
 * @returns {Array<{name:string, htmlContext?:string, description?:string}>}
 */
export function mergeMissingPrimitives(analyses) {
  const out = []
  const counts = new Map()
  for (const a of analyses || []) {
    for (const p of a?.missingPrimitives || []) {
      if (!p?.name) continue
      const k = nameKey(p.name)
      const prev = counts.get(k) || 0
      if (prev === 0) {
        out.push({
          name: p.name,
          htmlContext: p.htmlContext || '',
          description: p.description || '',
          _sectionCount: 1,
        })
      } else {
        // Already in `out` — bump its sectionCount in place.
        const existing = out.find(o => nameKey(o.name) === k)
        if (existing) existing._sectionCount = prev + 1
      }
      counts.set(k, prev + 1)
    }
  }
  return out
}

// ============================================================
// Concurrency limiter (pLimit-style) — wraps parallel() with a cap
// ============================================================

/**
 * Run an array of thunks with a concurrency cap. Each thunk is invoked when
 * a slot frees up; the returned promise resolves with all results in order.
 *
 * The harness provides `parallel(thunks)` for true unbounded parallelism; this
 * is the bounded variant used by `:verify-leaves` and `:verify-sections` so
 * Playwright doesn't OOM the host.
 *
 * @template T
 * @param {number} limit
 * @param {Array<() => Promise<T>>} thunks
 * @returns {Promise<T[]>}
 */
export async function pLimit(limit, thunks) {
  if (!Array.isArray(thunks)) return []
  const cap = Math.max(1, limit || 1)
  const results = new Array(thunks.length)
  let next = 0

  async function worker() {
    while (true) {
      const i = next++
      if (i >= thunks.length) return
      try {
        results[i] = await thunks[i]()
      } catch (e) {
        results[i] = null
      }
    }
  }

  const workers = []
  for (let w = 0; w < Math.min(cap, thunks.length); w++) workers.push(worker())
  await Promise.all(workers)
  return results
}

// ============================================================
// Atomic file write helper — write tmp + rename
// ============================================================

/**
 * Compose the shell command an agent should run to atomically write `content`
 * to `path`. The agent (which has shell access) executes this. We return the
 * command string instead of running it because workflows don't have fs access.
 *
 * Format: heredoc -> tmp -> mv. Idempotent.
 *
 * @param {string} path
 * @param {string} content
 * @returns {string}
 */
export function atomicWriteCommand(path, content) {
  const tmp = path + '.tmp'
  const safe = String(content).replace(/'/g, "'\\''")
  return [
    'mkdir -p "$(dirname "' + path + '")"',
    "printf '%s' '" + safe + "' > '" + tmp + "'",
    'mv "' + tmp + '" "' + path + '"',
  ].join(' && ')
}

// ============================================================
// Frontmatter parse (used by `:fetch`)
// ============================================================

/**
 * Parse YAML-ish frontmatter from a DESIGN.md body. Extracts simple
 * `key: value` pairs from the leading `---` block. Quoted values are
 * unquoted. Mutates nothing; returns `{ name, description }` merged
 * with the fallbacks passed in.
 *
 * @param {string} content
 * @param {string} fallbackName
 * @param {string} fallbackDescription
 * @returns {{name: string, description: string}}
 */
export function parseFrontmatter(content, fallbackName = '', fallbackDescription = '') {
  let name = fallbackName
  let description = fallbackDescription
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

// ============================================================
// Output-name helpers
// ============================================================

/**
 * Map an `element.name` + `kind` to the output .tsx filename.
 *   kind='section'   -> 'Overview<Name>.tsx'
 *   kind='component' -> '<Name>.tsx'
 *
 * @param {string} elementName
 * @param {'section'|'component'} kind
 * @returns {string}
 */
export function outputFilename(elementName, kind) {
  return (kind === 'section' ? 'Overview' : '') + elementName + '.tsx'
}

// ============================================================
// Indent helper for recursive logs
// ============================================================

/**
 * Build a depth-based indent string for log lines in recursive workflows.
 *
 * @param {number} depth
 * @param {number} width
 * @returns {string}
 */
export function indent(depth, width = 2) {
  return ' '.repeat(Math.max(0, depth) * width)
}