import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ButtonBlueProps {
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
  transition: 'background 150ms ease, color 150ms ease',
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  userSelect: 'none',
  padding: 'var(--space-sm) var(--space-xl)',
  borderRadius: 'var(--radius-pill)',
  background: 'var(--miro-brand-blue)',
  color: 'var(--color-text-on-primary)',
};

const hoverStyle: React.CSSProperties = {
  background: 'var(--color-accent-hover)',
};

const disabledStyle: React.CSSProperties = {
  background: 'var(--color-border)',
  color: 'var(--color-text-muted)',
  cursor: 'not-allowed',
};

// ---------------------------------------------------------------------------
// ButtonBlue component
// ---------------------------------------------------------------------------

/**
 * Brand-blue pill button for action callouts in the Miro design system.
 *
 * A filled pill-shaped button using `--miro-brand-blue` (#4262ff) as the
 * background, with `--color-accent-hover` on interaction. All colors, spacing,
 * and radii reference design-system CSS custom properties — no raw values or
 * hardcoded pixels.
 *
 * Use for primary action callouts that need visual prominence in the interface,
 * such as featured tier CTAs, sign-up flows, or highlighted actions.
 *
 * ```tsx
 * <ButtonBlue onClick={handleStartTrial}>
 *   Start trial
 * </ButtonBlue>
 * <ButtonBlue disabled>
 *   Unavailable
 * </ButtonBlue>
 * ```
 */
export const ButtonBlue = ({
  className,
  children,
  onClick,
  type = 'button',
  disabled = false,
  style,
  ...rest
}: ButtonBlueProps & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
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

ButtonBlue.displayName = 'ButtonBlue';

export default ButtonBlue;
