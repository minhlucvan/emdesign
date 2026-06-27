import fs from 'node:fs';
import path from 'node:path';
import type { RepoPaths, Store } from '@emdesign/backend';
import { loadOrBuild, overlayGenerated, effectiveAdapter, buildAndSave } from '@emdesign/backend';
import { query, getContext, findAffected, consistencyBrief } from '@emdesign/graph';
import { formatJson, formatError } from '../lib/format.js';
import { activeDsId } from '../lib/resolve.js';
import { listAllStories } from '../lib/storybook.js';

export interface ExploreArgs {
  topic?: string;
  name?: string;
  ds?: string;
  json?: boolean;
}

function graphWithCurrent(paths: RepoPaths, store: Store, id: string) {
  const g = loadOrBuild(paths, id);
  const current = store.get().currentComponent;
  if (current) {
    try { overlayGenerated(g, paths, id, current); } catch { /* ignore */ }
  }
  return g;
}

function srcOf(n: { props: Record<string, unknown> }): string | undefined {
  const s = n.props.source as { file?: string; line?: number } | undefined;
  return s?.line ? `${s.file}:${s.line}` : s?.file;
}

// ── Helpers ───────────────────────────────────────────────────────────────

function formatOverview(g: ReturnType<typeof graphWithCurrent>, dsId: string, paths: RepoPaths): string {
  const primitives = g.nodes({ label: 'primitive' });
  const tokens = g.nodes({ label: 'token' });
  const rules = g.nodes({ label: 'rule' });
  const charters = g.nodes({ label: 'charter' });
  const sections = g.nodes({ label: 'section' });

  // Token counts by kind
  const byKind: Record<string, number> = {};
  for (const t of tokens) {
    const kind = String(t.props.kind ?? 'other');
    byKind[kind] = (byKind[kind] ?? 0) + 1;
  }

  // Component counts
  const generatedDir = paths.generatedDir;
  let genCount = 0;
  try { genCount = fs.readdirSync(generatedDir).filter(f => f.endsWith('.tsx') && !f.endsWith('.stories.tsx')).length; } catch {}
  const compDir = paths.componentsDir;
  let capCount = 0;
  try { capCount = fs.readdirSync(compDir).filter(f => fs.statSync(path.join(compDir, f)).isDirectory()).length; } catch {}

  const p0 = rules.filter(r => String(r.props.severity) === 'P0').length;
  const p1 = rules.filter(r => String(r.props.severity) === 'P1').length;
  const p2 = rules.filter(r => String(r.props.severity) === 'P2').length;

  const lines = [
    `═══ Workspace: ${paths.root} ═══`,
    `Active DS: ${dsId} (${primitives.length} primitives, ${tokens.length} tokens, ${rules.length} rules, ${charters.length} charters, ${sections.length} sections)`,
    `Components: ${genCount} generated, ${capCount} captured`,
    '',
    `Tokens by kind:  ${Object.entries(byKind).map(([k, v]) => `${k}=${v}`).join(', ')}`,
    `Primitives: ${primitives.map(n => n.props.name).filter(Boolean).join(', ')}`,
    `Rules: ${p0} P0, ${p1} P1, ${p2} P2`,
    `Charters: ${charters.map(n => n.props.name).filter(Boolean).join(', ') || '(none)'}`,
  ];
  return lines.join('\n');
}

