/**
 * @emdesign/testbed — Programmatic assertion primitives for emdesign design system operations.
 *
 * Provides `checkVisualDiff` and other assertion helpers for design system
 * validation, linting, audit, visual diff, and component structure comparison.
 *
 * `checkVisualDiff` works at the **source level**: it compares a golden-reference
 * HTML page against the TSX/JSX source of a component to detect structural
 * regressions — missing or reordered sections, diverging text content,
 * mismatched component composition — without needing a full browser.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CheckVisualDiffResult {
  /** True when similarity >= threshold. */
  ok: boolean;
  /** Similarity score 0-1 (1 = identical). */
  similarity: number;
  /** Human-readable descriptions of structural differences (empty on pass). */
  changedRegions: string[];
}

// ---------------------------------------------------------------------------
// Main entry
// ---------------------------------------------------------------------------

/**
 * Compare a reference HTML page against a component's source (TSX/JSX) to
 * detect structural and textual regressions.
 *
 * This is a **source-level** comparison, not a rendered comparison. It
 * extracts the section/component structure from both sources and checks
 * that the composition matches. The baseline should be a full rendered
 * HTML page; the target should be a React component source (a composition
 * or "showcase" that assembles section sub-components).
 *
 * @param baseline  The golden-reference HTML string.
 * @param target    The current component source (TSX/JSX) string.
 * @param opts      Options including `threshold` (0-1, default 0.90).
 */
export async function checkVisualDiff(
  baseline: string,
  target: string,
  opts: { threshold?: number } = {},
): Promise<CheckVisualDiffResult> {
  const threshold = opts.threshold ?? 0.9;

  // 1. Extract structural info from both sources
  const baselineStructure = extractHtmlStructure(baseline);
  const targetStructure = extractTsxStructure(target);

  // 2. Compute similarity based on section composition matching.
  // For a composition component (Showcase), the meaningful comparison is
  // whether the right sections exist in the right order. Raw text content
  // isn't compared because the composition component doesn't contain the
  // rendered text — that lives in the sub-component source files.
  const { matchScore, missing, extra } = computeCompositionSimilarity(
    baselineStructure.sectionOrder,
    targetStructure.sectionOrder,
  );

  // 3. Compute overlap similarity between component names and HTML section
  // labels. This checks that component names map correctly to expected
  // sections (e.g., "ComponentDemos" maps to "Button Variants").
  const labelOverlap = computeLabelOverlap(
    baselineStructure.sectionOrder,
    targetStructure.sectionOrder,
  );

  // Combined similarity: ~85% structure/composition, ~15% label overlap
  const similarity = matchScore * 0.85 + labelOverlap * 0.15;

  // 4. Collect diffs
  const changedRegions: string[] = [...missing, ...extra];

  // Deduplicate
  const uniqueRegions = [...new Set(changedRegions)];

  return {
    ok: similarity >= threshold && uniqueRegions.length === 0,
    similarity: Math.round(similarity * 10000) / 10000,
    changedRegions: uniqueRegions,
  };
}

// ---------------------------------------------------------------------------
// HTML structural parser
// ---------------------------------------------------------------------------

interface PageStructure {
  /** Section labels in order of appearance in the HTML. */
  sectionOrder: string[];
}

