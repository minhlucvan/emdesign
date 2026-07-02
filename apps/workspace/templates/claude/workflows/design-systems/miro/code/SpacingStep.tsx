import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SpacingStepProps {
  /** The spacing value in pixels (e.g., 4, 8, 16, 24, 48, 64, 96, 120). */
  value: number;
  /** The semantic name of the spacing token (e.g., "xxs", "xs", "sm", "md"). */
  name: string;
  /** Additional CSS class names. */
  className?: string;
  /** Additional inline styles. */
  style?: React.CSSProperties;
}

// ---------------------------------------------------------------------------
// Styles — every value binds to a Miro semantic CSS custom property
// ---------------------------------------------------------------------------

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 'var(--space-xs)',
  fontFamily: 'var(--font-sans)',
  boxSizing: 'border-box',
  minWidth: 0,
};

const barBaseStyle: React.CSSProperties = {
  height: 16,
  background: 'var(--color-text)',
  borderRadius: 'var(--radius-xs)',
  flexShrink: 0,
};

const valueStyle: React.CSSProperties = {
  fontSize: 'var(--font-size-micro)',
  fontWeight: 'var(--font-weight-medium)',
  color: 'var(--color-text)',
  textAlign: 'center',
  lineHeight: 1.4,
};

const nameStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 10,
  fontWeight: 400,
  color: 'var(--color-text-muted)',
  textAlign: 'center',
  lineHeight: 1.4,
  marginTop: 2,
};

// ---------------------------------------------------------------------------
// SpacingStep component
// ---------------------------------------------------------------------------

/**
 * Individual spacing step item for the Miro spacing scale.
 *
 * Renders a vertical stack containing a dark visual bar whose width matches
 * the spacing value, plus a label showing the pixel value and its semantic
 * name. Intended for use within a spacing-scale grid in design-system
 * documentation pages.
 *
 * Colors, typography, and layout bind to design-system CSS custom properties.
 * The bar width uses the numeric pixel value to faithfully represent the
 * spacing token — all other values use `--space-*` / `--color-*` tokens.
 *
 * ```tsx
 * <SpacingStep value={16} name="md" />
 * ```
 */
export const SpacingStep = ({
  value,
  name,
  className,
  style,
}: SpacingStepProps) => {
  return (
    <div
      className={className}
      style={{
        ...containerStyle,
        ...style,
      }}
    >
      <div
        style={{
          ...barBaseStyle,
          width: value,
        }}
      />
      <div style={valueStyle}>
        {value}
        <span style={nameStyle}>{name}</span>
      </div>
    </div>
  );
};

SpacingStep.displayName = 'SpacingStep';

export default SpacingStep;
