import fs from 'node:fs';
import path from 'node:path';
import type { RepoPaths, RenderSnapshotOutput } from '@emdesign/backend';
import { renderSnapshot } from '@emdesign/backend';
import { formatJson, formatError } from '../lib/format.js';

export interface SpatialAuditArgs {
  component: string;
  story?: string;
  theme?: 'light' | 'dark';
  json?: boolean;
  grid?: boolean;
  viewport?: string;
}

/**
 * Full geometry breakdown for a component: bounding boxes, overlap detection,
 * spacing analysis, and optional grid overlay measurement.
 * Builds on the existing spatial.ts in the backend.
 */
export async function cmdSpatialAudit(args: SpatialAuditArgs, paths: RepoPaths): Promise<void> {
  const { component, story = 'default', theme = 'light', grid, viewport } = args;
  if (!component) {
    formatError('usage: emdesign spatial audit <component> [--story <name>] [--theme light|dark] [--grid] [--viewport <WxH>]');
    process.exit(1);
  }

  const vp = viewport ? parseViewport(viewport) : undefined;

  // Use the existing renderSnapshot to get DOM structure
  let snapshots;
  try {
    snapshots = await renderSnapshot(paths, component, { story, themes: [theme], viewportWidth: vp?.width, viewportHeight: vp?.height });
  } catch (e) {
    formatError(`Render failed: ${(e as Error).message}. Ensure Storybook is running.`);
    process.exit(1);
  }

  if (!snapshots || snapshots.length === 0) {
    formatError('No render snapshots captured.');
    process.exit(1);
  }

  const snapshot = snapshots[0];
  const nodes = snapshot.nodes ?? [];

  // Compute spatial metrics
  const overlaps: { a: string; b: string; overlapPx: number }[] = [];
  const misalignments: { node: string; axis: string; diff: number }[] = [];

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j];
      if (!a.box || !b.box) continue;
      const ax = a.box.x, ay = a.box.y, aw = a.box.width, ah = a.box.height;
      const bx = b.box.x, by = b.box.y, bw = b.box.width, bh = b.box.height;
      // Check overlap
      const ox = Math.max(0, Math.min(ax + aw, bx + bw) - Math.max(ax, bx));
      const oy = Math.max(0, Math.min(ay + ah, by + bh) - Math.max(ay, by));
      if (ox > 0 && oy > 0 && (aw * ah > 0) && (bw * bh > 0)) {
        overlaps.push({
          a: a.tag ?? 'unknown',
          b: b.tag ?? 'unknown',
          overlapPx: ox * oy,
        });
      }
    }
  }

  // Grid adherence — if --grid is passed and viewport is known
  let gridInfo: Record<string, unknown> | undefined;
  if (grid && snapshot.viewport) {
    const gridSize = 8; // default 8px grid
    const gk = (v: number) => Math.round(v / gridSize) * gridSize;
    gridInfo = {
      gridSize,
      violations: nodes.filter(n => n.box && (n.box.x !== gk(n.box.x) || n.box.y !== gk(n.box.y))).length,
      alignedNodes: nodes.filter(n => n.box && n.box.x === gk(n.box.x) && n.box.y === gk(n.box.y)).length,
    };
  }

  const result = {
    component,
    story,
    theme,
    viewport: snapshot.viewport ?? { width: 1280, height: 720 },
    nodeCount: nodes.length,
    overlaps: overlaps.slice(0, 20), // cap at 20 for readability
    misalignments: misalignments.slice(0, 20),
    grid: gridInfo,
  };

  if (args.json) {
    formatJson(result);
  } else {
    process.stdout.write(`═══ Spatial Audit: ${component} ═══\n`);
    process.stdout.write(`Viewport: ${result.viewport.width}x${result.viewport.height}\n`);
    process.stdout.write(`Nodes: ${nodes.length}\n`);
    process.stdout.write(`Overlaps: ${overlaps.length}${overlaps.length > 0 ? ` (${overlaps.slice(0, 5).map(o => `${o.a}/${o.b}:${o.overlapPx}px`).join(', ')})` : ''}\n`);
    if (gridInfo) {
      process.stdout.write(`Grid (${gridInfo.gridSize}px): ${gridInfo.alignedNodes} aligned, ${gridInfo.violations} violations\n`);
    }
    process.stdout.write(`═══════════════════════════════════\n`);
  }
}

/** Parse "WxH" viewport string into {width, height}. */
function parseViewport(s: string): { width: number; height: number } {
  const m = s.match(/^(\d+)x(\d+)$/);
  if (!m) { formatError(`Invalid viewport "${s}". Use WxH format (e.g. 375x812).`); process.exit(1); }
  return { width: parseInt(m[1], 10), height: parseInt(m[2], 10) };
}
