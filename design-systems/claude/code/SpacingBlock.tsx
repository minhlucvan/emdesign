import React from 'react';

export interface SpacingBlockProps {
  /** Width of the spacing bar in pixels (e.g. 4, 8, 12, 16, 24, 32, 48, 96). */
  width: number;
  /** Label displayed below the bar (e.g. "xxs · 4px"). */
  label: string;
  /** Additional CSS classes. */
  className?: string;
}

/** Spacing scale display block — a coral bar at the given width with a
 *  mono-space label below. Used to visualize each stop on the 4px
 *  spacing token scale (xxs through section). */
export function SpacingBlock({ width, label, className = '' }: SpacingBlockProps) {
  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div
        className="bg-accent rounded h-7"
        style={{ width }}
      />
      <div className="text-xs text-text-muted font-mono whitespace-nowrap">
        {label}
      </div>
    </div>
  );
}
