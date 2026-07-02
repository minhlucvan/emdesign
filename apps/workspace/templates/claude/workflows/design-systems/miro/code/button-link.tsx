import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ButtonLinkProps {
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
  lineHeight: 'inherit',
  cursor: 'pointer',
  border: 'none',
  borderRadius: 0,
  outline: 'none',
  textDecoration: 'none',
  transition: 'color 150ms ease',
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  userSelect: 'none',
  padding: 0,
  background: 'transparent',
  color: 'var(--color-accent)',
};

const hoverStyle: React.CSSProperties = {
  color: 'var(--color-accent-hover)',
};

const disabledStyle: React.CSSProperties = {
  color: 'var(--color-text-muted)',
  cursor: 'not-allowed',
};

// ---------------------------------------------------------------------------
// ButtonLink component
// ---------------------------------------------------------------------------

/**
 * Inline blue text link button for the Miro design system.
 *
 * Renders as a semantic `<button>` that visually matches an inline text link
 * — zero padding, transparent background, accent-blue type with no underline.
 * All colors and typography reference design-system CSS custom properties.
 *
 * Use for inline actions that should read as a text link rather than a pill
 * button, such as "Learn more →", "Read more →", or text-anchored actions.
 *
 * ```tsx
 * <ButtonLink onClick={handleLearnMore}>
 *   Learn more →
 * </ButtonLink>
 * <ButtonLink disabled>
 *   Unavailable
 * </ButtonLink>
 * ```
 */
export const ButtonLink = ({
  className,
  children,
  onClick,
  type = 'button',
  disabled = false,
  style,
  ...rest
}: ButtonLinkProps & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
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

ButtonLink.displayName = 'ButtonLink';

export default ButtonLink;
