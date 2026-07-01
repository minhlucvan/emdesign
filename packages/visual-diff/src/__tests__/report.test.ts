/**
 * Tests for visual-diff report generation and fix instructions.
 */

import { describe, it, expect } from 'vitest';
import { generateFixInstructions, generateHtmlReport } from '../report.js';
import type { HtmlDiffResult } from '../types.js';

// ---------------------------------------------------------------------------
// generateFixInstructions
// ---------------------------------------------------------------------------

describe('generateFixInstructions', () => {
  const mockResult: HtmlDiffResult = {
    overallScore: 85.5,
    pixel: { score: 80, changedPixels: 1000, totalPixels: 10000, diffPng: null, regions: [], severity: { critical: 500, significant: 300, minor: 200, totalPixels: 10000 }, ssimScore: 0.85 },
    structure: { score: 90, missingElements: [{ tag: 'button', selector: '.hero button', text: 'Get Started', box: { x: 100, y: 200, width: 120, height: 40 } }], extraElements: [], matchedCount: 10, baselineCount: 11, targetCount: 10 },
    elementDiffs: [],
    feedback: [
      { selector: '.hero h1', tag: 'h1', box: { x: 100, y: 50, width: 400, height: 50 }, property: 'color', baselineValue: 'rgb(13, 37, 61)', actualValue: 'rgb(100, 100, 100)', severity: 'high' },
      { selector: '.hero button', tag: 'button', box: { x: 100, y: 200, width: 120, height: 40 }, property: 'backgroundColor', baselineValue: 'rgb(83, 58, 253)', actualValue: 'rgb(68, 52, 212)', severity: 'high' },
      { selector: '.card', tag: 'div', box: { x: 0, y: 400, width: 300, height: 200 }, property: 'borderRadius', baselineValue: '12px', actualValue: '4px', severity: 'medium' },
    ],
    regions: [],
    viewport: { width: 1280, height: 720 },
    timestamp: new Date().toISOString(),
  };

  it('generates fix instructions for all feedback items', () => {
    const instructions = generateFixInstructions(mockResult);
    expect(instructions.length).toBeGreaterThanOrEqual(3);
    expect(instructions[0].priority).toBe('high');  // sorted: high first
  });

  it('includes missing elements from structure diff', () => {
    const instructions = generateFixInstructions(mockResult, 'Hero Section');
    const missingEl = instructions.find(i => i.expectedValue === 'present');
    expect(missingEl).toBeDefined();
    expect(missingEl!.target).toBe('Hero Section');
  });

  it('prioritizes high-severity items first', () => {
    const noMissing = { ...mockResult, structure: { ...mockResult.structure, missingElements: [] } };
    const instructions = generateFixInstructions(noMissing);
    expect(instructions[0].priority).toBe('high');
    const lastHighIdx = instructions.map(i => i.priority).lastIndexOf('high');
    const firstMedIdx = instructions.map(i => i.priority).indexOf('medium');
    expect(lastHighIdx).toBeLessThan(firstMedIdx);
  });

  it('deduplicates identical selector+property pairs', () => {
    const noMissing = { ...mockResult, structure: { ...mockResult.structure, missingElements: [] } };
    const result = { ...noMissing, feedback: [...noMissing.feedback, ...noMissing.feedback] };
    const instructions = generateFixInstructions(result);
    expect(instructions.length).toBe(noMissing.feedback.length);
  });
});

// ---------------------------------------------------------------------------
// generateHtmlReport
// ---------------------------------------------------------------------------

describe('generateHtmlReport', () => {
  const mockResult: HtmlDiffResult = {
    overallScore: 97.8,
    pixel: { score: 100, changedPixels: 0, totalPixels: 10000, diffPng: null, regions: [], severity: { critical: 0, significant: 0, minor: 0, totalPixels: 10000 }, ssimScore: 1 },
    structure: { score: 100, missingElements: [], extraElements: [], matchedCount: 10, baselineCount: 10, targetCount: 10 },
    elementDiffs: [],
    feedback: [],
    regions: [
      { col: 0, row: 0, x: 0, y: 0, width: 160, height: 90, changedPixels: 0, totalPixels: 14400, diffRatio: 0, label: 'col-1-row-1', domFeedback: null },
      { col: 1, row: 0, x: 160, y: 0, width: 160, height: 90, changedPixels: 0, totalPixels: 14400, diffRatio: 0, label: 'col-2-row-1', domFeedback: null },
    ],
    viewport: { width: 1280, height: 720 },
    timestamp: new Date().toISOString(),
  };

  it('generates valid HTML', () => {
    const html = generateHtmlReport(mockResult, 'preview.html', 'overview.html');
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('Visual Diff Report');
    expect(html).toContain('97.8');
    expect(html).toContain('preview.html');
    expect(html).toContain('overview.html');
  });

  it('includes region breakdown when regions have diffs', () => {
    const resultWithDiff = {
      ...mockResult,
      regions: mockResult.regions.map(r => ({ ...r, diffRatio: 0.05, changedPixels: 100 })),
    };
    const html = generateHtmlReport(resultWithDiff, 'a', 'b');
    expect(html).toContain('col-1-row-1');
  });

  it('includes fix instructions section when there are feedback items', () => {
    const resultWithFeedback: HtmlDiffResult = {
      ...mockResult,
      feedback: [{ selector: '.btn', tag: 'button', box: { x: 0, y: 0, width: 50, height: 20 }, property: 'backgroundColor', baselineValue: 'blue', actualValue: 'red', severity: 'high' }],
    };
    const html = generateHtmlReport(resultWithFeedback, 'a', 'b');
    expect(html).toContain('Fix Instructions');
    expect(html).toContain('blue');
    expect(html).toContain('red');
  });
});
