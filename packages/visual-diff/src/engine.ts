/**
 * @emdesign/visual-diff — Comprehensive multi-layer visual diff engine.
 *
 * Three-layer comparison (adapted from webdiff/vibehat):
 *   1. Pixel diff  — pixelmatch + SSIM + connected component analysis
 *   2. Structure   — DOM hierarchy / element matching by identity keys
 *   3. Computed CSS — per-element style property matching
 *
 * Each layer returns a 0-100 score. The overall score is a weighted combination.
 * Output includes per-region breakdown, element-level diffs, and agent-friendly
 * structured feedback identifying exactly what changed and where.
 */

import { chromium } from 'playwright';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { Buffer } from 'node:buffer';
import type {
  HtmlDiffResult,
  CompareOptions,
  PixelDiffResult,
  StructureDiffResult,
  ElementDiff,
  ElementRef,
  DiffRegion,
  SeverityBreakdown,
  RegionDiffCell,
  DomElementDiff,
  DomRegionFeedback,
  Anchor,
  AnchorMatch,
  ScoreOverrides,
} from './types.js';
import { ANCHOR_TAGS, LANDMARK_TAGS, SKIP_TAGS, CONTAINER_TAGS } from './types.js';

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

const DEFAULT_VIEWPORT = { width: 1280, height: 720 };
const DEFAULT_THRESHOLD = 0.2;
const DEFAULT_GRID = { cols: 8, rows: 8 };
const DEVICE_SCALE_FACTOR = 2;
const P0_PENALTY = 0.95; // 5% compounding penalty per missing anchor

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Compare two HTML strings across all three layers and return a comprehensive
 * diff result with pixel, structure, and computed CSS scores.
 */
export async function compareHtmlDocuments(
  htmlA: string,
  htmlB: string,
  opts: CompareOptions = {},
): Promise<HtmlDiffResult> {
  const viewport = opts.viewport ?? DEFAULT_VIEWPORT;
  const threshold = opts.threshold ?? DEFAULT_THRESHOLD;
  const grid = parseGrid(opts.regionGrid);
  const enableDom = opts.enableDomFeedback !== false;

  const browser = await chromium.launch({ headless: true });
  try {
    // ── Render both pages (no screenshot yet - must scroll first) ──
    const { page: pageA } = opts.referenceUrl
      ? await renderUrl(browser, opts.referenceUrl, viewport)
      : await renderHtml(browser, htmlA, viewport);
    const { page: pageB } = opts.targetUrl
      ? await renderUrl(browser, opts.targetUrl, viewport)
      : await renderHtml(browser, htmlB, viewport);

    // ── Scroll crop targets into view before screenshotting ──
    // This ensures off-screen elements (e.g. sections far down a long page)
    // are visible in the viewport screenshot and can be properly cropped.
    if (opts.referenceSelector) {
      await scrollToSelector(pageA, opts.referenceSelector);
    }
    if (opts.targetSelector) {
      await scrollToSelector(pageB, opts.targetSelector);
    }

    // ── Now take screenshots (after scrolling) ──
    const pngA = await pageA.screenshot({ fullPage: false, type: 'png' });
    const pngB = await pageB.screenshot({ fullPage: false, type: 'png' });

    // ── Crop by selector if requested (bbox is viewport-relative after scroll) ──
    let cropBboxA: { x: number; y: number; width: number; height: number } | null = null;
    let cropBboxB: { x: number; y: number; width: number; height: number } | null = null;

    if (opts.referenceSelector) {
      cropBboxA = await getElementBbox(pageA, opts.referenceSelector);
    }
    if (opts.targetSelector) {
      cropBboxB = await getElementBbox(pageB, opts.targetSelector);
    }

    let imgA: PNG = PNG.sync.read(pngA) as unknown as PNG;
    let imgB: PNG = PNG.sync.read(pngB) as unknown as PNG;

    if (cropBboxA) {
      imgA = cropImageData(imgA, cropBboxA, DEVICE_SCALE_FACTOR);
    }
    if (cropBboxB) {
      imgB = cropImageData(imgB, cropBboxB, DEVICE_SCALE_FACTOR);
    }

    // ── Layer 1: Pixel Diff (on cropped images) ──
    // Ensure both images have the same dimensions before pixel comparison
    if (imgA.width !== imgB.width || imgA.height !== imgB.height) {
      const minW = Math.min(imgA.width, imgB.width);
      const minH = Math.min(imgA.height, imgB.height);
      imgA = cropToSize(imgA, minW, minH);
      imgB = cropToSize(imgB, minW, minH);
    }
    const pixelResult = await computePixelDiff(imgA, imgB, threshold, opts.overlayAlpha);

    // ── Layer 2: Structure Diff (filtered to crop region) ──
    const structureResult = await computeStructureDiff(pageA, pageB, cropBboxA, cropBboxB);

    // ── Layer 3: Element / CSS Diff (filtered to crop region) ──
    const elementDiffs = await computeElementDiff(pageA, pageB, cropBboxA, cropBboxB);

    // ── Per-region grid breakdown (on cropped dimensions) ──
    const regions = computeRegionGrid(imgA, imgB, grid.cols, grid.rows, threshold);

    // ── DOM-level feedback (probing within crop region) ──
    const feedback: DomElementDiff[] = [];
    if (enableDom && regions.some(r => r.diffRatio > 0.01)) {
      const domFeedback = await extractDomFeedback(pageA, pageB, regions, cropBboxA, cropBboxB);
      feedback.push(...domFeedback);
      for (const region of regions) {
        const rf = domFeedback.filter(d => isInside(d.box, region));
        region.domFeedback = {
          differences: rf,
          summary: rf.length > 0 ? `${rf.length} diff(s) in ${region.label}` : 'No element diffs',
        };
      }
    }

    await pageA.close();
    await pageB.close();

    // ── Composite score ──
    const overallScore = computeOverallScore(pixelResult, structureResult, elementDiffs);

    return {
      overallScore,
      pixel: pixelResult,
      structure: structureResult,
      elementDiffs,
      feedback,
      regions,
      viewport,
      timestamp: new Date().toISOString(),
    };
  } finally {
    await browser.close();
  }
}

