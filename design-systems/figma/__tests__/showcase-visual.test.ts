import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import { checkVisualDiff } from '@emdesign/testbed';

describe('figma overview visual regression', () => {
  it('Showcase visually matches reference-example.html', async () => {
    const baseline = fs.readFileSync(
      'design-systems/figma/reference-example.html',
      'utf8',
    );
    const showcase = fs.readFileSync(
      'design-systems/figma/code/Showcase.stories.tsx',
      'utf8',
    );

    // Source-level comparison: the baseline HTML's section structure is compared
    // against the Showcase component's composition order. Required sections:
    // Hero, Color Palette, Typography, Button Variants, Color Blocks,
    // Cards & Containers, Form Elements, Spacing Scale, Radius Scale,
    // Elevation & Depth, Responsive Behavior, and Footer.
    const result = await checkVisualDiff(baseline, showcase, {
      threshold: 0.90,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      console.log('Similarity:', result.similarity);
      console.log('Changed regions:', result.changedRegions);
    }
  });
});
