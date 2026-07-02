import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ButtonOnDarkProps {
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
  padding: 'var(--space-sm) var(--space-xl)',
  borderRadius: '9999px',
  background: 'var(--on-dark)',
  color: 'var(--color-text)',
};

const hoverStyle: React.CSSProperties = {
  background: 'var(--color-surface)',
};

const disabledStyle: React.CSSProperties = {
  background: 'var(--color-border)',
  color: 'var(--color-text-muted)',
  cursor: 'not-allowed',
};

// ---------------------------------------------------------------------------
// ButtonOnDark component
// ---------------------------------------------------------------------------

/**
 * Light pill button for use on dark backgrounds in the Miro design system.
 *
 * Renders a white pill on dark backgrounds — used in the CTA banner,
 * enterprise pricing card, and other dark-surfaced sections. The white
 * background (`--on-dark`) with dark text (`--color-text`) creates a
 * high-contrast call-to-action on ink or primary-colored containers.
 *
 * All colors, spacing, and radii reference design-system CSS custom properties
 * — no raw hex values, no hardcoded pixels.
 *
 * ```tsx
 * <ButtonOnDark onClick={handleGetStarted}>
 *   Get started free
 * </ButtonOnDark>
 * <ButtonOnDark disabled>
 *   Unavailable
 * </ButtonOnDark>
 * ```
 */
export const ButtonOnDark = ({
  className,
  children,
  onClick,
  type = 'button',
  disabled = false,
  style,
  ...rest
}: ButtonOnDarkProps & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
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
};

ButtonOnDark.displayName = 'ButtonOnDark';

export default ButtonOnDark;