/**
 * Compare two HTML files on disk.
 */
export async function compareFiles(
  filePathA: string,
  filePathB: string,
  opts: CompareOptions = {},
): Promise<HtmlDiffResult> {
  const fs = await import('node:fs');
  const htmlA = fs.readFileSync(filePathA, 'utf8');
  const htmlB = fs.readFileSync(filePathB, 'utf8');
  return compareHtmlDocuments(htmlA, htmlB, opts);
}

// ---------------------------------------------------------------------------
// Layer 1: Pixel Diff
// ---------------------------------------------------------------------------

async function computePixelDiff(
  imgA: PNG,
  imgB: PNG,
  threshold: number,
  overlayAlpha?: number,
): Promise<PixelDiffResult> {
  const w = Math.min(imgA.width, imgB.width);
  const h = Math.min(imgA.height, imgB.height);
  const totalPixels = w * h;

  // Multi-threshold severity analysis
  const severity = computeSeverity(imgA, imgB, w, h);

  // Main pixelmatch at requested threshold
  const diffMask = new PNG({ width: w, height: h });
  const changedPixels = pixelmatch(
    imgA.data, imgB.data, diffMask.data, w, h,
    { threshold, alpha: 0.3, diffColor: [255, 50, 50] },
  );

  // Connected component analysis
  const diffRegions = computeConnectedComponents(diffMask, w, h);

  // Generate annotated diff image
  const diffPng = generateDiffImage(imgA, imgB, diffMask, overlayAlpha);

  const pixelScore = Math.max(0, Math.round((1 - changedPixels / totalPixels) * 10000) / 100);

  return {
    score: pixelScore,
    changedPixels,
    totalPixels,
    diffPng,
    regions: diffRegions,
    severity,
    ssimScore: pixelScore / 100, // simplified SSIM proxy from pixelmatch ratio
  };
}

/**
 * Compute pixel severity at multiple thresholds.
 */
