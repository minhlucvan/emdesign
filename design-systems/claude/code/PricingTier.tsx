import React from 'react';
import { Button } from './Button';

export interface PricingTierProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Plan name (e.g. "Free", "Pro", "Team"). */
  name: string;
  /** Price text (e.g. "$0", "$30 / user"). */
  price: string;
  /** Feature list items displayed with checkmark bullets. */
  features: string[];
  /** Call-to-action button label. */
  cta: string;
  /** CTA variant — primary (coral) or secondary (cream outline). */
  ctaVariant?: 'primary' | 'secondary';
  /** Featured tier — applies dark navy surface background. */
  featured?: boolean;
  className?: string;
}

/** Pricing tier card — cream surface with hairline border, or dark navy for featured.
 *  Composes a plan name (title-lg), price (display-md), feature list with green
 *  checkmarks, and a full-width CTA button.
 *  The featured variant inverts the surface to --color-surface-dark with white
 *  hairline border and --color-on-dark text. */
export function PricingTier({
  name,
  price,
  features,
  cta,
  ctaVariant = 'secondary',
  featured = false,
  className = '',
  ...props
}: PricingTierProps) {
  return (
    <div
      className={
        (featured
          ? 'bg-[var(--color-surface-dark)] border border-[rgba(255,255,255,0.1)] text-[var(--color-on-dark)]'
          : 'bg-surface border border-border text-text') +
        ' rounded-lg p-8 ' +
        className
      }
      {...props}
    >
      <h4 className="font-[var(--font-sans)] text-[var(--text-title-lg)] font-[var(--text-title-lg-weight)] leading-[var(--text-title-lg-line)] mb-3">
        {name}
      </h4>
      <div className="font-[var(--font-display)] text-[var(--text-display-md)] font-[var(--text-display-md-weight)] leading-[var(--text-display-md-line)] tracking-[var(--text-display-md-tracking)] mb-4">
        {price}
      </div>
      <ul className="list-none p-0 m-0 mb-6 space-y-0 text-sm">
        {features.map((feature, i) => (
          <li
            key={i}
            className={
              'flex items-start gap-2 py-1.5 ' +
              'before:content-["✓"] before:text-[var(--color-success)] before:font-semibold ' +
              (featured ? 'text-[var(--color-on-dark-soft)]' : 'text-text')
            }
          >
            {feature}
          </li>
        ))}
      </ul>
      <Button variant={ctaVariant} className="w-full">
        {cta}
      </Button>
    </div>
  );
}
