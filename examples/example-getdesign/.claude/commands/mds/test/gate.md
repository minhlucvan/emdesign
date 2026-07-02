---
name: "MDS: Test Gate"
description: Run the composite quality gate (doctor) on a component. This is the authoritative ship/revise decision. Unlike /mds:review (read-only), this runs the full weighted composite and produces a decision. Writes a .test.ts file and runs vitest.
category: Test
tags: [test, gate, doctor, vitest, ship]
---

# MDS: Test Gate

Usage: `/mds:test:gate <name> [--threshold 0.8] [--source <path>]`

Example: `/mds:test:gate StatsCard --threshold 0.85`

## Workflow

1. **Write test file** to `src/__tests__/<Name>-gate.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import { resolveRepoPaths } from '@emdesign/backend';
import { runDoctor } from '@emdesign/testbed';
const paths = resolveRepoPaths();
const name = '<Name>';
const source = fs.readFileSync('<SourcePath>', 'utf8');
describe(`${name} gate`, () => {
  it('passes doctor (composite >= threshold && mustFix === 0)', async () => {
    const result = await runDoctor(paths, name, source, { threshold: 0.8 });
    expect(result.decision).toBe('ship');
  });
});
```

2. **Run vitest**: `$ npx vitest run src/__tests__/<Name>-gate.test.ts --reporter=json`
3. **If RED** — address P0/P1 findings, re-run
4. **If GREEN** — ship decision confirmed

## Gate Criteria

```
composite >= threshold  AND  mustFix === 0
```

Where composite is the unweighted mean of all dimension scores (lint, snapshot, spatial, ...).

## Decision Meanings

| Decision | Meaning |
|---|---|
| `ship` | Pass — all criteria met |
| `revise` | Composite below threshold — needs improvement |
| `continue` | Good average but blocking issues remain |

## Guardrails

- The gate is read-only — it never edits
- Must run after all other test levels
- Never ship on `revise` or `continue`
