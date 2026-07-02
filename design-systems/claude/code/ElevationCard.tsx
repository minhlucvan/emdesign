import React from 'react';

export type ElevationCardVariant = 'flat' | 'raised' | 'dark' | 'coral';

export interface ElevationCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Visual elevation variant: flat (canvas+hairline), raised (cream card), dark (dark mockup), coral (CTA). */
  variant?: ElevationCardVariant;
  /** Card heading (rendered as h5). */
  title?: string;
  /** Card description (rendered as p). */
  description?: string;
  className?: string;
}

/** Colour-block elevation card — background contrast does the work, not shadows.
 *  Four variants matching the elevation & depth grid in the Claude design spec. */
export function ElevationCard({
  variant = 'flat',
  title,
  description,
  className = '',
  children,
  ...props
}: ElevationCardProps) {
  const isDark = variant === 'dark';
  const isCoral = variant === 'coral';

  return (
    <div
      className={
        'rounded-lg p-6 text-[13px] ' +
        {
          flat: 'bg-surface border border-border',
          raised: 'bg-surface-raised',
          dark: 'bg-[var(--color-surface-dark)] text-[var(--color-on-dark)] border border-white/10',
          coral: 'bg-accent text-white',
        }[variant] +
        ' ' +
        className
      }
      {...props}
    >
      {title && (
        <h5
          className={
            'text-[13px] font-medium mb-1.5 ' +
            (isDark ? '' : 'text-text')
          }
        >
          {title}
        </h5>
      )}
      {description && (
        <p
          className={
            'text-xs ' +
            (isDark
              ? 'text-[var(--color-on-dark-soft)]'
              : isCoral
                ? 'text-white/85'
                : 'text-text-muted')
          }
        >
          {description}
        </p>
      )}
      {children}
    </div>
  );
}
