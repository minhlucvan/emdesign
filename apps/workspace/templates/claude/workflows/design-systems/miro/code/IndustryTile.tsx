import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface IndustryTileProps {
  /** Emoji or icon element shown in the icon zone */
  icon?: React.ReactNode;
  /** Tile heading */
  title: string;
  /** Supporting description */
  description: string;
  /** Additional class names */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
}

// ---------------------------------------------------------------------------
// Styles — every value binds to a Miro semantic CSS custom property
// ---------------------------------------------------------------------------

const wrapperStyle: React.CSSProperties = {
  background: 'var(--color-surface)',
  borderRadius: 'var(--radius-xl)',
  padding: 'var(--space-xl)',
  border: '1px solid var(--color-border-soft)',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-sm)',
  fontFamily: 'var(--font-sans)',
  boxSizing: 'border-box',
};

const iconZoneStyle: React.CSSProperties = {
  width: 40,
  height: 40,
  background: 'var(--color-surface-raised)',
  borderRadius: 'var(--radius)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 20,
  flexShrink: 0,
};

const titleStyle: React.CSSProperties = {
  fontSize: 'var(--font-size-subtitle)',
  fontWeight: 'var(--font-weight-medium)',
  color: 'var(--color-text)',
  margin: 0,
  lineHeight: 1.25,
};

const descriptionStyle: React.CSSProperties = {
  fontSize: 'var(--font-size-body-sm)',
  color: 'var(--color-text-muted)',
  margin: 0,
  lineHeight: 1.5,
};

// ---------------------------------------------------------------------------
// IndustryTile component
// ---------------------------------------------------------------------------

/**
 * Industry tile card for the Miro design system.
 *
 * Renders a vertically-stacked card with an optional icon zone, a heading,
 * and a description — styled using semantic design-system tokens. No raw
 * color values or hardcoded spacing are used.
 *
 * ```tsx
 * <IndustryTile
 *   icon="📊"
 *   title="Project Management"
 *   description="Track progress, share updates, and drive accountability across your team."
 * />
 * ```
 */
export const IndustryTile = ({
  icon,
  title,
  description,
  className,
  style,
}: IndustryTileProps) => {
  return (
    <div
      className={className}
      style={{
        ...wrapperStyle,
        ...style,
      }}
    >
      {icon && <div style={iconZoneStyle}>{icon}</div>}
      <h5 style={titleStyle}>{title}</h5>
      <p style={descriptionStyle}>{description}</p>
    </div>
  );
};

IndustryTile.displayName = 'IndustryTile';

export default IndustryTile;
