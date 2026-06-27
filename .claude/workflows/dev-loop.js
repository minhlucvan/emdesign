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
];

// ── Initialize ─────────────────────────────────────────────────────────────
phase('Initialize');
var gitCheck = await agent(
  'Run `cd ' + REPO_ROOT + ' && git status --porcelain -- apps/workspace/templates/claude/ examples/ledger-console/ packages/dsr/src/rules/lint.ts packages/plugin-tailwindcss/src/index.ts packages/backend/src/critique/ packages/mcp-server/src/mcp.ts`. Return { stdout: "<output>" }.',
  { label: 'git-check', phase: 'Initialize', schema: { type: 'object', properties: { stdout: { type: 'string' } }, required: ['stdout'] } },
);
if (gitCheck && gitCheck.stdout && gitCheck.stdout.trim().length > 0) {
  log('Dirty tree. Commit or stash first.');
  return { error: 'Dirty tree', status: gitCheck.stdout };
}

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
    'Return JSON with all fields.',
    { label: 'metrics-' + component, phase: 'Check',
      schema: { type: 'object', additionalProperties: true, properties: {
        rawHexCount: { type: 'number' }, unresolvedVarCount: { type: 'number' }, offTokenStyleCount: { type: 'number' },
        anyCount: { type: 'number' }, tsIgnoreCount: { type: 'number' }, linesOfCode: { type: 'number' },
        patternViolations: { type: 'array' }, maxConditionalDepth: { type: 'number' },
      }, required: ['rawHexCount', 'unresolvedVarCount', 'offTokenStyleCount', 'anyCount', 'tsIgnoreCount', 'linesOfCode', 'patternViolations'] },
    },
  );

  // Find the first failing check
  var fixApplied = false;
  for (var fi = 0; fi < FIX_MAP.length; fi++) {
    if (FIX_MAP[fi].check(metrics)) {
      log('Issue detected: ' + JSON.stringify(FIX_MAP[fi].check.toString().slice(0, 80)));

      // ── Fix ──────────────────────────────────────────────────────────
      phase('Fix');
      var fixFile = FIX_MAP[fi].file;
      var fixAnchor = FIX_MAP[fi].anchor;
      var fixText = FIX_MAP[fi].insert;
      var fixOp = FIX_MAP[fi].op;

      var fixResult = await agent(
        'Read the file at ' + fixFile + '. Find this EXACT text:\n"""' + fixAnchor + '"""\n\n' +
        'Apply ' + fixOp + ' with this text:\n"""' + fixText + '"""\n\n' +
        'Write the FULL modified file back. Do NOT change anything else.\n' +
        'Then run \`cd ' + REPO_ROOT + ' && git diff -- ' + fixFile + '\` and include the diff.\n' +
        'Return { applied: true|false, diff: "..." }',
        { label: 'fix-' + fi + '-' + component, phase: 'Fix', schema: { type: 'object', properties: { applied: { type: 'boolean' }, diff: { type: 'string' } }, required: ['applied'] } },
      );

      if (fixResult && fixResult.applied) {
        // ── Verify ─────────────────────────────────────────────────────
        phase('Verify');
        log('Fix applied. Rebuilding ' + component + ' to verify...');

        var rebuild = await agent(
          'Rebuild "' + component + '" through core-loop (edit mode): ' +
          'call edit_component with the same source, run the cascade, gate. ' +
          'Return { shipped: true|false }',
          { label: 'rebuild-' + component, phase: 'Verify', schema: { type: 'object', properties: { shipped: { type: 'boolean' } }, required: ['shipped'] } },
        );

        // Recheck metrics
        var recheck = await agent(
          'Read ' + sourcePath + ' and run the EXACT same white-box metrics check again. Return the same JSON format.',
          { label: 'recheck-' + component, phase: 'Verify',
            schema: { type: 'object', additionalProperties: true, properties: {
              rawHexCount: { type: 'number' }, unresolvedVarCount: { type: 'number' }, offTokenStyleCount: { type: 'number' },
              anyCount: { type: 'number' }, tsIgnoreCount: { type: 'number' }, linesOfCode: { type: 'number' }, patternViolations: { type: 'array' },
            }, required: ['rawHexCount', 'unresolvedVarCount', 'offTokenStyleCount', 'anyCount', 'tsIgnoreCount', 'linesOfCode', 'patternViolations'] },
          },
        );

        var stillFailing = FIX_MAP[fi].check(recheck);

        if (!stillFailing) {
          // ── Commit ─────────────────────────────────────────────────
          phase('Commit');
          await agent(
            'Commit: cd ' + REPO_ROOT + ' && git add -A && git commit -m "dev-loop: auto-fix ' + FIX_MAP[fi].anchor.slice(0, 60) + '"',
            { label: 'commit', phase: 'Commit' },
          );
          totalFixes++;
          cycleCount++;
          fixApplied = true;
          log('✅ Fix verified and committed. Total fixes: ' + totalFixes);
          break;
        } else {
          // Revert the change
          log('Fix did not pass recheck. Reverting.');
          await agent(
            'Revert: cd ' + REPO_ROOT + ' && git restore ' + fixFile,
            { label: 'revert', phase: 'Verify' },
          );
        }
      }
    }
  }

  if (!fixApplied) {
    // No metric issues found for this component
    log(component + ' passed all metrics. Moving to next component.');
    cycleCount++;
  }

  if (!fixApplied) {
    stallCount++;
    if (stallCount >= 10) {
      log('No fixes found for 10 consecutive cycles. All metrics passing. Stopping.');
      break;
    }
  } else {
    stallCount = 0;
  }

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
