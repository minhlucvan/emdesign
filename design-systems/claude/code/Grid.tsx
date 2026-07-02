import React from 'react';

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Minimum column width before wrapping (e.g. '320px', '220px'). */
  minColumnWidth?: string;
  /** Gap in multiples of the 4px spacing unit (default 6 = 24px). */
  gap?: number;
}

/** Responsive CSS Grid that auto-fills columns to the given minimum width.
 *  Wraps children such as feature-card, code-window-card, and model-comparison-card. */
export function Grid({
  minColumnWidth = '320px',
  gap = 6,
  className = '',
  style,
  children,
  ...props
}: GridProps) {
  return (
    <div
      className={'grid ' + className}
      style={{
        gridTemplateColumns: `repeat(auto-fill, minmax(${minColumnWidth}, 1fr))`,
        gap: `calc(var(--space-unit) * ${gap})`,
        minWidth: 0,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
