import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface NavLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
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
  color: 'var(--miro-primary)',
  textDecoration: 'none',
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--font-size-body-sm)',
  fontWeight: 'var(--font-weight-medium)',
  lineHeight: 1,
  padding: 'var(--space-xs) var(--space-sm)',
  borderRadius: 'var(--radius-pill)',
  boxSizing: 'border-box',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 'var(--space-xxs)',
  whiteSpace: 'nowrap',
  transition: 'color 120ms ease, background-color 120ms ease',
  cursor: 'pointer',
};

// ---------------------------------------------------------------------------
// NavLink component
// ---------------------------------------------------------------------------

/**
 * `NavLink` — navigation link primitive for the Miro top nav bar.
 *
 * Renders an `<a>` element with Miro's signature top-nav styling: dark text
 * (`--miro-primary`) on the white canvas background, Roobert PRO type at the
 * body-sm size, medium weight, and a subtle darkening hover effect. Designed
 * for use inside `Nav` link lists.
 *
 * Every visual property binds to a Miro design system CSS custom property —
 * no raw hex values, no hardcoded spacing.
 *
 * ```tsx
 * <Nav>
 *   <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xl)' }}>
 *     <MiroLogo />
 *     <NavLink href="/product">Product</NavLink>
 *     <NavLink href="/solutions">Solutions</NavLink>
 *     <NavLink href="/resources">Resources</NavLink>
 *   </div>
 *   <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
 *     <NavLink href="/pricing">Pricing</NavLink>
 *     <Button variant="primary">Get started free</Button>
 *   </div>
 * </Nav>
 * ```
 */
export function NavLink({
  href,
  children,
  className,
  style,
  ...rest
}: NavLinkProps) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <a
      href={href}
      className={className}
      style={{
        ...baseStyle,
        color: hovered ? 'var(--miro-primary-muted)' : 'var(--miro-primary)',
        backgroundColor: hovered ? 'var(--color-surface)' : 'transparent',
        ...style,
      }}
      onMouseEnter={(e) => {
        setHovered(true);
        rest.onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        setHovered(false);
        rest.onMouseLeave?.(e);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}

NavLink.displayName = 'NavLink';

export default NavLink;
