import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DiscountBadgeVariant = 'promo' | 'accent' | 'neutral';

export interface DiscountBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * Visual variant.
   * - `promo`   — brand-yellow background, black text (default, for promotional
   *   / discount callouts consistent with `--miro-brand-yellow` treatment)
   * - `accent`  — solid black background, white text (for high-contrast badges)
   * - `neutral` — surface background, muted text (for secondary discount info)
   */
  variant?: DiscountBadgeVariant;
  /** Additional class names for custom styling. */
  className?: string;
  /** Badge content — e.g. "50% OFF" or "Save $20". */
  children?: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Variant style map — every value binds to a Miro CSS custom property
// ---------------------------------------------------------------------------

const variantStyles: Record<DiscountBadgeVariant, React.CSSProperties> = {
  promo: {
    backgroundColor: 'var(--miro-brand-yellow)',
    color: 'var(--miro-primary)',
  },
  accent: {
    backgroundColor: 'var(--miro-primary)',
    color: 'var(--miro-on-primary)',
  },
  neutral: {
    backgroundColor: 'var(--color-surface)',
    color: 'var(--color-text-muted)',
  },
};

// ---------------------------------------------------------------------------
// Base style — every visual property binds to a Miro CSS custom property
// ---------------------------------------------------------------------------

const baseStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--font-size-micro)',
  fontWeight: 'var(--font-weight-semibold)',
  lineHeight: 1,
  borderRadius: 'var(--radius-pill)',
  padding: 'var(--space-xxs) var(--space-xs)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 'var(--space-xxs)',
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  letterSpacing: '0.3px',
  userSelect: 'none',
};

// ---------------------------------------------------------------------------
// DiscountBadge component
// ---------------------------------------------------------------------------

/**
 * `DiscountBadge` — compact pill badge for discount / promotional labels in
 * the Miro design system.
 *
 * Renders a small pill-shaped `<span>` element with `--radius-pill` rounding
 * and compact padding designed for discount callouts (e.g. "50% OFF", "Save
 * $20"). The default `promo` variant uses `--miro-brand-yellow` background
 * with `--miro-primary` (black) text, consistent with Miro's promotional
 * visual language (see `PromoBanner`).
 *
 * Three variants:
 * - `promo`   — brand-yellow background, black text (default, for promotional
 *   / discount callouts)
 * - `accent`  — solid black background, white text (for high-contrast badges)
 * - `neutral` — surface background, muted text (for secondary discount info)
 *
 * Every visual property binds to a Miro design system CSS custom property —
 * no raw hex values, no hardcoded spacing.
 *
 * ```tsx
 * <DiscountBadge>50% OFF</DiscountBadge>
 * <DiscountBadge variant="accent">Save $20</DiscountBadge>
 * <DiscountBadge variant="neutral">Limited time</DiscountBadge>
 * ```
 */
export function DiscountBadge({
  variant = 'promo',
  className,
  style,
  children,
  ...rest
}: DiscountBadgeProps) {
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
}

DiscountBadge.displayName = 'DiscountBadge';

export default DiscountBadge;
