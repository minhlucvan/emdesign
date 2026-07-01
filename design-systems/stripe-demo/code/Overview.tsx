import React from 'react';
import { OverviewHeroBanner } from './OverviewHeroBanner';
import { OverviewColorPalette } from './OverviewColorPalette';
import { OverviewTypographyScale } from './OverviewTypographyScale';
import { OverviewButtonVariants } from './OverviewButtonVariants';
import { OverviewCardExamples } from './OverviewCardExamples';
import { OverviewFormElements } from './OverviewFormElements';
import { OverviewSpacingScale } from './OverviewSpacingScale';
import { OverviewBorderRadiusScale } from './OverviewBorderRadiusScale';
import { OverviewElevationAndDepth } from './OverviewElevationAndDepth';
import { OverviewResponsiveBehavior } from './OverviewResponsiveBehavior';
import { OverviewKitMirrorPricingTiers } from './OverviewKitMirrorPricingTiers';
import { OverviewFooter } from './OverviewFooter';

export interface OverviewProps {
  className?: string;
}

/**
 * Overview — Stripe-style design system landing page.
 * Composes all Overview* section components in document order.
 */
export function Overview({ className = '' }: OverviewProps) {
  return (
    <div className={className} style={{ background: 'var(--bg-surface)' }}>
      <OverviewHeroBanner />
      <OverviewColorPalette />
      <OverviewTypographyScale />
      <OverviewButtonVariants />
      <OverviewCardExamples />
      <OverviewFormElements />
      <OverviewSpacingScale />
      <OverviewBorderRadiusScale />
      <OverviewElevationAndDepth />
      <OverviewResponsiveBehavior />
      <OverviewKitMirrorPricingTiers />
      <OverviewFooter />
    </div>
  );
}
