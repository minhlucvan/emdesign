import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SectionHeadingProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Heading text displayed as the section title. */
  heading: React.ReactNode;
  /** Supporting sub-text displayed below the heading. */
  sub: React.ReactNode;
  /** Additional class names for custom styling. */
  className?: string;
}

// ---------------------------------------------------------------------------
// Style constants — every visual property binds to a Miro CSS custom property
// ---------------------------------------------------------------------------

const wrapperStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-xxs)',
  boxSizing: 'border-box',
};

const headingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-family-primary)',
  fontSize: 'var(--font-size-heading-2)',
  fontWeight: 'var(--font-weight-medium)',
  lineHeight: 'var(--line-height-heading-2)',
  letterSpacing: 'var(--letter-spacing-heading-2)',
  color: 'var(--color-text-heading)',
  margin: 0,
};

const subStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--font-size-body)',
  fontWeight: 'var(--font-weight-regular)',
  lineHeight: 1.6,
  color: 'var(--color-text)',
  margin: 0,
};

// ---------------------------------------------------------------------------
// SectionHeading component
// ---------------------------------------------------------------------------

/**
 * `SectionHeading` — section-level heading with a subtitle for the Miro design
 * system.
 *
 * Renders an `<h2>` heading paired with a supporting sub-text `<p>`, stacked
 * vertically with a small gap. Designed for page and section introductions
 * where a heading alone is insufficient context.
 *
 * Every visual property binds to a Miro CSS custom property — no raw hex
 * values, no hardcoded spacing.
 *
 * ```tsx
 * <SectionHeading
 *   heading="Customer Story Cards"
 *   sub="Brand-tinted photographic cards..."
 * />
 * ```
 */
export function SectionHeading({
  heading,
  sub,
  className,
  style,
  children,
  ...rest
}: SectionHeadingProps) {
  return (
    <div
      className={className}
      style={{
        ...wrapperStyle,
        ...style,
      }}
      {...rest}
    >
      <h2 style={headingStyle}>{heading}</h2>
      {sub && <p style={subStyle}>{sub}</p>}
      {children}
    </div>
  );
}

SectionHeading.displayName = 'SectionHeading';

export default SectionHeading;
