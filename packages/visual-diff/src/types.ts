/**
 * Type definitions for @emdesign/visual-diff.
 *
 * Adapted from concepts in webdiff (github.com/vibehat/uirip):
 * - Three-layer pixel + structure + CSS comparison
 * - Anchor-based element matching by identity keys
 * - Per-region/segment scoring with P0 penalties
 * - Iteration history for convergence tracking
 */

// ---------------------------------------------------------------------------
// Core result types
// ---------------------------------------------------------------------------

export interface HtmlDiffResult {
  /** Overall similarity score 0-100 (weighted combination of all layers). */
  overallScore: number;
  /** Pixel-level comparison result. */
  pixel: PixelDiffResult;
  /** DOM structure comparison result. */
  structure: StructureDiffResult;
  /** Per-element computed style comparison results. */
  elementDiffs: ElementDiff[];
  /** Aggregate DOM-level feedback for agent consumption. */
  feedback: DomElementDiff[];
  /** Per-region (grid-based) breakdown. */
  regions: RegionDiffCell[];
  /** Viewport dimensions used for the comparison. */
  viewport: { width: number; height: number };
  /** Timestamp of the comparison. */
  timestamp: string;
}

// ---------------------------------------------------------------------------
// Pixel diff types
// ---------------------------------------------------------------------------

export interface PixelDiffResult {
  /** Pixel similarity score 0-100. */
  score: number;
  /** Total pixels that differ. */
  changedPixels: number;
  /** Total pixels compared. */
  totalPixels: number;
  /** Annotated diff image as PNG buffer (red overlay on differences). */
  diffPng: Buffer | null;
  /** Diff regions (connected components) found in the diff image. */
  regions: DiffRegion[];
  /** Per-severity breakdown at multiple thresholds. */
  severity: SeverityBreakdown;
  /** SSIM (structural similarity) score 0-1. */
  ssimScore: number;
}

export interface DiffRegion {
  id: number;
  bbox: { x: number; y: number; width: number; height: number };
  centroid: { x: number; y: number };
  pixelCount: number;
  percentOfImage: number;
}

export interface SeverityBreakdown {
  /** Pixels differing at threshold ≤ 0.3 (very obvious). */
  critical: number;
  /** Pixels differing at threshold ≤ 0.1 but not at 0.3. */
  significant: number;
  /** Pixels differing at threshold ≤ 0.05 but not at 0.1. */
  minor: number;
  /** Total pixels compared. */
  totalPixels: number;
}

// ---------------------------------------------------------------------------
// Structure diff types
// ---------------------------------------------------------------------------

export interface StructureDiffResult {
  /** Structure similarity score 0-100. */
  score: number;
  /** Elements present in baseline but missing in target. */
  missingElements: ElementRef[];
  /** Elements present in target but not in baseline. */
  extraElements: ElementRef[];
  /** Number of elements matched across both pages. */
  matchedCount: number;
  /** Total elements in baseline. */
  baselineCount: number;
  /** Total elements in target. */
  targetCount: number;
}

export interface ElementRef {
  tag: string;
  selector: string;
  text: string;
  box: { x: number; y: number; width: number; height: number } | null;
}

// ---------------------------------------------------------------------------
// Element / anchor matching types
// ---------------------------------------------------------------------------

export interface Anchor {
  tag: string;
  identityKey: string;
  text: string;
  selector: string;
  classes: string[];
  ancestors: AncestorNode[];
  attrs: Record<string, string>;
  bbox: { x: number; y: number; width: number; height: number } | null;
}

export interface AncestorNode {
  tag: string;
  identityKey: string;
  classes: string[];
}

export interface AnchorMatch {
  templateAnchor: Anchor;
  liveAnchor: Anchor | null;
  status: 'matched' | 'missing' | 'extra';
  elementScore: number;
  pathScore: number;
  details: Record<string, unknown>;
}

export interface ElementDiff {
  selector: string;
  tag: string;
  text: string;
  propertyDiffs: PropertyDiff[];
  styleScore: number;
}

export interface PropertyDiff {
  property: string;
  expected: string;
  actual: string;
}

// ---------------------------------------------------------------------------
// DOM feedback types (for agent consumption)
// ---------------------------------------------------------------------------

export interface DomElementDiff {
  selector: string;
  tag: string;
  box: { x: number; y: number; width: number; height: number };
  property: string;
  baselineValue: string;
  actualValue: string;
  severity: 'high' | 'medium' | 'low';
}

export interface DomRegionFeedback {
  differences: DomElementDiff[];
  summary: string;
}

// ---------------------------------------------------------------------------
// Region types
// ---------------------------------------------------------------------------

export interface RegionDiffCell {
  col: number;
  row: number;
  x: number;
  y: number;
  width: number;
  height: number;
  changedPixels: number;
  totalPixels: number;
  diffRatio: number;
  label: string;
  domFeedback: DomRegionFeedback | null;
}

export interface RegionResult {
  label: string;
  col: number;
  row: number;
  x: number;
  y: number;
  width: number;
  height: number;
  changedPixels: number;
  totalPixels: number;
  diffRatio: number;
}

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

export interface CompareOptions {
  viewport?: { width: number; height: number };
  deviceScaleFactor?: number;
  threshold?: number;
  regionGrid?: string;
  overlayAlpha?: number;
  enableDomFeedback?: boolean;
}

export interface FileCompareOptions extends CompareOptions {
  diffOutput?: string;
}

export interface RegionDiffOptions {
  cols: number;
  rows: number;
}

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

export interface ScoreOverrides {
  pixelWeight?: number;
  structureWeight?: number;
  cssWeight?: number;
  p0Penalty?: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const ANCHOR_TAGS = new Set(['a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img', 'button']);
export const LANDMARK_TAGS = new Set(['header', 'main', 'footer', 'nav', 'section', 'article', 'aside']);
export const SKIP_TAGS = new Set(['script', 'style', 'noscript', 'link', 'meta', 'head', 'template']);
export const CONTAINER_TAGS = new Set(['div', 'main', 'section', 'article', 'aside']);
