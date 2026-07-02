import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WhiteboardMockupProps {
  /** StickyNote children rendered inside the whiteboard grid. */
  children?: React.ReactNode;
  /** Additional class names. */
  className?: string;
  /** Additional inline styles. */
  style?: React.CSSProperties;
}

// ---------------------------------------------------------------------------
// Styles — every value binds to a Miro semantic CSS custom property
// ---------------------------------------------------------------------------

const containerStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: 'var(--space-sm)',
  padding: 'var(--space-xl)',
  background: 'var(--color-surface)',
  borderRadius: 'var(--radius-xl)',
  border: '1px solid var(--color-border-soft)',
  // Elevation-3 shadow: rgba(5,0,56,0.08) 0px 12px 32px -4px
  boxShadow: 'rgba(5,0,56,0.08) 0px 12px 32px -4px',
  minHeight: 320,
  fontFamily: 'var(--font-sans)',
  boxSizing: 'border-box',
  minWidth: 0,
};

// ---------------------------------------------------------------------------
// WhiteboardMockup component
// ---------------------------------------------------------------------------

/**
 * `WhiteboardMockup` — a whiteboard grid container for the Miro design system.
 *
 * Renders a 4-column CSS grid with 12px gap, 24px padding, 16px corner radius,
 * a soft hairline border, and an elevation-3 box shadow. Designed to hold
 * `StickyNote` children in a visual collaboration surface reminiscent of a
 * real Miro board.
 *
 * All visual properties bind to design-system CSS custom properties — no raw
 * hex values or hardcoded spacing.
 *
 * ```tsx
 * <WhiteboardMockup>
 *   <StickyNote color="yellow">Brainstorm ideas for Q4 launch</StickyNote>
 *   <StickyNote color="coral">User research insights</StickyNote>
 *   <StickyNote color="teal">Sprint planning · 2 weeks</StickyNote>
 *   <StickyNote color="rose">Design review · Friday 3pm</StickyNote>
 *   <StickyNote color="orange">Action items: prioritize</StickyNote>
 *   <StickyNote color="yellow">Risk: timeline overlap</StickyNote>
 *   <StickyNote color="teal">Stakeholder alignment</StickyNote>
 *   <StickyNote color="coral">Customer feedback theme</StickyNote>
 * </WhiteboardMockup>
 * ```
 */
export function WhiteboardMockup({
  children,
  className,
  style,
  ...rest
}: WhiteboardMockupProps & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={className}
      style={{
        ...containerStyle,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

WhiteboardMockup.displayName = 'WhiteboardMockup';

export default WhiteboardMockup;
