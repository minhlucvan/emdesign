import React from 'react';
import { Card } from './Card';

/* ---- Shared inline styles matching reference-example.html section#cards CSS ---- */

const displayFont = "'Inter', 'Sohne', 'SF Pro Display', system-ui, sans-serif";
const bodyFont = "'Inter', system-ui, sans-serif";

const primary = '#533afd';
const ink = '#0d253d';
const muted = '#64748d';
const hairline = '#e3e8ee';
const canvas = '#ffffff';
const featuredFg = '#ffffff';

const h3style: React.CSSProperties = {
  fontFamily: displayFont,
  fontSize: '24px',
  fontWeight: 700,
  margin: '0 0 8px',
  letterSpacing: '-0.1px',
};
const priceStyle: React.CSSProperties = {
  fontFamily: displayFont,
  fontSize: '50px',
  fontWeight: 700,
  lineHeight: 1.12,
  margin: '8px 0 16px',
  letterSpacing: '-0.6px',
};
const pStyle: React.CSSProperties = {
  fontSize: '16px',
  lineHeight: 1.55,
  margin: '0 0 16px',
  color: 'inherit',
};
const ulStyle: React.CSSProperties = {
  listStyle: 'none',
  padding: 0,
  margin: '16px 0',
  fontSize: '14px',
  lineHeight: 1.8,
  color: 'inherit',
};
const liStyle: React.CSSProperties = {
  padding: 0,
  margin: 0,
};

const s: Record<string, React.CSSProperties> = {
  section: {
    padding: '96px 48px',
    maxWidth: '1440px',
    margin: '0 auto',
    borderTop: `1px solid ${hairline}`,
    fontFamily: bodyFont,
    color: ink,
    backgroundColor: canvas,
    WebkitFontSmoothing: 'antialiased',
    boxSizing: 'border-box',
  },
  eyebrow: {
    fontFamily: bodyFont,
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '0.96px',
    textTransform: 'uppercase',
    color: muted,
    margin: '0 0 12px',
  },
  heading: {
    fontFamily: displayFont,
    fontSize: '50px',
    fontWeight: 700,
    letterSpacing: '-0.6px',
    lineHeight: 1.12,
    color: ink,
    margin: '0 0 16px',
  },
  sub: {
    fontFamily: bodyFont,
    fontSize: '18px',
    color: ink,
    maxWidth: '720px',
    margin: '0 0 48px',
    lineHeight: 1.55,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '24px',
  },
};

/* ---- Data ---- */

interface CardEntry {
  variant: 'pricing-light' | 'pricing-featured' | 'feature-alt';
  title: string;
  price: string;
  description: string;
  features: string[];
}

const cardEntries: CardEntry[] = [
  {
    variant: 'pricing-light',
    title: 'Starter',
    price: '$0',
    description: 'Get started with basic payment processing for small businesses.',
    features: ['Up to $1M in revenue', 'Standard reporting', 'Email support'],
  },
  {
    variant: 'pricing-featured',
    title: 'Growth',
    price: '$299',
    description: 'Scale your business with advanced features and priority support.',
    features: ['Unlimited revenue', 'Advanced reporting', 'Priority support', 'Dedicated manager'],
  },
  {
    variant: 'feature-alt',
    title: 'Enterprise',
    price: 'Custom',
    description: 'Tailored solutions for large organizations with custom needs.',
    features: ['Custom pricing', 'Dedicated infrastructure', '24/7 phone support', 'SLA guarantee'],
  },
];

/* ---- Sub-components ---- */

function PricingCardItem({ variant, title, price, description, features }: CardEntry) {
  const finalPriceStyle: React.CSSProperties = {
    ...priceStyle,
    color: variant === 'pricing-featured' ? featuredFg : ink,
  };

  const checkColor = variant === 'pricing-featured' ? featuredFg : primary;

  return (
    <Card variant={variant} style={{ '--check-color': checkColor } as React.CSSProperties}>
      <h3 style={h3style}>{title}</h3>
      <div style={finalPriceStyle}>{price}</div>
      <p style={pStyle}>{description}</p>
      <ul style={ulStyle}>
        {features.map((feat, i) => (
          <li key={i} style={liStyle}>{feat}</li>
        ))}
      </ul>
    </Card>
  );
}

/* ---- Export ---- */

export interface OverviewKitMirrorPricingTiersProps {
  className?: string;
}

/**
 * OverviewKitMirrorPricingTiers — Stripe-inspired pricing tiers section.
 * Uses inline styles to match reference-example.html section#cards computed values.
 * Renders three pricing tiers (Starter, Growth, Enterprise) in a responsive grid.
 * Mirrors the pricing cards from the design kit with light, featured, and alt treatments.
 */
export function OverviewKitMirrorPricingTiers({ className = '' }: OverviewKitMirrorPricingTiersProps) {
  return (
    <section id="kit-mirror-pricing-tiers" className={'ex-section' + (className ? ' ' + className : '')} style={s.section}>
      <style>{`#kit-mirror-pricing-tiers .card-grid li::before{content:"✓ ";font-weight:700;color:var(--check-color,#533afd)}`}</style>
      <p style={s.eyebrow}>04 &mdash; Cards</p>
      <h2 style={s.heading}>Card Examples</h2>
      <p style={s.sub}>
        Pricing tiers and feature cards with light, alt, and featured treatments.
      </p>

      <div style={s.grid} className="card-grid">
        {cardEntries.map((card) => (
          <PricingCardItem key={card.title} {...card} />
        ))}
      </div>
    </section>
  );
}
