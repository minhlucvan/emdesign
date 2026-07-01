/**
 * @emdesign/visual-diff — Comprehensive multi-layer visual diff engine.
 *
 * Three-layer comparison:
 *   1. Pixel diff  — pixelmatch + SSIM + connected component analysis + per-region scoring
 *   2. Structure   — DOM element matching by tag, text, and position
 *   3. Computed CSS — per-element style property matching
 *
 * Returns a structured report with 0-100 overall score, per-region breakdown,
 * element-level diffs, and agent-friendly feedback pinpointing differences.
 */

export { compareHtmlDocuments, compareFiles, compareUrlDocuments, generateDiffImage, measureSimilarity, computeRegionGrid } from './engine.js';
export { generateFixInstructions, generateHtmlReport } from './report.js';
export type { FixInstruction } from './report.js';
export { cropRegion, extractElementText } from './crop.js';
export type {
  HtmlDiffResult,
  PixelDiffResult,
  StructureDiffResult,
  ElementDiff,
  PropertyDiff,
  ElementRef,
  DiffRegion,
  SeverityBreakdown,
  RegionDiffCell,
  DomElementDiff,
  DomRegionFeedback,
  Anchor,
  AnchorMatch,
  AncestorNode,
  CompareOptions,
  FileCompareOptions,
  RegionDiffOptions,
  ScoreOverrides,
} from './types.js';
