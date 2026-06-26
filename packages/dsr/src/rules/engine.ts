import type { Diagnostic, RuleScope, Severity } from '../domain/values.js';
import { SEMANTIC_TOKEN_ROLES } from '../domain/values.js';
import type { DesignSystem } from '../domain/designSystem.js';
import type { Graph, GNode, GEdge } from '@emdesign/graph';
import { componentLint, tokenReferenceLint, type ComponentLintOptions } from './lint.js';
import type { ElementCharter, EcContext, EcGraphContext, EcDomContext, EcDomNode } from '../charters/charter.js';
import { buildDomTree, querySelectorAll, queryByRelation } from '../charters/matcher.js';
import type { RenderSnapshot } from './rendered.js';

export interface RuleContext {
  source?: string;
  ds?: DesignSystem;
  declaredTokens?: string[];
  bindsDisplayFace?: boolean;
  exemptions?: string[];
  framework?: string;
  target?: string;
}

/** A first-class, testable rule. Built-ins live in lint.ts/system checks; adapters register more. */
export interface Rule {
  id: string;
  severity: Severity;
  scope: RuleScope;
  framework?: string;
  evaluate(ctx: RuleContext): Array<Omit<Diagnostic, 'scope'>>;
}

/**
 * The single source of truth for evaluating design-system + component rules. The backend's
 * `adapter.lint()` and `validate_design_system` both delegate here.
 */
export class RuleEngine {
  private registered: Rule[] = [];
  private elementCharters: ElementCharter[] = [];

  register(rule: Rule): void {
    this.registered.push(rule);
  }

  /** Component-scope evaluation (anti-slop + token contract on source). */
  evaluateComponent(source: string, opts: ComponentLintOptions & { framework?: string } = {}): Diagnostic[] {
    const exempt = new Set(opts.exemptions ?? []);
    const findings = [
      ...componentLint(source, opts),
      ...tokenReferenceLint(source, opts.declaredTokens ?? []),
    ];
    for (const r of this.registered) {
      if (r.scope !== 'component') continue;
      if (opts.framework && r.framework && r.framework !== opts.framework) continue;
      findings.push(...r.evaluate({ source, ...opts }).map((f) => ({ ...f })));
    }
    return findings.filter((f) => !exempt.has(f.ruleId)).map((f) => ({ ...f, scope: 'component' as const }));
  }

  /** System-scope evaluation (structural invariants over the whole design system). */
  evaluateSystem(ds: DesignSystem): Diagnostic[] {
    const out: Diagnostic[] = [];
    const declared = new Set(ds.declaredTokens.map((t) => t.replace(/^--/, '')));
    for (const role of SEMANTIC_TOKEN_ROLES) {
      if (!declared.has(role)) out.push({ ruleId: 'missing-role', severity: 'P0', scope: 'system', message: `Required token role --${role} is not declared in tokens.css.`, fix: `Add --${role} to tokens.css.`, target: ds.id });
    }
    const sectionCount = ds.sections().length;
    if (sectionCount < 9) out.push({ ruleId: 'incomplete-spec', severity: 'P1', scope: 'system', message: `DESIGN.md has ${sectionCount}/9 sections.`, fix: 'Author all 9 sections (see docs/spec.md).', target: ds.id });
    for (const f of tokenReferenceLint(ds.assets.tokensCss, ds.declaredTokens)) out.push({ ...f, scope: 'system', target: ds.id });
    const exempt = new Set(ds.exemptions);
    out.push(...this.registered.filter((r) => r.scope === 'system').flatMap((r) => r.evaluate({ ds }).map((f) => ({ ...f, scope: 'system' as const }))));
    return out.filter((d) => !exempt.has(d.ruleId));
  }

  // ---------------------------------------------------------------------------
  // Element Charters
  // ---------------------------------------------------------------------------

  /** Register Element Charters from the active design system. */
  registerCharters(charters: ElementCharter[]): void {
    this.elementCharters = charters;
  }

  /** Clear all registered charters (e.g. when switching design systems). */
  clearCharters(): void {
    this.elementCharters = [];
  }