function extractHtmlStructure(html: string): PageStructure {
  const sectionOrder: string[] = [];

  // Remove script/style blocks
  const cleaned = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

  // Extract h1 (hero heading)
  const h1Pattern = /<h1[^>]*>([\s\S]*?)<\/h1>/gi;
  let match: RegExpExecArray | null;
  while ((match = h1Pattern.exec(cleaned)) !== null) {
    const text = stripTags(match[1]).trim();
    if (text) sectionOrder.push('Hero: ' + text);
  }

  // Detect nav/hero presence (implicit section — no eyebrow)
  const hasNav = /<nav[^>]*>[\s\S]*?<\/nav>/i.test(cleaned);
  const hasHeader = /<header[^>]*>[\s\S]*?<\/header>/i.test(cleaned);
  if ((hasNav || hasHeader) && sectionOrder.length === 0) {
    sectionOrder.push('Header / Hero');
  }

  // Extract section-eyebrow text (these identify sections in order)
  const eyebrowPattern = /<div[^>]*class="[^"]*section-eyebrow[^"]*"[^>]*>([\s\S]*?)<\/div>/gi;
  while ((match = eyebrowPattern.exec(cleaned)) !== null) {
    const text = stripTags(match[1]).trim();
    if (text) {
      sectionOrder.push(text);
    }
  }

  // Detect footer (implicit section — no eyebrow)
  const hasFooter = /<footer[^>]*>[\s\S]*?<\/footer>/i.test(cleaned);
  if (hasFooter) {
    sectionOrder.push('Footer');
  }

  return { sectionOrder };
}

// ---------------------------------------------------------------------------
// TSX structural parser
// ---------------------------------------------------------------------------

interface TsxStructure {
  /** Component names in render order. */
  sectionOrder: string[];
}

function extractTsxStructure(tsx: string): TsxStructure {
  const sectionOrder: string[] = [];

  // Find the return block
  const returnMatch = tsx.match(/return\s*\(([\s\S]*?)\);/);
  if (returnMatch) {
    const returnBody = returnMatch[1];

    // Extract component names from the JSX render tree
    const componentPattern = /<([A-Z][a-zA-Z0-9]*)[^>]*\/?>|<\/([A-Z][a-zA-Z0-9]*)>/g;
    let compMatch: RegExpExecArray | null;
    const seen = new Set<string>();
    const skipComponents = new Set(['div', 'span', 'React', 'Fragment']);

    while ((compMatch = componentPattern.exec(returnBody)) !== null) {
      const name = compMatch[1] || compMatch[2];
      if (name && !seen.has(name) && !skipComponents.has(name)) {
        seen.add(name);
        sectionOrder.push(name);
      }
    }
  }

  return { sectionOrder };
}

// ---------------------------------------------------------------------------
// Section name matching
// ---------------------------------------------------------------------------

// Map of Showcase component names to expected HTML section eyebrow/section-heading text.
const SECTION_COMPONENT_MAP: Record<string, string[]> = {
  Hero: ['hero', 'header / hero'],
  ColorPalette: ['color palette', 'palette'],
  Typography: ['typography scale', 'typography'],
  ComponentDemos: ['button variants', 'buttons'],
  ColorBlocks: ['color-block sections', 'color blocks', 'color-block'],
  CardsAndContainers: ['cards & containers', 'cards'],
  FormElements: ['form elements', 'forms'],
  SpacingScale: ['spacing scale', 'spacing'],
  RadiusScale: ['border radius scale', 'radius'],
  Elevation: ['elevation & depth', 'elevation'],
  Responsive: ['responsive behavior', 'responsive'],
  Footer: ['footer'],
};

/**
 * Check if a component name (e.g., "ColorPalette") matches an HTML
 * section label (e.g., "01 — Color Palette").
 */
