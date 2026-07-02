import React from 'react';

type BodySize = 'md' | 'sm';

export interface BodyProps extends React.HTMLAttributes<HTMLParagraphElement> {
  size?: BodySize;
}

const sizeStyles: Record<BodySize, string> = {
  md: 'text-[var(--text-body-md)] leading-[var(--text-body-md-line)]',
  sm: 'text-[var(--text-body-sm)] leading-[var(--text-body-sm-line)]',
};

/** Body text — sans-serif running copy on the cream canvas.
 *  body-md (16px/400/1.55) is the default paragraph size;
 *  body-sm (14px/400/1.55) for footer and fine-print. */
export function Body({ size = 'md', className = '', ...props }: BodyProps) {
  return (
    <p
      className={`font-[var(--font-sans)] text-text ${sizeStyles[size]} ${className}`}
      {...props}
    />
  );
}
