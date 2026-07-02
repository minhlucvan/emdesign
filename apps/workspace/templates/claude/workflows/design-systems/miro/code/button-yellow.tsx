import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ButtonYellowProps {
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
  borderRadius: 'var(--radius-pill)',
  background: 'var(--miro-brand-yellow)',
  color: 'var(--color-text)',
};

const hoverStyle: React.CSSProperties = {
  background: 'var(--miro-brand-yellow-deep)',
};

const disabledStyle: React.CSSProperties = {
  background: 'var(--color-border)',
  color: 'var(--color-text-muted)',
  cursor: 'not-allowed',
};

// ---------------------------------------------------------------------------
// ButtonYellow component
// ---------------------------------------------------------------------------

/**
 * Brand-yellow pill button for emphasis in the Miro design system.
 *
 * A filled pill-shaped button using `--miro-brand-yellow` (#ffd02f) as the
 * background with ink text, matching the canary yellow that anchors the Miro
 * brand identity. Hover transitions to `--miro-brand-yellow-deep` (#fcb900).
 *
 * All colors, spacing, and radii reference design-system CSS custom properties
 * — no raw hex values, no hardcoded pixels.
 *
 * Used for brand emphasis CTAs such as the "Contact sales" button in the
 * Enterprise pricing card and other yellow callout moments.
 *
 * ```tsx
 * <ButtonYellow onClick={handleContactSales}>
 *   Contact sales
 * </ButtonYellow>
 * <ButtonYellow disabled>
 *   Unavailable
 * </ButtonYellow>
 * ```
 */
export const ButtonYellow = ({
  className,
  children,
  onClick,
  type = 'button',
  disabled = false,
  style,
  ...rest
}: ButtonYellowProps & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
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

ButtonYellow.displayName = 'ButtonYellow';

export default ButtonYellow;
