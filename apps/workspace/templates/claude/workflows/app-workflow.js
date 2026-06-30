// app-workflow.js
// Full application build/update orchestrator.
// The workspace has a single default design system (set in emdesign.config.json).
// Decomposes into screens → builds in parallel → verifies → reconciles.
//
// Usage: workflow('app-workflow', { name, screens: [{name, route, sections}] })
export const meta = {
  name: 'app-workflow',
  description: 'Full app build/update. Screen decomposition → parallel screen builds → verification → reconciliation.',
  phases: [{ title: 'Decompose' }, { title: 'Build Screens' }, { title: 'Verify' }, { title: 'Reconcile' }],
}

const _args = typeof args === "string" ? JSON.parse(args) : (args || {});

const { name, screens = [] } = _args
log(`[app] Setting up application: ${name}`)

// Validate the workspace DS (set at init time, not per-invocation)
try {
  await $`emdesign ds validate --strict 2>/dev/null`
} catch { /* optional */ }

phase('Decompose')
log(`[app] Decomposing into ${screens.length} screen(s)`)

// Decompose screens — check for reuse opportunities across screens
const allComponents = new Set()
for (const screen of screens) {
  for (const section of screen.sections ?? []) {
    allComponents.add(section.id)
  }
}
log(`[app] ${allComponents.size} unique component(s) across all screens`)

phase('Build Screens')
log(`[app] Building screens`)

// Build screens in parallel (they're independent)
const screenResults = await parallel(screens.map(s => () =>
  workflow('screen-create', {
    name: s.name,
    route: s.route ?? `/${s.name.toLowerCase()}`,
    sections: s.sections ?? [],
    layout: s.layout ?? 'stack',
  })
))

const built = screenResults.filter(r => r?.decision === 'ship' || r?.renderOk)
const failed = screenResults.filter(r => r && r.decision !== 'ship' && !r.renderOk)
log(`[app] Screens: ${built.length} built, ${failed.length} failed`)

phase('Verify')
log(`[app] Running app-level verification`)

// Cross-screen consistency check
const sharedComponents = new Map()
for (const screen of screens) {
  for (const section of screen.sections ?? []) {
    const prev = sharedComponents.get(section.id) ?? []
    prev.push(screen.name)
    sharedComponents.set(section.id, prev)
  }
}
const reused = Array.from(sharedComponents.entries()).filter(([, screens]) => screens.length > 1)
if (reused.length > 0) {
  log(`[app] Shared components: ${reused.map(([c, s]) => `${c} (${s.join(', ')})`).join('; ')}`)
}

// Validate DS after all screens
let dsValid = false
try {
  const result = await $`emdesign ds validate --strict --json 2>/dev/null`
  const parsed = JSON.parse(result)
  dsValid = parsed.ok && parsed.data?.ok
  log(`[app] DS validate: ${dsValid ? '✅' : '❌'}`)
} catch { /* optional */ }

phase('Reconcile')
// Run reconciliation on the full app
const reconcileResult = await workflow('reconcile-workflow', {
  nodes: screens.map(s => `screen:${s.name}`),
})

return {
  name,
  screens: screens.map(s => s.name),
  screenResults: built.length,
  screenFailures: failed.length,
  sharedComponents: reused.map(([c]) => c),
  dsValid,
  reconcileResult,
}
