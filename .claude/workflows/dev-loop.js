export const meta = {
  name: 'dev-loop',
  description: 'Automated benchmark-driven engine development loop. Measures current state, diagnoses weaknesses, forms a specific hypothesis, implements ONE change to the engine, then verifies by building a single failing component through core-loop. Full benchmark suite runs every 5 cycles as a regression check. Loops until production-ready or stalled.',
  phases: [
    { title: 'Initialize' },
    { title: 'Diagnose' },
    { title: 'Hypothesize' },
    { title: 'Implement' },
    { title: 'Verify' },
    { title: 'Decide' },
    { title: 'Report' },
    { title: 'Check' },
  ],
};

// ── Config ─────────────────────────────────────────────────────────────────
const MAX_CYCLES = (args && args.maxCycles) || 30;
const MODE = (args && args.mode) || 'semi-auto';
const INITIAL_FILTER = (args && args.filter) || '';
const TOLERANCE = 0.02;
const ROUND_TOLERANCE = 2;
const FULL_SUITE_INTERVAL = 5;
const PRODUCTION_THRESHOLD = 0.80;
const MAX_AVG_ROUNDS = 5;
const REPO_ROOT = '/Users/minh/Documents/medesign';

// ── Engine file registry ───────────────────────────────────────────────────
const ENGINE_FILES = [
  { path: REPO_ROOT + '/apps/workspace/templates/claude/workflows/core-loop.js', type: 'workflow', area: 'build-prompt', description: 'The core build/critique loop.', impactAxes: ['general', 'visual', 'functional', 'accessibility', 'tokenCompliance', 'typescript', 'complexity', 'patterns', 'rounds'] },
  { path: REPO_ROOT + '/apps/workspace/templates/claude/agents/consistency-auditor.md', type: 'agent', area: 'token-audit', description: 'Runs lint, scores token compliance.', impactAxes: ['tokenCompliance', 'patterns'] },
  { path: REPO_ROOT + '/apps/workspace/templates/claude/agents/design-reviewer.md', type: 'agent', area: 'design-review', description: 'LLM critique of code quality.', impactAxes: ['general', 'functional'] },
  { path: REPO_ROOT + '/apps/workspace/templates/claude/agents/vision-critic.md', type: 'agent', area: 'vision-critique', description: 'Screenshot-based visual critique.', impactAxes: ['visual'] },
  { path: REPO_ROOT + '/packages/backend/src/critique/scoreboard.ts', type: 'backend', area: 'gate-logic', description: 'Weighted composite and gate.', impactAxes: ['rounds'] },
  { path: REPO_ROOT + '/packages/backend/src/critique/score.ts', type: 'backend', area: 'gate-config', description: 'scoreComponent with floors and ratchet.', impactAxes: ['visual', 'tokens', 'rounds'] },
  { path: REPO_ROOT + '/packages/plugin-tailwindcss/src/index.ts', type: 'plugin', area: 'codegen', description: 'Tailwind codegen instructions.', impactAxes: ['tokenCompliance', 'patterns'] },
  { path: REPO_ROOT + '/packages/dsr/src/rules/lint.ts', type: 'dsr', area: 'lint-rules', description: 'P0/P1 lint rules.', impactAxes: ['tokenCompliance', 'patterns'] },
];

const AXIS_TO_ENGINE = {
  general: { label: 'Code structure (B1)', primaryFile: REPO_ROOT + '/apps/workspace/templates/claude/workflows/core-loop.js', area: 'build-prompt structure', typicalFix: 'Add structure requirements to the build prompt' },
  visual: { label: 'Visual appearance (B2)', primaryFile: REPO_ROOT + '/apps/workspace/templates/claude/agents/vision-critic.md', area: 'vision-critic', typicalFix: 'Add specific visual guidance or tighten vision-critic instructions' },
  functional: { label: 'Functional correctness (B3)', primaryFile: REPO_ROOT + '/apps/workspace/templates/claude/workflows/core-loop.js', area: 'build-prompt states', typicalFix: 'Add state coverage requirements to build prompt' },
  accessibility: { label: 'Accessibility (B4)', primaryFile: REPO_ROOT + '/apps/workspace/templates/claude/workflows/core-loop.js', area: 'build-prompt a11y', typicalFix: 'Add a11y requirements to build prompt' },
  tokenCompliance: { label: 'Token compliance (W1)', primaryFile: REPO_ROOT + '/packages/dsr/src/rules/lint.ts', area: 'lint rules', typicalFix: 'Add a lint rule or strengthen token prompt in core-loop' },
  typescript: { label: 'TypeScript quality (W2)', primaryFile: REPO_ROOT + '/apps/workspace/templates/claude/workflows/core-loop.js', area: 'build-prompt TS', typicalFix: 'Add TS requirements to build prompt' },
  complexity: { label: 'Code complexity (W3)', primaryFile: REPO_ROOT + '/apps/workspace/templates/claude/workflows/core-loop.js', area: 'build-prompt complexity', typicalFix: 'Add complexity budget to build prompt' },
  patterns: { label: 'Pattern adherence (W4)', primaryFile: REPO_ROOT + '/apps/workspace/templates/claude/workflows/core-loop.js', area: 'build-prompt patterns', typicalFix: 'Add pattern rules to build prompt' },
  rounds: { label: 'Iteration speed', primaryFile: REPO_ROOT + '/apps/workspace/templates/claude/workflows/core-loop.js', area: 'build-prompt or gate params', typicalFix: 'Improve first-attempt quality or adjust plateau/floor params' },
};

