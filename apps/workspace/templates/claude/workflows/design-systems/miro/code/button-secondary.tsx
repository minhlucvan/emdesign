import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ButtonSecondaryProps {
  /** Additional class names */
  className?: string;
  /** Button contents */
  children?: React.ReactNode;
  /** Disabled state — grayed out, non-interactive */
  disabled?: boolean;
  /** Click handler */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  /** HTML type attribute */
  type?: 'button' | 'submit' | 'reset';
  /** Additional inline styles */
  style?: React.CSSProperties;
}

// ---------------------------------------------------------------------------
// Styles — every value binds to a Miro semantic CSS custom property
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
  border: '1px solid var(--color-border)',
  outline: 'none',
  textDecoration: 'none',
  transition: 'background 150ms ease, color 150ms ease, border-color 150ms ease',
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  userSelect: 'none',
  padding: 'var(--space-sm) var(--space-xl)',
  borderRadius: '9999px',
  background: 'transparent',
  color: 'var(--color-text)',
};

const disabledOverrides: React.CSSProperties = {
  background: 'var(--color-border)',
  color: 'var(--color-text-muted)',
  cursor: 'not-allowed',
  border: 'none',
};

// ---------------------------------------------------------------------------
// ButtonSecondary component
// ---------------------------------------------------------------------------

/**
 * Secondary outlined pill button for the Miro design system.
 *
 * Renders a transparent pill button with a 1px border and text colored via
 * `--color-text` / `--color-border` tokens. Commonly used for "Book a demo"
 * and "Sign up free" actions alongside primary CTAs.
 *
 * All colors, spacing, and radii reference design-system CSS custom properties
 * — no raw hex values, no hardcoded pixels.
 *
 * ```tsx
 * <ButtonSecondary onClick={handleClick}>
 *   Book a demo
 * </ButtonSecondary>
 * ```
 */
export function ButtonSecondary({
  className,
  children,
  disabled = false,
  onClick,
  type = 'button',
  style,
  ...rest
}: ButtonSecondaryProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const disabledStyle = disabled ? disabledOverrides : undefined;

  return (
    <button
      className={className}
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{
        ...baseStyle,
        ...disabledStyle,
        ...style,
      }}
      aria-disabled={disabled || undefined}
      {...rest}
    >
      {children}
    </button>
  );
}

ButtonSecondary.displayName = 'button-secondary';

export default ButtonSecondary;
