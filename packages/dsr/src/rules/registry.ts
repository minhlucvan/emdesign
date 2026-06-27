/**
 * @emdesign/dsr — Unified Rule Registry.
 *
 * A single registry where ALL rule types (lint, doctor, rendered, Element Charters)
 * are registered with hierarchical IDs (e.g. `@emdesign/geometry/no-overlap`),
 * categories, presets, and severity overrides.
 *
 * Modeled on ESLint's plugin system:
 * - Every rule has a unique hierarchical id
 * - Rules are organized by category and plugin
 * - Presets define which rules are active and at what severity
 * - Severity overrides let projects customize without forking rules
 *
 * This registry WRAPS existing rule types rather than replacing them.
 * Architecture: RuleManifest is the universal adapter.
 */

import type { ElementCharter } from '../charters/charter.js';
import type { RenderSnapshot } from './rendered.js';
import type { DesignSystem } from '../domain/designSystem.js';
import type { Diagnostic } from '../domain/values.js';

// =========================================================================
// Core types
// =========================================================================

/** Built-in severity levels, same scale as P0/P1/P2. */
export type RuleSeverity = 'P0' | 'P1' | 'P2';

/**
 * User-facing override levels.
 * - 'off':   rule is skipped entirely
 * - 'warn':  rule runs but doesn't block the gate (maps to P2)
 * - 'error': rule runs and can block the gate (maps to original severity)
 */
export type RuleOverrideLevel = 'off' | 'warn' | 'error';

/** Named presets a project can select. */
export type RulePresetName = 'recommended' | 'strict' | 'lenient' | 'minimal';

/** Which evaluation engine a rule wraps. */
export type RuleKind =
  | 'rendered'       // RenderedReviewRule — DOM geometry/contrast checks
  | 'lint'           // Rule — component source lint (anti-slop, tokens)
  | 'doctor'         // DesignReviewRule — system-level review rules
  | 'element-charter' // ElementCharter — DS-level or framework charter
  | 'story-charter';  // StoryCharter — CSF inline assertions

/** A single severity override for one rule. */
export interface RuleOverride {
  severity?: RuleOverrideLevel | RuleSeverity;
}

// =========================================================================
// RuleManifest — the universal rule descriptor
// =========================================================================

/**
 * Evaluation context passed to a rule's evaluate function.
 * A subset of what the original rule types expect, mapped to a common shape.
 */
export interface RuleEvalContext {
  /** Render snapshots (for rendered/geometry rules). */
  renders?: RenderSnapshot[];
  /** Design system (for token-aware rules). */
  ds?: DesignSystem;
  /** Component source code string (for lint rules). */
  source?: string;
  /** Component name (PascalCase). */
  component?: string;
  /** Diagnostics from other systems (for cross-referencing). */
  diagnostics?: Diagnostic[];
}

/**
 * A unified evaluation result from any rule type.
 * Superset of all finding types: spatial (targetBox/relatedBox/measurement),
 * boolean (pass), and textual (message/remediation).
 */
export interface UnifiedFinding {
  ruleId: string;
  severity: RuleSeverity;
  pass: boolean;
  message: string;
  /** Primary element CSS selector. */
  target?: string;
  /** Secondary element selector (for overlap/relationship findings). */
  relatedTarget?: string;
  /** Bounding box of the primary element. */
  targetBox?: { x: number; y: number; width: number; height: number };
  /** Bounding box of the related element. */
  relatedBox?: { x: number; y: number; width: number; height: number };
  /** Numerical measurement (overlap px, gap px, overflow px, etc.). */
  measurement?: { x?: number; y?: number; max?: number };
  /** Human-readable fix guidance. */
  remediation?: string;
  /** Link to documentation. */
  docsUrl?: string;
  /** Category for report grouping. */
  category: string;
}

/** Aggregated result of evaluating all rules in a plan. */
export interface UnifiedResult {
  findings: UnifiedFinding[];
  passed: number;
  failed: number;
  total: number;
  byCategory: Record<string, { passed: number; total: number }>;
  grade: string; // A-F
  score: number; // 0-1
}

