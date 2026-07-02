/**
 * @emdesign/testdom — Browser-injectable design rule evaluation.
 *
 * Zero Node.js dependencies. Runs entirely in the browser's `window` context.
 * Injected via Playwright's `page.addScriptTag()` or `page.evaluate()`.
 *
 * Exports `window.__emdesign.evaluateRules()` which walks the rendered DOM
 * and evaluates design system rules against it.
 */
export interface DomRuleResult {
    passed: boolean;
    score: number;
    violations: DomViolation[];
}
export interface DomViolation {
    selector: string;
    tag: string;
    text?: string;
    rule: string;
    expected: string;
    actual: string;
    severity: 'error' | 'warning';
    fix?: string;
}
export interface EvaluateRulesInput {
    /** The design system's declared CSS token map (name → value). */
    declaredTokens: Record<string, string>;
    /** Optional: spacing scale values in px to validate against. */
    spacingScale?: string[];
    /** Optional: minimum contrast ratio for WCAG AA (default 4.5). */
    minContrast?: number;
}
export interface EvaluateRulesResult {
    tokenBinding: DomRuleResult;
    antiPatterns: DomRuleResult;
    spacing: DomRuleResult;
    contrast: DomRuleResult;
}
export declare function checkTokenBinding(declaredTokens: Record<string, string>): DomRuleResult;
export declare function checkAntiPatterns(declaredTokens: Record<string, string>): DomRuleResult;
export declare function checkSpacing(spacingScale?: string[]): DomRuleResult;
export declare function checkContrast(minContrast?: number): DomRuleResult;
export declare function evaluateAll(input: EvaluateRulesInput): EvaluateRulesResult;
declare global {
    interface Window {
        __emdesign?: {
            evaluateRules: (input: EvaluateRulesInput) => EvaluateRulesResult;
        };
    }
}
