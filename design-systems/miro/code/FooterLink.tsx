import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FooterLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Link destination URL. */
  href: string;
  /** Link content (label, icon, etc.). */
  children?: React.ReactNode;
  /** Additional class names for custom styling. */
  className?: string;
}

// ---------------------------------------------------------------------------
// Base style — every visual property binds to a Miro CSS custom property
// ---------------------------------------------------------------------------

const baseStyle: React.CSSProperties = {
  color: 'var(--color-text-on-dark)',
  textDecoration: 'none',
  fontFamily: 'var(--font-sans)',
  fontSize: 14,
  lineHeight: 1.5,
  transition: 'opacity 120ms ease',
  boxSizing: 'border-box',
};

// ---------------------------------------------------------------------------
// FooterLink component
// ---------------------------------------------------------------------------

/**
 * `FooterLink` — single link primitive for the Miro footer.
 *
 * Renders an `<a>` element with the signature Miro dark-footer typography
 * (`--color-text-on-dark`, 14px, 1.5 line-height) and a subtle opacity
 * transition on hover. Designed for use inside `Footer` link lists or the
 * bottom credit bar.
 *
 * Every visual property binds to a Miro design system CSS custom property —
 * no raw hex values, no hardcoded spacing.
 *
 * ```tsx
 * <FooterLink href="/pricing">Pricing</FooterLink>
 * <FooterLink href="/blog">Blog</FooterLink>
 * ```
 */
export function FooterLink({
  href,
  children,
  className,
  style,
  ...rest
}: FooterLinkProps) {
  return (
    <a
      href={href}
      className={className}
      style={{
        ...baseStyle,
        ...style,
      }}
      {...rest}
    >
      {children}
    </a>
  );
}

FooterLink.displayName = 'FooterLink';

export default FooterLink;
