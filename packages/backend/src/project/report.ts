/**
 * The canonical adoption-report shape for the "Design System From Existing
 * Project" flow. Owned by the component-adoption capability; other capabilities
 * (workflow, surface API, MCP tools, CLI) reference these types rather than
 * redefining them, so the report is a single source of truth.
 *
 * The report is pure data — JSON-serializable — so it can cross the HTTP/MCP
 * boundary unchanged.
 */

/** Status of an adopted component relative to the consistency loop. */
export type ComponentStatus = 'loop-ready' | 'needs-manual-fix';

/** Whether placement changed the component on this run. */
export type ComponentChange = 'created' | 'updated' | 'unchanged';

/** One hardcoded value safely rewritten to a semantic token role. */
export interface Rebind {
  /** The original utility/value, e.g. `bg-[#ffffff]`. */
  before: string;
  /** The token-bound replacement, e.g. `bg-surface`. */
  after: string;
  /** The proposed role the value mapped to, e.g. `color-surface`. */
  role: string;
  /** The raw value that was rebound, e.g. `#ffffff`. */
  value: string;
  /** 1-based line of the original occurrence in the source component. */
  line: number;
}

/** A hardcoded value left for manual fix (ambiguous or low-confidence). */
export interface BlockingValue {
  /** The raw value still present in the placed component, e.g. `#0a0a0a`. */
  value: string;
  /** Absolute path of the placed component the value remains in. */
  file: string;
  /** 1-based line of the value in the placed component. */
  line: number;
  /** High-confidence candidate roles (0 = none ≥ threshold, >1 = ambiguous). */
  candidates: string[];
}

/** A knowledge-graph node reference with `file:line` provenance. */
export interface GraphEntry {
  file: string;
  line: number;
}

/** One component brought under management, with its adoption outcome. */
export interface AdoptedComponent {
  name: string;
  /** Absolute path where the component was placed under `componentsDir`. */
  placedPath: string;
  /** Absolute path of the (copied or generated) CSF story, if any. */
  storyPath?: string;
  /** True when a story was generated because the component lacked one. */
  storyGenerated: boolean;
  status: ComponentStatus;
  change: ComponentChange;
  rebinds: Rebind[];
  blockingValues: BlockingValue[];
  graph: GraphEntry;
}

/** The structured outcome of adopting a project's components. */
export interface AdoptionReport {
  components: AdoptedComponent[];
}

/** Assemble the canonical report from per-component outcomes. */
export function buildAdoptionReport(components: AdoptedComponent[]): AdoptionReport {
  return { components };
}

/** A human-readable triage summary of the report (counts + per-component list). */
export function summarizeReport(report: AdoptionReport): string {
  const ready = report.components.filter((c) => c.status === 'loop-ready');
  const manual = report.components.filter((c) => c.status === 'needs-manual-fix');
  const lines: string[] = [
    `Adoption: ${report.components.length} component(s) — ${ready.length} loop-ready, ${manual.length} needs-manual-fix.`,
  ];
  for (const c of report.components) {
    const detail =
      c.status === 'loop-ready'
        ? `${c.rebinds.length} rebind(s)`
        : `${c.blockingValues.length} blocking value(s)`;
    lines.push(`- ${c.name} [${c.status}] (${c.change}): ${detail}`);
  }
  return lines.join('\n');
}
