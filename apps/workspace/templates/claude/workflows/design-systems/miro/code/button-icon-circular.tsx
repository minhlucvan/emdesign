import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ButtonIconCircularProps {
  /** Additional class names */
  className?: string;
  /** Icon content (typically a single character or SVG) */
  children?: React.ReactNode;
  /** Accessible label for the icon button */
  'aria-label'?: string;
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
  width: '36px',
  height: '36px',
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--font-size-body-sm)',
  fontWeight: 'var(--font-weight-medium)',
  lineHeight: 1,
  cursor: 'pointer',
  border: '1px solid var(--color-border)',
  borderRadius: '50%',
  outline: 'none',
  textDecoration: 'none',
  transition: 'background 150ms ease, color 150ms ease, border-color 150ms ease',
  boxSizing: 'border-box',
  userSelect: 'none',
  flexShrink: 0,
  padding: 0,
  background: 'var(--color-surface-raised)',
  color: 'var(--color-text)',
};

const hoverStyle: React.CSSProperties = {
  background: 'var(--color-surface)',
};

const disabledStyle: React.CSSProperties = {
  background: 'var(--color-border)',
  color: 'var(--color-text-muted)',
  cursor: 'not-allowed',
  border: 'none',
};

// ---------------------------------------------------------------------------
// ButtonIconCircular component
// ---------------------------------------------------------------------------

/**
 * `ButtonIconCircular` — a 36x36 circular icon utility button for the Miro
 * design system.
 *
 * Renders a raised-surface circular button with a 1px border, designed for
 * icon-only actions such as navigation arrows, close buttons, or utility
 * controls. All colors, spacing, and radii reference design-system CSS custom
 * properties — no raw hex values, no hardcoded pixels.
 *
 * Always provide an `aria-label` for accessibility.
 *
 * ```tsx
 * <ButtonIconCircular aria-label="Next page">
 *   &rsaquo;
 * </ButtonIconCircular>
 * <ButtonIconCircular aria-label="Close" disabled>
 *   &times;
 * </ButtonIconCircular>
 * ```
 */
export function ButtonIconCircular({
  className,
  children,
  onClick,
  type = 'button',
  disabled = false,
  style,
  ...rest
}: ButtonIconCircularProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <button
      className={className}
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{
        ...baseStyle,
        ...(hovered && !disabled ? hoverStyle : {}),
        ...(disabled ? disabledStyle : {}),
        ...style,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-disabled={disabled || undefined}
      {...rest}
    >
      {children}
    </button>
  );
}

ButtonIconCircular.displayName = 'ButtonIconCircular';

export default ButtonIconCircular;
