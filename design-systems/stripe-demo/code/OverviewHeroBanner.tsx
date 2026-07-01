import React from 'react';
import { Button } from './Button';

export interface OverviewHeroBannerProps {
  headline?: string;
  description?: string;
  primaryCta?: string;
  secondaryCta?: string;
  className?: string;
}

/**
 * OverviewHeroBanner — Stripe-inspired hero banner.
 * Uses inline styles to match reference-example.html header.hero computed values.
 * Includes fontFamily and display to match the reference CSS exactly.
 */
export function OverviewHeroBanner({
  headline = 'Design System Analysis of Stripi',
  description = 'An inspired interpretation of Stripi\'s design language — a financial-infrastructure brand built on a deep navy ink, electric indigo primary, and a recurring gradient mesh on every marketing hero. Sohne thin (300) display with negative letter-spacing; tabular-figure body for money cells.',
  primaryCta = 'Get started',
  secondaryCta = 'Talk to sales',
  className = '',
}: OverviewHeroBannerProps) {
  const bodyFont = "'Inter', system-ui, sans-serif";
  const displayFont = "'Inter', 'Sohne', 'SF Pro Display', system-ui, sans-serif";
  const ink = '#0d253d';

  return (
    <header
      className={className}
      style={{
        padding: '96px 48px',
        maxWidth: '1440px',
        margin: '0 auto',
        display: 'block',
        background: 'linear-gradient(120deg, #fff0e6 0%, #f4ede4 25%, #f9f0ff 50%, #e9d8ff 75%, #d8e6e0 100%)',
      }}
    >
      <div style={{ maxWidth: '1200px' }}>
        <h1
          style={{
            fontFamily: displayFont,
            fontSize: '56px',
            fontWeight: 300,
            lineHeight: 1.12,
            color: ink,
            margin: '0 0 32px',
            letterSpacing: '-1.4px',
          }}
        >
          {headline}
        </h1>

        <p
          style={{
            fontFamily: bodyFont,
            fontSize: '18px',
            color: ink,
            maxWidth: '720px',
            margin: '0 0 40px',
            lineHeight: 1.55,
          }}
        >
          {description}
        </p>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Button variant="primary">{primaryCta}</Button>
          <Button variant="secondary">{secondaryCta}</Button>
        </div>
      </div>
    </header>
  );
}
