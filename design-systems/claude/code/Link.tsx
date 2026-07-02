import React from 'react';

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  className?: string;
}

/** Inline coral link with underline — used for 'Read the research →' inline links
 *  in body text. Matches text-link-coral from the design reference.
 *  References token roles only (text-accent = --color-accent = coral #cc785c). */
export function Link({ className = '', ...props }: LinkProps) {
  return (
    <a
      className={`text-accent underline focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)] ${className}`.trim()}
      {...props}
    />
  );
}
