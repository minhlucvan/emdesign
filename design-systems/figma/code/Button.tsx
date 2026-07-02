import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant of the button */
  variant?: ButtonVariant;
  /** Size of the button */
  size?: ButtonSize;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Button content */
  children: React.ReactNode;
}

const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
  sm: {
    padding: '6px 14px',
    fontSize: '16px',
    lineHeight: '1.4',
  },
  md: {
    padding: '10px 20px',
    fontSize: 'var(--font-size-button)',
    lineHeight: 'var(--line-height-button)',
  },
  lg: {
    padding: '14px 28px',
    fontSize: '22px',
    lineHeight: '1.4',
  },
};

/**
 * Button component following the Figma design system.
 *
 * **Primary** — black pill CTA (`--color-primary` background, white text).
 * Used for the main action on any section (e.g. "Get started for free").
 *
 * **Secondary** — white pill with black text, no border.
 * Used as the visual counterpart to the primary CTA (e.g. "Contact sales").
 *
 * **Ghost** — transparent text-only hit target styled with link typography.
 * Used inside nav bars and footer link lists.
 *
 * Every CTA is a pill shape (`--rounded-pill`); icon variants use `--rounded-full`.
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  children,
  style,
  ...rest
}) => {
  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--spacing-xs)',
    fontFamily: 'var(--font-sans)',
    fontWeight: 'var(--font-weight-button)',
    letterSpacing: 'var(--letter-spacing-button)',
    borderRadius: 'var(--rounded-pill)',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'opacity 0.15s ease',
    opacity: disabled ? 0.4 : 1,
    whiteSpace: 'nowrap',
    textDecoration: 'none',
    userSelect: 'none',
    fontFeatureSettings: '"kern"',
    ...sizeStyles[size],
  };

  const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
    primary: {
      backgroundColor: 'var(--color-primary)',
      color: 'var(--color-on-primary)',
    },
    secondary: {
      backgroundColor: 'var(--color-canvas)',
      color: 'var(--color-ink)',
      // Figma secondary pills have no border — the white-on-white is the intended look
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--color-ink)',
      borderRadius: 'var(--rounded-full)',
      fontSize: 'var(--font-size-link)',
      fontWeight: 'var(--font-weight-link)',
      lineHeight: 'var(--line-height-link)',
      letterSpacing: 'var(--letter-spacing-link)',
      padding: '8px 12px',
    },
  };

  return (
    <button
      disabled={disabled}
      style={{ ...baseStyle, ...variantStyles[variant], ...style }}
      {...rest}
    >
      {children}
    </button>
  );
};

Button.displayName = 'Button';
