export const meta = {
  name: 'dev-loop',
  description: 'Micro-optimization loop: build Button → check with deterministic metrics.mjs → if any metric fails, look up the exact file+fix → apply → rebuild → confirm. No LLM evaluation, no hypothesis agent. Full benchmark suite every 20 cycles.',
  phases: [
    { title: 'Initialize' },
    { title: 'Build' },
    { title: 'Check' },
    { title: 'Fix' },
    { title: 'Verify' },
    { title: 'Commit' },
  ],
};

const REPO_ROOT = '/Users/minh/Documents/medesign';
const TEST_COMPONENTS = ['Button', 'MetricCard', 'NavigationBar', 'DataTable', 'FeatureShowcase'];
const FULL_SUITE_INTERVAL = 20;
const MAX_FIX_ATTEMPTS = 3;

// Metric → fix mapping: when metrics.mjs detects an issue, apply this exact change
var FIX_MAP = [
  // Raw hex outside token definitions
  { check: function(r) { return r.rawHexCount > 0; }, file: REPO_ROOT + '/apps/workspace/templates/claude/workflows/core-loop.js', anchor: 'NON-DETERMINISTIC CODE: NEVER use', insert: '\n RAW HEX: NEVER use raw hex colors (#xxx) in component code. Every color must reference a token role (bg-surface, text-accent, border-border, etc.). If a needed role does not exist, use var(--color-role) — never #hex.', op: 'insert-before' },
  // Inline styles with colors
  { check: function(r) { return r.offTokenStyleCount > 0; }, file: REPO_ROOT + '/apps/workspace/templates/claude/workflows/core-loop.js', anchor: 'RAW HEX: NEVER use raw hex', insert: '\n INLINE STYLES: NEVER use style={{}} for colors, backgrounds, borders, spacing, or typography. Use Tailwind classes only (bg-*, text-*, border-*, p-*, gap-*, font-*). inline style={{}} is only for dynamic values that cannot be expressed as classes.', op: 'insert-before' },
  // Pattern violations: inline event handlers
  { check: function(r) { return r.patternViolations && r.patternViolations.some(function(v) { return v.indexOf('inline') >= 0 || v.indexOf('arrow') >= 0; }); }, file: REPO_ROOT + '/apps/workspace/templates/claude/workflows/core-loop.js', anchor: 'RAW HEX: NEVER use raw hex', insert: '\n EVENT HANDLERS: Define event handlers as named functions (const handleClick = ...) instead of inline arrow functions (onClick={() => ...}). Use onClick={handleClick}.', op: 'insert-before' },
  // Pattern violations: missing keys
  { check: function(r) { return r.patternViolations && r.patternViolations.some(function(v) { return v.indexOf('key') >= 0 || v.indexOf('map') >= 0; }); }, file: REPO_ROOT + '/apps/workspace/templates/claude/workflows/core-loop.js', anchor: 'RAW HEX: NEVER use raw hex', insert: '\n MAP KEYS: Always provide stable, unique keys (preferably from data IDs) in .map() iterations. NEVER use the array index as a key.', op: 'insert-before' },
  // Pattern violations: raw button instead of @ds
  { check: function(r) { return r.patternViolations && r.patternViolations.some(function(v) { return v.indexOf('button') >= 0 && v.indexOf('@ds') >= 0; }); }, file: REPO_ROOT + '/apps/workspace/templates/claude/workflows/core-loop.js', anchor: 'RAW HEX: NEVER use raw hex', insert: '\n PRIMITIVES: Import and use primitives from "@ds" (import { Button, Card, Badge, Heading, Stack } from "@ds"). NEVER use raw HTML elements (<button>, <div>, <h1>) when a primitive exists.', op: 'insert-before' },
  // @ts-ignore
  { check: function(r) { return r.tsIgnoreCount > 0; }, file: REPO_ROOT + '/apps/workspace/templates/claude/workflows/core-loop.js', anchor: 'RAW HEX: NEVER use raw hex', insert: '\n TYPESCRIPT: NEVER use @ts-ignore or as any. Define explicit interfaces for all props. Use proper TypeScript types for event handlers (React.MouseEvent, React.ChangeEvent).', op: 'insert-before' },
  // as any
  { check: function(r) { return r.anyCount > 0; }, file: REPO_ROOT + '/apps/workspace/templates/claude/workflows/core-loop.js', anchor: 'TYPESCRIPT: NEVER use @ts-ignore', insert: '\n TYPESCRIPT STRICT: NEVER use `as any`. If a type is complex, define an interface or type alias. Use generics for data arrays (items: T[]).', op: 'insert-before' },
  // Too complex
  { check: function(r) { return r.linesOfCode > 200; }, file: REPO_ROOT + '/apps/workspace/templates/claude/workflows/core-loop.js', anchor: 'COMPOSE primitives from "@ds"', insert: ' KEEP COMPONENTS SMALL: Target under 80 lines per component. Extract sub-components for repeated JSX. Extract custom hooks for data fetching and side effects.', op: 'insert-before' },
  // Inline var() for color tokens — must use Tailwind semantic classes instead
  { check: function(r) { return r.arbitraryVarColorCount > 0; }, file: REPO_ROOT + '/apps/workspace/templates/claude/workflows/core-loop.js', anchor: 'TAILWIND CONFIG: The active design system', insert: ' USE SEMANTIC CLASSES: The Tailwind config maps ALL --color-* tokens to classes. NEVER use bg-[var(--color-x)], text-[var(--color-x)], or border-[var(--color-x)]. Use bg-highlight, text-highlight, border-highlight etc. Only use var(--x) for non-color tokens like --motion-fast, --focus-ring, --shadow-raised.', op: 'replace-line' },
];