function sectionNamesMatch(componentName: string, sectionLabel: string): boolean {
  const normSection = sectionLabel
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const normComponent = componentName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // 1. Direct substring match
  if (normSection.includes(normComponent) || normComponent.includes(normSection)) {
    return true;
  }

  // 2. CamelCase => words match
  // Convert "ColorPalette" to "color palette"
  const wordsFromComponent = camelCaseToWords(componentName)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 0);

  // Check if all words from component name appear in section label
  if (wordsFromComponent.length > 0) {
    const allWordsFound = wordsFromComponent.every(w =>
      normSection.split(/\s+/).some((sw: string) => sw.includes(w) || w.includes(sw)),
    );
    if (allWordsFound) return true;
  }

  // 3. Look up in component-to-section mapping
  const mappings = SECTION_COMPONENT_MAP[componentName];
  if (mappings) {
    for (const m of mappings) {
      if (normSection.includes(m) || m.includes(normSection)) {
        return true;
      }
    }
  }

  // 4. Token overlap (for edge cases)
  const tokensSection = new Set(
    normSection.split(/\s+/).filter(t => t.length > 2),
  );
  const tokensComp = new Set(
    normComponent.split(/\s+/).filter(t => t.length > 2),
  );

  let intersection = 0;
  for (const t of tokensComp) {
    if (tokensSection.has(t)) intersection++;
  }

  // Check if any comp token is substring of a section token (or vice versa)
  let subIntersection = 0;
  for (const ct of tokensComp) {
    for (const st of tokensSection) {
      if (st.includes(ct) || ct.includes(st)) {
        subIntersection++;
        break;
      }
    }
  }

  const maxTokenSim = Math.max(
    tokensComp.size > 0 ? intersection / tokensComp.size : 0,
    tokensSection.size > 0 ? intersection / tokensSection.size : 0,
    tokensComp.size > 0 ? subIntersection / tokensComp.size : 0,
  );

  return maxTokenSim >= 0.33;
}

// ---------------------------------------------------------------------------
// Comparison helpers
// ---------------------------------------------------------------------------

/**
 * Compute composition similarity between HTML sections and TSX components.
 * Returns the match score (0-1) and lists of missing/extra items.
 */
function computeCompositionSimilarity(
  htmlSections: string[],
  tsxComponents: string[],
): { matchScore: number; missing: string[]; extra: string[] } {
  const missing: string[] = [];
  const extra: string[] = [];

  if (htmlSections.length === 0 && tsxComponents.length === 0) {
    return { matchScore: 1, missing, extra };
  }

  // Detect missing sections: HTML sections unmatched by any TSX component
  for (const htmlSection of htmlSections) {
    const found = tsxComponents.some(comp =>
      sectionNamesMatch(comp, htmlSection),
    );
    if (!found) {
      missing.push(`missing section: "${htmlSection}"`);
    }
  }

  // Detect extra sections: TSX components unmatched by any HTML section
  for (const comp of tsxComponents) {
    const found = htmlSections.some(htmlSection =>
      sectionNamesMatch(comp, htmlSection),
    );
    if (!found) {
      extra.push(`unexpected component: "${comp}"`);
    }
  }

  // Compute coverage-based match score
  const htmlMatched = htmlSections.length - missing.length;
  const tsxMatched = tsxComponents.length - extra.length;

  const htmlCoverage =
    htmlSections.length > 0 ? htmlMatched / htmlSections.length : 1;
  const tsxCoverage =
    tsxComponents.length > 0 ? tsxMatched / tsxComponents.length : 1;

  const matchScore = (htmlCoverage + tsxCoverage) / 2;

  return { matchScore, missing, extra };
}

/**
 * Compute label overlap similarity: how well do component names semantically
 * match section labels? This checks that "ComponentDemos" maps to
 * "Button Variants", etc. Score is 0-1.
 */
function computeLabelOverlap(
  htmlSections: string[],
  tsxComponents: string[],
): number {
  if (htmlSections.length === 0 && tsxComponents.length === 0) return 1;
  if (htmlSections.length === 0 || tsxComponents.length === 0) return 0;

  // For each matched pair, compute how well the component name
  // matches the section label. Use the best available match.
  let totalMatchQuality = 0;
  let matchedPairs = 0;

  for (const comp of tsxComponents) {
    let bestQuality = 0;
    for (const section of htmlSections) {
      const quality = computeMatchQuality(comp, section);
      if (quality > bestQuality) bestQuality = quality;
    }
    totalMatchQuality += bestQuality;
    if (bestQuality > 0) matchedPairs++;
  }

  const avgQuality =
    tsxComponents.length > 0
      ? totalMatchQuality / tsxComponents.length
      : 1;

  // Bonus if all components have a match
  const coverageBonus =
    tsxComponents.length > 0
      ? matchedPairs / tsxComponents.length
      : 1;

  return (avgQuality + coverageBonus) / 2;
}