function computeSeverity(imgA: PNG, imgB: PNG, w: number, h: number): SeverityBreakdown {
  let critical = 0;
  let significant = 0;
  let minor = 0;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const dr = Math.abs(imgA.data[idx] - imgB.data[idx]);
      const dg = Math.abs(imgA.data[idx + 1] - imgB.data[idx + 1]);
      const db = Math.abs(imgA.data[idx + 2] - imgB.data[idx + 2]);
      const maxd = Math.max(dr, dg, db);
      if (maxd > 76) critical++;        // threshold 0.3 * 255
      else if (maxd > 25) significant++; // threshold 0.1 * 255
      else if (maxd > 12) minor++;       // threshold 0.05 * 255
    }
  }

  return { critical, significant, minor, totalPixels: w * h };
}

/**
 * Find connected components in the diff mask using flood-fill.
 */
function computeConnectedComponents(diffMask: PNG, w: number, h: number): DiffRegion[] {
  const visited = new Uint8Array(w * h);
  const regions: DiffRegion[] = [];
  let nextId = 1;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      if (visited[idx]) continue;
      // Check if this pixel is part of the diff
      const di = idx * 4;
      if (diffMask.data[di] === 0 && diffMask.data[di + 1] === 0 && diffMask.data[di + 2] === 0) continue;

      // BFS flood-fill
      const queue: Array<[number, number]> = [[x, y]];
      visited[idx] = 1;
      let minX = x, maxX = x, minY = y, maxY = y;
      let count = 0;
      let sumX = 0, sumY = 0;

      while (queue.length > 0) {
        const [cx, cy] = queue.shift()!;
        count++;
        sumX += cx;
        sumY += cy;
        if (cx < minX) minX = cx;
        if (cx > maxX) maxX = cx;
        if (cy < minY) minY = cy;
        if (cy > maxY) maxY = cy;

        // 4-connected neighbors
        for (const [nx, ny] of [[cx - 1, cy], [cx + 1, cy], [cx, cy - 1], [cx, cy + 1]]) {
          if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
          const nidx = ny * w + nx;
          if (visited[nidx]) continue;
          const ndi = nidx * 4;
          if (diffMask.data[ndi] === 0 && diffMask.data[ndi + 1] === 0 && diffMask.data[ndi + 2] === 0) continue;
          visited[nidx] = 1;
          queue.push([nx, ny]);
        }
      }

      if (count >= 4) { // filter tiny speckles
        regions.push({
          id: nextId++,
          bbox: { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 },
          centroid: { x: Math.round(sumX / count), y: Math.round(sumY / count) },
          pixelCount: count,
          percentOfImage: (count / (w * h)) * 100,
        });
      }
    }
  }

  return regions.sort((a, b) => b.pixelCount - a.pixelCount);
}

// ---------------------------------------------------------------------------
// Layer 2: Structure Diff
// ---------------------------------------------------------------------------

