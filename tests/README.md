# @emdesign/tests

## Philosophy

These tests follow one rule: **a passing test means the feature works.**
No silent skips, no fallback paths, no bending the test to match broken code.

Two kinds of tests:

- **Contract tests** — define what the system SHOULD do. They fail when
  behavior regresses. Every test here runs the actual CLI binary or hits
  the actual HTTP API.

- **Known-issue tests** (`test.fails()`) — define what the system SHOULD
  do but currently doesn't. When a bug is fixed, the `test.fails()` marker
  starts passing and alerts us to remove it. Look in `known-issues.test.ts`.

## Running

```bash
# Init and CLI tests (no backend required)
npm run test:smoke

# API tests (requires backend on :4321 — `npm run backend`)
npx vitest run tests/api.test.ts

# All tests including known-issues
npx vitest run tests/
```

## Currently documented bugs

See `known-issues.test.ts`. Each `test.fails()` names the broken feature
with a description of expected vs actual behavior. Fix one and the test
files red at you — that's how you know to remove the fails marker.
