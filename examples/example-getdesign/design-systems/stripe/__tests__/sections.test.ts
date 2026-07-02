/**
 * Tests for Design System section stories and Showcase.
 *
 * Verifies that each section story file exists and that the Showcase
 * story file properly imports and exports all section components.
 */

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CODE_DIR = path.resolve(HERE, '..', 'code');

/* ---- Section story files ---- */

const SECTION_FILES: string[] = [
  'Hero.stories.tsx',
  'ColorPalette.stories.tsx',
  'Typography.stories.tsx',
  'SpacingShapes.stories.tsx',
  'Components.stories.tsx',
  'DashboardMockup.stories.tsx',
];

/* ---- Section component names each file should export ---- */

const SECTION_EXPORTS: Record<string, string[]> = {
  'Hero.stories.tsx': ['HeroSection'],
  'ColorPalette.stories.tsx': ['ColorPaletteSection'],
  'Typography.stories.tsx': ['TypographySection'],
  'SpacingShapes.stories.tsx': ['SpacingShapesSection'],
  'Components.stories.tsx': ['ComponentsSection'],
  'DashboardMockup.stories.tsx': ['DashboardMockupSection'],
};

/* ---- Tests ---- */

describe('Design System stripe — section stories', () => {
  for (const file of SECTION_FILES) {
    const filePath = path.join(CODE_DIR, file);
    const expectedExports = SECTION_EXPORTS[file];

    describe(file, () => {
      it('file exists on disk', () => {
        expect(fs.existsSync(filePath)).toBe(true);
      });

      it('file is not empty', () => {
        const content = fs.readFileSync(filePath, 'utf8');
        expect(content.length).toBeGreaterThan(0);
      });

      it('file exports section component', async () => {
        const mod = await import(filePath);
        for (const exp of expectedExports) {
          expect(mod[exp]).toBeDefined();
          expect(typeof mod[exp]).toBe('function');
        }
      });

      it('file has a default story meta export', async () => {
        const mod = await import(filePath);
        expect(mod.default).toBeDefined();
      });

      it('meta title starts with "Design System/stripe/"', async () => {
        const mod = await import(filePath);
        const meta = mod.default;
        expect(meta.title).toBeDefined();
        expect(meta.title).toMatch(/^Design System\/stripe\//);
      });

      it('exported section component returns valid JSX', async () => {
        const mod = await import(filePath);
        for (const exp of expectedExports) {
          const Component = mod[exp];
          expect(() => {
            const result = (Component as React.FC)({});
            // Should be a valid React element or null (not throw)
            expect(result).toBeDefined();
          }).not.toThrow();
        }
      });
    });
  }
});

describe('Design System stripe — Showcase', () => {
  const showcasePath = path.join(CODE_DIR, 'Showcase.stories.tsx');

  it('Showcase.stories.tsx file exists', () => {
    expect(fs.existsSync(showcasePath)).toBe(true);
  });

  it('Showcase.stories.tsx is not empty', () => {
    const content = fs.readFileSync(showcasePath, 'utf8');
    expect(content.length).toBeGreaterThan(0);
  });

  it('exports DesignSystemOverview component', async () => {
    const mod = await import(showcasePath);
    expect(mod.DesignSystemOverview).toBeDefined();
    expect(typeof mod.DesignSystemOverview).toBe('function');
  });

  it('has default story meta export', async () => {
    const mod = await import(showcasePath);
    expect(mod.default).toBeDefined();
  });

  it('meta title is "Design System/stripe"', async () => {
    const mod = await import(showcasePath);
    expect(mod.default.title).toBe('Design System/stripe');
  });

  it('Showcase content includes all section imports', () => {
    const content = fs.readFileSync(showcasePath, 'utf8');
    const sectionFiles = [
      'Hero.stories',
      'ColorPalette.stories',
      'Typography.stories',
      'SpacingShapes.stories',
      'Components.stories',
      'DashboardMockup.stories',
    ];
    for (const file of sectionFiles) {
      expect(content).toContain(file);
    }
  });
});
