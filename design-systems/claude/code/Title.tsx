import React from 'react';

type TitleSize = 'lg' | 'md' | 'sm';

export interface TitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /** Size variant mapped to title-lg (22px), title-md (18px), or title-sm (16px). */
  size?: TitleSize;
}

const sizeStyles: Record<TitleSize, string> = {
  lg: 'text-[22px] leading-[1.3]',
  md: 'text-[18px] leading-[1.4]',
  sm: 'text-[16px] leading-[1.4]',
};

/** Title — sans-serif labels for plan names, card titles, tile titles.
 *  Uses --font-sans (StyreneB/Inter), weight 500, no tracking.
 *  Renders as <h3> by default. */
export function Title({ size = 'md', className = '', ...props }: TitleProps) {
  return (
    <h3
      className={`font-[var(--font-sans)] font-medium text-text ${sizeStyles[size]} ${className}`}
      {...props}
    />
  );
}
