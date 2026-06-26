/**
 * Tests `emdesign init react-tailwind <dir>`.
 *
 * VALUE: Verifies the init command creates the expected project scaffold
 * on disk. These tests fail if the init template changes in a breaking way.
 */
import { describe, it, expect } from 'vitest';
import { tmpDir, assertFileExists, assertDirExists, assertFileContains } from './helpers/fs.js';
import { runEmdesign, expectSuccess } from './helpers/cli.js';

describe('emdesign init', () => {
  it('creates core config files', async () => {
    const dir = tmpDir();
    const r = await runEmdesign(['init', 'react-tailwind', dir], { timeout: 30_000 });
    expectSuccess(r);

    assertFileExists(dir, 'emdesign.config.json');
    assertFileExists(dir, 'CLAUDE.md');
    assertFileExists(dir, 'package.json');
    assertFileExists(dir, 'tailwind.config.js');
  });

  it('creates Storybook scaffolding', async () => {
    const dir = tmpDir();
    const r = await runEmdesign(['init', 'react-tailwind', dir], { timeout: 30_000 });
    expectSuccess(r);

    assertFileExists(dir, '.storybook', 'main.ts');
    assertFileExists(dir, '.storybook', 'preview.tsx');
  });

  it('creates Claud workspace structure', async () => {
    const dir = tmpDir();
    const r = await runEmdesign(['init', 'react-tailwind', dir], { timeout: 30_000 });
    expectSuccess(r);

    assertDirExists(dir, '.claude');
    assertDirExists(dir, '.claude', 'agents');
    assertDirExists(dir, '.claude', 'commands', 'mds');
    assertDirExists(dir, '.claude', 'skills');
    assertDirExists(dir, '.claude', 'workflows');
  });

  it('seeds the atelier design system', async () => {
    const dir = tmpDir();
    const r = await runEmdesign(['init', 'react-tailwind', dir], { timeout: 30_000 });
    expectSuccess(r);

    assertDirExists(dir, 'design-systems', 'atelier');
    assertFileExists(dir, 'design-systems', 'atelier', 'DESIGN.md');
    assertFileExists(dir, 'design-systems', 'atelier', 'tokens.css');
    assertDirExists(dir, 'design-systems', 'atelier', 'code');
  });

  it('creates src directory with index.css and active-design-system.css', async () => {
    const dir = tmpDir();
    const r = await runEmdesign(['init', 'react-tailwind', dir], { timeout: 30_000 });
    expectSuccess(r);

    assertDirExists(dir, 'src');
    assertFileExists(dir, 'src', 'index.css');
    assertFileExists(dir, 'src', 'active-design-system.css');
  });

  it('package.json includes storybook dependency', async () => {
    const dir = tmpDir();
    const r = await runEmdesign(['init', 'react-tailwind', dir], { timeout: 30_000 });
    expectSuccess(r);

    assertFileContains(dir, 'package.json', 'storybook');
  });

  it('rejects an invalid framework name', async () => {
    const dir = tmpDir();
    const r = await runEmdesign(['init', 'nonexistent-framework', dir], { timeout: 15_000 });
    expect(r.exitCode).not.toBe(0);
    expect(r.stderr.toLowerCase()).toContain('unknown');
  });
});
