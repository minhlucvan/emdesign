/**
 * Button — captured by emdesign.
 * Reusable, design-system-bound component. Edit freely; re-capture to update.
 */
import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

const base =
  'inline-flex items-center justify-center font-[var(--font-sans)] font-semibold text-sm leading-none ' +
  'px-5 py-3 rounded transition-[background-color,box-shadow] duration-[var(--motion-fast)] ' +
  'focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)] ' +
  'disabled:opacity-45 disabled:pointer-events-none active:translate-y-0';

const variants: Record<string, string> = {
  primary:
    'bg-accent text-white hover:bg-accent-hover ' +
    'dark:bg-accent dark:text-[var(--color-highlight-ink)] dark:hover:bg-accent-hover',
  secondary:
    'bg-transparent text-text border border-border hover:bg-surface ' +
    'dark:bg-transparent dark:text-text dark:border-border dark:hover:bg-surface-raised',
};

/** A primary action button with hover, focus, and disabled states. Sharp corners, no shadow. */
export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}
