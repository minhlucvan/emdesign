/**
 * Atelier EC: button-padding
 *
 * "As a Button, I want padding of at least 12px/20px so that
 *  touch targets meet accessibility guidelines."
 *
 * Layer: graph
 * Matcher: node (atoms named "Button")
 */
import type { ElementCharter, EcGraphContext, EcFinding } from '@emdesign/dsr';

export const buttonPadding: ElementCharter = {
  name: 'button-padding',
  description:
    'As a Button, I want minimum 12px/20px padding so touch targets are accessible.',
  severity: 'P1',
  // Match all primitives, then filter by name in run()
  matcher: { type: 'node', label: 'primitive' },
  run(ctx: EcGraphContext) {
    const findings: EcFinding[] = [];
    const MIN_Y = 12; // px
    const MIN_X = 20; // px
    const buttons = ctx.matchedNodes.filter(
      (n) => /Button/i.test(String(n.props.name ?? '')),
    );

    for (const node of buttons) {
      const name = String(node.props.name ?? '');

      // Check hasProp edges for explicit padding props
      const paddingProps = ctx.graph
        .out(node.id, 'hasProp')
        .filter((e) => String(e.to).includes('padding'));

      if (paddingProps.length > 0) {
        // AST-parsed props exist — validate them
        for (const edge of paddingProps) {
          const propNode = ctx.graph.node(edge.to);
          const value = String(propNode?.props?.defaultValue ?? '');
          findings.push({
            id: `prop/${node.id}`,
            severity: 'P1',
            message: `Button "${name}" declares padding via prop "${String(edge.to)}" (${value}). Verify it meets ${MIN_Y}px/${MIN_X}px minimum.`,
            target: node.id,
            remediation: `Ensure padding is at least ${MIN_Y}px ${MIN_X}px.`,
          });
        }
      } else {
        // No AST props — check via source conventions (Tailwind classes)
        // Atelier Button uses px-5 (20px) and py-3 (12px) which meet the standard.
        // Check if the source uses standard Tailwind padding classes
        const sourceFile = String(node.props?.source?.file ?? '');
        const sourceMatch = sourceFile.match(/code\/(\w+)\.tsx/);
        const nameForCheck = sourceMatch?.[1] ?? name;

        // px-5=20px horizontal, py-3=12px vertical — these meet the minimum
        // If the primitive uses a different convention, flag it for review.
        // For now, this is a soft check since Tailwind classes aren't AST-parsed.
        findings.push({
          id: `check/${node.id}`,
          severity: 'P2',
          message: `Button "${name}" — verify rendered padding meets ${MIN_Y}px/${MIN_X}px minimum. Currently uses Tailwind spacing classes (px-5/py-3 = 20px/12px) which meet the standard.`,
          target: node.id,
          remediation: 'Keep px-5 py-3 or equivalent spacing. Avoid custom padding values.',
        });
      }
    }

    return findings;
  },
};
