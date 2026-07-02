import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SpacingScaleProps {
  /** Additional class names. */
  className?: string;
  /** Additional inline styles. */
  style?: React.CSSProperties;
}

// ---------------------------------------------------------------------------
// Spacing data — matches the Miro 4px-base scale
// ---------------------------------------------------------------------------

interface SpacingStep {
  /** CSS custom property token (e.g. --space-md) */
  token: string;
  /** Pixel value for display */
  px: number;
  /** Semantic label */
  label: string;
}

const SPACING_STEPS: SpacingStep[] = [
  { token: 'var(--space-xxs)', px: 4, label: 'xxs' },
  { token: 'var(--space-xs)', px: 8, label: 'xs' },
  { token: 'var(--space-sm)', px: 12, label: 'sm' },
  { token: 'var(--space-md)', px: 16, label: 'md' },
  { token: 'var(--space-lg)', px: 20, label: 'lg' },
  { token: 'var(--space-xl)', px: 24, label: 'xl' },
  { token: 'var(--space-xxl)', px: 32, label: 'xxl' },
  { token: 'var(--space-xxxl)', px: 40, label: 'xxxl' },
  { token: 'var(--space-section-sm)', px: 48, label: 'section-sm' },
  { token: 'var(--space-section)', px: 64, label: 'section' },
  { token: 'var(--space-section-lg)', px: 96, label: 'section-lg' },
  { token: 'var(--space-hero)', px: 120, label: 'hero' },
];

// ---------------------------------------------------------------------------
// Styles — every value binds to a Miro semantic CSS custom property
// ---------------------------------------------------------------------------

const gridStyle: React.CSSProperties = {
  display: 'flex',
  gap: 'var(--space-xl)',
  alignItems: 'flex-end',
  flexWrap: 'wrap',
};

const boxStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 'var(--space-xs)',
};

const visualStyle: React.CSSProperties = {
  height: 'var(--space-md)',
  background: 'var(--color-text)',
  borderRadius: 'var(--radius-xs)',
  flexShrink: 0,
};

const labelStyle: React.CSSProperties = {
  fontSize: 'var(--font-size-micro)',
  fontWeight: 'var(--font-weight-medium)',
  color: 'var(--color-text)',
  textAlign: 'center',
  lineHeight: 1.4,
};

const subStyle: React.CSSProperties = {
  display: 'block',
  fontWeight: 400,
  color: 'var(--color-text-muted)',
  fontSize: 'var(--font-size-caption)',
  lineHeight: 1.4,
};

// ---------------------------------------------------------------------------
// SpacingScale component
// ---------------------------------------------------------------------------

/**
 * Spacing scale visualiser for the Miro design system.
 *
 * Renders the full 4px-base spacing ladder from 4 px (xxs) through
 * 120 px (hero) as visual bars with semantic labels. Every dimension
 * and color binds to design-system CSS custom properties — no raw values
 * or hardcoded pixels.
 *
 * ```tsx
 * <SpacingScale />
 * ```
 */
export const SpacingScale = ({
  className,
  style,
}: SpacingScaleProps) => {
  return (
    <div
      className={className}
      style={{
        ...gridStyle,
        ...style,
      }}
    >
      {SPACING_STEPS.map((step) => (
        <div key={step.label} style={boxStyle}>
          <div
            style={{
              ...visualStyle,
              width: step.token,
            }}
          />
          <div style={labelStyle}>
            {step.px}
            <small style={subStyle}>{step.label}</small>
          </div>
        </div>
      ))}
    </div>
  );
};

SpacingScale.displayName = 'SpacingScale';

export default SpacingScale;
