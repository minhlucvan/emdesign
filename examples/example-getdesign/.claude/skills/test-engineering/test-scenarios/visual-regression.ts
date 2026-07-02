// Test template: visual-regression
// Agent: copy this file, replace <BaselineHtml> and <CurrentHtml>,
// write to src/__tests__/visual-<Name>.test.ts
// Then run: $ npx vitest run src/__tests__/visual-<Name>.test.ts --reporter=json
//
// Levels: Visual (similarity, DOM structure)
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import { checkVisualDiff, assertDomSnapshotMatches } from '@emdesign/testing';

const baselinePath = '<BaselinePath>';
const currentPath = '<CurrentPath>';
const threshold = 0.98;

describe('visual regression', () => {
  const baselineHtml = fs.existsSync(baselinePath) ? fs.readFileSync(baselinePath, 'utf8') : '';
  const currentHtml = fs.existsSync(currentPath) ? fs.readFileSync(currentPath, 'utf8') : '';

  it('baseline and current HTML exist', () => {
    expect(baselineHtml.length).toBeGreaterThan(0);
    expect(currentHtml.length).toBeGreaterThan(0);
  });

  it('DOM structure matches baseline', () => {
    if (baselineHtml && currentHtml) {
      expect(() => assertDomSnapshotMatches(currentHtml, baselineHtml, 'visual-regression')).not.toThrow();
    }
  });

  it('visual similarity meets threshold', async () => {
    if (baselineHtml && currentHtml) {
      const result = await checkVisualDiff(baselineHtml, currentHtml);
      expect(result.similarity).toBeGreaterThanOrEqual(threshold);
    }
  });
});