const QUICK_EVAL_SCHEMA = {
  type: 'object', additionalProperties: true,
  properties: {
    overall: { type: 'number' },
    blackBox: { type: 'number' },
    whiteBox: { type: 'number' },
    general: { type: 'number' },
    visual: { type: 'number' },
    tokenCompliance: { type: 'number' },
    patterns: { type: 'number' },
    typescript: { type: 'number' },
    rounds: { type: 'number' },
    shipped: { type: 'boolean' },
    errors: { type: 'array' },
  },
  required: ['overall', 'blackBox', 'whiteBox'],
};

// ── Schemas (unchanged) ────────────────────────────────────────────────────
const HISTORY_SCHEMA = { type: 'object', additionalProperties: true, properties: { startTime: { type: 'string' }, initialBaseline: { type: 'string' }, bestOverallAvg: { type: 'number' }, perComponentBaselines: { type: 'object' }, cycles: { type: 'array', items: { type: 'object' } } }, required: ['cycles'] };
const DIAGNOSIS_SCHEMA = { type: 'object', additionalProperties: true, properties: { weakestTest: { type: 'string' }, weakestAxis: { type: 'string' }, axisValue: { type: 'number' }, axisBucket: { type: 'string' }, complexity: { type: 'string' }, testOverall: { type: 'number' }, testRounds: { type: 'number' }, failingTests: { type: 'array' }, allTestsPass: { type: 'boolean' }, avgRounds: { type: 'number' }, productionReady: { type: 'boolean' } }, required: ['weakestTest', 'weakestAxis', 'axisValue', 'failingTests', 'allTestsPass', 'productionReady'] };
const HYPOTHESIS_SCHEMA = { type: 'object', additionalProperties: true, properties: { hypothesis: { type: 'string' }, changeFile: { type: 'string' }, changeType: { type: 'string' }, operation: { type: 'string' }, anchorText: { type: 'string' }, insertText: { type: 'string' }, targetMetric: { type: 'string' }, expectedDelta: { type: 'number' }, expectedDirection: { type: 'string' }, mechanism: { type: 'string' }, risks: { type: 'string' } }, required: ['hypothesis', 'changeFile', 'operation', 'anchorText', 'insertText', 'targetMetric', 'expectedDelta', 'expectedDirection'] };
const IMPLEMENTATION_SCHEMA = { type: 'object', additionalProperties: true, properties: { applied: { type: 'boolean' }, diff: { type: 'string' }, error: { type: 'string' } }, required: ['applied'] };
const VERIFICATION_SCHEMA = { type: 'object', additionalProperties: true, properties: { targetImproved: { type: 'boolean' }, targetDelta: { type: 'number' }, hasRegressions: { type: 'boolean' }, regressions: { type: 'array' }, improvements: { type: 'array' }, hypothesisCorrect: { type: 'boolean' }, overallAvgDelta: { type: 'number' }, avgRoundsDelta: { type: 'number' }, afterPassRate: { type: 'number' } }, required: ['targetImproved', 'hasRegressions', 'hypothesisCorrect'] };
const GIT_SCHEMA = { type: 'object', additionalProperties: true, properties: { stdout: { type: 'string' } }, required: ['stdout'] };
var clamp = function(v) { return Math.max(0, Math.min(1, typeof v === 'number' ? v : 0)); };

