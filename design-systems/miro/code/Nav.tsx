import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface NavProps {
  /** Additional class names for custom styling. */
  className?: string;
  /** Additional inline styles. */
  style?: React.CSSProperties;
  /** Nav content — typically a left section (logo + links) and right section (secondary links + primary CTA). */
  children?: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Base style — every visual property binds to a Miro CSS custom property
// ---------------------------------------------------------------------------

const baseStyle: React.CSSProperties = {
  backgroundColor: 'var(--miro-canvas)',
  fontFamily: 'var(--font-sans)',
  padding: '0 var(--space-xxl)',
  height: 'var(--space-section)',
  boxSizing: 'border-box',
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderBottom: '1px solid var(--miro-hairline-soft)',
  position: 'sticky',
  top: 0,
  zIndex: 100,
};

// ---------------------------------------------------------------------------
// Nav component
// ---------------------------------------------------------------------------

/**
 * `Nav` — sticky top navigation bar for the Miro design system.
 *
 * Renders a full-width `<nav>` element with the signature Miro white canvas
 * background (`--miro-canvas`), 64px height, a soft bottom hairline border,
 * and sticky positioning. Uses a flex `space-between` layout for left-aligned
 * branding + navigation links and right-aligned secondary links + primary CTA.
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
 *   </div>
 *   <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
 *     <TextLink href="/pricing">Pricing</TextLink>
 *     <Button variant="primary">Get started free</Button>
 *   </div>
 * </Nav>
 * ```
 */
export const Nav: React.FC<NavProps> = ({
  className,
  style,
  children,
  ...rest
}) => {
  return (
    <nav
      className={className}
      style={{
        ...baseStyle,
        ...style,
      }}
      {...rest}
    >
      {children}
    </nav>
  );
};

Nav.displayName = 'Nav';

export default Nav;
