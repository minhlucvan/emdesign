import React from 'react';

type BadgeVariant = 'neutral' | 'accent' | 'brand';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  neutral: 'bg-surface text-text-muted',
  accent: 'bg-accent text-white',
  brand: 'bg-[var(--color-brand)] text-black',
};

/**
 * Miro pill badge.
 *
 * Miro's badge is a small pill-shaped label in the signature 11px micro-label
 * typography (weight 600, 0.5px tracking). Three variants:
 *
 * - `neutral` — surface background, muted text (default tags, labels)
 * - `accent`  — solid black background, white text (emphasis badges)
 * - `brand`   — canary-yellow background, black text (NEW / featured tags,
 *   consistent with the brand-yellow-on-small-chips rule)
 */
export function Badge({ variant = 'neutral', className = '', ...props }: BadgeProps) {
  return (
    <span
      className={
        'inline-flex items-center rounded-[var(--radius-pill)] px-2 py-0.5 ' +
        'text-[11px] font-semibold tracking-[0.5px] ' +
        variantClasses[variant] +
        ' ' +
        className
      }
      {...props}
    />
  );
}
