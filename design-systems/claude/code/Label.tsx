import React from 'react';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /** Additional class names */
  className?: string;
}

/** Form label — caption-sized (13px/500) in text-text, block, with 8px bottom margin.
 *  Pairs with {@link Input} via htmlFor / for association. */
export function Label({ className = '', ...props }: LabelProps) {
  return (
    <label
      className={
        'block mb-2 ' +
        'text-[var(--text-caption)] font-[var(--text-caption-weight)] leading-[var(--text-caption-line)] ' +
        'font-[var(--font-sans)] text-text ' +
        className
      }
      {...props}
    />
  );
}