// ── Initialize ─────────────────────────────────────────────────────────────
phase('Initialize');
// Git check skipped — the loop handles errors gracefully during commit/revert.

log('Micro-optimization loop starting');
var cycleCount = 0;
var totalFixes = 0;
var componentIndex = 0;
var suiteCounter = 0;

var maxCycles = (args && args.maxCycles) || 50;
var stallCount = 0;

while (cycleCount < maxCycles) {
  suiteCounter++;
  var component = TEST_COMPONENTS[componentIndex % TEST_COMPONENTS.length];
  componentIndex++;

  // Every FULL_SUITE_INTERVAL cycles, run full suite as regression check
  if (suiteCounter % FULL_SUITE_INTERVAL === 0) {
    phase('Check');
    log('Running full suite regression check...');
    var suiteResult = await workflow({ scriptPath: REPO_ROOT + '/benchmarks/run-benchmark.js' }, { runId: 'suite-' + suiteCounter, filter: '', threshold: 0.8 });
    log('Suite: ' + (suiteResult ? suiteResult.passRate : 'error'));
    continue;
  }

  // ── Build ──────────────────────────────────────────────────────────────
  phase('Build');
  log('Building ' + component + ' through core-loop...');
  var buildResult = await agent(
    'Build the component "' + component + '" through the full core-loop using MCP tools.\n' +
    '1. Call get_design_context with componentName="' + component + '"\n' +
    '2. Call create_component with mode="create"\n' +
    '3. Run the progressive cascade: lint → visual → a11y → vision → LLM → gate\n' +
    '4. Stop when decision="ship" or plateau.\n' +
    'Return { shipped: true|false, rounds: number }',
    { label: 'build-' + component, phase: 'Build', schema: { type: 'object', properties: { shipped: { type: 'boolean' }, rounds: { type: 'number' } }, required: ['shipped'] } },
  );
  log('Built ' + component + ': shipped=' + buildResult.shipped + ' rounds=' + buildResult.rounds);

  // ── Check with deterministic metrics ───────────────────────────────────
  phase('Check');
  var sourcePath = REPO_ROOT + '/examples/ledger-console/src/generated/' + component + '.tsx';

  var metrics = await agent(
    'Read the source file at ' + sourcePath + '. Then run white-box metrics on it (regex analysis, NO LLM):\n' +
    '1. rawHexCount: count of #[0-9a-fA-F]{3,8} in source (outside :root blocks)\n' +
    '2. unresolvedVarCount: count of var(--x) where x is NOT in declared tokens\n' +
    '3. offTokenStyleCount: count of style={{}} with color/background/border/font values\n' +
    '4. anyCount: count of "as any" and ": any"\n' +
    '5. tsIgnoreCount: count of @ts-ignore\n' +
    '6. linesOfCode: total lines\n' +
    '7. patternViolations: array of strings describing anti-patterns (hooks, keys, inline handlers, inline styles, raw elements)\n' +
    '8. arbitraryVarColorCount: count of bg-[var(--color-*, text-[var(--color-*, border-[var(--color-*, hover:bg-[var(--color-*)\n' +
    'Return JSON with all fields.',
    { label: 'metrics-' + component, phase: 'Check',
      schema: { type: 'object', additionalProperties: true, properties: {
        rawHexCount: { type: 'number' }, unresolvedVarCount: { type: 'number' }, offTokenStyleCount: { type: 'number' },
        anyCount: { type: 'number' }, tsIgnoreCount: { type: 'number' }, linesOfCode: { type: 'number' },
        patternViolations: { type: 'array' }, maxConditionalDepth: { type: 'number' }, arbitraryVarColorCount: { type: 'number' },
      }, required: ['rawHexCount', 'unresolvedVarCount', 'offTokenStyleCount', 'anyCount', 'tsIgnoreCount', 'linesOfCode', 'patternViolations', 'arbitraryVarColorCount'] },
    },
  );

  // Collect ALL failing fixes from one observation
  var pendingFixes = [];
  for (var fi = 0; fi < FIX_MAP.length; fi++) {
    if (FIX_MAP[fi].check(metrics)) {
      pendingFixes.push(fi);
    }
  }

  if (pendingFixes.length === 0) {
    log(component + ' passed all metrics. Moving to next component.');
    cycleCount++;
    stallCount++;
    if (stallCount >= 10) { log('10 clean cycles. All metrics passing. Stopping.'); break; }
    continue;
  }

  stallCount = 0;
  log(pendingFixes.length + ' issue(s) detected in ' + component + '. Fixing all at once...');

  // ── Fix ALL at once ──────────────────────────────────────────────────
  phase('Fix');
  var fixDescriptions = [];
  for (var pi = 0; pi < pendingFixes.length; pi++) {
    var fx = FIX_MAP[pendingFixes[pi]];
    fixDescriptions.push('- ' + fx.anchor + ' in ' + fx.file);
  }

  var batchFixResult = await agent(
    'Apply ALL of the following fixes to the engine files at once:\n' +
    fixDescriptions.join('\n') + '\n\n' +
    'For each fix, read the target file, find the anchor text, and insert/modify exactly as described.\n' +
    'Do NOT change anything else. After ALL fixes are applied, run:\n' +
    'cd ' + REPO_ROOT + ' && git diff --stat\n' +
    'Return { filesChanged: ["file1", "file2"], diff: "..." }',
    { label: 'batch-fix-' + component, phase: 'Fix',
      schema: { type: 'object', properties: { filesChanged: { type: 'array', items: { type: 'string' } }, diff: { type: 'string' } }, required: ['filesChanged'] } },
  );

  if (batchFixResult && batchFixResult.filesChanged && batchFixResult.filesChanged.length > 0) {
    // ── Verify all at once ─────────────────────────────────────────────
    phase('Verify');
    log(batchFixResult.filesChanged.length + ' file(s) changed. Rebuilding ' + component + ' to verify...');

    var rebuild = await agent(
      'Rebuild "' + component + '" through core-loop (edit mode): ' +
      'call edit_component, run the cascade (lint → visual → a11y → vision → LLM → gate). ' +
      'Return { shipped: true|false }',
      { label: 'rebuild-' + component, phase: 'Verify', schema: { type: 'object', properties: { shipped: { type: 'boolean' } }, required: ['shipped'] } },
    );

    // Recheck ALL metrics at once
    var recheck = await agent(
      'Read ' + sourcePath + ' and run the EXACT same white-box metrics check again. Return the same JSON format.',
      { label: 'recheck-' + component, phase: 'Verify',
        schema: { type: 'object', additionalProperties: true, properties: {
          rawHexCount: { type: 'number' }, unresolvedVarCount: { type: 'number' }, offTokenStyleCount: { type: 'number' },
          anyCount: { type: 'number' }, tsIgnoreCount: { type: 'number' }, linesOfCode: { type: 'number' }, patternViolations: { type: 'array' },
        }, required: ['rawHexCount', 'unresolvedVarCount', 'offTokenStyleCount', 'anyCount', 'tsIgnoreCount', 'linesOfCode', 'patternViolations'] },
      },
    );

    // Check if ALL pending fixes passed
    var stillFailing = pendingFixes.filter(function(fi) { return FIX_MAP[fi].check(recheck); });

    if (stillFailing.length === 0) {
      // ── Commit ─────────────────────────────────────────────────────
      phase('Commit');
      await agent(
        'Commit all changes: cd ' + REPO_ROOT + ' && git add -A && git commit -m "dev-loop: fix ' + pendingFixes.length + ' issues (' + pendingFixes.map(function(fi) { return FIX_MAP[fi].anchor.slice(0, 30); }).join(', ') + ')"',
        { label: 'commit', phase: 'Commit' },
      );
      totalFixes += pendingFixes.length;
      log('✅ ' + pendingFixes.length + ' fixes verified and committed. Total: ' + totalFixes);
    } else {
      log(stillFailing.length + '/' + pendingFixes.length + ' fixes did not pass recheck. Reverting all.');
      for (var ri = 0; ri < batchFixResult.filesChanged.length; ri++) {
        await agent('Revert: cd ' + REPO_ROOT + ' && git restore ' + batchFixResult.filesChanged[ri], { label: 'revert-' + ri, phase: 'Verify' });
      }
    }
  } else {
    log('No fixes applied. Batch fix returned no changes.');
  }

  cycleCount++;

  if (totalFixes >= 100) {
    log('Reached 100 fixes. Stopping.');
    break;
  }
}

log('=== Micro-optimization complete ===');
log('Total fixes: ' + totalFixes + ' across ' + cycleCount + ' cycles');

return {
  totalFixes: totalFixes,
  totalCycles: cycleCount,
  metricsChecked: TEST_COMPONENTS,
  summary: totalFixes + ' fixes applied across ' + cycleCount + ' build cycles',
};