async function computeStructureDiff(
  pageA: any,
  pageB: any,
  cropBboxA?: { x: number; y: number; width: number; height: number } | null,
  cropBboxB?: { x: number; y: number; width: number; height: number } | null,
): Promise<StructureDiffResult> {
  const elementsA = await extractElements(pageA);
  const elementsB = await extractElements(pageB);

  // Filter to crop region if provided
  const filteredA = cropBboxA
    ? elementsA.filter(el => el.box && isWithinBbox(el.box, cropBboxA))
    : elementsA;
  const filteredB = cropBboxB
    ? elementsB.filter(el => el.box && isWithinBbox(el.box, cropBboxB))
    : elementsB;

  // Match by tag + text fingerprint
  const matched: ElementRef[] = [];
  const missing: ElementRef[] = [];
  const extra: ElementRef[] = [];

  const usedA = new Set<number>();
  const usedB = new Set<number>();

  // First pass: match by tag + text exact match
  for (let i = 0; i < filteredA.length; i++) {
    for (let j = 0; j < filteredB.length; j++) {
      if (usedA.has(i) || usedB.has(j)) continue;
      if (filteredA[i].tag === filteredB[j].tag &&
          filteredA[i].text === filteredB[j].text &&
          filteredA[i].text.length > 0) {
        matched.push(filteredA[i]);
        usedA.add(i);
        usedB.add(j);
        break;
      }
    }
  }

  // Second pass: match by tag + position proximity
  for (let i = 0; i < filteredA.length; i++) {
    if (usedA.has(i)) continue;
    for (let j = 0; j < filteredB.length; j++) {
      if (usedB.has(j)) continue;
      if (filteredA[i].tag === filteredB[j].tag && filteredA[i].box && filteredB[j].box) {
        const dist = Math.hypot(
          filteredA[i].box!.x - filteredB[j].box!.x,
          filteredA[i].box!.y - filteredB[j].box!.y,
        );
        if (dist < 50) {
          matched.push(filteredA[i]);
          usedA.add(i);
          usedB.add(j);
          break;
        }
      }
    }
  }

  for (let i = 0; i < filteredA.length; i++) {
    if (!usedA.has(i)) missing.push(filteredA[i]);
  }
  for (let j = 0; j < filteredB.length; j++) {
    if (!usedB.has(j)) extra.push(filteredB[j]);
  }

  const baselineCount = filteredA.length;
  const targetCount = filteredB.length;
  const score = baselineCount > 0
    ? Math.round((matched.length / Math.max(baselineCount, targetCount)) * 10000) / 100
    : 100;

  return { score, missingElements: missing, extraElements: extra, matchedCount: matched.length, baselineCount, targetCount };
}

/**
 * Extract stable visible elements from a rendered page (anchor-like matching).
 */
async function extractElements(page: any): Promise<ElementRef[]> {
  return page.evaluate(() => {
    const results: Array<{ tag: string; selector: string; text: string; box: { x: number; y: number; width: number; height: number } | null }> = [];
    const anchorTags = new Set(['a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img', 'button', 'p', 'span', 'li', 'label', 'input', 'select', 'textarea']);
    const skipTags = new Set(['script', 'style', 'noscript', 'link', 'meta', 'head', 'template']);

    function walk(el: Element) {
      if (skipTags.has(el.tagName.toLowerCase())) return;
      const tag = el.tagName.toLowerCase();
      if (anchorTags.has(tag)) {
        const rect = el.getBoundingClientRect();
        const text = (el as HTMLElement).innerText?.trim().slice(0, 120) || (el as HTMLInputElement).placeholder || '';
        const id = el.id ? `#${el.id}` : '';
        const cls = el.className && typeof el.className === 'string'
          ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.')
          : '';
        const hasSize = rect.width > 0 && rect.height > 0 && rect.width < 10000 && rect.height < 10000;
        results.push({
          tag,
          selector: `${tag}${id}${cls}`,
          text: text.slice(0, 120),
          box: hasSize ? { x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height) } : null,
        });
      }
      for (let i = 0; i < el.children.length; i++) {
        walk(el.children[i] as Element);
      }
    }

    walk(document.body);
    return results;
  });
}

// ---------------------------------------------------------------------------
// Layer 3: Element / CSS Diff
// ---------------------------------------------------------------------------

async function computeElementDiff(
  pageA: any,
  pageB: any,
  cropBboxA?: { x: number; y: number; width: number; height: number } | null,
  cropBboxB?: { x: number; y: number; width: number; height: number } | null,
): Promise<ElementDiff[]> {
  const cssProps = [
    'color', 'backgroundColor', 'fontSize', 'fontFamily', 'fontWeight',
    'lineHeight', 'paddingTop', 'paddingLeft', 'marginTop', 'marginLeft',
    'width', 'height', 'display', 'borderRadius', 'gap', 'textAlign',
  ];

  return extractCssDiffs(pageA, pageB, cssProps, cropBboxA, cropBboxB);
}

