import React from 'react';

export interface CodeProps extends React.HTMLAttributes<HTMLElement> {
  className?: string;
}

/** Inline code — 14px/400/1.6 JetBrains Mono, for API snippets and inline code samples. */
export function Code({ className = '', ...props }: CodeProps) {
  return (
    <code
      className={
        `font-[var(--font-mono)] text-sm leading-[1.6] text-text ${className}`
      }
      {...props}
    />
  );
}
