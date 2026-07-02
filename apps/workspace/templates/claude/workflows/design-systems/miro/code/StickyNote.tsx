import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type StickyNoteColor = 'yellow' | 'coral' | 'teal' | 'rose' | 'orange';

export interface StickyNoteProps {
  /** The text content displayed inside the sticky note. */
  children: React.ReactNode;
  /**
   * Background color variant matching Miro's pastel sticky-note palette.
   * @default 'yellow'
   */
  color?: StickyNoteColor;
  /** Additional class names. */
  className?: string;
  /** Additional inline styles. */
  style?: React.CSSProperties;
}

// ---------------------------------------------------------------------------
// Styles — every value binds to a Miro semantic CSS custom property
// ---------------------------------------------------------------------------

const baseStyle: React.CSSProperties = {
  padding: 'var(--space-md)',
  borderRadius: 'var(--radius-md)',
  fontSize: 'var(--font-size-micro)',
  lineHeight: 1.4,
  color: 'var(--color-text)',
  fontFamily: 'var(--font-sans)',
  minHeight: '80px',
  boxShadow: 'var(--shadow-raised)',
  boxSizing: 'border-box',
};

const colorMap: Record<StickyNoteColor, React.CSSProperties> = {
  yellow: { background: 'var(--miro-brand-yellow)' },
  coral: { background: 'var(--miro-coral-light)' },
  teal: { background: 'var(--miro-teal-light)' },
  rose: { background: 'var(--miro-rose-light)' },
  orange: { background: 'var(--miro-orange-light)' },
};

// ---------------------------------------------------------------------------
// StickyNote component
// ---------------------------------------------------------------------------

/**
 * `StickyNote` — a pastel sticky note primitive for the Miro design system.
 *
 * Renders a small card reminiscent of a physical sticky note, using Miro's
 * signature pastel palette (yellow, coral, teal, rose, orange). Designed for
 * whiteboard mockups, brainstorming sections, and visual collaboration surfaces.
 *
 * All colors, typography, spacing, and shadow bind to design-system CSS custom
 * properties — no raw hex values or hardcoded spacing.
 *
 * ```tsx
 * <StickyNote color="yellow">Brainstorm ideas for Q4 launch</StickyNote>
 * <StickyNote color="coral">User research insights from interviews</StickyNote>
 * <StickyNote color="teal">Sprint planning &middot; 2 weeks</StickyNote>
 * ```
 */
export function StickyNote({
  children,
  color = 'yellow',
  className,
  style,
  ...rest
}: StickyNoteProps & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={className}
      style={{
        ...baseStyle,
        ...colorMap[color],
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

StickyNote.displayName = 'StickyNote';

export default StickyNote;