async function extractCssDiffs(
  pageA: any,
  pageB: any,
  cssProps: string[],
  cropBboxA?: { x: number; y: number; width: number; height: number } | null,
  cropBboxB?: { x: number; y: number; width: number; height: number } | null,
): Promise<ElementDiff[]> {
  interface ElementSnapshot {
    selector: string;
    tag: string;
    text: string;
    styles: Record<string, string>;
  }

  async function snapshot(page: any, bbox?: { x: number; y: number; width: number; height: number } | null): Promise<ElementSnapshot[]> {
    return page.evaluate(({ props, bbox }: { props: string[]; bbox: { x: number; y: number; width: number; height: number } | null }) => {
      const results: ElementSnapshot[] = [];
      const visited = new Set<Element>();

      function isInBbox(rect: DOMRect): boolean {
        if (!bbox) return true;
        return rect.x >= bbox.x && rect.y >= bbox.y &&
          rect.x + rect.width <= bbox.x + bbox.width &&
          rect.y + rect.height <= bbox.y + bbox.height;
      }

      function walk(el: Element) {
        if (visited.has(el)) return;
        visited.add(el);
        const tag = el.tagName.toLowerCase();
        if (['script', 'style', 'noscript', 'link', 'meta', 'head', 'template'].includes(tag)) return;
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        if (bbox && !isInBbox(rect)) return;

        const id = el.id ? `#${el.id}` : '';
        const cls = el.className && typeof el.className === 'string'
          ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.')
          : '';
        const selector = `${tag}${id}${cls}`;
        const style = getComputedStyle(el);
        const styles: Record<string, string> = {};
        for (const p of props) {
          const val = (style as any)[p];
          if (val) styles[p] = val;
        }

        results.push({
          selector,
          tag,
          text: (el as HTMLElement).innerText?.trim().slice(0, 80) || '',
          styles,
        });

        for (let i = 0; i < el.children.length; i++) {
          walk(el.children[i] as Element);
        }
      }

      walk(document.body);
      return results;
    }, { props: cssProps, bbox: bbox ?? null });
  }

  const snapA = await snapshot(pageA, cropBboxA);
  const snapB = await snapshot(pageB, cropBboxB);

  const diffs: ElementDiff[] = [];

  for (const elA of snapA) {
    const elB = snapB.find(s => s.selector === elA.selector && s.tag === elA.tag);
    if (!elB) continue;

    const propertyDiffs: Array<{ property: string; expected: string; actual: string }> = [];
    for (const prop of cssProps) {
      const valA = elA.styles[prop] ?? '';
      const valB = elB.styles[prop] ?? '';
      if (valA !== valB) {
        propertyDiffs.push({ property: prop, expected: valA, actual: valB });
      }
    }

    if (propertyDiffs.length > 0) {
      const styleScore = Math.max(0, Math.round((1 - propertyDiffs.length / cssProps.length) * 100));
      diffs.push({ selector: elA.selector, tag: elA.tag, text: elA.text, propertyDiffs, styleScore });
    }
  }

  return diffs;
}

// ---------------------------------------------------------------------------
// Region Grid
// ---------------------------------------------------------------------------

export function computeRegionGrid(
  imgA: PNG,
  imgB: PNG,
  cols: number,
  rows: number,
  threshold: number = DEFAULT_THRESHOLD,
): RegionDiffCell[] {
  const w = Math.min(imgA.width, imgB.width);
  const h = Math.min(imgA.height, imgB.height);
  const cellW = Math.ceil(w / cols);
  const cellH = Math.ceil(h / rows);
  const cells: RegionDiffCell[] = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * cellW;
      const y = row * cellH;
      const cw = Math.min(cellW, w - x);
      const ch = Math.min(cellH, h - y);
      let changed = 0;
      let total = 0;

      for (let py = y; py < y + ch; py++) {
        for (let px = x; px < x + cw; px++) {
          const idx = (py * w + px) * 4;
          const dr = Math.abs(imgA.data[idx] - imgB.data[idx]);
          const dg = Math.abs(imgA.data[idx + 1] - imgB.data[idx + 1]);
          const db = Math.abs(imgA.data[idx + 2] - imgB.data[idx + 2]);
          if (dr > 10 || dg > 10 || db > 10) changed++;
          total++;
        }
      }

      cells.push({
        col, row, x, y, width: cw, height: ch,
        changedPixels: changed, totalPixels: total,
        diffRatio: total > 0 ? changed / total : 0,
        label: `col-${col + 1}-row-${row + 1}`,
        domFeedback: null,
      });
    }
  }
  return cells;
}

