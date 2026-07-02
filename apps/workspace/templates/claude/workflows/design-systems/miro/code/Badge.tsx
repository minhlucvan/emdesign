import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type BadgeVariant =
  | 'promo'
  | 'yellow'
  | 'purple'
  | 'coral'
  | 'success'
  | 'discount';

export interface BadgeProps {
  /**
   * Visual style variant.
   * - `promo`: brand-yellow pill — for promotional callout chips (default)
   * - `yellow`: light yellow surface with dark amber text — for tag chips
   * - `purple`: lavender surface with blue accent text — for feature badges
   * - `coral`: coral-light surface with dark red text — for template/status badges
   * - `success`: green filled — for active/approved status
   * - `discount`: brand-yellow compact rectangle — for inline savings badges
   */
  variant?: BadgeVariant;
  /** Additional class names */
  className?: string;
  /** Badge contents */
  children?: React.ReactNode;
  /** Additional inline styles */
  style?: React.CSSProperties;
}

// ---------------------------------------------------------------------------
// Styles — every value binds to a Miro design-system CSS custom property
// ---------------------------------------------------------------------------

const baseStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 'var(--space-xxs)',
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--font-size-caption)',
  fontWeight: 600,
  lineHeight: 1.4,
  padding: 'var(--space-xxs) var(--space-sm)',
  borderRadius: 'var(--radius-pill)',
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
};

const variantStyles: Record<BadgeVariant, React.CSSProperties> = {
  promo: {
    background: 'var(--miro-brand-yellow)',
    color: 'var(--color-ink)',
  },
  yellow: {
    background: 'var(--miro-surface-yellow)',
    color: 'var(--miro-yellow-dark)',
  },
  purple: {
    background: 'var(--color-surface-pricing-featured)',
    color: 'var(--color-accent)',
  },
  coral: {
    background: 'var(--miro-coral-light)',
    color: 'var(--miro-coral-dark)',
  },
  success: {
    background: 'var(--color-success)',
    color: 'var(--color-text-on-primary)',
  },
  discount: {
    background: 'var(--miro-brand-yellow)',
    color: 'var(--color-ink)',
    borderRadius: 'var(--radius-sm)',
    padding: 'var(--space-xxs)',
  },
};

// ---------------------------------------------------------------------------
// Badge component
// ---------------------------------------------------------------------------

/**
 * Pill-shaped badge primitive for the Miro design system.
 *
 * Renders a compact inline badge chip in one of six variants. All colors,
 * spacing, and radii reference design-system CSS custom properties — no raw
 * hex values or hardcoded pixels.
 *
 * ```tsx
 * <Badge variant="promo">GET YOUR SPOT</Badge>
 * <Badge variant="yellow">Yellow</Badge>
 * <Badge variant="purple">AI agent</Badge>
 * <Badge variant="coral">Templates</Badge>
 * <Badge variant="success">Active</Badge>
 * <Badge variant="discount">Save 15%</Badge>
 * ```
 *
 * Per Miro design rules, badges are predominantly flat (no shadow);
 * elevation is reserved for whiteboard mockups and modals.
 */
export const Badge = ({
  variant = 'promo',
  className,
  children,
  style,
  ...rest
}: BadgeProps & React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={className}
      style={{
        ...baseStyle,
        ...variantStyles[variant],
        ...style,
      }}
      {...rest}
    >
      {children}
    </span>
  );
};

Badge.displayName = 'Badge';

export default Badge;
