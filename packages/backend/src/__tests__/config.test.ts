import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

// ---------------------------------------------------------------------------
// R25 — emdesign.config.json Schema
// Table cases: valid config, missing-framework fallback, path resolution
// ---------------------------------------------------------------------------

/** Helper: create a temp directory with an optional emdesign.config.json. */
let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'emdesign-config-test-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

function writeConfig(partial: Record<string, unknown>): void {
  const cfg = {
    framework: 'react-tailwind',
    storybookUrl: 'http://localhost:6006',
    generatedDir: 'src/generated',
    componentsDir: 'src/components',
    designSystemsDir: 'design-systems',
    screenshotsDir: '__screenshots__',
    ...partial,
  };
  fs.writeFileSync(path.join(tmpDir, 'emdesign.config.json'), JSON.stringify(cfg, null, 2));
}

describe('readConfig', () => {
  it('loads a valid emdesign.config.json with all fields', async () => {
    const { readConfig } = await import('../paths.js');
    writeConfig({});
    const cfg = readConfig(tmpDir);
    expect(cfg.framework).toBe('react-tailwind');
    expect(cfg.storybookUrl).toBe('http://localhost:6006');
    expect(cfg.generatedDir).toBe('src/generated');
    expect(cfg.componentsDir).toBe('src/components');
    expect(cfg.designSystemsDir).toBe('design-systems');
  });

  it('reads the framework field from config', async () => {
    const { readConfig } = await import('../paths.js');
    writeConfig({ framework: 'vue' });
    const cfg = readConfig(tmpDir);
    expect(cfg.framework).toBe('vue');
  });

  it('returns defaults when no config file exists', async () => {
    const { readConfig } = await import('../paths.js');
    const cfg = readConfig(tmpDir);
    expect(cfg.framework).toBe('react-tailwind');
    expect(cfg.generatedDir).toBe('src/generated');
  });

  // R25 negative scenario: loading with missing required field (e.g. no framework) —
  // the current implementation returns defaults rather than an error.
  // This test asserts the intended SPEC behaviour: missing required field → error.
  it('returns error when required field "framework" is missing (negative)', async () => {
    const { readConfig } = await import('../paths.js');
    writeConfig({});
    // Delete the framework key from the written config
    const raw = JSON.parse(fs.readFileSync(path.join(tmpDir, 'emdesign.config.json'), 'utf8'));
    delete raw.framework;
    fs.writeFileSync(path.join(tmpDir, 'emdesign.config.json'), JSON.stringify(raw, null, 2));
    // The current code silently defaults, but the spec says missing required → error
    const cfg = readConfig(tmpDir);
    // EXPECTED (RED): this assertion will FAIL because readConfig returns defaults instead
    expect(cfg.framework).toBeUndefined();
  });
});

describe('resolveRepoPaths', () => {
  it('resolves all directory paths relative to project root', async () => {
    const { resolveRepoPaths } = await import('../paths.js');
    writeConfig({
      generatedDir: 'custom-gen',
      componentsDir: 'custom-comps',
      designSystemsDir: 'my-ds',
    });
    const paths = resolveRepoPaths(tmpDir);
    expect(paths.root).toBe(tmpDir);
    expect(paths.generatedDir).toBe(path.join(tmpDir, 'custom-gen'));
    expect(paths.componentsDir).toBe(path.join(tmpDir, 'custom-comps'));
    expect(paths.designSystemsDir).toBe(path.join(tmpDir, 'my-ds'));
    expect(paths.stateFile).toBe(path.join(tmpDir, '.emdesign', 'state.json'));
  });

  it('includes emdesignDir, studioDir, screenshotsDir', async () => {
    const { resolveRepoPaths } = await import('../paths.js');
    writeConfig({});
    const paths = resolveRepoPaths(tmpDir);
    expect(paths.emdesignDir).toBe(path.join(tmpDir, '.emdesign'));
    expect(paths.studioDir).toBe(tmpDir);
    expect(paths.screenshotsDir).toBe(path.join(tmpDir, '__screenshots__'));
  });

  it('resolves plugins stack from config', async () => {
    const { resolveRepoPaths } = await import('../paths.js');
    writeConfig({ plugins: ['react', 'css', 'tailwind'] });
    const paths = resolveRepoPaths(tmpDir);
    expect(paths.plugins).toEqual(['react', 'css', 'tailwind']);
  });

  it('derives plugin stack from framework when no plugins field', async () => {
    const { resolveRepoPaths } = await import('../paths.js');
    writeConfig({});
    const paths = resolveRepoPaths(tmpDir);
    expect(paths.plugins).toEqual(['react', 'css', 'tailwind']);
  });

  it('sets storybookUrl from config', async () => {
    const { resolveRepoPaths } = await import('../paths.js');
    writeConfig({ storybookUrl: 'http://localhost:9009' });
    const paths = resolveRepoPaths(tmpDir);
    expect(paths.storybookUrl).toBe('http://localhost:9009');
  });
});

describe('frameworkToStack', () => {
  it('maps react-tailwind to react, css, tailwind', async () => {
    const { frameworkToStack } = await import('../paths.js');
    expect(frameworkToStack('react-tailwind')).toEqual(['react', 'css', 'tailwind']);
  });

  it('passthrough for unknown frameworks', async () => {
    const { frameworkToStack } = await import('../paths.js');
    expect(frameworkToStack('vue')).toEqual(['vue']);
  });
});