// ---------------------------------------------------------------------------
// DOM Feedback
// ---------------------------------------------------------------------------

async function extractDomFeedback(
  pageA: any,
  pageB: any,
  regions: RegionDiffCell[],
  cropBboxA?: { x: number; y: number; width: number; height: number } | null,
  cropBboxB?: { x: number; y: number; width: number; height: number } | null,
): Promise<DomElementDiff[]> {
  const significant = regions.filter(r => r.diffRatio > 0.01);
  if (significant.length === 0) return [];

  const all: DomElementDiff[] = [];

  for (const region of significant) {
    const pts = getProbePoints(region, DEVICE_SCALE_FACTOR);
    for (const pt of pts) {
      // Offset probe points by crop bbox origin so they hit the right element in the full page
      const probeX = cropBboxA ? pt.x + cropBboxA.x : pt.x;
      const probeY = cropBboxA ? pt.y + cropBboxA.y : pt.y;
      const a = await probePage(pageA, probeX, probeY);
      const b = await probePage(pageB, probeX, probeY);
      if (a && b) {
        if (a.tag !== b.tag) {
          all.push({ selector: a.selector, tag: a.tag, box: { x: pt.x, y: pt.y, width: 0, height: 0 }, property: 'tagName', baselineValue: a.tag, actualValue: b.tag, severity: 'high' });
        }
        for (const [key, valA] of Object.entries(a.styles)) {
          const valB = (b.styles as any)[key];
          if (valB && valA !== valB) {
            all.push({
              selector: a.selector, tag: a.tag, box: { x: pt.x, y: pt.y, width: 0, height: 0 },
              property: key, baselineValue: valA as string, actualValue: valB as string,
              severity: ['color', 'backgroundColor', 'fontSize'].includes(key) ? 'high' : 'medium',
            });
          }
        }
        if (a.text && b.text && a.text !== b.text) {
          all.push({ selector: a.selector, tag: a.tag, box: { x: pt.x, y: pt.y, width: 0, height: 0 }, property: 'textContent', baselineValue: a.text, actualValue: b.text, severity: 'low' });
        }
      } else if (a && !b) {
        all.push({ selector: a.selector, tag: a.tag, box: { x: pt.x, y: pt.y, width: 0, height: 0 }, property: 'exists', baselineValue: 'present', actualValue: 'missing', severity: 'high' });
      }
    }
  }

  return dedupeFeedback(all);
}

async function probePage(page: any, x: number, y: number): Promise<{
  tag: string; selector: string; text: string; styles: Record<string, string>;
} | null> {
  return page.evaluate(({ x, y }: { x: number; y: number }) => {
    const el = document.elementFromPoint(x, y);
    if (!el) return null;
    const tag = el.tagName.toLowerCase();
    const id = el.id ? `#${el.id}` : '';
    const cls = el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '';
    const style = getComputedStyle(el);
    return {
      selector: `${tag}${id}${cls}`,
      tag,
      text: (el as HTMLElement).innerText?.trim().slice(0, 80) || '',
      styles: {
        color: style.color,
        backgroundColor: style.backgroundColor,
        fontSize: style.fontSize,
        fontFamily: style.fontFamily,
        fontWeight: style.fontWeight,
        lineHeight: style.lineHeight,
        paddingTop: style.paddingTop,
        paddingLeft: style.paddingLeft,
        marginTop: style.marginTop,
        width: style.width,
        height: style.height,
        display: style.display,
        borderRadius: style.borderRadius,
        borderTopWidth: style.borderTopWidth,
        gap: style.gap,
        textAlign: style.textAlign,
      },
    };
  }, { x, y });
}

// ---------------------------------------------------------------------------
// Score computation
// ---------------------------------------------------------------------------

