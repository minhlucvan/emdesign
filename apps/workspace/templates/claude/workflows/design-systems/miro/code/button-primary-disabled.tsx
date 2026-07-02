import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ButtonPrimaryDisabledProps {
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
  cursor: 'not-allowed',
  border: 'none',
  outline: 'none',
  textDecoration: 'none',
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  userSelect: 'none',
  padding: 'var(--space-sm) var(--space-xl)',
  borderRadius: 'var(--radius-pill)',
  background: 'var(--color-border)',
  color: 'var(--color-text-muted)',
};

// ---------------------------------------------------------------------------
// ButtonPrimaryDisabled component
// ---------------------------------------------------------------------------

/**
 * Disabled-state pill button for the Miro design system.
 *
 * Visually represents a disabled primary CTA pill using the design system's
 * muted border background (`--color-border`) and muted text (`--color-text-muted`)
 * tokens, with `not-allowed` cursor. All colors, spacing, and radii reference
 * design-system CSS custom properties — no raw hex values, no hardcoded pixels.
 *
 * Rendered as a disabled `<button>` element so it remains in the tab order
 * for assistive technology while being non-interactive.
 *
 * ```tsx
 * <ButtonPrimaryDisabled>Unavailable</ButtonPrimaryDisabled>
 * ```
 */
export function ButtonPrimaryDisabled({
  className,
  children,
  onClick,
  type = 'button',
  style,
  ...rest
}: ButtonPrimaryDisabledProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={className}
      type={type}
      disabled
      onClick={onClick}
      style={{
        ...baseStyle,
        ...style,
      }}
      aria-disabled
      {...rest}
    >
      {children}
    </button>
  );
}

ButtonPrimaryDisabled.displayName = 'ButtonPrimaryDisabled';

export default ButtonPrimaryDisabled;
