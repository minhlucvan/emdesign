import React from 'react';

export interface ElevationCardProps {
  /** Elevation depth: 0 (flat, bordered) through 4 (deepest shadow) */
  level?: 0 | 1 | 2 | 3 | 4;
  /** Card heading */
  title: string;
  /** Supporting metadata shown below the title */
  description?: string;
  /** Additional CSS classes */
  className?: string;
  /** Child content rendered below heading */
  children?: React.ReactNode;
}

const elevationStyles: Record<number, string> = {
  0: 'border border-default',
  1: 'border border-default shadow-raised',
  2: 'shadow-raised',
  3: 'shadow-raised',
  4: 'shadow-raised',
};

export function ElevationCard({
  level = 0,
  title,
  description,
  className = '',
  children,
}: ElevationCardProps) {
  return (
    <div
      className={`bg-surface-raised rounded-2xl p-8 flex flex-col gap-2 ${elevationStyles[level]} ${className}`}
    >
      <span className="text-default text-sm font-medium">{title}</span>
      {description && (
        <span className="text-muted text-xs font-mono">{description}</span>
      )}
      {children}
    </div>
  );
}
