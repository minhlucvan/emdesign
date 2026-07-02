import React, { useState, forwardRef } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

/* ---- Static style maps ---- */

const baseStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 'var(--space-sm)',
  fontFamily: 'var(--font-sans)',
  borderRadius: 'var(--radius-pill)',
  cursor: 'pointer',
  border: '1px solid',
  outline: 'none',
  transition:
    'background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease',
  textDecoration: 'none',
  whiteSpace: 'nowrap',
  userSelect: 'none',
  minHeight: 'var(--space-xxl)',
  boxSizing: 'border-box',
};

const variantBase: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    backgroundColor: 'var(--color-accent)',
    color: 'var(--color-on-primary)',
    borderColor: 'var(--color-accent)',
  },
  secondary: {
    backgroundColor: 'var(--color-surface)',
    color: 'var(--color-accent)',
    borderColor: 'var(--color-accent)',
  },
  ghost: {
    backgroundColor: 'transparent',
    color: 'var(--color-accent)',
    borderColor: 'transparent',
  },
};

const variantHover: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    backgroundColor: 'var(--color-accent-hover)',
    borderColor: 'var(--color-accent-hover)',
  },
  secondary: {
    backgroundColor: 'var(--color-accent)',
    color: 'var(--color-on-primary)',
  },
  ghost: {
    backgroundColor: 'var(--color-primary-bg-subdued-hover)',
  },
};

const variantActive: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    backgroundColor: 'var(--color-primary-press)',
    borderColor: 'var(--color-primary-press)',
  },
  secondary: {
    backgroundColor: 'var(--color-primary-press)',
    color: 'var(--color-on-primary)',
    borderColor: 'var(--color-primary-press)',
  },
  ghost: {
    backgroundColor: 'var(--color-primary-bg-subdued-hover)',
  },
};

const sizeMap: Record<ButtonSize, React.CSSProperties> = {
  sm: {
    fontSize: 'var(--font-size-button-sm)',
    fontWeight: 'var(--font-weight-button-sm)',
    lineHeight: 'var(--line-height-button-sm)',
    letterSpacing: 'var(--letter-spacing-button-sm)',
    padding: 'var(--space-xs) var(--space-sm)',
  },
  md: {
    fontSize: 'var(--font-size-button-md)',
    fontWeight: 'var(--font-weight-button-md)',
    lineHeight: 'var(--line-height-button-md)',
    letterSpacing: 'var(--letter-spacing-button-md)',
    padding: 'var(--space-sm) var(--space-lg)',
  },
  lg: {
    fontSize: 'var(--font-size-button-md)',
    fontWeight: 'var(--font-weight-button-md)',
    lineHeight: 'var(--line-height-button-md)',
    letterSpacing: 'var(--letter-spacing-button-md)',
    padding: 'var(--space-md) var(--space-xl)',
  },
};

const focusRing: React.CSSProperties = {
  boxShadow:
    '0 0 0 2px var(--color-on-primary), 0 0 0 4px var(--color-accent)',
};

/* ---- Component ---- */

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      disabled,
      style,
      onMouseEnter,
      onMouseLeave,
      onMouseDown,
      onMouseUp,
      onFocus,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const [hovered, setHovered] = useState(false);
    const [focused, setFocused] = useState(false);
    const [active, setActive] = useState(false);

    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        style={{
          ...baseStyle,
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
          ...variantBase[variant],
          ...sizeMap[size],
          ...(hovered && !disabled ? variantHover[variant] : {}),
          ...(active && !disabled ? variantActive[variant] : {}),
          ...(focused && !disabled ? focusRing : {}),
          ...style,
        }}
        onMouseEnter={(e) => {
          setHovered(true);
          onMouseEnter?.(e);
        }}
        onMouseLeave={(e) => {
          setHovered(false);
          setActive(false);
          onMouseLeave?.(e);
        }}
        onMouseDown={(e) => {
          setActive(true);
          onMouseDown?.(e);
        }}
        onMouseUp={(e) => {
          setActive(false);
          onMouseUp?.(e);
        }}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          setActive(false);
          onBlur?.(e);
        }}
        {...props}
      />
    );
  },
);

Button.displayName = 'Button';

export default Button;