function formatTokens(g: ReturnType<typeof graphWithCurrent>, dsId: string, nameFilter?: string): string {
  const all = g.nodes({ label: 'token' });
  if (nameFilter) {
    const match = all.filter(t => String(t.props.name).includes(nameFilter));
    if (match.length === 0) return `No token matching "${nameFilter}" in ${dsId}.`;
    const lines = [`═══ Token: ${match[0].props.name} ═══`];
    for (const t of match) {
      const ctx = getContext(g, t.id);
      if (ctx) {
        lines.push(`Value: ${JSON.stringify(ctx.node.props.value ?? ctx.node.props.defaultValue ?? '(set)')}`);
        lines.push(`Kind: ${ctx.node.props.kind ?? 'unknown'}`);
        lines.push(`Source: ${srcOf(ctx.node) ?? 'unknown'}`);
        const usedBy = ctx.in.filter(e => e.label === 'uses').map(e => `${e.fromLabel}/${e.from}`);
        if (usedBy.length) lines.push(`Used by: ${usedBy.join(', ')}`);
        const defdIn = ctx.out.filter(e => e.label === 'definedIn').map(e => e.to);
        if (defdIn.length) lines.push(`Defined in: ${defdIn.join(', ')}`);
      }
    }
    return lines.join('\n');
  }

  const byKind: Record<string, typeof all> = {};
  for (const t of all) {
    const kind = String(t.props.kind ?? 'other');
    (byKind[kind] ??= []).push(t);
  }

  const lines = [`═══ Tokens (${dsId}) ═══`, ''];
  for (const [kind, kindTokens] of Object.entries(byKind)) {
    lines.push(`${kind} (${kindTokens.length}):`);
    for (const t of kindTokens.slice(0, 20)) {
      const val = String(t.props.value ?? t.props.defaultValue ?? '');
      const s = srcOf(t) ?? '';
      const displayName = String(t.props.name).replace(/^--/, '');
      lines.push(`  --${displayName}${val ? `  ${val}` : ''}${s ? `  ${s}` : ''}`);
    }
    if (kindTokens.length > 20) lines.push(`  ... and ${kindTokens.length - 20} more`);
    lines.push('');
  }
  return lines.join('\n');
}

function formatPrimitives(g: ReturnType<typeof graphWithCurrent>, dsId: string, nameFilter?: string): string {
  const all = g.nodes({ label: 'primitive' });

  if (nameFilter) {
    const match = all.find(t => String(t.props.name).toLowerCase() === nameFilter.toLowerCase());
    if (!match) return `No primitive "${nameFilter}" in ${dsId}.`;
    const ctx = getContext(g, match.id);
    const lines = [`═══ Primitive: ${match.props.name} ═══`];
    if (ctx) {
      const shortId = (id: string) => id.split('/').pop() ?? id;
      const props = ctx.out.filter(e => e.label === 'hasProp').map(e => shortId(e.to));
      if (props.length) lines.push(`Props: ${props.join(', ')}`);
      const variants = ctx.out.filter(e => e.label === 'hasVariant').map(e => shortId(e.to));
      if (variants.length) lines.push(`Variants: ${variants.join(', ')}`);
      const states = ctx.out.filter(e => e.label === 'hasState').map(e => shortId(e.to));
      if (states.length) lines.push(`States: ${states.join(', ')}`);
      const uses = ctx.out.filter(e => e.label === 'uses').map(e => shortId(e.to));
      if (uses.length) lines.push(`Uses tokens: ${uses.join(', ')}`);
      const composedBy = ctx.in.filter(e => e.label === 'composes').map(e => `${e.fromLabel}/${shortId(e.from)}`);
      if (composedBy.length) lines.push(`Composed by: ${composedBy.join(', ')}`);
      const stories = ctx.in.filter(e => e.label === 'storyOf').map(e => shortId(e.from));
      if (stories.length) lines.push(`Stories: ${stories.join(', ')}`);
    }
    lines.push(`Source: ${srcOf(match) ?? 'unknown'}`);
    return lines.join('\n');
  }

  const lines = [`═══ Primitives (${dsId}): ${all.length} total ═══`, ''];
  for (const p of all) {
    const ctx = getContext(g, p.id);
    const props = ctx?.out.filter(e => e.label === 'hasProp').map(e => e.to).join(', ') ?? '';
    const uses = ctx?.out.filter(e => e.label === 'uses').map(e => e.to).join(', ') ?? '';
    lines.push(`  ${p.props.name}${props ? `  props: [${props}]` : ''}${uses ? `  uses: ${uses}` : ''}`);
  }
  return lines.join('\n');
}

