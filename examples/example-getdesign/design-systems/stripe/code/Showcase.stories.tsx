import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Divider } from './index';
import { HeroSection } from './Hero.stories';
import { ColorPaletteSection } from './ColorPalette.stories';
import { TypographySection } from './Typography.stories';
import { SpacingShapesSection } from './SpacingShapes.stories';
import { ComponentsSection } from './Components.stories';
import { DashboardMockupSection } from './DashboardMockup.stories';

/* ---- Full-page Design System Overview ---- */

export const DesignSystemOverview: React.FC = () => (
  <div
    style={{
      backgroundColor: 'var(--color-canvas)',
      color: 'var(--color-ink)',
      fontFamily: 'var(--font-sans)',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
      fontFeatureSettings: '"ss01"',
    }}
  >
    {/* Hero — gradient mesh + nav + headline + CTA + feature cards */}
    <HeroSection />

    {/* Section divider */}
    <div
      style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '0 var(--space-xxl)',
      }}
    >
      <Divider />
    </div>

    {/* Color Palette */}
    <ColorPaletteSection />

    {/* Section divider */}
    <div
      style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '0 var(--space-xxl)',
      }}
    >
      <Divider />
    </div>

    {/* Typography */}
    <TypographySection />

    {/* Section divider */}
    <div
      style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '0 var(--space-xxl)',
      }}
    >
      <Divider />
    </div>

    {/* Spacing, Shapes, Elevation */}
    <SpacingShapesSection />

    {/* Section divider */}
    <div
      style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '0 var(--space-xxl)',
      }}
    >
      <Divider />
    </div>

    {/* Components — buttons, cards, inputs, badges, layout */}
    <ComponentsSection />

    {/* Section divider */}
    <div
      style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '0 var(--space-xxl)',
      }}
    >
      <Divider />
    </div>

    {/* Dashboard Mockup — dark app surface */}
    <DashboardMockupSection />
  </div>
);

const meta: Meta = {
  title: 'Design System/stripe',
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => <DesignSystemOverview />,
};
