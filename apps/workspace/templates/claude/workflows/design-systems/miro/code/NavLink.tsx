import React, { useState, useCallback } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface NavLinkProps {
  /** Link URL. */
  href?: string;
  /** Link label content. */
  children?: React.ReactNode;
  /** Additional CSS classes. */
  className?: string;
  /** Whether this link represents the current page / section. */
  isActive?: boolean;
  /** Click handler. */
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  /** HTML target attribute (e.g. "_blank"). */
  target?: string;
  /** HTML rel attribute (e.g. "noopener noreferrer"). */
  rel?: string;
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const baseStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--font-size-body-sm)',
  fontWeight: 'var(--font-weight-medium)',
  lineHeight: 1.5,
  color: 'var(--color-text)',
  textDecoration: 'none',
  cursor: 'pointer',
  transition: 'color 150ms ease',
  boxSizing: 'border-box',
};

const activeStyle: React.CSSProperties = {
  color: 'var(--color-accent)',
};

const hoverStyle: React.CSSProperties = {
  color: 'var(--color-accent)',
};

// ---------------------------------------------------------------------------
// NavLink component
// ---------------------------------------------------------------------------

/**
 * `NavLink` — navigation link for the Miro design system.
 *
 * Renders an anchor element styled as a top-level navigation item: body-sm
 * (14px) medium-weight text in the default text color, with no underline.
 * On hover the link shifts to the brand accent blue (`--color-accent`).
 * When `isActive` is true the link renders in accent blue to indicate the
 * current page or section.
 *
 * All colors and typography bind to design-system CSS custom properties —
 * no raw hex values or hardcoded spacing.
 *
 * ```tsx
 * <NavLink href="/product">Product</NavLink>
 * <NavLink href="/pricing" isActive>Pricing</NavLink>
 * ```
 */
export const NavLink = ({
  href,
  children,
  className,
  isActive = false,
  onClick,
  target,
  rel,
  ...rest
}: NavLinkProps & React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
  const [hovered, setHovered] = useState(false);

  const handleMouseEnter = useCallback(() => setHovered(true), []);
  const handleMouseLeave = useCallback(() => setHovered(false), []);

  const resolvedStyle: React.CSSProperties = {
    ...baseStyle,
    ...(isActive ? activeStyle : {}),
    ...(!isActive && hovered ? hoverStyle : {}),
  };

  return (
    <a
      href={href}
      className={className}
      onClick={onClick}
      target={target}
      rel={rel}
      style={resolvedStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...rest}
    >
      {children}
    </a>
  );
};

NavLink.displayName = 'NavLink';

export default NavLink;
