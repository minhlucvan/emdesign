import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SectionHeadingProps {
  /** Primary heading text, rendered as an h2 element with the heading-1 type scale. */
  title: string;
  /** Optional supporting description rendered below the heading. */
  subtitle?: string;
  /** Additional class names. */
  className?: string;
  /** Additional inline styles. */
  style?: React.CSSProperties;
}

// ---------------------------------------------------------------------------
// Styles — every value binds to a Miro semantic CSS custom property
// ---------------------------------------------------------------------------

const wrapperStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-sm)',
  fontFamily: 'var(--font-sans)',
  boxSizing: 'border-box',
};

const headingStyle: React.CSSProperties = {
  fontSize: 'var(--font-size-heading-1)',
  fontWeight: 'var(--font-weight-medium)',
  lineHeight: 1.15,
  letterSpacing: '-0.0625em',
  color: 'var(--color-text)',
  margin: 0,
};

const subtitleStyle: React.CSSProperties = {
  fontSize: 'var(--font-size-body-md)',
  fontWeight: 400,
  lineHeight: 1.5,
  color: 'var(--color-text-muted)',
  margin: 0,
  maxWidth: 720,
};

// ---------------------------------------------------------------------------
// SectionHeading component
// ---------------------------------------------------------------------------

/**
 * Section heading primitive for the Miro design system.
 *
 * Renders a vertically-stacked heading-and-subtitle group using the heading-1
 * (`48px / 500 / 1.15 / -1px`) and body-md (`16px / 400 / 1.50`) type scales.
 * All colors and spacing reference design-system CSS custom properties — no raw
 * values or hardcoded pixels.
 *
 * ```tsx
 * <SectionHeading
 *   title="Color Palette"
 *   subtitle="Stark white canvas anchored by black-and-white CTA system…"
 * />
 * ```
 */
export const SectionHeading = ({
  title,
  subtitle,
  className,
  style,
}: SectionHeadingProps) => {
  return (
    <div
      className={className}
      style={{
        ...wrapperStyle,
        ...style,
      }}
    >
      <h2 style={headingStyle}>{title}</h2>
      {subtitle && <p style={subtitleStyle}>{subtitle}</p>}
    </div>
  );
};

SectionHeading.displayName = 'SectionHeading';

export default SectionHeading;
