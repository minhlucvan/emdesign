import React from 'react';

export interface PaletteGridProps extends React.HTMLAttributes<HTMLDivElement> {}

/** Responsive grid container for ColorSwatch components.
 *  Renders a CSS Grid that auto-fills columns at 200px minimum with a 20px gap.
 *  Place ColorSwatch or other palette items as children. */
export function PaletteGrid({ className = '', ...props }: PaletteGridProps) {
  return (
    <div
      className={
        'grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-5 ' +
        className
      }
      {...props}
    />
  );
}