// ══════════════════════════════════════════════════════════════════════════
//  PHASE 0: INITIALIZE
// ══════════════════════════════════════════════════════════════════════════
phase('Initialize');
const gitResult = await agent(
  `Run \`cd ${REPO_ROOT} && git status --porcelain -- apps/workspace/templates/claude/ examples/ledger-console/ examples/landing-site/ packages/dsr/src/rules/lint.ts packages/plugin-tailwindcss/src/index.ts packages/backend/src/critique/ packages/mcp-server/src/mcp.ts\`. Return ONLY the raw stdout as { stdout: "<output>" }.`,
  { label: 'git-check', phase: 'Initialize', schema: GIT_SCHEMA },
);
const isClean = gitResult && typeof gitResult.stdout === 'string' && gitResult.stdout.trim().length === 0;
if (!isClean) {
  return { error: 'Dirty working tree. Please commit or stash first.', gitStatus: gitResult };
}

let history = { startTime: (args && args.timestamp) || 'unknown', initialBaseline: '', bestOverallAvg: 0, perComponentBaselines: {}, cycles: [] };
const historyRaw = await agent(
  `Read ${REPO_ROOT}/bench-results/dev-loop-history.json if it exists. If it exists, parse it and return the JSON. If not, return { cycles: [] }.`,
  { label: 'load-history', phase: 'Initialize', schema: HISTORY_SCHEMA },
);
if (historyRaw && historyRaw.cycles) {
  history = { ...history, ...historyRaw, cycles: [...(historyRaw.cycles || [])] };
}

let cycleNumber = (history.cycles && history.cycles.length > 0 ? history.cycles.length : 0) + 1;
let currentResults = null;
let totalBenchmarkRuns = 0;
const hadBaseline = history.initialBaseline && history.initialBaseline.length > 0;

if (!hadBaseline) {
  log('No baseline found. Running initial full-suite benchmark...');
  const baseline = await workflow({ scriptPath: `${REPO_ROOT}/benchmarks/run-benchmark.js` }, { runId: `baseline-0`, filter: '', threshold: 0.8 });
  totalBenchmarkRuns++;
  history.initialBaseline = baseline && baseline.runId;
  currentResults = baseline;
  if (baseline && baseline.results) {
    history.bestOverallAvg = baseline.results.reduce(function(s, r) { return s + clamp(r.overall); }, 0) / baseline.results.length;
    for (const t of baseline.results) {
      history.perComponentBaselines[t.name] = {
        overall: clamp(t.overall),
        blackBox: clamp(t.blackBox),
        whiteBox: clamp(t.whiteBox),
        rounds: t.rounds || 1,
      };
    }
  }
  log(`Baseline complete: ${baseline ? baseline.passRate : 'N/A'} pass rate`);
} else {
  log(`Resuming from cycle ${history.cycles.length}. Last best avg: ${history.bestOverallAvg}`);
}

log(`Dev loop: cycle ${cycleNumber}, mode=${MODE}, max=${MAX_CYCLES}`);

// ══════════════════════════════════════════════════════════════════════════
//  MAIN LOOP — fast single-component cycles, full suite every 5
// ══════════════════════════════════════════════════════════════════════════
let done = false;
let stalled = false;
let keptChanges = [];
let lastDiagnosis = null;
let skipCounter = 0;

