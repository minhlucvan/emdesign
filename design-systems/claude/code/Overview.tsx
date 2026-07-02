import React from 'react';
import { OverviewNavigation } from './OverviewNavigation';
import { OverviewHero } from './OverviewHero';
import { OverviewColorPalette } from './OverviewColorPalette';
import { OverviewTypography } from './OverviewTypography';
import { OverviewButtonVariants } from './OverviewButton Variants';
import { OverviewCardsAndContainers } from './OverviewCards & Containers';
import { OverviewCoralCalloutCard } from './OverviewCoral Callout Card';
import { OverviewConnectorTileGrid } from './OverviewConnector Tile Grid';
import { OverviewPricingTiers } from './OverviewPricingTiers';
import { OverviewFormElements } from './OverviewForm Elements';
import { OverviewBadges } from './OverviewBadges';
import { OverviewSpacingScale } from './OverviewSpacing Scale';
import { OverviewBorderRadiusScale } from './OverviewBorder Radius Scale';
import { OverviewElevationAndDepth } from './OverviewElevation & Depth';
import { OverviewResponsiveBehavior } from './OverviewResponsive Behavior';
import { OverviewFooter } from './OverviewFooter';

export interface OverviewProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

/** Full overview page for the Claude design system — warm-canvas editorial interface.
 *  Matches the reference-example.html layout:
 *  Font family: var(--font-sans) (Inter/StyreneB) at 14px body, var(--font-display) headlines.
 *  Background: var(--color-surface) (cream #faf9f5).
 *  Text: var(--color-text) for headings, var(--color-body) for body. */
export function Overview({ className = '', ...props }: OverviewProps) {
  return (
    <div
      style={{
        fontFamily: 'Inter, -apple-system, sans-serif',
        fontSize: '14px',
        lineHeight: '1.55',
        color: 'var(--color-body)',
        background: 'var(--color-surface)',
        minHeight: '100vh',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      }}
      {...props}
    >
      <OverviewNavigation />
      <OverviewHero />
      <OverviewColorPalette />
      <OverviewTypography />
      <OverviewButtonVariants />
      <OverviewCardsAndContainers />
      <OverviewCoralCalloutCard />
      <OverviewConnectorTileGrid />
      <OverviewPricingTiers />
      <OverviewFormElements />
      <OverviewBadges />
      <OverviewSpacingScale />
      <OverviewBorderRadiusScale />
      <OverviewElevationAndDepth />
      <OverviewResponsiveBehavior />
      <OverviewFooter />
    </div>
  );
}
