/**
 * Tests CLI subcommands that produce output.
 *
 * VALUE: Verifies CLI commands execute without errors and return
 * expected output shapes. These test the actual CLI binary.
 *
 * Known gaps (not tested here — see known-issues.test.ts):
 *   - `--help` / `--version` flags not supported
 *   - `ds doctor` unreliable
 *   - `lint` / `visual-test` gates (need running backend + Storybook)
 */
import { describe, it, expect } from 'vitest';
import { runEmdesign, expectSuccess } from './helpers/cli.js';

describe('emdesign CLI', () => {
  it('frameworks returns a JSON list containing react', async () => {
    const r = await runEmdesign(['frameworks']);
    expectSuccess(r);
    // Test: output must contain react-tailwind
    expect(r.stdout).toMatch(/react/i);
  });

  it('plugins returns a JSON array', async () => {
    const r = await runEmdesign(['plugins']);
    expectSuccess(r);
    const parsed = JSON.parse(r.stdout);
    expect(Array.isArray(parsed)).toBe(true);
  });

  it('ds list returns a JSON array of design systems', async () => {
    const r = await runEmdesign(['ds', 'list']);
    expectSuccess(r);
    const parsed = JSON.parse(r.stdout);
    expect(Array.isArray(parsed)).toBe(true);
  });
});