function formatComponents(g: ReturnType<typeof graphWithCurrent>, paths: RepoPaths, nameFilter?: string): string {
  // Scan generated + captured directories
  const scanDir = (dir: string, kind: string): Array<{ name: string; path: string; kind: string }> => {
    const result: Array<{ name: string; path: string; kind: string }> = [];
    if (!fs.existsSync(dir)) return result;
    for (const entry of fs.readdirSync(dir)) {
      const full = path.join(dir, entry);
      if (fs.statSync(full).isDirectory()) {
        // Captured components live in subdirectories
        if (fs.existsSync(path.join(full, `${entry}.tsx`))) {
          result.push({ name: entry, path: full, kind });
        }
      } else if (entry.endsWith('.tsx') && !entry.endsWith('.stories.tsx')) {
        result.push({ name: entry.replace(/\.tsx$/, ''), path: full, kind });
      }
    }
    return result;
  };

  const generated = scanDir(paths.generatedDir, 'generated');
  const captured = scanDir(paths.componentsDir, 'captured');

  if (nameFilter) {
    const match = [...generated, ...captured].find(c => c.name.toLowerCase() === nameFilter.toLowerCase());
    if (!match) return `No component "${nameFilter}" found.`;

    const lines = [`═══ Component: ${match.name} ═══`];
    lines.push(`Type: ${match.kind} (${match.path})`);

    // Graph context
    const artNode = g.nodes({ label: 'artifact', where: { name: match.name } });
    if (artNode.length) {
      const ctx = getContext(g, artNode[0].id);
      if (ctx) {
        const composes = ctx.out.filter(e => e.label === 'composes').map(e => `${e.toLabel}/${e.to}`);
        if (composes.length) lines.push(`\nComposes:\n${composes.map(c => `  └─ ${c}`).join('\n')}`);
        const uses = ctx.out.filter(e => e.label === 'uses' || e.label === 'references').map(e => e.to);
        if (uses.length) lines.push(`\nUses tokens: ${uses.join(', ')}`);
      }
    }

    // Stories
    const adapter = effectiveAdapter(paths);
    const storyFile = path.join(paths.generatedDir, `${match.name}${adapter.storyExt}`);
    if (fs.existsSync(storyFile)) {
      const src = fs.readFileSync(storyFile, 'utf8');
      const exports = src.match(/export const (\w+)/g)?.map(e => e.replace('export const ', '')) ?? [];
      lines.push(`\nStories: ${exports.filter(e => !['default', 'meta', 'args', 'argTypes'].includes(e)).join(', ')}`);
    }

    return lines.join('\n');
  }

  // Summary table
  const lines = [`═══ Components ═══`, ''];
  if (generated.length) {
    lines.push(`Generated (${generated.length}):`);
    for (const c of generated) {
      const art = g.nodes({ label: 'artifact', where: { name: c.name } });
      const ctx = art.length ? getContext(g, art[0].id) : null;
      const composes = ctx?.out.filter(e => e.label === 'composes').map(e => e.to).join(', ') ?? '';
      lines.push(`  ${c.name}${composes ? `  composes: [${composes}]` : ''}`);
    }
    lines.push('');
  }
  if (captured.length) {
    lines.push(`Captured (${captured.length}):`);
    for (const c of captured) {
      lines.push(`  ${c.name}`);
    }
    lines.push('');
  }
  if (generated.length + captured.length === 0) lines.push('(none)');
  return lines.join('\n');
}

