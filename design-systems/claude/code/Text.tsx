import React from 'react';

type TextSize = 'lg' | 'md' | 'sm';

export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  size?: TextSize;
}

const sizeStyles: Record<TextSize, string> = {
  lg: 'text-lg leading-[1.55]',
  md: 'text-base leading-[1.55]',
  sm: 'text-sm leading-[1.55]',
};

/** Body text — sans-serif running copy on the cream canvas. */
export function Text({ size = 'lg', className = '', ...props }: TextProps) {
  return (
    <p
      className={`font-[var(--font-sans)] text-text ${sizeStyles[size]} ${className}`}
      {...props}
    />
  );
}
