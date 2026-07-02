import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ButtonVariant =
  | 'primary'
  | 'yellow'
  | 'blue'
  | 'secondary'
  | 'onDark'
  | 'ghost'
  | 'link';

export interface ButtonProps {
  /**
   * Visual style variant.
   * - `primary`: dark pill (dominant CTA)
   * - `yellow`: brand-yellow pill (brand emphasis)
   * - `blue`: brand-blue pill (action callout)
   * - `secondary`: outlined pill
   * - `onDark`: light pill for dark backgrounds
   * - `ghost`: quiet rectangular ghost
   * - `link`: inline blue text link
   */
  variant?: ButtonVariant;
  /** Disabled state — grayed out, non-interactive */
  disabled?: boolean;
  /** Additional class names */
  className?: string;
  /** Button contents */
  children?: React.ReactNode;
  /** Click handler */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  /** HTML type attribute */
  type?: 'button' | 'submit' | 'reset';
  /** Additional inline styles */
  style?: React.CSSProperties;
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const baseStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 'var(--space-xs)',
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--font-size-body-sm)',
  fontWeight: 'var(--font-weight-medium)',
  lineHeight: 1.3,
  cursor: 'pointer',
  border: 'none',
  outline: 'none',
  textDecoration: 'none',
  transition: 'background 150ms ease, color 150ms ease, border-color 150ms ease',
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  userSelect: 'none',
};

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    padding: 'var(--space-sm) var(--space-xl)',
    borderRadius: '9999px',
    background: 'var(--miro-primary)',
    color: 'var(--color-text-on-primary)',
  },
  yellow: {
    padding: 'var(--space-sm) var(--space-xl)',
    borderRadius: '9999px',
    background: 'var(--miro-brand-yellow)',
    color: 'var(--color-text)',
  },
  blue: {
    padding: 'var(--space-sm) var(--space-xl)',
    borderRadius: '9999px',
    background: 'var(--miro-brand-blue)',
    color: 'var(--color-text-on-primary)',
  },
  secondary: {
    padding: 'var(--space-sm) var(--space-xl)',
    borderRadius: '9999px',
    background: 'transparent',
    color: 'var(--color-text)',
    border: '1px solid var(--color-border)',
  },
  onDark: {
    padding: 'var(--space-sm) var(--space-xl)',
    borderRadius: '9999px',
    background: 'var(--color-surface)',
    color: 'var(--color-text)',
  },
  ghost: {
    padding: 'var(--space-xs) var(--space-sm)',
    borderRadius: 'var(--radius)',
    background: 'transparent',
    color: 'var(--color-text)',
  },
  link: {
    padding: 0,
    borderRadius: 0,
    background: 'transparent',
    color: 'var(--color-accent)',
    lineHeight: 'inherit',
  },
};

const disabledOverrides: React.CSSProperties = {
  background: 'var(--color-border)',
  color: 'var(--color-text-muted)',
  cursor: 'not-allowed',
  border: 'none',
};

// ---------------------------------------------------------------------------
// Button component
// ---------------------------------------------------------------------------

/**
 * Pill-shaped button primitive for the Miro design system.
 *
 * Renders a semantic button with one of seven visual variants. All colors,
 * spacing, and radii reference design-system CSS custom properties — no raw
 * values or hardcoded pixels.
 *
 * ```tsx
 * <Button variant="primary" onClick={handleClick}>
 *   Get started free
 * </Button>
 * <Button variant="link">Learn more →</Button>
 * ```
 */
export const Button = ({
  variant = 'primary',
  disabled = false,
  className,
  children,
  onClick,
  type = 'button',
  style,
  ...rest
}: ButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const variantStyle = variantStyles[variant];
  const disabledStyle = disabled ? disabledOverrides : undefined;

  return (
    <button
      className={className}
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{
        ...baseStyle,
        ...variantStyle,
        ...disabledStyle,
        ...style,
      }}
      aria-disabled={disabled || undefined}
      {...rest}
    >
      {children}
    </button>
  );
};

Button.displayName = 'Button';

export default Button;
