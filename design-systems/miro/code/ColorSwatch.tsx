import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ColorSwatchProps {
  /** The CSS color value or variable to display in the swatch block. */
  color: string;
  /** The color's display name (e.g. "Brand Yellow"). */
  name: string;
  /** The hex value label (e.g. "#FFD02F"). */
  hex: string;
  /** The semantic role description (e.g. "Primary brand accent"). */
  role: string;
  /** Additional class names for custom styling. */
  className?: string;
  /** Additional inline styles. */
  style?: React.CSSProperties;
}

// ---------------------------------------------------------------------------
// Style constants — every visual property binds to a Miro CSS custom property
// ---------------------------------------------------------------------------

const swatchStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  borderRadius: 'var(--radius)',
  overflow: 'hidden',
  fontFamily: 'var(--font-sans)',
  backgroundColor: 'var(--color-surface)',
  boxSizing: 'border-box',
  width: '100%',
};

const swatchColorBlockStyle: React.CSSProperties = {
  width: '100%',
  height: 80,
  flexShrink: 0,
  boxSizing: 'border-box',
};

const swatchInfoStyle: React.CSSProperties = {
  padding: 'var(--space-xs) var(--space-sm)',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-xxs)',
  boxSizing: 'border-box',
};

const swatchNameStyle: React.CSSProperties = {
  fontSize: 'var(--font-size-body-sm)',
  fontWeight: 'var(--font-weight-medium)',
  color: 'var(--color-text)',
  lineHeight: 1.3,
  margin: 0,
};

const swatchHexStyle: React.CSSProperties = {
  fontSize: 'var(--font-size-micro)',
  fontWeight: 'var(--font-weight-regular)',
  color: 'var(--color-text-muted)',
  fontFamily: 'monospace',
  lineHeight: 1.3,
  margin: 0,
};

const swatchRoleStyle: React.CSSProperties = {
  fontSize: 'var(--font-size-micro)',
  fontWeight: 'var(--font-weight-regular)',
  color: 'var(--color-text-muted)',
  lineHeight: 1.3,
  margin: 0,
};

// ---------------------------------------------------------------------------
// ColorSwatch component
// ---------------------------------------------------------------------------

/**
 * `ColorSwatch` — individual color swatch card for the Miro design system.
 *
 * Renders a compact card showing a color block, its display name, hex value,
 * and semantic role description. Intended for use inside a palette grid to
 * document and showcase a design system's color tokens.
 *
 * Every visual property binds to a Miro design system CSS custom property —
 * no raw hex values, no hardcoded spacing.
 *
 * ```tsx
 * <ColorSwatch
 *   color="var(--miro-brand-yellow)"
 *   name="Brand Yellow"
 *   hex="#FFD02F"
 *   role="Primary brand accent"
 * />
 * ```
 */
export function ColorSwatch({
  color,
  name,
  hex,
  role,
  className,
  style,
  ...rest
}: ColorSwatchProps & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={className}
      style={{
        ...swatchStyle,
        ...style,
      }}
      {...rest}
    >
      <div
        style={{
          ...swatchColorBlockStyle,
          backgroundColor: color,
        }}
      />
      <div style={swatchInfoStyle}>
        <span style={swatchNameStyle}>{name}</span>
        <span style={swatchHexStyle}>{hex}</span>
        <span style={swatchRoleStyle}>{role}</span>
      </div>
    </div>
  );
}

ColorSwatch.displayName = 'ColorSwatch';

export default ColorSwatch;
