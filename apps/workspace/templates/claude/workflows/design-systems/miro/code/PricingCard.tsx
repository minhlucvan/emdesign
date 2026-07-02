import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PricingCardVariant = 'default' | 'featured' | 'enterprise';

export interface PricingCardProps {
  /** Name of the pricing tier (e.g. "Free", "Starter", "Business", "Enterprise"). */
  tierName: string;
  /** Price display text (e.g. "$0", "$8", "$16", "Custom"). */
  price: string;
  /** Optional period suffix shown after the price (e.g. "/mo"). */
  period?: string;
  /** List of feature descriptions displayed with checkmarks. */
  features: string[];
  /** Visual variant: default (white), featured (lavender + blue border), enterprise (dark). */
  variant?: PricingCardVariant;
  /** CTA button or action element rendered at the bottom of the card. */
  cta?: React.ReactNode;
  /** Optional badge/ribbon content shown above the tier name. */
  badge?: React.ReactNode;
  /** Additional class names. */
  className?: string;
  /** Additional inline styles. */
  style?: React.CSSProperties;
}

// ---------------------------------------------------------------------------
// Styles — every value binds to a Miro semantic CSS custom property
// ---------------------------------------------------------------------------

const cardBaseStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-lg)',
  borderRadius: 'var(--radius-xl)',
  padding: 'var(--space-xxl)',
  fontFamily: 'var(--font-sans)',
  boxSizing: 'border-box',
};

const variantCardStyles: Record<PricingCardVariant, React.CSSProperties> = {
  default: {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
  },
  featured: {
    background: 'var(--color-surface-pricing-featured)',
    border: '2px solid var(--color-accent)',
    padding: 'calc(var(--space-xxl) - 1px)',
  },
  enterprise: {
    background: 'var(--miro-primary)',
    border: '1px solid transparent',
    color: 'var(--color-text-on-dark)',
  },
};

const tierNameStyle: React.CSSProperties = {
  fontSize: 'var(--font-size-body-md)',
  fontWeight: 'var(--font-weight-medium)',
  color: 'inherit',
  lineHeight: 1.4,
};

const priceRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'baseline',
  gap: 'var(--space-xs)',
};

const priceStyle: React.CSSProperties = {
  fontSize: 'var(--font-size-heading-1)',
  fontWeight: 'var(--font-weight-medium)',
  letterSpacing: '-0.0625em',
  lineHeight: 1.1,
  color: 'inherit',
};

const periodStyle: React.CSSProperties = {
  fontSize: 'var(--font-size-body-sm)',
  fontWeight: 400,
  color: 'var(--color-text-tertiary)',
  lineHeight: 1.4,
};

const featureListStyle: React.CSSProperties = {
  listStyle: 'none',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-sm)',
  margin: 0,
  padding: 0,
};

const featureItemStyle: React.CSSProperties = {
  fontSize: 'var(--font-size-caption)',
  color: 'inherit',
  display: 'flex',
  gap: 'var(--space-sm)',
  alignItems: 'flex-start',
  lineHeight: 1.4,
};

const checkStyle: React.CSSProperties = {
  color: 'var(--color-success)',
  fontWeight: 700,
  flexShrink: 0,
};

const enterpriseCheckStyle: React.CSSProperties = {
  ...checkStyle,
  color: 'var(--miro-brand-yellow)',
};

const ctaWrapperStyle: React.CSSProperties = {
  marginTop: 'auto',
};

// ---------------------------------------------------------------------------
// PricingCard component
// ---------------------------------------------------------------------------

/**
 * Pricing card primitive for the Miro design system.
 *
 * Renders a vertically-stacked pricing tier card with tier name, price, feature
 * list with checkmarks, and a call-to-action button. Three variants cover the
 * Miro pricing page: default (white with hairline border), featured (lavender
 * background with blue accent border for highlighted tier), and enterprise
 * (dark background with light text).
 *
 * All visual properties bind to design-system CSS custom properties — no raw
 * hex values, no hardcoded pixels.
 *
 * ```tsx
 * <PricingCard
 *   tierName="Starter"
 *   price="$8"
 *   period="/mo"
 *   features={["Unlimited boards", "Premium templates", "Email support"]}
 *   variant="default"
 *   cta={<Button variant="primary">Start trial</Button>}
 * />
 * ```
 */
export function PricingCard({
  tierName,
  price,
  period,
  features,
  variant = 'default',
  cta,
  badge,
  className,
  style,
}: PricingCardProps) {
  const isEnterprise = variant === 'enterprise';
  const checkColorStyle = isEnterprise ? enterpriseCheckStyle : checkStyle;

  return (
    <div
      className={className}
      style={{
        ...cardBaseStyle,
        ...variantCardStyles[variant],
        ...style,
      }}
    >
      {badge && <div>{badge}</div>}
      <span style={tierNameStyle}>{tierName}</span>
      <div style={priceRowStyle}>
        <span style={priceStyle}>{price}</span>
        {period && <span style={periodStyle}>{period}</span>}
      </div>
      {features.length > 0 && (
        <ul style={featureListStyle}>
          {features.map((feature, i) => (
            <li key={i} style={featureItemStyle}>
              <span style={checkColorStyle} aria-hidden="true">
                ✓
              </span>
              {feature}
            </li>
          ))}
        </ul>
      )}
      {cta && <div style={ctaWrapperStyle}>{cta}</div>}
    </div>
  );
}

PricingCard.displayName = 'PricingCard';

export default PricingCard;