function formatHierarchy(g: ReturnType<typeof graphWithCurrent>, dsId: string, name: string): string {
  // Find the node: try artifact first, then primitive
  const arts = g.nodes({ label: 'artifact', where: { name } });
  const prims = g.nodes({ label: 'primitive', where: { name } });
  const target = arts[0] ?? prims[0];

  if (!target) return `No "${name}" found in ${dsId}. Try: primitives, components.`;

  const lines = [`═══ Composition: ${name} ═══`];
  const ctx = getContext(g, target.id);
  if (!ctx) return `No context for "${name}".`;

  // What it composes (out edges: composes, uses)
  const composes = ctx.out.filter(e => e.label === 'composes');
  if (composes.length) {
    lines.push(`Composes:`);
    for (const c of composes) {
      const childCtx = getContext(g, c.to);
      const childUses = childCtx?.out.filter(e => e.label === 'uses').map(e => `--${e.to.replace(/.*--/, '')}`) ?? [];
      const useStr = childUses.length ? `  [uses ${childUses.join(', ')}]` : '';
      lines.push(`  ├─ ${c.toLabel}/${c.to}${useStr}`);

      // One more level of depth for primitives
      const grandchildCtx = getContext(g, c.to);
      const grandchildComposes = grandchildCtx?.out.filter(e => e.label === 'composes') ?? [];
      for (const g2 of grandchildComposes) {
        lines.push(`  │    └─ ${g2.toLabel}/${g2.to}`);
      }
    }
  }

  // What uses it (in edges: composes)
  const usedBy = ctx.in.filter(e => e.label === 'composes');
  if (usedBy.length) {
    lines.push(`\nUsed by:`);
    for (const u of usedBy) {
      lines.push(`  └─ ${u.fromLabel}/${u.from}`);
    }
  }

  return lines.join('\n');
}

function formatRules(g: ReturnType<typeof graphWithCurrent>, dsId: string): string {
  const all = g.nodes({ label: 'rule' });
  if (all.length === 0) return `No rules in ${dsId}.`;

  const bySeverity: Record<string, typeof all> = {};
  for (const r of all) {
    const sev = String(r.props.severity ?? 'P2');
    (bySeverity[sev] ??= []).push(r);
  }

  const lines = [`═══ Rules (${dsId}): ${all.length} total ═══`, ''];
  for (const sev of ['P0', 'P1', 'P2']) {
    const sevRules = bySeverity[sev];
    if (!sevRules?.length) continue;
    lines.push(`${sev} (${sevRules.length}):`);
    for (const r of sevRules) {
      lines.push(`  ${r.props.ruleId ?? r.id}: ${r.props.message}`);
    }
    lines.push('');
  }
  return lines.join('\n');
}

function formatCharters(g: ReturnType<typeof graphWithCurrent>, dsId: string): string {
  const all = g.nodes({ label: 'charter' });
  if (all.length === 0) return `No element charters in ${dsId}.`;

  const lines = [`═══ Element Charters (${dsId}): ${all.length} total ═══`, ''];
  for (const c of all) {
    lines.push(`  ${c.props.name}${c.props.severity ? `  [${c.props.severity}]` : ''}${c.props.description ? `  ${c.props.description}` : ''}`);
  }
  return lines.join('\n');
}

function formatSections(g: ReturnType<typeof graphWithCurrent>, dsId: string): string {
  const all = g.nodes({ label: 'section' });
  if (all.length === 0) return `No sections in ${dsId}.`;

  const lines = [`═══ DESIGN.md Sections (${dsId}): ${all.length} total ═══`, ''];
  for (const s of all) {
    const src = srcOf(s) ?? '';
    lines.push(`  ${s.props.title ?? s.id}${src ? `  ${src}` : ''}`);
  }
  return lines.join('\n');
}

function formatStats(g: ReturnType<typeof graphWithCurrent>, dsId: string): string {
  const stats = g.stats();
  const lines = [`═══ Graph Stats (${dsId}) ═══`];
  lines.push(`Nodes: ${stats.nodes}`);
  lines.push(`Edges: ${stats.edges}`);

  // Show counts per node label
  const nodeCounts: Record<string, number> = {};
  for (const n of g.nodes()) {
    nodeCounts[n.label] = (nodeCounts[n.label] ?? 0) + 1;
  }
  lines.push('', 'Nodes by label:');
  for (const [label, count] of Object.entries(nodeCounts).sort((a, b) => b[1] - a[1])) {
    lines.push(`  ${label}: ${count}`);
  }

  return lines.join('\n');
}

// ── Main dispatch ─────────────────────────────────────────────────────────

