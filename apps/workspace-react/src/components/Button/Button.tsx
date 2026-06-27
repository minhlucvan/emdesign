/**
 * Button — captured by emdesign.
 * Reusable, design-system-bound component. Edit freely; re-capture to update.
 */
import React from 'react';

type Variant = 'primary' | 'secondary' | 'danger';
type Size = 'default' | 'small';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const base =
  'inline-flex items-center justify-center gap-2 rounded font-medium ' +
  'transition-[background-color,box-shadow] duration-[120ms] ' +
  'focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)] ' +
  'disabled:opacity-45 disabled:pointer-events-none';

const sizes: Record<Size, string> = {
  default: 'px-5 py-3 text-text text-sm',
  small: 'px-3 py-1.5 text-text text-xs',
};

const variants: Record<Variant, string> = {
  primary: 'bg-accent text-white hover:bg-accent-hover',
  secondary: 'bg-transparent text-text border border-border hover:bg-[var(--color-surface-raised)]',
  danger: 'bg-[var(--color-danger)] text-white hover:opacity-85',
};

/**
 * Atelier-compliant Button component.
 * References token roles only — never raw hex.
 * Supports primary, secondary, and danger variants with default and small sizes.
 * Includes loading state with accessible announcement.
 */
export function Button({
  variant = 'primary',
  size = 'default',
  loading = false,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${loading ? 'cursor-wait' : ''} ${className}`}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      aria-disabled={isDisabled || undefined}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4 shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
