import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PromoBannerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Additional class names for custom styling. */
  className?: string;
  /** Banner content — typically a text message composed with a Badge. */
  children?: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Base style — every visual property binds to a Miro CSS custom property
// ---------------------------------------------------------------------------

const baseStyle: React.CSSProperties = {
  backgroundColor: 'var(--miro-primary)',
  color: 'var(--miro-on-primary)',
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--font-size-body-sm)',
  fontWeight: 'var(--font-weight-medium)',
  lineHeight: 1.5,
  padding: 'var(--space-sm) var(--space-md)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 'var(--space-sm)',
  boxSizing: 'border-box',
  width: '100%',
};

// ---------------------------------------------------------------------------
// PromoBanner component
// ---------------------------------------------------------------------------

/**
 * `PromoBanner` — sticky black promo strip for the Miro design system.
 *
 * Renders a full-width banner bar with the signature Miro dark ink background
 * (`--miro-primary`) and on-primary white text, padded per the `promo-banner`
 * contract (`--space-sm` vertical, `--space-md` horizontal). Content is
 * centered as a flex row with `--space-sm` gap between items.
 *
 * Designed to sit above the top navigation as a full-width announcement strip.
 * Typically composed with a yellow pill Badge inside for the CTA chip.
 *
 * Every visual property binds to a Miro design system CSS custom property —
 * no raw hex values, no hardcoded spacing.
 *
 * Per DESIGN.md: the brand-yellow pill is the approved treatment for inline
 * promo call-to-action chips within this banner. Use a Badge with inline
 * brand-yellow styling or a custom `<span>` with `--miro-brand-yellow`
 * background for the CTA pill.
 *
 * ```tsx
 * <PromoBanner>
 *   Convo'25 registration is open. Get up to 70% off on Annual
 *   <span
 *     style={{
 *       background: 'var(--miro-brand-yellow)',
 *       color: 'var(--miro-primary)',
 *       padding: '4px 10px',
 *       borderRadius: 'var(--radius-pill)',
 *       fontSize: 'var(--font-size-micro)',
 *       fontWeight: 'var(--font-weight-semibold)',
 *     }}
 *   >
 *     GET YOUR SPOT
 *   </span>
 * </PromoBanner>
 * ```
 */
export function PromoBanner({
  className,
  style,
  children,
  ...rest
}: PromoBannerProps) {
  return (
    <div
      className={className}
      style={{
        ...baseStyle,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

PromoBanner.displayName = 'PromoBanner';

export default PromoBanner;
