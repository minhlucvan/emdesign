import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type WhiteboardNoteVariant = 'yellow' | 'coral' | 'teal' | 'rose';

export interface WhiteboardNote {
  /** Color variant for the sticky note. Defaults to 'yellow'. */
  variant?: WhiteboardNoteVariant;
  /** Text content displayed on the sticky note. */
  text: string;
}

export interface WhiteboardMockupProps {
  /** Additional class names for custom styling. */
  className?: string;
  /** Sticky notes to render on the whiteboard canvas. */
  notes: WhiteboardNote[];
}

// ---------------------------------------------------------------------------
// Note variant style map — every value binds to a Miro CSS custom property
// ---------------------------------------------------------------------------

const noteVariantStyles: Record<WhiteboardNoteVariant, React.CSSProperties> = {
  yellow: {
    backgroundColor: 'var(--miro-brand-yellow)',
    color: 'var(--miro-primary)',
  },
  coral: {
    backgroundColor: 'var(--miro-coral-light)',
    color: 'var(--miro-primary)',
  },
  teal: {
    backgroundColor: 'var(--miro-teal-light)',
    color: 'var(--miro-primary)',
  },
  rose: {
    backgroundColor: 'var(--miro-rose-light)',
    color: 'var(--miro-primary)',
  },
};

// ---------------------------------------------------------------------------
// Style constants — every visual property binds to a Miro CSS custom property
// ---------------------------------------------------------------------------

const canvasStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: 'var(--space-md)',
  backgroundColor: 'var(--miro-canvas)',
  borderRadius: 'var(--radius-xl)',
  padding: 'var(--space-section)',
  boxSizing: 'border-box',
  width: '100%',
  minHeight: 300,
  fontFamily: 'var(--font-sans)',
  // Dot-grid background echoing the Miro canvas dot pattern
  backgroundImage:
    'radial-gradient(circle, var(--miro-hairline-soft) 1px, transparent 1px)',
  backgroundSize: '24px 24px',
};

const noteStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  borderRadius: 'var(--radius-xl)',
  padding: 'var(--space-md)',
  minHeight: 120,
  boxSizing: 'border-box',
  fontSize: 'var(--font-size-body-sm)',
  fontWeight: 'var(--font-weight-regular)',
  lineHeight: 1.5,
  fontFamily: 'var(--font-sans)',
  // Slight rotation offset per note to mimic organic whiteboard stickies
  transition: 'transform var(--motion-fast) ease, box-shadow var(--motion-fast) ease',
};

// Small rotation offsets so stickies don't look perfectly aligned
const rotationOffsets = [-1, 1.5, -0.5, 2, -2, 0.5, -1.5, 1];

// ---------------------------------------------------------------------------
// WhiteboardMockup component
// ---------------------------------------------------------------------------

/**
 * `WhiteboardMockup` — responsive grid mockup of a Miro whiteboard canvas.
 *
 * Renders a whiteboard canvas area with the signature Miro dot-grid background
 * (`--miro-canvas` surface with `--miro-hairline-soft` dot pattern) and sticky
 * notes in the four brand palette colors (yellow, coral, teal, rose). Each
 * note has a slight random rotation to mimic the organic feel of real
 * whiteboard stickies, with a hover lift effect.
 *
 * Every visual property binds to a Miro design system CSS custom property —
 * no raw hex values, no hardcoded spacing.
 *
 * ```tsx
 * <WhiteboardMockup
 *   notes={[
 *     { variant: 'yellow', text: 'User story mapping for Q3' },
 *     { variant: 'coral',  text: 'Design system audit items' },
 *     { variant: 'teal',   text: 'Retrospective action points' },
 *     { variant: 'rose',   text: 'Sprint planning — draft' },
 *     { variant: 'yellow', text: 'OKR draft: reduce cycle time by 20%' },
 *   ]}
 * />
 * ```
 */
export function WhiteboardMockup({
  className,
  notes = [],
  ...rest
}: WhiteboardMockupProps & React.HTMLAttributes<HTMLDivElement>) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  return (
    <div
      className={className}
      style={canvasStyle}
      {...rest}
    >
      {notes.map((note, index) => {
        const variant = note.variant ?? 'yellow';
        const rotation = rotationOffsets[index % rotationOffsets.length];
        const isHovered = hoveredIndex === index;

        return (
          <div
            key={index}
            style={{
              ...noteStyle,
              ...noteVariantStyles[variant],
              transform: isHovered
                ? 'rotate(0deg) scale(1.04)'
                : `rotate(${rotation}deg)`,
              boxShadow: isHovered
                ? '0 4px 16px rgba(0,0,0,0.12)'
                : '0 1px 3px rgba(0,0,0,0.06)',
            }}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {note.text}
          </div>
        );
      })}
    </div>
  );
}

WhiteboardMockup.displayName = 'WhiteboardMockup';

export default WhiteboardMockup;