while (!done && !stalled && cycleNumber <= MAX_CYCLES) {

  // ── DIAGNOSE ──────────────────────────────────────────────────────────
  phase('Diagnose');
  const isFullSuiteCycle = (cycleNumber % FULL_SUITE_INTERVAL === 0);

  // Run full suite if it's time, otherwise use stored baselines
  if (isFullSuiteCycle) {
    log(`Full suite cycle ${cycleNumber}. Running benchmark...`);
    const suiteResults = await workflow({ scriptPath: `${REPO_ROOT}/benchmarks/run-benchmark.js` }, { runId: `suite-${cycleNumber}`, filter: '', threshold: 0.8 });
    totalBenchmarkRuns++;
    currentResults = suiteResults;
    if (suiteResults && suiteResults.results) {
      for (const t of suiteResults.results) {
        history.perComponentBaselines[t.name] = { overall: clamp(t.overall), blackBox: clamp(t.blackBox), whiteBox: clamp(t.whiteBox), rounds: t.rounds || 1 };
      }
    }
  }

  const diagnosis = await agent(
    `You are diagnosing engine weaknesses from benchmark results.\n\n` +
    `PRODUCTION-READY: all 7 tests overall >= ${PRODUCTION_THRESHOLD}, black-box >= 0.75, white-box >= 0.75, avg rounds <= ${MAX_AVG_ROUNDS}\n\n` +
    `CURRENT RESULTS / BASELINES:\n${JSON.stringify(history.perComponentBaselines, null, 2)}\n\n` +
    `Analyze each test. For failing ones, identify the weakest sub-axis (general, visual, functional, accessibility, tokenCompliance, typescript, complexity, patterns).\n` +
    `Priority: 1) failing simple 2) failing medium 3) failing complex 4) high rounds\n\n` +
    `Return JSON with: weakestTest, weakestAxis, axisValue, axisBucket, complexity, testOverall, testRounds, failingTests[], allTestsPass, avgRounds, productionReady.`,
    { label: `diagnose:r${cycleNumber}`, phase: 'Diagnose', schema: DIAGNOSIS_SCHEMA },
  );
  lastDiagnosis = diagnosis;

  if (diagnosis && diagnosis.productionReady) {
    log('All tests pass. Production-ready!');
    done = true; break;
  }

  const weakTest = diagnosis?.weakestTest || 'Button';
  const weakAxis = diagnosis?.weakestAxis || 'patterns';
  log(`Target: ${weakTest}/${weakAxis} (${diagnosis?.axisValue})`);

  // ── HYPOTHESIZE ──────────────────────────────────────────────────────
  phase('Hypothesize');
  const axisInfo = AXIS_TO_ENGINE[weakAxis] || AXIS_TO_ENGINE.patterns;
  const primaryFile = axisInfo.primaryFile;
  const engineFileInfo = ENGINE_FILES.find((f) => f.path === primaryFile);

  const hypothesis = await agent(
    `Form a hypothesis to improve the engine.\n\n` +
    `WEAKEST: ${weakTest} / ${weakAxis} (score: ${diagnosis?.axisValue})\n` +
    `PRIMARY FILE: ${primaryFile}\n\n` +
    `CRITICAL: ONE change per cycle. Read the target file first, find the exact text to anchor the edit.\n\n` +
    `Return JSON with: hypothesis, changeFile, operation (insert-after|insert-before|replace-line|replace-block), anchorText (EXACT text from file), insertText (change text), targetMetric ("${weakTest}.${weakAxis}"), expectedDelta (0.05-0.3), expectedDirection (up|down), mechanism, risks.`,
    { label: `hypothesize:r${cycleNumber}`, phase: 'Hypothesize', schema: HYPOTHESIS_SCHEMA },
  );

  if (!hypothesis || !hypothesis.changeFile) {
    log('Failed to form hypothesis. Retrying with simpler prompt...');
    skipCounter++;
    const retry = await agent(
      `Propose ONE simple change to ${primaryFile} to improve ${weakTest}/${weakAxis}. Return JSON with hypothesis, changeFile, operation, anchorText, insertText, targetMetric, expectedDelta, expectedDirection.`,
      { label: `hypothesize:r${cycleNumber}:retry`, phase: 'Hypothesize', schema: HYPOTHESIS_SCHEMA },
    );
    if (retry && retry.changeFile) { Object.assign(hypothesis, retry); }
    else {
      if (skipCounter >= 3) { stalled = true; log('Too many skipped cycles. Stalling.'); break; }
      cycleNumber++; continue;
    }
  }

  log(`Hypothesis: ${(hypothesis.hypothesis || '').slice(0, 100)}`);

  if (MODE === 'suggest') { done = true; break; }

  // ── IMPLEMENT ────────────────────────────────────────────────────────
  phase('Implement');
  const gitBefore = await agent(
    `Run \`cd ${REPO_ROOT} && git status --porcelain -- apps/workspace/templates/claude/ examples/ledger-console/ examples/landing-site/ packages/dsr/src/rules/lint.ts packages/plugin-tailwindcss/src/index.ts packages/backend/src/critique/ packages/mcp-server/src/mcp.ts\`. Return { stdout: "<output>" }.`,
    { label: `git-before:r${cycleNumber}`, phase: 'Implement', schema: GIT_SCHEMA },
  );
  if (gitBefore && typeof gitBefore.stdout === 'string' && gitBefore.stdout.trim().length > 0) {
    log('Working tree changed unexpectedly. Aborting cycle.');
    skipCounter++; if (skipCounter >= 3) { stalled = true; break; }
    cycleNumber++; continue;
  }

  const implementation = await agent(
    `Read the file at ${hypothesis.changeFile}. Find "${hypothesis.anchorText}". Apply ${hypothesis.operation} with text:\n"""${hypothesis.insertText}"""\n` +
    `Write the FULL modified file back. Do NOT change anything else. Then run \`git diff -- ${hypothesis.changeFile}\` and include the output.` +
    ` Return { applied: true|false, diff: "...", error: "..." }`,
    { label: `implement:r${cycleNumber}`, phase: 'Implement', schema: IMPLEMENTATION_SCHEMA },
  );

  if (!implementation || !implementation.applied) {
    log(`Implementation failed: ${implementation?.error}. Skipping.`);
    skipCounter++; if (skipCounter >= 3) { stalled = true; break; }
    cycleNumber++; continue;
  }

  keptChanges.push({ cycle: cycleNumber, file: hypothesis.changeFile, diff: implementation.diff });

  // ── VERIFY (single component, fast) ──────────────────────────────────
  phase('Verify');
  log(`Building "${weakTest}" through core-loop to verify change...`);

  const quickResult = await agent(
    `Build the component "${weakTest}" through the full core-loop and evaluate it.\n\n` +
    `Instruction: Use the active design system. Build a high-quality React+Tailwind component "${weakTest}".\n\n` +
    `Steps:\n` +
    `1. Call get_design_context for "${weakTest}"\n` +
    `2. Call create_component and build through the cascade: lint → visual → a11y → vision → LLM\n` +
    `3. After the component ships or plateaus, run the evaluation:\n` +
    `   - Black-box: run the benchmark-critic (general code review), run_visual_test (visual), functional check, a11y check\n` +
    `   - White-box: analyze source for token compliance, typescript health, complexity, patterns\n` +
    `4. Clamp all scores to [0, 1]. Compute blackBox = 0.30*general + 0.30*visual + 0.25*functional + 0.15*a11y. whiteBox = 0.35*tokenCompliance + 0.25*typescript + 0.20*complexity + 0.20*patterns. overall = 0.6*blackBox + 0.4*whiteBox.\n\n` +
    `Return JSON: { overall, blackBox, whiteBox, general, visual, tokenCompliance, patterns, typescript, rounds, shipped, errors[] }`,
    { label: `verify:r${cycleNumber}`, phase: 'Verify', schema: QUICK_EVAL_SCHEMA },
  );

  // Compare against stored baseline
  const before = history.perComponentBaselines[weakTest] || { overall: 0, blackBox: 0, whiteBox: 0, rounds: 0 };
  const after = {
    overall: quickResult?.overall || 0,
    blackBox: quickResult?.blackBox || 0,
    whiteBox: quickResult?.whiteBox || 0,
    rounds: quickResult?.rounds || 0,
  };

  const targetDelta = after.overall - before.overall;
  const hasRegressions = (after.blackBox < before.blackBox - TOLERANCE) || (after.whiteBox < before.whiteBox - TOLERANCE);
  const targetImproved = targetDelta >= TOLERANCE;
  const hypothesisCorrect = targetImproved && !hasRegressions;

  log(`Verify: overall ${before.overall.toFixed(2)} → ${after.overall.toFixed(2)} (Δ${targetDelta >= 0 ? '+' : ''}${targetDelta.toFixed(2)}) ` +
    `improved=${targetImproved} regressions=${hasRegressions}`);

  // ── DECIDE ───────────────────────────────────────────────────────────
  phase('Decide');
  let decision = 'revert';
  if (hypothesisCorrect) {
    decision = 'keep';
  } else if (targetImproved && !hasRegressions) {
    decision = 'keep';
  } else if (targetImproved && hasRegressions) {
    decision = targetDelta > 0.05 ? 'keep' : (targetDelta > 0 ? 'keep' : 'revert');
  }

  if (decision === 'keep') {
    await agent(
      `Commit the change: cd ${REPO_ROOT} && git add -A && git commit -m "dev-loop cycle ${cycleNumber}: ${(hypothesis.hypothesis || '').slice(0, 100)}" -m "Target: ${hypothesis.targetMetric}\\nDelta: ${targetDelta.toFixed(3)}"`,
      { label: `commit:r${cycleNumber}`, phase: 'Decide' },
    );
  } else {
    await agent(
      `Revert: cd ${REPO_ROOT} && git restore ${hypothesis.changeFile}. Confirm: git diff -- ${hypothesis.changeFile} should be empty.`,
      { label: `revert:r${cycleNumber}`, phase: 'Decide' },
    );
  }

  // Update baselines (with clamping)
  history.perComponentBaselines[weakTest] = {
    overall: clamp(after.overall),
    blackBox: clamp(after.blackBox),
    whiteBox: clamp(after.whiteBox),
    rounds: after.rounds || 1,
  };
  const avgOv = Object.values(history.perComponentBaselines).reduce(function(s, v) { return s + (v.overall || 0); }, 0) / Math.max(1, Object.keys(history.perComponentBaselines).length);
  if (avgOv > history.bestOverallAvg) history.bestOverallAvg = avgOv;

  const cycleEntry = {
    cycle: cycleNumber, hypothesis: hypothesis.hypothesis, changeFile: hypothesis.changeFile,
    targetMetric: hypothesis.targetMetric, targetDelta, kept: decision === 'keep',
    compositeDelta: targetDelta, roundsDelta: after.rounds - before.rounds,
    testComponent: weakTest, regressions: hasRegressions ? [{ test: weakTest, metric: 'overall', delta: targetDelta }] : [],
  };
  history.cycles.push(cycleEntry);
  skipCounter = 0;

  // Persist history
  await agent(
    `Write the dev-loop history to ${REPO_ROOT}/bench-results/dev-loop-history.json:\n${JSON.stringify(history, null, 2)}`,
    { label: `save-history:r${cycleNumber}`, phase: 'Decide' },
  );

  // ── REPORT ───────────────────────────────────────────────────────────
  phase('Report');
  log(`Cycle ${cycleNumber}: ${decision.toUpperCase()} — ${weakTest} overall ${before.overall.toFixed(2)} → ${after.overall.toFixed(2)} (Δ${targetDelta >= 0 ? '+' : ''}${targetDelta.toFixed(2)})`);
  log(`History: ${history.cycles.length} cycles, best avg ${history.bestOverallAvg.toFixed(3)}`);

  // ── CHECK ────────────────────────────────────────────────────────────
  phase('Check');
  // Production-ready check
  const allOver80 = Object.values(history.perComponentBaselines).every(function(v) { return (v.overall || 0) >= PRODUCTION_THRESHOLD; });
  if (allOver80 && avgOv >= PRODUCTION_THRESHOLD) {
    done = true; log('Production-ready! All components at threshold.'); break;
  }

  // Stall detection
  const last3 = history.cycles.slice(-3);
  if (last3.length >= 3 && last3.every(function(c) { return !c.kept; })) {
    stalled = true; log('Stalled: last 3 cycles all reverted.'); break;
  }
  if (skipCounter >= 3) { stalled = true; log('Stalled: too many skipped cycles.'); break; }

  if (cycleNumber >= MAX_CYCLES) { log('Max cycles reached.'); break; }
  cycleNumber++;
  log(`--- Starting cycle ${cycleNumber} ---`);
}

