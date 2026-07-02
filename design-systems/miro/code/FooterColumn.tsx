import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FooterColumnProps {
  /** Column heading text. */
  heading: string;
  /** Content rendered below the heading (typically FooterLink elements). */
  children?: React.ReactNode;
  /** Additional class names for custom styling. */
  className?: string;
  /** Additional inline styles. */
  style?: React.CSSProperties;
}

// ---------------------------------------------------------------------------
// Base style — every visual property binds to a Miro CSS custom property
// ---------------------------------------------------------------------------

const baseStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-sm)',
  boxSizing: 'border-box',
};

const headingStyle: React.CSSProperties = {
  color: 'var(--color-text-on-dark)',
  fontFamily: 'var(--font-family-primary)',
  fontSize: 'var(--font-size-heading-5)',
  fontWeight: 'var(--font-weight-medium)',
  lineHeight: 'var(--line-height-heading-5)',
  margin: 0,
  marginBottom: 'var(--space-md)',
};

// ---------------------------------------------------------------------------
// FooterColumn component
// ---------------------------------------------------------------------------

/**
 * `FooterColumn` — single stacked column primitive for the Miro footer.
 *
 * Renders a column heading followed by stacked children (typically
 * `FooterLink` elements) inside the dark-on-dark footer region. Designed
 * for composition inside `Footer` or a custom grid layout.
 *
 * Every visual property binds to a Miro design system CSS custom property —
 * no raw hex values, no hardcoded spacing.
 *
 * ```tsx
 * <FooterColumn heading="Product">
 *   <FooterLink href="/overview">Overview</FooterLink>
 *   <FooterLink href="/pricing">Pricing</FooterLink>
 * </FooterColumn>
 * ```
 */
export function FooterColumn({
  heading,
  children,
  className,
  style,
  ...rest
}: FooterColumnProps) {
  return (
    <div
      className={className}
      style={{
        ...baseStyle,
        ...style,
      }}
      {...rest}
    >
      <h6 style={headingStyle}>{heading}</h6>
      {children}
    </div>
  );
}

FooterColumn.displayName = 'FooterColumn';

export default FooterColumn;
