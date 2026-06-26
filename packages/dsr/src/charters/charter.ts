/**
 * @emdesign/dsr — Element Charters (EC).
 *
 * Element Charters are the fundamental unit of design-system-specific validation.
 * Each charter is a self-contained JS module that:
 * 1. Declares which element(s) it applies to (via a matcher)
 * 2. Runs deterministic validation over the graph or rendered DOM (via run)
 * 3. Returns findings that plug into the existing critique/scoreboard pipeline
 *
 * Two layers:
 * - Graph layer: validates against the knowledge graph (primitives, tokens, compositions)
 * - DOM layer: validates against rendered DOM snapshots (computed styles, layout, hierarchy)
 */

import type { Graph, GNode, GEdge } from '@emdesign/graph';
import type { RenderSnapshot, RenderNode } from '../rules/rendered.js';
import type { Severity } from '../domain/values.js';

// ---------------------------------------------------------------------------
// Finding
// ---------------------------------------------------------------------------

/**
 * A single finding from an Element Charter's run().
 * Compatible with Diagnostic from @emdesign/dsr so it feeds into the
 * critique pipeline (computeComposite, decideRound).
 */
export interface EcFinding {
  /** Machine-readable id, e.g. "button-padding/atelier/Button" */
  id: string;
  severity: Severity;
  message: string;
  /** The node/edge/selector-id this finding targets */
  target?: string;
  /** How to fix (optional, for agent guidance) */
  remediation?: string;
}

// ---------------------------------------------------------------------------
// Graph layer
// ---------------------------------------------------------------------------

/**
 * Context passed to an Element Charter's run() when matched at the graph layer.
 * A charter receives this when using a node/edge/subgraph/custom matcher.
 */
export interface EcGraphContext {
  layer: 'graph';
  /** The full design-system knowledge graph */
  graph: Graph;
  /** The matched node/edge ids this charter applies to */
  matched: string[];
  /** All graph nodes matched by the charter's matcher */
  matchedNodes: GNode[];
  /** All graph edges matched (for edge matchers) */
  matchedEdges: GEdge[];
}

// ---------------------------------------------------------------------------
// DOM layer
// ---------------------------------------------------------------------------

/**
 * A matched DOM element — wraps the raw RenderNode with convenience accessors
 * for traversal (parent, children, siblings) and computed style queries.
 */
export interface EcDomNode {
  /** The raw render-probe data (selector, tag, classes, text, box, styles) */
  node: RenderNode;
  /** Direct children of this element (matched within the same snapshot) */
  children: EcDomNode[];
  /** Parent element, if any */
  parent: EcDomNode | null;
  /** Sibling elements (same parent, excluding this one) */
  siblings: EcDomNode[];
}

/**
 * Context passed to an Element Charter's run() when matched at the DOM layer.
 * A charter receives this when using a dom-selector or dom-relation matcher.
 */
export interface EcDomContext {
  layer: 'dom';
  /** The full design-system graph (still available for cross-reference) */
  graph: Graph;
  /** One or more render snapshots the charter runs against */
  renders: RenderSnapshot[];
  /** The matched DOM elements (from all snapshots) */
  matchedElements: EcDomNode[];
}

// ---------------------------------------------------------------------------
// Union context
// ---------------------------------------------------------------------------

/**
 * Union of all possible Element Charter contexts.
 * The layer is determined by the matcher type:
 * - node | edge | subgraph | custom → EcGraphContext
 * - dom-selector | dom-relation → EcDomContext
 */
export type EcContext = EcGraphContext | EcDomContext;

// ---------------------------------------------------------------------------
// Matchers
// ---------------------------------------------------------------------------

/**
 * A matcher identifies which element(s) an Element Charter applies to.
 * The matcher type determines which layer (graph or DOM) the charter runs on.
 *
 * Graph layer:
 * - `node`: match all graph nodes of a given label + optional property filter
 * - `edge`: match all graph edges of a given label + optional property filters
 * - `subgraph`: hand a function the full graph; returns subgraph matches
 * - `custom`: arbitrary programmatic match returning node/edge IDs
 *
 * DOM layer:
 * - `dom-selector`: standard CSS selector against the rendered DOM
 * - `dom-relation`: select elements by their DOM relationship to a selector
 */
export type EcMatcher =
  // ── Graph layer ──
  | { type: 'node'; label: string; where?: Record<string, unknown> }
  | { type: 'edge'; label: string; fromWhere?: Record<string, unknown>; toWhere?: Record<string, unknown> }
  | { type: 'subgraph'; pattern(g: Graph): Array<{ label: string; nodes: GNode[]; edges: GEdge[] }> }
  | { type: 'custom'; match(g: Graph): string[] }
  // ── DOM layer ──
  | { type: 'dom-selector'; selector: string }
  | {
      type: 'dom-relation';
      /** CSS selector to find base elements */
      selector: string;
      /** Relationship to traverse from each matched base element */
      relation: 'parent' | 'children' | 'siblings' | 'ancestors';
      /** Human-readable hint for what the relation targets (not used in matching logic) */
      of?: string;
    };

// ---------------------------------------------------------------------------
// ElementCharter
// ---------------------------------------------------------------------------

/**
 * An Element Charter (EC) — the fundamental unit of design-system-specific validation.
 *
 * Each charter is a self-contained module that:
 * 1. Declares which element(s) it applies to (via matcher)
 * 2. Runs deterministic validation over the graph or rendered DOM (via run)
 * 3. Returns findings that plug into the existing critique/scoreboard pipeline
 *
 * The matcher type determines the validation layer:
 * - node | edge | subgraph | custom → graph layer (EcGraphContext)
 * - dom-selector | dom-relation → DOM layer (EcDomContext)
 */
export interface ElementCharter {
  /** Unique kebab-case identifier, e.g. "button-padding", "heading-font" */
  name: string;
  /** Human-readable description, phrased as a charter statement */
  description: string;
  /** Severity level for findings from this charter */
  severity: Severity;
  /** Which element(s) this charter applies to — determines the validation layer */
  matcher: EcMatcher;
  /**
   * Deterministic validation.
   * Receives matched elements + full context (graph or DOM depending on matcher).
   * Must be pure: no side effects, no external calls, deterministic output.
   */
  run(ctx: EcContext): EcFinding[];
}
