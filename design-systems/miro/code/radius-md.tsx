import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RadiusMdProps {
  /** Additional class names for custom styling. */
  className?: string;
  /** Additional inline styles. */
  style?: React.CSSProperties;
  /** Card content. */
  children?: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Base style — every visual property binds to a Miro CSS custom property
// ---------------------------------------------------------------------------

const baseStyle: React.CSSProperties = {
  backgroundColor: 'var(--color-surface)',
  color: 'var(--color-text)',
  fontFamily: 'var(--font-sans)',
  borderRadius: 'var(--radius-md)',
  padding: 'var(--space-card)',
  boxSizing: 'border-box',
  width: '100%',
};

// ---------------------------------------------------------------------------
// RadiusMd component
// ---------------------------------------------------------------------------

/**
 * `RadiusMd` — card container with the Miro medium border radius (`--radius-md`).
 *
 * A medium-radius container for individual cards, content blocks, and UI panels.
 * The `--radius-md` token is the standard card-level corner radius in the Miro
 * system, used for single-column content cards, stat tiles, and nested UI panels
 * that need visual separation without the prominence of a full-section container.
 *
 * Every visual property binds to a Miro design system CSS custom property —
 * no raw hex values, no hardcoded spacing.
 *
 * ```tsx
 * <RadiusMd>
 *   <Text variant="body">Card content goes here.</Text>
 * </RadiusMd>
 *
 * <RadiusMd style={{ padding: 'var(--space-lg)' }}>
 *   <Heading level={3}>Custom padded card</Heading>
 * </RadiusMd>
 * ```
 */
export const RadiusMd: React.FC<RadiusMdProps> = ({
  className,
  style,
  children,
  ...rest
}) => {
  return (
    <div
      className={className}
      style={{
        ...baseStyle,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
};

RadiusMd.displayName = 'RadiusMd';

export default RadiusMd;
