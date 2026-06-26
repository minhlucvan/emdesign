/**
 * Element Charters — integration validation script.
 *
 * Exercises all key pieces end-to-end:
 * 1. Imports all new types
 * 2. Builds a graph with charter nodes
 * 3. Tests DOM selector matching
 * 4. Loads atelier charters
 * 5. Evaluates charters via RuleEngine
 */
import { Graph } from '@emdesign/graph';
import { buildGraph } from '@emdesign/graph';
import { RuleEngine } from '@emdesign/dsr';
import {
  ElementCharter,
  EcMatcher,
  EcGraphContext,
  EcDomContext,
  EcDomNode,
  EcFinding,
  buildDomTree,
  querySelectorAll,
  queryByRelation,
} from '@emdesign/dsr';
import { RenderNode, RenderSnapshot } from '@emdesign/dsr';

async function main() {
  const pass: string[] = [];
  const fail: string[] = [];

  function check(name: string, ok: boolean, detail?: string) {
    if (ok) {
      pass.push(`  ✓ ${name}`);
    } else {
      fail.push(`  ✗ ${name}${detail ? ` — ${detail}` : ''}`);
    }
  }

  // ── 1. Graph: charter nodes in build ──
  console.log('\n1. Graph: charter nodes during build');
  const dsDir = new URL('../design-systems/atelier', import.meta.url).pathname;
  const g = buildGraph(dsDir, 'atelier');
  const charterNodes = g.nodes({ label: 'charter' });
  const hasCharterEdges = g.edges({ label: 'hasCharter' });
  check(
    'charter nodes created in graph',
    charterNodes.length > 0,
    `found ${charterNodes.length} charter nodes`,
  );
  check(
    'hasCharter edges created',
    hasCharterEdges.length > 0,
    `found ${hasCharterEdges.length} hasCharter edges`,
  );
  if (charterNodes.length > 0) {
    console.log(`    Nodes: ${charterNodes.map((n) => n.props.name).join(', ')}`);
  }

  // ── 2. RuleEngine: register and evaluate charters ──
  console.log('\n2. RuleEngine: register + evaluate graph-layer charters');
  const engine = new RuleEngine();
  const testCharter: ElementCharter = {
    name: 'test-prime-check',
    description:
      'As a test, I want to verify the RuleEngine integration works.',
    severity: 'P1',
    matcher: { type: 'node', label: 'primitive' },
    run(ctx: EcGraphContext) {
      const findings: EcFinding[] = [];
      for (const node of ctx.matchedNodes) {
        findings.push({
          id: `found/${node.id}`,
          severity: 'P1',
          message: `Matched primitive: ${String(node.props.name)}`,
          target: node.id,
        });
      }
      return findings;
    },
  };
  engine.registerCharters([testCharter]);
  const graphDiags = engine.evaluateCharters(g);
  check(
    'graph-layer charter ran and produced findings',
    graphDiags.length > 0,
    `produced ${graphDiags.length} findings`,
  );
  check(
    'findings include EC prefix',
    graphDiags[0]?.ruleId.startsWith('ec/test-prime-check/'),
    `first finding: ${graphDiags[0]?.ruleId}`,
  );

  // ── 3. DOM matcher: buildDomTree + querySelectorAll ──
  console.log('\n3. DOM matcher: tree construction + selector query');
  const mockSnapshot: RenderSnapshot = {
    component: 'Button',
    storyId: 'example-button--primary',
    url: 'http://localhost:6006/iframe.html?id=example-button--primary',
    theme: 'light',
    viewport: { width: 1280, height: 720, deviceScaleFactor: 2 },
    root: { width: 1180, height: 60 },
    nodes: [
      {
        selector: 'button.btn-primary',
        tag: 'button',
        classes: 'btn-primary inline-flex items-center justify-center px-5 py-3',
        text: 'Click me',
        box: { x: 50, y: 20, width: 120, height: 44 },
        styles: {
          color: 'rgb(255, 255, 255)',
          backgroundColor: 'rgb(180, 83, 42)',
          backgroundImage: 'none',
          fontSize: '16px',
          fontFamily: 'Inter, sans-serif',
          fontWeight: '500',
          lineHeight: '1.5',
          marginTop: '0px',
          marginRight: '0px',
          marginBottom: '0px',
          marginLeft: '0px',
          paddingTop: '12px',
          paddingRight: '20px',
          paddingBottom: '12px',
          paddingLeft: '20px',
          gap: '8px',
          display: 'inline-flex',
          position: 'static',
          zIndex: 'auto',
          overflow: 'visible',
        },
        parentSelector: undefined,
      },
      {
        selector: 'span.btn-label',
        tag: 'span',
        classes: 'btn-label',
        text: 'Click me',
        box: { x: 70, y: 32, width: 80, height: 20 },
        styles: {
          color: 'rgb(255, 255, 255)',
          backgroundColor: 'transparent',
          backgroundImage: 'none',
          fontSize: '16px',
          fontFamily: 'Inter, sans-serif',
          fontWeight: '500',
          lineHeight: '1.5',
          marginTop: '0px',
          marginRight: '0px',
          marginBottom: '0px',
          marginLeft: '0px',
          paddingTop: '0px',
          paddingRight: '0px',
          paddingBottom: '0px',
          paddingLeft: '0px',
          gap: 'normal',
          display: 'inline',
          position: 'static',
          zIndex: 'auto',
          overflow: 'visible',
        },
        parentSelector: 'button.btn-primary',
      },
    ],
  };

  // Build DOM tree from snapshot
  const roots = buildDomTree(mockSnapshot);
  check(
    'DOM tree built from snapshot',
    roots.length === 1 && roots[0].children.length === 1,
    `roots: ${roots.length}, children of root: ${roots[0]?.children.length}`,
  );

  // Query by tag selector
  const buttons = querySelectorAll('button', roots);
  check(
    'querySelectorAll matches button tag',
    buttons.length === 1,
    `matched ${buttons.length} button`,
  );

  // Query by class selector
  const btnPrimary = querySelectorAll('.btn-primary', roots);
  check(
    'querySelectorAll matches .btn-primary class',
    btnPrimary.length === 1,
    `matched ${btnPrimary.length} .btn-primary`,
  );

  // Query by contains pseudo-class
  const clickMe = querySelectorAll(':contains("Click me")', roots);
  check(
    'querySelectorAll matches :contains()',
    clickMe.length >= 1,
    `matched ${clickMe.length} elements containing "Click me"`,
  );

  // Query by relation: children of button
  const spanChildren = queryByRelation('button', 'children', roots);
  check(
    'queryByRelation finds children of button',
    spanChildren.length === 1 && spanChildren[0].node.tag === 'span',
    `found ${spanChildren.length} children of button`,
  );

  // Query by relation: parent of span
  const parentButton = queryByRelation('span', 'parent', roots);
  check(
    'queryByRelation finds parent of span',
    parentButton.length === 1 && parentButton[0].node.tag === 'button',
    `found parent: ${parentButton[0]?.node.tag}`,
  );

  // ── 4. RuleEngine: evaluate DOM-layer charters (with proper registration) ──
  console.log('\n4. RuleEngine: evaluate DOM-layer charters');

  // Create a fresh RuleEngine with all charters
  const engine2 = new RuleEngine();

  const graphCharter2: ElementCharter = {
    name: 'test-prime-check',
    description: 'Graph-layer charter for testing.',
    severity: 'P1',
    matcher: { type: 'node', label: 'primitive' },
    run(ctx: EcGraphContext) {
      return ctx.matchedNodes.map((n) => ({
        id: `found/${n.id}`,
        severity: 'P1' as const,
        message: `Matched primitive: ${String(n.props.name)}`,
        target: n.id,
      }));
    },
  };

  const passingDomCharter: ElementCharter = {
    name: 'button-computed-padding-pass',
    description: 'Check button padding >= 12px/20px.',
    severity: 'P1',
    matcher: { type: 'dom-selector', selector: 'button' },
    run(ctx: EcDomContext) {
      const findings: EcFinding[] = [];
      for (const el of ctx.matchedElements) {
        const padTop = parseFloat(el.node.styles.paddingTop);
        const padBottom = parseFloat(el.node.styles.paddingBottom);
        if (padTop < 12 || padBottom < 12) {
          findings.push({
            id: `padding-y/${el.node.selector}`,
            severity: 'P1',
            message: `Button has ${padTop}px/${padBottom}px vertical padding`,
            target: el.node.selector,
            remediation: 'Set padding-top/bottom to at least 12px.',
          });
        }
      }
      return findings;
    },
  };

  const failingDomCharter: ElementCharter = {
    name: 'button-computed-padding-fail',
    description: 'Check button padding >= 20px/20px (will fail mock).',
    severity: 'P1',
    matcher: { type: 'dom-selector', selector: 'button' },
    run(ctx: EcDomContext) {
      const findings: EcFinding[] = [];
      for (const el of ctx.matchedElements) {
        const padTop = parseFloat(el.node.styles.paddingTop);
        const padBottom = parseFloat(el.node.styles.paddingBottom);
        if (padTop < 20 || padBottom < 20) {
          findings.push({
            id: `padding-y/${el.node.selector}`,
            severity: 'P1',
            message: `Button has only ${padTop}px/${padBottom}px vertical padding; need ≥20px.`,
            target: el.node.selector,
          });
        }
      }
      return findings;
    },
  };

  engine2.registerCharters([graphCharter2, passingDomCharter, failingDomCharter]);
  const mixedDiags = engine2.evaluateCharters(g, [mockSnapshot]);
  check(
    'mixed graph+DOM charters run together',
    mixedDiags.length > 0,
    `produced ${mixedDiags.length} findings total`,
  );

  const graphFindings = mixedDiags.filter((d) => d.ruleId.startsWith('ec/test-prime-check/'));
  const failingFindings = mixedDiags.filter((d) => d.ruleId.includes('padding-fail'));
  const passingFindings = mixedDiags.filter((d) => d.ruleId.includes('padding-pass'));

  check(
    'graph-layer findings present alongside DOM findings',
    graphFindings.length > 0,
    `found ${graphFindings.length} graph findings`,
  );
  check(
    'DOM charter with ≥12px threshold passes (mock has 12px)',
    passingFindings.length === 0,
    `found ${passingFindings.length} violations (expected 0)`,
  );
  check(
    'DOM charter with ≥20px threshold fails (mock has 12px)',
    failingFindings.length > 0,
    `found ${failingFindings.length} violations (expected >0)`,
  );
  console.log(`    Graph findings: ${graphFindings.length}`);
  console.log(`    Passing DOM (≥12px): ${passingFindings.length} violations`);
  console.log(`    Failing DOM (≥20px): ${failingFindings.length} violations`);

  // ── 5. RuleEngine: listCharters ──
  console.log('\n5. RuleEngine: list charters');
  const listed = engine2.listCharters();
  check(
    'listCharters returns all registered charters',
    listed.length === 3,
    `listed ${listed.length} charters (expected 3)`,
  );
  if (listed.length > 0) {
    console.log(
      `    ${listed.map((c) => `${c.name} (${c.layer})`).join(', ')}`,
    );
  }

  // ── Summary ──
  console.log('\n══════════════════════════════════════');
  console.log(`  PASS: ${pass.length}  FAIL: ${fail.length}`);
  console.log('══════════════════════════════════════\n');
  for (const p of pass) console.log(p);
  for (const f of fail) console.log(f);
  console.log('');
  process.exit(fail.length > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('FATAL:', err);
  process.exit(1);
});
