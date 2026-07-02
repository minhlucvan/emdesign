import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ColorSwatchProps {
  /**
   * CSS variable reference for the swatch preview color.
   * Use a `--miro-*` or `--color-*` token, e.g. `"var(--miro-brand-yellow)"`.
   */
  color: string;
  /** Display name of the color (e.g. "Miro Yellow"). */
  name: string;
  /** Hex value rendered below the preview (e.g. "#ffd02f"). */
  hex: string;
  /** Short description of the color's role or usage. */
  role: string;
  /** Additional class names. */
  className?: string;
  /** Additional inline styles. */
  style?: React.CSSProperties;
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const baseStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-xs)',
  minWidth: 0,
  fontFamily: 'var(--font-sans)',
  boxSizing: 'border-box',
};

const previewStyle: React.CSSProperties = {
  width: '100%',
  height: 'var(--space-section-lg)',
  borderRadius: 'var(--radius-lg)',
  border: '1px solid var(--color-border-soft)',
};

const nameStyle: React.CSSProperties = {
  fontWeight: 'var(--font-weight-medium)',
  fontSize: 'var(--font-size-body-sm)',
  color: 'var(--color-text)',
  lineHeight: 1.4,
};

const metaStyle: React.CSSProperties = {
  fontFamily: 'var(--font-family-primary)',
  fontSize: 'var(--font-size-micro)',
  color: 'var(--color-text-tertiary)',
  lineHeight: 1.4,
};

const hexStyle: React.CSSProperties = {
  ...metaStyle,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
};

// ---------------------------------------------------------------------------
// ColorSwatch component
// ---------------------------------------------------------------------------

/**
 * Color swatch card for use in palette grids and documentation pages.
 *
 * Renders a vertical stack containing a color preview rectangle, the color
 * name, its hex value, and a role description — all styled via design-system
 * tokens. No raw color values or hardcoded spacing are used.
 *
 * ```tsx
 * <ColorSwatch
 *   color="var(--miro-brand-yellow)"
 *   name="Miro Yellow"
 *   hex="#ffd02f"
 *   role="Wordmark, promo banner"
 * />
 * ```
 */
export const ColorSwatch = ({
  color,
  name,
  hex,
  role,
  className,
  style,
  ...rest
}: ColorSwatchProps & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={className}
      style={{
        ...baseStyle,
        ...style,
      }}
      {...rest}
    >
      <div
        style={{
          ...previewStyle,
          background: color,
        }}
      />
      <span style={nameStyle}>{name}</span>
      <span style={hexStyle}>{hex}</span>
      <span style={metaStyle}>{role}</span>
    </div>
  );
};

ColorSwatch.displayName = 'ColorSwatch';

export default ColorSwatch;