export async function cmdExplore(args: ExploreArgs, paths: RepoPaths, store: Store): Promise<void> {
  const dsId = args.ds ?? activeDsId(store);
  const g = graphWithCurrent(paths, store, dsId);

  let output: string;

  switch (args.topic) {
    case undefined:
    case 'overview': {
      output = formatOverview(g, dsId, paths);
      if (args.json) {
        const primitives = g.nodes({ label: 'primitive' });
        const tokens = g.nodes({ label: 'token' });
        const rules = g.nodes({ label: 'rule' });
        formatJson({
          dsId,
          primitives: primitives.length,
          tokens: tokens.length,
          rules: rules.length,
          primitiveNames: primitives.map(n => n.props.name),
          tokenNames: tokens.map(n => n.props.name),
        });
        return;
      }
      break;
    }

    case 'ds': {
      const targetName = args.name ?? dsId;
      output = formatOverview(g, targetName, paths);
      if (args.json) {
        const primitives = g.nodes({ label: 'primitive' });
        const tokens = g.nodes({ label: 'token' });
        const rules = g.nodes({ label: 'rule' });
        formatJson({
          dsId: targetName,
          primitives: primitives.map(n => ({ name: n.props.name, source: srcOf(n) })),
          tokens: tokens.map(n => ({ name: n.props.name, kind: n.props.kind, value: n.props.value ?? n.props.defaultValue, source: srcOf(n) })),
          rules: rules.map(n => ({ id: n.props.ruleId, severity: n.props.severity, message: n.props.message })),
        });
        return;
      }
      break;
    }

    case 'token':
    case 'tokens': {
      output = formatTokens(g, dsId, args.name);
      if (args.json) {
        const tokens = g.nodes({ label: 'token' });
        formatJson(tokens.map(t => ({
          name: t.props.name,
          kind: t.props.kind,
          value: t.props.value ?? t.props.defaultValue,
          source: srcOf(t),
        })));
        return;
      }
      break;
    }

    case 'primitive':
    case 'primitives': {
      output = formatPrimitives(g, dsId, args.name);
      if (args.json) {
        const primitives = g.nodes({ label: 'primitive' });
        formatJson(primitives.map(p => ({
          name: p.props.name,
          source: srcOf(p),
        })));
        return;
      }
      break;
    }

    case 'component':
    case 'components': {
      output = formatComponents(g, paths, args.name);
      if (args.json) {
        formatJson({ note: 'Use --json on individual explore topics for structured data' });
        return;
      }
      break;
    }

    case 'hierarchy': {
      const name = args.name;
      if (!name) {
        formatError('usage: emdesign explore hierarchy <component-or-primitive-name>');
        process.exit(1);
      }
      output = formatHierarchy(g, dsId, name);
      if (args.json) {
        const target = (g.nodes({ label: 'artifact', where: { name } })[0] ?? g.nodes({ label: 'primitive', where: { name } })[0]);
        const ctx = target ? getContext(g, target.id) : null;
        formatJson(ctx ?? { error: `Not found: ${name}` });
        return;
      }
      break;
    }

    case 'rule':
    case 'rules': {
      output = formatRules(g, dsId);
      if (args.json) {
        const rules = g.nodes({ label: 'rule' });
        formatJson(rules.map(r => ({ id: r.props.ruleId, severity: r.props.severity, message: r.props.message })));
        return;
      }
      break;
    }

    case 'charter':
    case 'charters': {
      output = formatCharters(g, dsId);
      if (args.json) {
        const charters = g.nodes({ label: 'charter' });
        formatJson(charters.map(c => ({ name: c.props.name, severity: c.props.severity, description: c.props.description })));
        return;
      }
      break;
    }

    case 'section':
    case 'sections': {
      output = formatSections(g, dsId);
      if (args.json) {
        const sections = g.nodes({ label: 'section' });
        formatJson(sections.map(s => ({ title: s.props.title, source: srcOf(s) })));
        return;
      }
      break;
    }

    case 'stats': {
      output = formatStats(g, dsId);
      if (args.json) {
        formatJson(g.stats());
        return;
      }
      break;
    }

    default:
      formatError(`Unknown explore topic: ${args.topic}`);
      process.exit(1);
  }

  process.stdout.write(output + '\n');
}
