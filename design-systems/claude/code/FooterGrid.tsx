import React from 'react';

export interface FooterGridProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Additional className for the grid container. */
  className?: string;
}

/** 4-column responsive grid for use inside the dark footer band.
 *  Collapses to 2 columns at 760px (`max-md`).
 *  Children should be footer-col elements composed from Text, Heading, and Link primitives. */
export function FooterGrid({ className = '', children, ...props }: FooterGridProps) {
  return (
    <div
      className={`grid grid-cols-4 max-md:grid-cols-2 gap-8 max-md:gap-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