/**
 * The universal rule descriptor.
 * Wraps ANY existing rule type (lint, doctor, rendered, charter) into a
 * common shape with metadata and a unified evaluate() interface.
 */
export interface RuleManifest {
  /** Hierarchical ID, e.g. "@emdesign/geometry/no-overlap". */
  id: string;
  /** Short human title, e.g. "No unintended element overlap". */
  title: string;
  /** Category for report grouping. */
  category: string;
  /** Default severity. */
  severity: RuleSeverity;
  /** Human-readable target description, e.g. "0 overlapping pairs". */
  target?: string;
  /** Longer description / what this rule checks. */
  description: string;
  /** URL to documentation. */
  docsUrl?: string;
  /** Which evaluation engine this rule wraps. */
  kind: RuleKind;
  /** Tags for filtering, e.g. ["geometry", "layout", "always-on"]. */
  tags: string[];
  /** The source plugin, e.g. "core", "react". */
  pluginId: string;
  /** Old rule IDs for backward compatibility in reports. */
  aliases: string[];
  /**
   * The unified evaluate function.
   * Implementations delegate to the wrapped rule type's native evaluate
   * and convert the result to UnifiedFinding[].
   */
  evaluate(ctx: RuleEvalContext): UnifiedFinding[];
}

// =========================================================================
// RulePreset
// =========================================================================

export interface RulePreset {
  name: RulePresetName;
  label: string;
  description: string;
  /**
   * Which rules to include: a map of ruleId → severity override.
   * Rules not listed inherit their default severity.
   * Rules listed as 'off' are excluded from this preset.
   * Key can be an exact rule ID or a glob pattern like "@emdesign/geometry/*".
   */
  rules: Record<string, RuleOverrideLevel | RuleSeverity | 'off'>;
}

// =========================================================================
// Built-in presets
// =========================================================================

const RECOMMENDED_PRESET: RulePreset = {
  name: 'recommended',
  label: 'Recommended',
  description: 'All rules at default severity (the standard configuration).',
  rules: {},
};

const STRICT_PRESET: RulePreset = {
  name: 'strict',
  label: 'Strict',
  description: 'All rules at maximum severity. No warnings — every issue is blocking.',
  rules: { '*': 'P0' },
};

const LENIENT_PRESET: RulePreset = {
  name: 'lenient',
  label: 'Lenient',
  description: 'All rules downgraded to advisory severity. Good for prototyping.',
  rules: { '*': 'P2' },
};

const MINIMAL_PRESET: RulePreset = {
  name: 'minimal',
  label: 'Minimal',
  description: 'Only anti-slop + token contract rules. No geometry or a11y checks.',
  rules: {
    '@emdesign/geometry/*': 'off',
    '@emdesign/a11y/*': 'off',
    '@emdesign/spacing/*': 'off',
    '@emdesign/typography/*': 'off',
  },
};

export const BUILTIN_PRESETS: Record<RulePresetName, RulePreset> = {
  recommended: RECOMMENDED_PRESET,
  strict: STRICT_PRESET,
  lenient: LENIENT_PRESET,
  minimal: MINIMAL_PRESET,
};

// =========================================================================
// RuleRegistry implementation
// =========================================================================

export interface RuleRegistryQuery {
  category?: string;
  pluginId?: string;
  tag?: string;
  kind?: RuleKind;
}

/**
 * In-memory rule registry.
 * Rules are registered once at startup (when composeStack builds the adapter)
 * and are immutable thereafter.
 */
export class RuleRegistry {
  rules = new Map<string, RuleManifest>();
  presets = new Map<RulePresetName, RulePreset>();
  plugins = new Map<string, { id: string; rules: string[] }>();

  constructor() {
    // Register built-in presets
    for (const preset of Object.values(BUILTIN_PRESETS)) {
      this.presets.set(preset.name, preset);
    }
  }

  /** Register a single rule manifest. */
  register(manifest: RuleManifest): void {
    this.rules.set(manifest.id, manifest);
  }

