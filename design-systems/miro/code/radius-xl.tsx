import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RadiusXlProps {
  /** Additional class names for custom styling. */
  className?: string;
  /** Additional inline styles. */
  style?: React.CSSProperties;
  /** Grid items — typically pricing cards or panel children. */
  children?: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Base style — every visual property binds to a Miro CSS custom property
// ---------------------------------------------------------------------------

const baseStyle: React.CSSProperties = {
  backgroundColor: 'var(--color-surface)',
  color: 'var(--color-text)',
  fontFamily: 'var(--font-sans)',
  borderRadius: 'var(--radius-xl)',
  padding: 'var(--space-section)',
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: 'var(--space-xl)',
  boxSizing: 'border-box',
  width: '100%',
};

// ---------------------------------------------------------------------------
// RadiusXl component
// ---------------------------------------------------------------------------

/**
 * `RadiusXl` — grid container with the Miro 16px border radius (`--radius-xl`).
 *
 * Renders a CSS Grid container with the signature Miro pricing-panel radius.
 * The `--radius-xl` token (16px) is the standard card-container corner radius,
 * used for pricing panels, card grids, and multi-column feature layouts that
 * need less prominence than the full 32px `--radius-feature` panels.
 *
 * The grid auto-fits columns with a 280px minimum, wrapping to the next row
 * when space narrows. Each child renders as a grid cell.
 *
 * Every visual property binds to a Miro design system CSS custom property —
 * no raw hex values, no hardcoded spacing.
 *
 * ```tsx
 * <RadiusXl>
 *   <PricingCard tier="starter" price="$0" />
 *   <PricingCard tier="team" price="$16" />
 *   <PricingCard tier="business" price="$40" />
 * </RadiusXl>
 *
 * <RadiusXl style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
 *   <FeatureCard icon={...} title="Integrations" />
 *   <FeatureCard icon={...} title="Templates" />
 *   <FeatureCard icon={...} title="Security" />
 * </RadiusXl>
 * ```
 */
export const RadiusXl: React.FC<RadiusXlProps> = ({
  className,
  style,
  children,
  ...rest
}) => {
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
};

RadiusXl.displayName = 'RadiusXl';

export default RadiusXl;
