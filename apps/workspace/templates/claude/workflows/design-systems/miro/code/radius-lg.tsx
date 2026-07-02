import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RadiusLgProps {
  /** Additional CSS class names. */
  className?: string;
  /** Additional inline styles. */
  style?: React.CSSProperties;
}

// ---------------------------------------------------------------------------
// Styles — every value binds to a Miro semantic CSS custom property
// ---------------------------------------------------------------------------

const boxStyle: React.CSSProperties = {
  aspectRatio: '1',
  background: 'var(--color-surface)',
  border: '2px solid var(--color-text)',
  borderRadius: 'var(--radius-lg)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: 'var(--space-sm)',
  boxSizing: 'border-box',
  minWidth: 0,
};

const labelStyle: React.CSSProperties = {
  fontSize: 'var(--font-size-micro)',
  fontWeight: 'var(--font-weight-medium)',
  color: 'var(--color-text)',
  lineHeight: 1.4,
};

const sublabelStyle: React.CSSProperties = {
  fontSize: 'var(--font-size-micro)',
  fontWeight: 400,
  color: 'var(--color-text-tertiary)',
  lineHeight: 1.4,
};

// ---------------------------------------------------------------------------
// RadiusLg component
// ---------------------------------------------------------------------------

/**
 * `RadiusLg` — a 12px (lg) border radius demo square for the Miro radius scale.
 *
 * Renders an aspect-ratio square with the Miro 12px rounded corner token applied,
 * displaying the radius value and its scale label. Intended for use in the
 * radius-scale grid shown in design-system documentation pages.
 *
 * Every visual property binds to a Miro design-system CSS custom property —
 * no raw hex values, no hardcoded spacing.
 *
 * ```tsx
 * <RadiusLg />
 * ```
 */
export const RadiusLg = ({
  className,
  style,
  ...rest
}: RadiusLgProps & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={className}
      style={{
        ...boxStyle,
        ...style,
      }}
      {...rest}
    >
      <span style={labelStyle}>
        12px
        <br />
        <span style={sublabelStyle}>lg</span>
      </span>
    </div>
  );
};

RadiusLg.displayName = 'RadiusLg';

export default RadiusLg;
