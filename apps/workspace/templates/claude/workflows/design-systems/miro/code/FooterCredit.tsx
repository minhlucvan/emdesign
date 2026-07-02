import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FooterCreditProps {
  /** Additional CSS class names */
  className?: string;
  /** Credit bar content */
  children?: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Styles — every value binds to a Miro semantic CSS custom property
// ---------------------------------------------------------------------------

const baseStyle: React.CSSProperties = {
  paddingTop: 'var(--space-xxl)',
  borderTop: '1px solid var(--color-border)',
  textAlign: 'center',
  color: 'var(--color-text-muted)',
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--font-size-caption)',
  lineHeight: 1.4,
};

// ---------------------------------------------------------------------------
// FooterCredit component
// ---------------------------------------------------------------------------

/**
 * `FooterCredit` — centered credit bar with top separator for page footers.
 *
 * Renders a full-width credit/copyright bar with a transparent top border and
 * muted caption text. Commonly placed at the bottom of a `Footer` containing
 * text such as "Maintained by Team" or copyright notices. All colors, spacing,
 * and typography reference Miro design-system CSS custom properties — no raw
 * values or hardcoded pixels.
 *
 * ```tsx
 * <footer>
 *   <FooterCredit>
 *     &copy; {new Date().getFullYear()} Miro. All rights reserved.
 *   </FooterCredit>
 * </footer>
 * ```
 */
export function FooterCredit({
  className = '',
  children,
  ...rest
}: FooterCreditProps & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={className}
      style={baseStyle}
      {...rest}
    >
      {children}
    </div>
  );
}

FooterCredit.displayName = 'FooterCredit';

export default FooterCredit;
