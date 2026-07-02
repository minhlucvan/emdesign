import React from 'react';

export interface PricingGridProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Minimum column width before wrapping (default '240px'). */
  minColumnWidth?: string;
  /** Gap in multiples of the 4px spacing unit (default 5 = 20px). */
  gap?: number;
}

/** Pricing grid — responsive grid for pricing tier cards.
 *  Auto-fills columns at 240px minimum width with 20px gaps.
 *  Children should be pricing tier cards composed from Card, Title, Text, Badge, and Button. */
export function PricingGrid({
  minColumnWidth = '240px',
  gap = 5,
  className = '',
  style,
  children,
  ...props
}: PricingGridProps) {
  return (
    <div
      className={'grid ' + className}
      style={{
        gridTemplateColumns: `repeat(auto-fill, minmax(${minColumnWidth}, 1fr))`,
        gap: `calc(var(--space-unit) * ${gap})`,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
