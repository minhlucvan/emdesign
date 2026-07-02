import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Overview } from './Overview';
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

const meta = {
  title: 'Pages/Overview',
  component: Overview,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Overview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SectionNavigation: Story = {
  render: () => <OverviewNavigation />,
};

export const SectionHero: Story = {
  render: () => <OverviewHero />,
};

export const SectionColorpalette: Story = {
  render: () => <OverviewColorPalette />,
};

export const SectionTypography: Story = {
  render: () => <OverviewTypography />,
};

export const SectionButtonvariants: Story = {
  render: () => <OverviewButtonVariants />,
};

export const SectionCardscontainers: Story = {
  render: () => <OverviewCardsAndContainers />,
};

export const SectionCoralcalloutcard: Story = {
  render: () => <OverviewCoralCalloutCard />,
};

export const SectionConnectortilegrid: Story = {
  render: () => <OverviewConnectorTileGrid />,
};

export const SectionPricingtiers: Story = {
  render: () => <OverviewPricingTiers />,
};

export const SectionFormelements: Story = {
  render: () => <OverviewFormElements />,
};

export const SectionBadges: Story = {
  render: () => <OverviewBadges />,
};

export const SectionSpacingscale: Story = {
  render: () => <OverviewSpacingScale />,
};

export const SectionBorderradiusscale: Story = {
  render: () => <OverviewBorderRadiusScale />,
};

export const SectionElevationdepth: Story = {
  render: () => <OverviewElevationAndDepth />,
};

export const SectionResponsivebehavior: Story = {
  render: () => <OverviewResponsiveBehavior />,
};

export const SectionFooter: Story = {
  render: () => <OverviewFooter />,
};