  /** Register a custom preset. */
  registerPreset(preset: RulePreset): void {
    this.presets.set(preset.name, preset);
  }

  /** Look up a rule by ID. */
  getRule(id: string): RuleManifest | undefined {
    // Direct match first
    let rule = this.rules.get(id);
    if (rule) return rule;

    // Fallback: search aliases
    for (const r of this.rules.values()) {
      if (r.aliases.includes(id)) return r;
    }
    return undefined;
  }

  /** List rules matching an optional filter. */
  listRules(filter?: RuleRegistryQuery): RuleManifest[] {
    let results = Array.from(this.rules.values());

    if (filter?.category) {
      results = results.filter((r) => r.category === filter.category);
    }
    if (filter?.pluginId) {
      results = results.filter((r) => r.pluginId === filter.pluginId);
    }
    if (filter?.tag) {
      results = results.filter((r) => r.tags.includes(filter.tag!));
    }
    if (filter?.kind) {
      results = results.filter((r) => r.kind === filter.kind);
    }

    return results;
  }

  /**
   * Resolve the effective severity of a rule given a preset and overrides.
   * Priority: override > preset > default.
   * Returns 'off' if the rule should be skipped.
   */
  resolveEffectiveSeverity(
    ruleId: string,
    presetName?: RulePresetName,
    overrides?: Record<string, RuleOverrideLevel | RuleSeverity | 'off'>,
  ): RuleSeverity | 'off' {
    const manifest = this.getRule(ruleId);
    if (!manifest) return 'off';

    // 1. Check user overrides (exact match)
    if (overrides?.[ruleId]) {
      const ov = overrides[ruleId];
      if (ov === 'off') return 'off';
      if (ov === 'warn') return 'P2';
      if (ov === 'error') return manifest.severity;
      // Direct severity override
      if (ov === 'P0' || ov === 'P1' || ov === 'P2') return ov;
    }

    // 2. Check preset glob patterns
    if (presetName) {
      const preset = this.presets.get(presetName);
      if (preset) {
        // Check glob patterns (e.g. "@emdesign/geometry/*")
        for (const [pattern, override] of Object.entries(preset.rules)) {
          if (pattern === '*') {
            // Wildcard catches all
            if (override === 'off') return 'off';
            if (override === 'P0' || override === 'P1' || override === 'P2') return override;
          }
          if (pattern.endsWith('/*') && ruleId.startsWith(pattern.slice(0, -1))) {
            if (override === 'off') return 'off';
            if (override === 'P0' || override === 'P1' || override === 'P2') return override;
            if (override === 'warn') return 'P2';
            if (override === 'error') return manifest.severity;
          }
          // Exact match in preset
          if (pattern === ruleId) {
            if (override === 'off') return 'off';
            if (override === 'P0' || override === 'P1' || override === 'P2') return override;
            if (override === 'warn') return 'P2';
            if (override === 'error') return manifest.severity;
          }
        }
      }
    }

    // 3. Check user overrides with glob
    if (overrides) {
      for (const [pattern, override] of Object.entries(overrides)) {
        if (pattern.endsWith('/*') && ruleId.startsWith(pattern.slice(0, -1))) {
          if (override === 'off') return 'off';
          if (override === 'P0' || override === 'P1' || override === 'P2') return override;
          if (override === 'warn') return 'P2';
          if (override === 'error') return manifest.severity;
        }
      }
    }

    // 4. Default severity
    return manifest.severity;
  }

  /**
   * Build an evaluation plan: the list of rules to run given a preset and overrides.
   * Rules resolved to 'off' are excluded.
   */
  buildEvaluationPlan(
    presetName?: RulePresetName,
    overrides?: Record<string, RuleOverrideLevel | RuleSeverity | 'off'>,
  ): { manifest: RuleManifest; effectiveSeverity: RuleSeverity }[] {
    const plan: { manifest: RuleManifest; effectiveSeverity: RuleSeverity }[] = [];

    for (const manifest of this.rules.values()) {
      const effective = this.resolveEffectiveSeverity(manifest.id, presetName, overrides);
      if (effective === 'off') continue;
      plan.push({ manifest, effectiveSeverity: effective });
    }

    return plan;
  }
}

