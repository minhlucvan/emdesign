import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ButtonGhostProps {
  /** Additional class names */
  className?: string;
  /** Button contents */
  children?: React.ReactNode;
  /** Click handler */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  /** HTML type attribute */
  type?: 'button' | 'submit' | 'reset';
  /** Disabled state — grayed out, non-interactive */
  disabled?: boolean;
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
  border: 'none',
  outline: 'none',
  textDecoration: 'none',
  transition: 'background 150ms ease, color 150ms ease',
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  userSelect: 'none',
  padding: 'var(--space-xs) var(--space-sm)',
  borderRadius: 'var(--radius)',
  background: 'transparent',
  color: 'var(--color-text)',
};

const disabledStyle: React.CSSProperties = {
  color: 'var(--color-text-muted)',
  cursor: 'not-allowed',
};

// ---------------------------------------------------------------------------
// ButtonGhost component
// ---------------------------------------------------------------------------

/**
 * Quiet rectangular ghost button for the Miro design system.
 *
 * A minimal transparent button with 8px rounded corners (not pill-shaped),
 * ink-colored text, and compact padding (`--space-xs` / `--space-sm`). Used
 * for secondary inline actions where a full outline or filled pill would be
 * too heavy — such as "View", "Edit", or contextual toolbar actions.
 *
 * All colors, spacing, and radii reference design-system CSS custom properties
 * — no raw hex values, no hardcoded pixels.
 *
 * ```tsx
 * <ButtonGhost onClick={handleView}>
 *   View
 * </ButtonGhost>
 * <ButtonGhost disabled>
 *   Unavailable
 * </ButtonGhost>
 * ```
 */
export function ButtonGhost({
  className,
  children,
  onClick,
  type = 'button',
  disabled = false,
  style,
  ...rest
}: ButtonGhostProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={className}
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{
        ...baseStyle,
        ...(disabled ? disabledStyle : {}),
        ...style,
      }}
      aria-disabled={disabled || undefined}
      {...rest}
    >
      {children}
    </button>
  );
}

ButtonGhost.displayName = 'button-ghost';

export default ButtonGhost;