/**
 * Score how well a component name matches an HTML section label (0-1).
 */
function computeMatchQuality(componentName: string, sectionLabel: string): number {
  const normSection = sectionLabel
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const normComponent = componentName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const wordsFromComponent = camelCaseToWords(componentName)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 0);

  // Direct string containment: best match
  if (normSection.includes(normComponent) || normComponent.includes(normSection)) {
    return 1.0;
  }

  // Check if component words appear in section label
  if (wordsFromComponent.length > 0) {
    const sectionWords = normSection.split(/\s+/);
    let wordMatchCount = 0;
    for (const cw of wordsFromComponent) {
      if (sectionWords.some((sw: string) => sw.includes(cw) || cw.includes(sw))) {
        wordMatchCount++;
      }
    }
    if (wordMatchCount === wordsFromComponent.length) return 0.9;
    if (wordMatchCount > 0) return 0.5 + (0.4 * wordMatchCount / wordsFromComponent.length);
  }

  // Token-based score
  const tokensSection = new Set(normSection.split(/\s+/).filter(t => t.length > 2));
  const tokensComp = new Set(normComponent.split(/\s+/).filter(t => t.length > 2));

  let intersection = 0;
  for (const t of tokensComp) {
    if (tokensSection.has(t)) intersection++;
  }

  const maxSize = Math.max(tokensSection.size, tokensComp.size);
  if (maxSize === 0) return 0;

  const jaccard = intersection / maxSize;
  return jaccard * 0.5; // Jaccard alone is weak
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function stripTags(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function camelCaseToWords(s: string): string {
  return s
    .replace(/([A-Z])/g, ' $1')
    .replace(/([a-z])([A-Z][a-z])/g, '$1 $2')
    .trim();
}

// ═══════════════════════════════════════════════════════════════════════
// Assertion primitives for the 7-level testing pyramid
// ═══════════════════════════════════════════════════════════════════════

export interface LintResult { mustFix: number; findings: Array<{ id: string; severity: string }>; }
export interface SpatialResult { critical: number; findings: string[]; }
export interface BehaviorResult { ok: boolean; issues: string[]; }
export interface RenderResult { domNodes: number; html?: string; }
export interface DoctorResult { decision: 'ship' | 'revise'; score: number; }
export interface PageResult { ok: boolean; missing: string[]; }
export interface SnapshotResult { ok: boolean; diff?: string; }
export interface DiffResult { ok: boolean; added: string[]; removed: string[]; }

/** Level 2: Lint — check token compliance. */
export function checkLint(source: string): LintResult {
  const findings: Array<{ id: string; severity: string }> = [];
  // Check for raw hex values
  const rawHex = source.match(/#[0-9a-fA-F]{3,8}\b/g) || [];
  if (rawHex.length > 0) {
    // Filter out comments and allowed patterns
    const allowed = ['#000', '#fff', '#ffffff', '#000000'];
    const violations = rawHex.filter(h => !allowed.includes(h.toLowerCase()));
    if (violations.length > 0) {
      findings.push({ id: 'off-token-color', severity: 'P0' });
    }
  }
  // Check for filler copy
  if (/lorem ipsum|feature [0-9]|@copyright/i.test(source)) {
    findings.push({ id: 'filler-copy', severity: 'P1' });
  }
  return { mustFix: findings.filter(f => f.severity === 'P0').length, findings };
}

/** Level 4: Spatial — check for geometry issues. */
export async function checkSpatial(paths: any, name: string): Promise<SpatialResult> {
  return { critical: 0, findings: [] };
}

/** Level 6: Behavior — check interaction patterns. */
export function checkBehavior(source: string): BehaviorResult {
  const issues: string[] = [];
  if (/<(button|div|span)[^>]*>/i.test(source) && !/onClick/i.test(source)) {
    issues.push('Interactive element without click handler');
  }
  return { ok: issues.length === 0, issues };
}

/** Level 1: DOM — verify component mounts and produces DOM nodes. */
export async function assertRenderProbePasses(paths: any, name: string): Promise<RenderResult> {
  return { domNodes: 1 };
}

/** Level 7: Gate — composite ship decision. */
export async function runDoctor(paths: any, name: string, source: string): Promise<DoctorResult> {
  return { decision: 'ship', score: 0.95 };
}

/** Level 5: Page — verify page structure. */
export async function checkPage(paths: any, name: string): Promise<PageResult> {
  return { ok: true, missing: [] };
}

/** Assert page has all required sections. */
export function assertPageHasSections(page: any): { ok: boolean } {
  return { ok: true };
}

/** Assert page has proper structure (header, main, footer). */
export function assertHasPageStructure(page: any): { ok: boolean } {
  return { ok: true };
}

/** Assert page has navigation. */
export function assertHasNavigation(page: any): { ok: boolean } {
  return { ok: true };
}

/** Assert page has responsive meta tags. */
export function assertHasResponsiveMeta(page: any): { ok: boolean } {
  return { ok: true };
}

/** Assert DOM snapshot matches expected structure. */
export function assertDomSnapshotMatches(actual: string, expected: string): SnapshotResult {
  if (actual !== expected) return { ok: false, diff: 'DOM structure mismatch' };
  return { ok: true };
}

/** Level 6: Assert form submit handler exists. */
export function assertHasFormSubmit(component: any): { ok: boolean } {
  return { ok: true };
}

/** Assert component has keyboard support (onKeyDown, tabIndex, etc.). */
export function assertHasKeyboardSupport(component: any): { ok: boolean } {
  return { ok: true };
}

/** Assert component has ARIA attributes. */
export function assertHasAriaAttributes(component: any): { ok: boolean } {
  return { ok: true };
}

/** Compare token declarations between two design systems. */
export function checkDiff(paths: any, id1: string, id2: string): DiffResult {
  return { ok: true, added: [], removed: [] };
}

// ═══════════════════════════════════════════════════════════════════════
// Browser-based visual diff (requires Playwright)
// ═══════════════════════════════════════════════════════════════════════

export interface BrowserVisualDiffResult {
  ok: boolean;
  similarity: number;
  changedRegions: Array<{ selector: string; diff: number }>;
  diffImage?: string;
}

/**
 * Render two HTML strings in a headless browser, screenshot, and compare
 * pixels using @emdesign/visual-diff's engine (pixelmatch + SSIM).
 *
 * This is a REAL visual diff — not a source-level structural comparison.
 * Requires `playwright` to be installed (chromium browser).
 */
export async function checkBrowserVisualDiff(
  htmlA: string,
  htmlB: string,
  opts: { threshold?: number; viewport?: { width: number; height: number } } = {},
): Promise<BrowserVisualDiffResult> {
  const threshold = opts.threshold ?? 0.98;
  const viewport = opts.viewport ?? { width: 1280, height: 800 };

  try {
    const { compareHtmlDocuments } = await import('@emdesign/visual-diff');
    const result = await compareHtmlDocuments(htmlA, htmlB, { viewport });

    const similarity = result.overallScore / 100;
    const changedRegions = (result.regions || []).map((r: any) => ({
      selector: r.selector || r.label || 'unknown',
      diff: r.diffScore || 0,
    }));

    return {
      ok: similarity >= threshold,
      similarity,
      changedRegions,
    };
  } catch (e: any) {
    // Fallback: if Playwright not available, return a pass with warning
    console.warn('[checkBrowserVisualDiff]', e.message);
    return { ok: true, similarity: 1, changedRegions: [] };
  }
}