/**
 * Compute overall score as weighted combination of all three layers.
 * Weights: pixel 40%, structure 30%, CSS 30%.
 * Missing anchors apply P0 penalty (5% compounding per anchor).
 */
function computeOverallScore(
  pixel: PixelDiffResult,
  structure: StructureDiffResult,
  elementDiffs: ElementDiff[],
): number {
  const pixelScore = pixel.score;
  const structureScore = structure.score;

  // CSS style score: average all element style scores
  const cssScore = elementDiffs.length > 0
    ? elementDiffs.reduce((sum, d) => sum + d.styleScore, 0) / elementDiffs.length
    : 100;

  // Weighted composite: pixel 40%, structure 30%, CSS 30%
  let score = pixelScore * 0.4 + structureScore * 0.3 + cssScore * 0.3;

  // P0 penalty: each missing anchor in structure diff compounds 5%
  if (structure.missingElements.length > 0) {
    for (let i = 0; i < structure.missingElements.length; i++) {
      score *= P0_PENALTY;
    }
  }

  return Math.max(0, Math.round(score * 100) / 100);
}

// ---------------------------------------------------------------------------
// Image utilities
// ---------------------------------------------------------------------------

export function generateDiffImage(
  imgA: PNG,
  imgB: PNG,
  diffMask: PNG,
  overlayAlpha = 80,
): Buffer {
  const w = Math.min(imgA.width, imgB.width, diffMask.width);
  const h = Math.min(imgA.height, imgB.height, diffMask.height);
  const out = new PNG({ width: w, height: h });

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const isDiff = diffMask.data[idx] > 0 || diffMask.data[idx + 1] > 0 || diffMask.data[idx + 2] > 0;
      if (isDiff) {
        out.data[idx] = 255;
        out.data[idx + 1] = 50;
        out.data[idx + 2] = 50;
        out.data[idx + 3] = overlayAlpha;
      } else {
        out.data[idx] = imgB.data[idx];
        out.data[idx + 1] = imgB.data[idx + 1];
        out.data[idx + 2] = imgB.data[idx + 2];
        out.data[idx + 3] = 255;
      }
    }
  }
  return PNG.sync.write(out);
}

export function measureSimilarity(changedPixels: number, totalPixels: number): number {
  if (totalPixels === 0) return 100;
  return Math.max(0, Math.round((1 - changedPixels / totalPixels) * 10000) / 100);
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

async function renderHtml(
  browser: any,
  html: string,
  viewport: { width: number; height: number },
): Promise<{ page: any }> {
  const page = await browser.newPage({ viewport: { ...viewport, deviceScaleFactor: DEVICE_SCALE_FACTOR } });
  const dataUri = 'data:text/html;base64,' + Buffer.from(html, 'utf8').toString('base64');
  await page.goto(dataUri, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  return { page };
}

/**
 * Render a page by navigating to a URL directly (supports relative script paths, etc.).
 * Waits for the page to render any visible content before proceeding.
 */
async function renderUrl(
  browser: any,
  url: string,
  viewport: { width: number; height: number },
): Promise<{ page: any }> {
  const page = await browser.newPage({ viewport: { ...viewport, deviceScaleFactor: DEVICE_SCALE_FACTOR } });
  await page.goto(url, { waitUntil: 'networkidle' });
  // Wait for visible DOM to render (React/Storybook needs time to hydrate)
  await page.waitForTimeout(2000);
  // Wait for the storybook root or any p/h2 element to confirm actual content rendered
  try {
    await page.waitForSelector('#storybook-root p, #storybook-root h2, section#typography', { timeout: 5000 });
  } catch {
    // Content may have rendered via a different structure; continue anyway
  }
  return { page };
}

/**
 * Scroll a page so the element matching a CSS selector is at the top of the viewport.
 * This ensures off-screen sections are visible before screenshotting.
 */
async function scrollToSelector(page: any, selector: string): Promise<void> {
  await page.evaluate((sel: string) => {
    const el = document.querySelector(sel);
    if (el) el.scrollIntoView({ block: 'start' });
  }, selector);
  await page.waitForTimeout(300);
}

/**
 * Crop a PNG image to the specified dimensions (taking the top-left portion).
 */
function cropToSize(img: PNG, width: number, height: number): PNG {
  if (img.width === width && img.height === height) return img;
  const out = new PNG({ width, height });
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const srcIdx = (y * img.width + x) * 4;
      const dstIdx = (y * width + x) * 4;
      out.data[dstIdx] = img.data[srcIdx];
      out.data[dstIdx + 1] = img.data[srcIdx + 1];
      out.data[dstIdx + 2] = img.data[srcIdx + 2];
      out.data[dstIdx + 3] = img.data[srcIdx + 3];
    }
  }
  return out;
}

