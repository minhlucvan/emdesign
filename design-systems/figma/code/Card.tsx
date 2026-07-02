import React from 'react';

type CardVariant = 'default' | 'elevated';

export interface CardProps {
  /** Visual variant of the card */
  variant?: CardVariant;
  /** Card content */
  children: React.ReactNode;
  /** Additional inline styles */
  style?: React.CSSProperties;
}

/**
 * Card container with border, padding, and rounded corners.
 *
 * **Default** — white surface with a `--color-hairline` stroke per the
 * Figma `pricing-card` component token. No shadow; the stroke is the boundary.
 *
 * **Elevated** — same white surface but with a subtle drop shadow
 * (0 4px 16px rgba(0,0,0,0.06)), used for floating template tiles and
 * dropdown menus (Elevation level 2 in the design system).
 *
 * Figma's marketing is intentionally shadow-light — the color-block sections
 * substitute for traditional elevation. The elevated variant is reserved for
 * interactive floaters that need to read above the page stack.
 */
export const Card: React.FC<CardProps> = ({
  variant = 'default',
  children,
  style,
}) => {
  const baseStyle: React.CSSProperties = {
    backgroundColor: 'var(--color-canvas)',
    color: 'var(--color-ink)',
    borderRadius: 'var(--rounded-lg)',
    padding: 'var(--spacing-lg)',
    fontFamily: 'var(--font-sans)',
    fontSize: 'var(--font-size-body)',
    fontWeight: 'var(--font-weight-body)',
    lineHeight: 'var(--line-height-body)',
    letterSpacing: 'var(--letter-spacing-body)',
    fontFeatureSettings: '"kern"',
  };

  const variantStyles: Record<CardVariant, React.CSSProperties> = {
    default: {
      border: '1px solid var(--color-hairline)',
      boxShadow: 'none',
    },
    elevated: {
      border: '1px solid var(--color-hairline)',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
    },
  };

  return (
    <div style={{ ...baseStyle, ...variantStyles[variant], ...style }}>
      {children}
    </div>
  );
};

Card.displayName = 'Card';
