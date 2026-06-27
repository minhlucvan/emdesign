import type { FrameworkAdapter } from '../adapters/index.js';
import type { DesignSystem } from '../designContext.js';
import type { LintOptions, Finding } from '../lint/index.js';
import type { RepoPaths } from '../paths.js';
import type { MedesignPlugin, ParseCtx, TokenInput, ThemeInput, FileEmit, GraphParser, DesignReviewRule, RenderedReviewRule, RuleManifest } from '@emdesign/plugin-api';
import { resolvePlugin } from './registry.js';
import { reactPlugin } from '@emdesign/plugin-react';
import { RuleEngine, type Diagnostic, RuleRegistry, createRuleRegistry, wrapElementCharter, FRAMEWORK_GEOMETRY_CHARTERS } from '@emdesign/dsr';

/** The composed adapter: today's FrameworkAdapter surface + the new plugin hooks. */
export interface EffectiveAdapter extends FrameworkAdapter {
  storyExt: string;
  stack: string[];
  classRoles(): Record<string, string>;
  parseTokens(ctx: ParseCtx): TokenInput[];
  parseThemes(ctx: ParseCtx): ThemeInput[];
  emitConfig(ds: DesignSystem, paths: RepoPaths): FileEmit[];
  /** Graph parsers contributed by the stack (e.g. plugin-css) — emit nodes during buildGraph. */
  graphParsers(): GraphParser[];
  /** Node labels the stack contributes (discovery/docs). */
  nodeTypes(): string[];
  /** Production-readiness review rules contributed by the stack (the doctor runs them). */
  doctorRules(): DesignReviewRule[];
  /** Rendered-artifact lint rules (geometry/contrast) from the stack. */
  renderedDoctorRules(): RenderedReviewRule[];
  /** Unified rule registry (ESLint-style). */
  ruleRegistry(): RuleRegistry;
}

const toFinding = (d: Diagnostic): Finding => ({ severity: d.severity, id: d.ruleId, message: d.message, fix: d.fix, snippet: d.snippet });

/**
 * Compose an ordered plugin stack into one effective adapter (capability-typed, merge-by-rule):
 *  - the framework plugin supplies fileExt/storyExt/parsesCode/primitiveImport (most-specific wins);
 *  - codegenInstructions + lint rules + parsers + classRoles AGGREGATE across the stack.
 * Behavior-preserving for ["react","tailwind"] — lint runs the same built-in predicates via the engine.
 */
export function composeStack(ids: string[]): EffectiveAdapter {
  // 'core' is always-on: injected first so its rules run before (and regardless of) the stack.
  const ids2 = ['core', ...ids.filter((x) => x !== 'core')];
  const plugins = ids2.map(resolvePlugin).filter((p): p is MedesignPlugin => !!p);
  const framework = plugins.find((p) => p.kind === 'framework') ?? reactPlugin;

  const lint = (source: string, opts: LintOptions): Finding[] => {
    const engine = new RuleEngine();
    for (const p of plugins) for (const r of p.lintRules?.() ?? []) engine.register(r);
    // No `framework` filter: every rule whose plugin is in the stack should run.
    return engine
      .evaluateComponent(source, { declaredTokens: opts.declaredTokens, exemptions: opts.exemptions, bindsDisplayFace: opts.bindsDisplayFace })
      .map(toFinding);
  };

  // ── Build the unified rule registry ───────────────────────────────
  let _registry: RuleRegistry | null = null;
  function buildRegistry(): RuleRegistry {
    if (_registry) return _registry;
    const reg = createRuleRegistry();

    // 1. Framework Element Charters (geometry rules)
    for (const ch of FRAMEWORK_GEOMETRY_CHARTERS) {
      reg.register(wrapElementCharter(ch, 'core'));
    }

    // 2. From plugins implementing the new rules() hook
    for (const p of plugins) {
      const manifests = p.rules?.() ?? [];
      for (const m of manifests) reg.register(m);
    }

    // 3. Auto-wrap plugins using old-style hooks
    //    (doctorRules, renderedDoctorRules)
    //    (lintRules handled via compositeStack's lint function)
    const pluginIds = new Set(plugins.map((p) => p.id));
    for (const p of plugins) {
      for (const dr of p.doctorRules?.() ?? []) {
        if (!reg.getRule(`@emdesign/doctor/${dr.id}`)) {
          reg.register({
            id: `@emdesign/doctor/${dr.id}`,
            title: dr.id,
            category: 'contract',
            severity: dr.severity,
            description: dr.title,
            kind: 'doctor',
            tags: ['doctor'],
            pluginId: p.id,
            aliases: [dr.id],
            evaluate: () => [], // stubbed — doctor rules run via lintDesignSystem
          });
        }
      }
      for (const rr of p.renderedDoctorRules?.() ?? []) {
        if (!reg.getRule(`@emdesign/rendered/${rr.id}`)) {
          reg.register({
            id: `@emdesign/rendered/${rr.id}`,
            title: rr.id,
            category: rr.category ?? 'rendered',
            severity: rr.severity,
            description: rr.title,
            kind: 'rendered',
            tags: ['rendered'],
            pluginId: p.id,
            aliases: [rr.id],
            evaluate: () => [], // stubbed — rendered rules run via lintRendered
          });
        }
      }
    }

    _registry = reg;
    return reg;
  }

  return {
    id: ids.join('+') || framework.id,
    stack: ids,
    fileExt: framework.fileExt ?? '.tsx',
    storyExt: framework.storyExt ?? '.stories.tsx',
    primitiveImport: framework.primitiveImport ?? '@ds',
    parsesCode: framework.parsesCode ?? false,
    codegenInstructions: (ds: DesignSystem) => plugins.map((p) => p.codegenInstructions?.(ds)).filter(Boolean).join('\n'),
    storyTemplate: (name: string) => framework.storyTemplate?.(name) ?? `// TODO: story for "${name}".\n`,
    lint,
    classRoles: () => Object.assign({}, ...plugins.map((p) => p.classRoles?.() ?? {})),
    parseTokens: (ctx: ParseCtx) => plugins.flatMap((p) => p.parseTokens?.(ctx) ?? []),
    parseThemes: (ctx: ParseCtx) => plugins.flatMap((p) => p.parseThemes?.(ctx) ?? []),
    emitConfig: (ds: DesignSystem, paths: RepoPaths) => plugins.flatMap((p) => p.emitConfig?.(ds, paths) ?? []),
    graphParsers: () => plugins.flatMap((p) => p.graphParsers?.() ?? []),
    nodeTypes: () => [...new Set(plugins.flatMap((p) => p.nodeTypes?.() ?? []))],
    doctorRules: () => plugins.flatMap((p) => p.doctorRules?.() ?? []),
    renderedDoctorRules: () => plugins.flatMap((p) => p.renderedDoctorRules?.() ?? []),
    ruleRegistry: buildRegistry,
  };
}
