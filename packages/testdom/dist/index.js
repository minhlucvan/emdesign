/**
 * @emdesign/testdom — Browser-injectable design rule evaluation.
 *
 * Zero Node.js dependencies. Runs entirely in the browser's `window` context.
 * Injected via Playwright's `page.addScriptTag()` or `page.evaluate()`.
 *
 * Exports `window.__emdesign.evaluateRules()` which walks the rendered DOM
 * and evaluates design system rules against it.
 */
// ═══════════════════════════════════════════════════════════════════════
// Token binding checker
// ═══════════════════════════════════════════════════════════════════════
export function checkTokenBinding(declaredTokens) {
    const violations = [];
    const allElements = document.querySelectorAll('*');
    const tokenNames = new Set(Object.keys(declaredTokens));
    const allowedRaw = new Set(['#000', '#000000', '#fff', '#ffffff', 'transparent', 'currentColor', 'inherit', 'initial']);
    for (const el of allElements) {
        if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE')
            continue;
        const cs = getComputedStyle(el);
        // Check color, backgroundColor, borderColor for raw hex
        for (const prop of ['color', 'backgroundColor', 'borderColor']) {
            const value = cs[prop];
            if (!value || value === 'rgba(0, 0, 0, 0)')
                continue;
            const hex = extractHex(value);
            if (hex && !allowedRaw.has(hex.toLowerCase())) {
                // Check if any token resolves to this hex
                const tokenMatch = Object.entries(declaredTokens).find(([, v]) => normalizeHex(v) === hex);
                if (!tokenMatch) {
                    violations.push({
                        selector: getSelector(el),
                        tag: el.tagName,
                        text: el.textContent?.slice(0, 50),
                        rule: 'token-binding',
                        expected: `var(--color-*) token matching ${hex}`,
                        actual: `raw hex ${hex} in ${prop}`,
                        severity: 'error',
                    });
                }
            }
        }
    }
    return {
        passed: violations.length === 0,
        score: violations.length === 0 ? 1 : Math.max(0, 1 - violations.length * 0.1),
        violations,
    };
}
// ═══════════════════════════════════════════════════════════════════════
// Anti-pattern checker
// ═══════════════════════════════════════════════════════════════════════
const AI_PURPLE_STOPS = ['indigo', 'purple', '#7c3aed', '#8b5cf6', '#6366f1', 'rgb(99,102,241)', 'rgb(139,92,246)'];
const EMOJI_RANGE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
const ACCENT_COLORS = new Set([
    '#6366f1', '#8b5cf6', '#7c3aed', // indigo/purple AI-defaults
    '#3b82f6', '#2563eb', '#1d4ed8', // blue
]);
export function checkAntiPatterns(declaredTokens) {
    const violations = [];
    const allElements = document.querySelectorAll('*');
    let accentCount = 0;
    for (const el of allElements) {
        if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE')
            continue;
        const cs = getComputedStyle(el);
        // 1. AI-purple gradient detection
        const bgImage = cs.backgroundImage || '';
        if (bgImage.includes('gradient') && AI_PURPLE_STOPS.some(s => bgImage.toLowerCase().includes(s))) {
            violations.push({
                selector: getSelector(el),
                tag: el.tagName,
                rule: 'anti-pattern-ai-gradient',
                expected: 'no purple/indigo gradients (AI default look)',
                actual: `gradient with AI-purple stop`,
                severity: 'error',
            });
        }
        // 2. Emoji as icon
        if (el.children.length === 0 && el.textContent) {
            const text = el.textContent.trim();
            if (text.length <= 2 && EMOJI_RANGE.test(text)) {
                violations.push({
                    selector: getSelector(el),
                    tag: el.tagName,
                    text,
                    rule: 'anti-pattern-emoji-icon',
                    expected: 'use SVG icons, not emoji',
                    actual: `emoji "${text}" used as icon`,
                    severity: 'warning',
                });
            }
        }
        // 3. Accent overuse (count elements with accent color)
        const color = normalizeHex(extractHex(cs.color) || '');
        if (ACCENT_COLORS.has(color)) {
            accentCount++;
        }
    }
    if (accentCount > 2) {
        violations.push({
            selector: 'body',
            tag: 'BODY',
            rule: 'anti-pattern-accent-overuse',
            expected: 'at most 2 accent-colored elements per screen',
            actual: `${accentCount} elements with accent color`,
            severity: 'warning',
        });
    }
    return {
        passed: violations.filter(v => v.severity === 'error').length === 0,
        score: violations.length === 0 ? 1 : Math.max(0, 1 - violations.length * 0.15),
        violations,
    };
}
// ═══════════════════════════════════════════════════════════════════════
// Spacing checker
// ═══════════════════════════════════════════════════════════════════════
export function checkSpacing(spacingScale) {
    const violations = [];
    if (!spacingScale || spacingScale.length === 0) {
        return { passed: true, score: 1, violations: [] };
    }
    // Parse spacing scale into px values
    const scalePx = spacingScale.map(s => parsePx(s)).filter(Boolean);
    if (scalePx.length === 0)
        return { passed: true, score: 1, violations: [] };
    const allElements = document.querySelectorAll('*');
    for (const el of allElements) {
        if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE' || el.tagName === 'BODY' || el.tagName === 'HTML')
            continue;
        const cs = getComputedStyle(el);
        for (const prop of ['marginTop', 'marginBottom', 'marginLeft', 'marginRight', 'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight', 'gap']) {
            const px = parsePx(cs[prop]);
            if (px === null || px === 0)
                continue;
            // Check if px value matches any scale step
            const matchesScale = scalePx.some(s => Math.abs(px - s) <= 1);
            if (!matchesScale) {
                violations.push({
                    selector: getSelector(el),
                    tag: el.tagName,
                    rule: 'spacing-off-scale',
                    expected: `one of [${scalePx.join(', ')}]px`,
                    actual: `${cs[prop]} on ${prop}`,
                    severity: 'warning',
                });
                break; // one violation per element
            }
        }
    }
    return {
        passed: violations.length === 0,
        score: violations.length === 0 ? 1 : Math.max(0, 1 - violations.length * 0.05),
        violations,
    };
}
// ═══════════════════════════════════════════════════════════════════════
// Contrast checker
// ═══════════════════════════════════════════════════════════════════════
export function checkContrast(minContrast = 4.5) {
    const violations = [];
    const allElements = document.querySelectorAll('*');
    for (const el of allElements) {
        if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE')
            continue;
        const cs = getComputedStyle(el);
        const fg = cs.color;
        const bg = cs.backgroundColor;
        if (!fg || !bg || bg === 'rgba(0, 0, 0, 0)' || fg === bg)
            continue;
        const ratio = getContrastRatio(fg, bg);
        if (ratio !== null && ratio < minContrast) {
            violations.push({
                selector: getSelector(el),
                tag: el.tagName,
                text: el.textContent?.slice(0, 50),
                rule: 'contrast-aa',
                expected: `contrast ratio ≥ ${minContrast}`,
                actual: `ratio ${ratio.toFixed(2)}`,
                severity: 'warning',
            });
        }
    }
    return {
        passed: violations.length === 0,
        score: violations.length === 0 ? 1 : Math.max(0, 1 - violations.length * 0.1),
        violations,
    };
}
// ═══════════════════════════════════════════════════════════════════════
// Main entry: evaluate all rules
// ═══════════════════════════════════════════════════════════════════════
export function evaluateAll(input) {
    return {
        tokenBinding: checkTokenBinding(input.declaredTokens),
        antiPatterns: checkAntiPatterns(input.declaredTokens),
        spacing: checkSpacing(input.spacingScale),
        contrast: checkContrast(input.minContrast),
    };
}
// Only attach in browser context
if (typeof window !== 'undefined') {
    window.__emdesign = {
        evaluateRules: evaluateAll,
    };
}
// ═══════════════════════════════════════════════════════════════════════
// Utilities
// ═══════════════════════════════════════════════════════════════════════
function getSelector(el) {
    if (el.id)
        return `#${el.id}`;
    if (el.className && typeof el.className === 'string') {
        const cls = el.className.trim().split(/\s+/).slice(0, 2).join('.');
        if (cls)
            return `${el.tagName.toLowerCase()}.${cls}`;
    }
    return el.tagName.toLowerCase();
}
function extractHex(value) {
    const m = value.match(/#([0-9a-fA-F]{3,8})\b/);
    return m ? `#${m[1].toLowerCase()}` : null;
}
function normalizeHex(hex) {
    if (!hex)
        return '';
    const h = hex.replace(/^#/, '');
    if (h.length === 3)
        return `#${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}`;
    return `#${h.slice(0, 6).toLowerCase()}`;
}
function parsePx(value) {
    const m = value.match(/^([\d.]+)px$/);
    return m ? parseFloat(m[1]) : null;
}
function getContrastRatio(fg, bg) {
    const fgRgb = parseRgb(fg);
    const bgRgb = parseRgb(bg);
    if (!fgRgb || !bgRgb)
        return null;
    const fgLum = relativeLuminance(fgRgb);
    const bgLum = relativeLuminance(bgRgb);
    const lighter = Math.max(fgLum, bgLum);
    const darker = Math.min(fgLum, bgLum);
    return (lighter + 0.05) / (darker + 0.05);
}
function parseRgb(value) {
    const m = value.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!m)
        return null;
    return [parseInt(m[1]), parseInt(m[2]), parseInt(m[3])];
}
function relativeLuminance([r, g, b]) {
    const [rs, gs, bs] = [r, g, b].map(c => {
        const s = c / 255;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}