// ══════════════════════════════════════════════════════════════════════════
//  FINAL RETURN
// ══════════════════════════════════════════════════════════════════════════
const finalAvg = Object.values(history.perComponentBaselines).reduce(function(s, v) { return s + (v.overall || 0); }, 0) / Math.max(1, Object.keys(history.perComponentBaselines).length);

log(`\n══════════════════════════════════════`);
log(`DEV LOOP COMPLETE — ${history.cycles.length} cycles, ${totalBenchmarkRuns} full benchmarks`);
log(`Best avg: ${history.bestOverallAvg.toFixed(3)} | Final avg: ${finalAvg.toFixed(3)} | Production-ready: ${done}`);
log(`══════════════════════════════════════`);

return {
  name: 'dev-loop', cyclesCompleted: history.cycles.length, totalBenchmarkRuns,
  productionReady: done || false, stalled: stalled || false,
  finalAvgOverall: finalAvg,
  perComponentBaselines: history.perComponentBaselines,
  history: history.cycles.map(function(c) { return { cycle: c.cycle, kept: c.kept, testComponent: c.testComponent, targetDelta: c.targetDelta, compositeDelta: c.compositeDelta }; }),
  keptChanges: keptChanges.map(function(k) { return { cycle: k.cycle, file: k.file }; }),
  summary: `Dev loop: ${history.cycles.length} cycles. Best avg: ${history.bestOverallAvg.toFixed(3)}. Production-ready: ${done}.`,
};
