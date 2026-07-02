import React from 'react';

export interface NavLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  className?: string;
}

/** Navigation link styled per the nav-link type token (14px / 500 / 1.4 / sans).
 *  Matches reference: color var(--color-ink), 14px font-size, 500 weight, no underline. */
export function NavLink({ style, ...props }: NavLinkProps) {
  return (
    <a
      style={{
        fontSize: '14px',
        fontWeight: 500,
        color: 'var(--color-ink)',
        textDecoration: 'none',
        ...style,
      }}
      {...props}
    />
  );
}