// =========================================================================
// Rule registry functions
// =========================================================================

/** Create a fresh, empty registry with built-in presets. */
export function createRuleRegistry(): RuleRegistry {
  return new RuleRegistry();
}

/**
 * Compute a unified grade (A-F) from pass/total counts.
 */
export function computeGrade(passed: number, total: number): string {
  if (total === 0) return 'A';
  const ratio = passed / total;
  if (ratio >= 0.9) return 'A';
  if (ratio >= 0.8) return 'B';
  if (ratio >= 0.7) return 'C';
  if (ratio >= 0.6) return 'D';
  return 'F';
}

/**
 * Compute a numeric score (0-1) from findings.
 * P0 failures count more heavily than P1/P2.
 */
export function computeUnifiedScore(findings: UnifiedFinding[]): number {
  if (findings.length === 0) return 1;
  let penalty = 0;
  for (const f of findings) {
    if (!f.pass) {
      if (f.severity === 'P0') penalty += 0.34;
      else if (f.severity === 'P1') penalty += 0.12;
      else penalty += 0.04;
    }
  }
  return Math.max(0, Math.round((1 - penalty / findings.length) * 100) / 100);
}

// =========================================================================
// Adapter: ElementCharter → RuleManifest
// =========================================================================

/**
 * Wrap an ElementCharter into a RuleManifest for the unified registry.
 */
export function wrapElementCharter(
  charter: ElementCharter,
  pluginId: string = 'core',
): RuleManifest {
  return {
    id: `@emdesign/${charter.name}`,
    title: charter.name.split('/').pop() ?? charter.name,
    category: charter.name.startsWith('geometry/') ? 'geometry' : 'charter',
    severity: charter.severity,
    description: charter.description,
    kind: 'element-charter',
    tags: ['geometry', 'always-on'].concat(charter.name.startsWith('geometry/') ? ['geometry'] : []),
    pluginId,
    aliases: [charter.name, `ec/${charter.name}`],
    evaluate(ctx: RuleEvalContext): UnifiedFinding[] {
      if (!ctx.renders || ctx.renders.length === 0) return [];
      if (charter.matcher.type !== 'dom-selector' && charter.matcher.type !== 'dom-relation') {
        return [];
      }

      const { buildDomTree, querySelectorAll } = require('../charters/matcher.js');
      const findings: UnifiedFinding[] = [];

      for (const snap of ctx.renders) {
        const roots = buildDomTree(snap);
        let matchedElements: ReturnType<typeof querySelectorAll> = [];

        if (charter.matcher.type === 'dom-selector') {
          matchedElements = querySelectorAll(charter.matcher.selector, roots);
        }

        // Build minimal DOM context for the charter runner
        const ecCtx = {
          layer: 'dom' as const,
          graph: {} as any,
          renders: [snap],
          matchedElements,
        };

        try {
          const results = charter.run(ecCtx);
          for (const r of results) {
            const matchedEl = matchedElements.find((m: any) => m.node.selector === r.target);
            findings.push({
              ruleId: `@emdesign/${charter.name}`,
              severity: r.severity,
              pass: false,
              message: r.message,
              target: r.target,
              targetBox: matchedEl ? { ...matchedEl.node.box } : undefined,
              remediation: r.remediation,
              category: 'geometry',
            });
          }

          // If no findings, register a pass
          if (results.length === 0) {
            findings.push({
              ruleId: `@emdesign/${charter.name}`,
              severity: charter.severity,
              pass: true,
              message: `${charter.name}: no violations`,
              category: 'geometry',
            });
          }
        } catch {
          findings.push({
            ruleId: `@emdesign/${charter.name}`,
            severity: 'P2',
            pass: false,
            message: `${charter.name}: evaluation error`,
            category: 'geometry',
            remediation: 'Check the charter implementation for errors.',
          });
        }
      }

      return findings;
    },
  };
}
