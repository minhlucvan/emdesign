import React from 'react';

type CaptionVariant = 'caption' | 'uppercase';

export interface CaptionProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: CaptionVariant;
}

const variantStyles: Record<CaptionVariant, string> = {
  caption:
    'text-[var(--text-caption)] ' +
    'font-[var(--text-caption-weight)] ' +
    'leading-[var(--text-caption-line)]',
  uppercase:
    'text-[var(--text-caption-uppercase)] ' +
    'font-[var(--text-caption-uppercase-weight)] ' +
    'leading-[var(--text-caption-uppercase-line)] ' +
    'tracking-[var(--text-caption-uppercase-tracking)] uppercase',
};

/** Caption text — small muted labels and uppercase status tags.
 *  `caption` (13px/500/1.4) for sub-labels and info text;
 *  `uppercase` (12px/500/1.4/1.5px) for "NEW" / "BETA" emphasis. */
export function Caption({ variant = 'caption', className = '', ...props }: CaptionProps) {
  return (
    <span
      className={`font-[var(--font-sans)] text-text-muted ${variantStyles[variant]} ${className}`}
      {...props}
    />
  );
}
