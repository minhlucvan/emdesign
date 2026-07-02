import React from 'react';

export interface FooterLinkProps extends React.HTMLAttributes<HTMLSpanElement> {
  className?: string;
}

/** Footer column item — a text label on the dark footer surface.
 *  body-sm sans-serif at 14px on on-dark-soft with 0.72 opacity and 1.35 line-height.
 *  Matches the .footer-col span pattern from the reference example. */
export function FooterLink({ className = '', ...props }: FooterLinkProps) {
  return (
    <span
      className={
        'block mb-2.5 text-sm leading-[1.35] font-sans ' +
        'text-[var(--color-on-dark-soft)] opacity-[0.72] ' +
        className
      }
      {...props}
    />
  );
}
