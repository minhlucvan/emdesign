import React from 'react';

export interface FooterContainerProps extends React.HTMLAttributes<HTMLElement> {
  className?: string;
}

/** Dark full-width footer band for page-end navigation, links, and legal information.
 *  Dark navy surface (--color-surface-dark) with on-dark-soft text.
 *  Renders as <footer>. Compose Grid, Stack, Text, Link, Title inside. */
export function FooterContainer({ className = '', children, ...props }: FooterContainerProps) {
  return (
    <footer
      className={
        'bg-[var(--color-surface-dark)] text-[var(--color-on-dark-soft)] ' +
        'font-sans text-sm leading-[1.55] ' +
        'py-16 px-12 ' +
        className
      }
      {...props}
    >
      {children}
    </footer>
  );
}
