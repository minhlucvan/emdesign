import path from 'node:path';
import fs from 'node:fs';
import { Repository, type RepoConfig } from './services/repository.js';
import { RuleEngine } from './rules/engine.js';
import type { ComponentLintOptions } from './rules/lint.js';
import { detectConflicts } from './services/conflicts.js';
import { snapshot, listSnapshots, diffAgainstLatest, type Snapshot, type HistoryDiff } from './services/history.js';
import type { Conflict, Diagnostic, Reference } from './domain/values.js';
import type { DesignSystem } from './domain/designSystem.js';
import type { ElementCharter } from './charters/charter.js';
import { loadElementCharters } from './charters/loader.js';
import type { RenderSnapshot } from './rules/rendered.js';
import { Graph, loadGraph } from '@emdesign/graph';

export type RuntimeConfig = RepoConfig;

export interface ValidationResult {
  id: string;
  ok: boolean;
  diagnostics: Diagnostic[];
}

/**
 * DesignSystemRuntime — the conventional, behaviorful interface the backend (and tools/agents)
 * call for every design-system operation: load, validate, find-references, conflicts, rules,
 * history, element charters. Design as code.
 */
export class DesignSystemRuntime {
  readonly repository: Repository;
  readonly rules: RuleEngine;

  constructor(private cfg: RuntimeConfig, rules: RuleEngine = new RuleEngine()) {
    this.repository = new Repository(cfg);
    this.rules = rules;
  }

  load(id: string): DesignSystem {
    return this.repository.load(id);
  }
  list() {
    return this.repository.list();
  }
  rebuild(id: string): DesignSystem {
    return this.repository.rebuild(id);
  }

  /** System-scope validation (token contract + structural invariants). ok = no P0. */
  validate(id: string): ValidationResult {
    const diagnostics = this.rules.evaluateSystem(this.load(id));
    return { id, ok: !diagnostics.some((d) => d.severity === 'P0'), diagnostics };
  }

  conflicts(id: string): Conflict[] {
    return detectConflicts(this.load(id));
  }

  /** Transitive dependents of a node (find-references / impact). */
  references(id: string, nodeId: string): Reference[] {
    return this.load(id).affected(nodeId);
  }

  /** Component-scope rule evaluation (the lint the backend adapter delegates to). */
  evaluateComponent(source: string, opts: ComponentLintOptions & { framework?: string }): Diagnostic[] {
    return this.rules.evaluateComponent(source, opts);
  }

  /** Commit a history snapshot of the current state. */
  snapshot(id: string): string {
    return snapshot(this.repository.load(id, { fresh: true }), this.cfg.designSystemsDir);
  }

  /** All snapshots + a diff of the working state vs the latest snapshot. */
  history(id: string): { snapshots: Snapshot[]; sinceLatest: HistoryDiff | null } {
    const ds = this.repository.load(id, { fresh: true });
    return { snapshots: listSnapshots(ds, this.cfg.designSystemsDir), sinceLatest: diffAgainstLatest(ds, this.cfg.designSystemsDir) };
  }

  // ---------------------------------------------------------------------------
  // Element Charters
  // ---------------------------------------------------------------------------

  /**
   * Load and register Element Charters for a design system.
   * Scans <designSystemsDir>/<id>/charters/ for charter files.
   * Call this after activating a design system to load its charters.
   */
  async loadCharters(id: string): Promise<ElementCharter[]> {
    const chartersDir = path.join(this.cfg.designSystemsDir, id, 'charters');
    let charters: ElementCharter[];
    try {
      charters = await loadElementCharters({ chartersDir });
    } catch {
      charters = [];
    }
    this.rules.registerCharters(charters);
    return charters;
  }

  /**
   * Evaluate all registered Element Charters against the design system.
   * Graph-layer charters are always evaluated.
   * DOM-layer charters require render snapshots (can pass renders from renderProbe).
   */
  evaluateCharters(
    id: string,
    renders?: RenderSnapshot[],
  ): { charters: Diagnostic[]; total: Diagnostic[] } {
    // Load the graph from disk for charter evaluation
    const graphPath = path.join(this.cfg.designSystemsDir, id, 'graph.json');
    let graph: Graph;
    try {
      graph = loadGraph(graphPath);
    } catch {
      console.warn(`[ec] No graph found for "${id}", skipping charter evaluation`);
      return { charters: [], total: [] };
    }

    const charterDiagnostics = this.rules.evaluateCharters(graph, renders);
    return {
      charters: charterDiagnostics,
      total: charterDiagnostics,
    };
  }

  /**
   * List registered Element Charters.
   */
  listCharters(): Array<{ name: string; severity: string; description: string; layer: string }> {
    return this.rules.listCharters();
  }
}

export function createRuntime(cfg: RuntimeConfig, rules?: RuleEngine): DesignSystemRuntime {
  return new DesignSystemRuntime(cfg, rules);
}