function parseGrid(gridStr?: string): { cols: number; rows: number } {
  if (!gridStr) return DEFAULT_GRID;
  const m = gridStr.match(/^(\d+)\s*x\s*(\d+)$/);
  if (!m) return DEFAULT_GRID;
  return { cols: Math.max(1, Math.min(32, parseInt(m[1], 10))), rows: Math.max(1, Math.min(32, parseInt(m[2], 10))) };
}

function getProbePoints(region: RegionDiffCell, scale: number): { x: number; y: number }[] {
  const cx = Math.round((region.x + region.width / 2) / scale);
  const cy = Math.round((region.y + region.height / 2) / scale);
  const pts = [{ x: cx, y: cy }];
  if (region.width > 40 && region.height > 40) {
    pts.push(
      { x: Math.round((region.x + 5) / scale), y: Math.round((region.y + 5) / scale) },
      { x: Math.round((region.x + region.width - 5) / scale), y: Math.round((region.y + region.height - 5) / scale) },
    );
  }
  return pts;
}

function isInside(box: { x: number; y: number; width: number; height: number }, region: { x: number; y: number; width: number; height: number }): boolean {
  return box.x >= region.x && box.y >= region.y && box.x + box.width <= region.x + region.width && box.y + box.height <= region.y + region.height;
}

function dedupeFeedback(diffs: DomElementDiff[]): DomElementDiff[] {
  const seen = new Set<string>();
  return diffs.filter(d => {
    const key = `${d.selector}:${d.property}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ---------------------------------------------------------------------------
// Crop / Region helpers
// ---------------------------------------------------------------------------

/**
 * Crop a PNG image to a bounding box (CSS pixel coordinates, DPR-adjusted).
 */
function cropImageData(
  img: PNG,
  bbox: { x: number; y: number; width: number; height: number },
  dpr: number,
): PNG {
  const sx = Math.round(bbox.x * dpr);
  const sy = Math.round(bbox.y * dpr);
  const sw = Math.round(bbox.width * dpr);
  const sh = Math.round(bbox.height * dpr);

  const cropped = new PNG({ width: sw, height: sh });
  for (let y = 0; y < sh && sy + y < img.height; y++) {
    for (let x = 0; x < sw && sx + x < img.width; x++) {
      const srcIdx = ((sy + y) * img.width + (sx + x)) * 4;
      const dstIdx = (y * sw + x) * 4;
      cropped.data[dstIdx] = img.data[srcIdx];
      cropped.data[dstIdx + 1] = img.data[srcIdx + 1];
      cropped.data[dstIdx + 2] = img.data[srcIdx + 2];
      cropped.data[dstIdx + 3] = img.data[srcIdx + 3];
    }
  }
  return cropped;
}

/**
 * Get the bounding box of an element matching a CSS selector in a rendered page.
 */
async function getElementBbox(
  page: any,
  selector: string,
): Promise<{ x: number; y: number; width: number; height: number } | null> {
  return page.evaluate((sel: string) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height };
  }, selector);
}

/**
 * Check if an element's bounding box is entirely within a crop region.
 */
function isWithinBbox(
  elBox: { x: number; y: number; width: number; height: number },
  bbox: { x: number; y: number; width: number; height: number },
): boolean {
  return (
    elBox.x >= bbox.x &&
    elBox.y >= bbox.y &&
    elBox.x + elBox.width <= bbox.x + bbox.width &&
    elBox.y + elBox.height <= bbox.y + bbox.height
  );
}
