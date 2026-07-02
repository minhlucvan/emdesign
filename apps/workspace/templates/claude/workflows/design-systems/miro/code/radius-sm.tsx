import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RadiusSmProps {
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
  borderRadius: 'var(--radius-sm)',
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
// RadiusSm component
// ---------------------------------------------------------------------------

/**
 * `RadiusSm` — a 6px (sm) border radius demo square for the Miro radius scale.
 *
 * Renders an aspect-ratio square with the Miro 6px rounded corner token applied,
 * displaying the radius value and its scale label. Intended for use in the
 * radius-scale grid shown in design-system documentation pages.
 *
 * Every visual property binds to a Miro design-system CSS custom property —
 * no raw hex values, no hardcoded spacing.
 *
 * ```tsx
 * <RadiusSm />
 * ```
 */
export const RadiusSm = ({
  className,
  style,
  ...rest
}: RadiusSmProps & React.HTMLAttributes<HTMLDivElement>) => {
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
        6px
        <br />
        <span style={sublabelStyle}>sm</span>
      </span>
    </div>
  );
};

RadiusSm.displayName = 'RadiusSm';

export default RadiusSm;