  /**
   * Evaluate all registered Element Charters against the graph.
   * Graph-layer charters (node/edge/subgraph/custom) run against the graph directly.
   * DOM-layer charters (dom-selector/dom-relation) require render snapshots.
   */
  evaluateCharters(g: Graph, renders?: RenderSnapshot[]): Diagnostic[] {
    const out: Diagnostic[] = [];
    const graphCharters = this.elementCharters.filter((c) => isGraphMatcher(c.matcher.type));
    const domCharters = this.elementCharters.filter((c) => !isGraphMatcher(c.matcher.type));

    // --- Graph layer ---
    for (const charter of graphCharters) {
      try {
        const ctx = this.resolveGraphContext(g, charter);
        const findings = charter.run(ctx);
        for (const f of findings) {
          out.push({
            ruleId: `ec/${charter.name}/${f.id}`,
            severity: f.severity,
            scope: 'component',
            message: `[EC:${charter.name}] ${f.message}`,
            target: f.target,
            fix: f.remediation,
          });
        }
      } catch (err) {
        console.warn(`[ec] Error running graph charter "${charter.name}":`, err);
      }
    }

    // --- DOM layer ---
    if (renders && renders.length > 0) {
      for (const charter of domCharters) {
        try {
          const ctx = this.resolveDomContext(g, charter, renders);
          const findings = charter.run(ctx);
          for (const f of findings) {
            out.push({
              ruleId: `ec/${charter.name}/${f.id}`,
              severity: f.severity,
              scope: 'component',
              message: `[EC:${charter.name}] ${f.message}`,
              target: f.target,
              fix: f.remediation,
            });
          }
        } catch (err) {
          console.warn(`[ec] Error running DOM charter "${charter.name}":`, err);
        }
      }
    }

    return out;
  }

  /** List registered charters for the design context prompt. */
  listCharters(): Array<{ name: string; severity: string; description: string; layer: string }> {
    return this.elementCharters.map((c) => ({
      name: c.name,
      severity: c.severity,
      description: c.description,
      layer: isGraphMatcher(c.matcher.type) ? 'graph' : 'dom',
    }));
  }

  // ---------------------------------------------------------------------------
  // Context resolution
  // ---------------------------------------------------------------------------

  private resolveGraphContext(g: Graph, charter: ElementCharter): EcGraphContext {
    const matcher = charter.matcher;
    let matched: string[] = [];
    let matchedNodes: GNode[] = [];
    let matchedEdges: GEdge[] = [];

    switch (matcher.type) {
      case 'node': {
        const nodes = g.nodes({ label: matcher.label as any, where: matcher.where });
        matched = nodes.map((n) => n.id);
        matchedNodes = nodes;
        break;
      }
      case 'edge': {
        const edges = g.edges({ label: matcher.label as any, from: matcher.fromWhere as any, to: matcher.toWhere as any });
        matched = edges.map((e) => e.id);
        matchedEdges = edges;
        break;
      }
      case 'subgraph': {
        const subgraphs = matcher.pattern(g);
        matched = subgraphs.flatMap((sg) => sg.nodes.map((n) => n.id));
        matchedNodes = subgraphs.flatMap((sg) => sg.nodes);
        matchedEdges = subgraphs.flatMap((sg) => sg.edges);
        break;
      }
      case 'custom': {
        matched = matcher.match(g);
        matchedNodes = matched.map((id) => g.node(id)).filter((n): n is GNode => !!n);
        break;
      }
    }

    return { layer: 'graph', graph: g, matched, matchedNodes, matchedEdges };
  }

  private resolveDomContext(g: Graph, charter: ElementCharter, renders: RenderSnapshot[]): EcDomContext {
    const matcher = charter.matcher;
    let matchedElements: EcDomNode[] = [];

    for (const render of renders) {
      const roots = buildDomTree(render);

      switch (matcher.type) {
        case 'dom-selector':
          matchedElements.push(...querySelectorAll(matcher.selector, roots));
          break;
        case 'dom-relation':
          matchedElements.push(...queryByRelation(matcher.selector, matcher.relation, roots));
          break;
      }
    }

    return { layer: 'dom', graph: g, renders, matchedElements };
  }
}

function isGraphMatcher(type: string): boolean {
  return type === 'node' || type === 'edge' || type === 'subgraph' || type === 'custom';
}

const order: Record<Severity, number> = { P0: 0, P1: 1, P2: 2 };

/** P0-first agent-facing render of diagnostics. */
export function renderDiagnostics(diags: Diagnostic[]): string {
  if (diags.length === 0) return 'No findings.';
  const sorted = [...diags].sort((a, b) => order[a.severity] - order[b.severity]);
  const blocking = sorted.filter((d) => d.severity === 'P0').length;
  const lines = sorted.map((d) => `- [${d.severity}] ${d.ruleId}: ${d.message}${d.fix ? `\n    fix: ${d.fix}` : ''}${d.snippet ? `\n    at: ${d.snippet}` : ''}`);
  return `${blocking} blocking (P0), ${diags.length - blocking} advisory.\n${lines.join('\n')}`;
}

export function countMustFix(diags: Diagnostic[]): number {
  return diags.filter((d) => d.severity === 'P0').length;
}

/** 0..1 quality score from diagnostics (P0 heavier). */
export function diagnosticsScore(diags: Diagnostic[]): number {
  const penalty = diags.reduce((s, d) => s + (d.severity === 'P0' ? 0.34 : d.severity === 'P1' ? 0.12 : 0.04), 0);
  return Math.max(0, 1 - penalty);
}
