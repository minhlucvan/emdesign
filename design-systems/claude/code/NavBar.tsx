import React from 'react';

export interface NavBarProps extends React.HTMLAttributes<HTMLElement> {}

/**
 * Navigation bar — cream surface, sticky, hairline bottom border.
 * 3-column grid layout: first child left (brand), second center (links), third right (CTA).
 *
 * Matches .nav from reference: position:sticky, bg:var(--canvas), grid:1fr auto 1fr, h-16(64px), px-12(48px).
 */
export function NavBar({ className = '', style, ...props }: NavBarProps) {
  return (
    <nav
      className={className}
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        height: '64px',
        padding: '0 48px',
        ...style,
      }}
      {...props}
    />
  );
}
