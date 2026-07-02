import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

/*
 * Import each section's default meta to access its React component.
 * Every section story file exports { title, component } as default.
 */
import HeroMeta from './Hero.stories';
import ColorPaletteMeta from './ColorPalette.stories';
import TypographyMeta from './Typography.stories';
import ComponentDemosMeta from './ComponentDemos.stories';
import ColorBlocksMeta from './ColorBlocks.stories';
import CardsAndContainersMeta from './CardsAndContainers.stories';
import FormElementsMeta from './FormElements.stories';
import SpacingScaleMeta from './SpacingScale.stories';
import RadiusScaleMeta from './RadiusScale.stories';
import ElevationMeta from './Elevation.stories';
import ResponsiveMeta from './Responsive.stories';
import FooterMeta from './Footer.stories';

/* ---- Extract each section's component from its meta ---- */

const Hero = HeroMeta.component as React.FC;
const ColorPalette = ColorPaletteMeta.component as React.FC;
const Typography = TypographyMeta.component as React.FC;
const ComponentDemos = ComponentDemosMeta.component as React.FC;
const ColorBlocks = ColorBlocksMeta.component as React.FC;
const CardsAndContainers = CardsAndContainersMeta.component as React.FC;
const FormElements = FormElementsMeta.component as React.FC;
const SpacingScale = SpacingScaleMeta.component as React.FC;
const RadiusScale = RadiusScaleMeta.component as React.FC;
const Elevation = ElevationMeta.component as React.FC;
const Responsive = ResponsiveMeta.component as React.FC;
const Footer = FooterMeta.component as React.FC;

/* ====================================================================
 * Showcase — Full-Page Composition
 *
 * Arranges every section in the order matching reference-example.html:
 *   Hero (sticky nav + hero header)
 *   Color Palette       (01)
 *   Typography          (02)
 *   Component Demos     (03 — Buttons)
 *   Color Blocks        (04)
 *   Cards & Containers  (05)
 *   Form Elements       (06)
 *   Spacing Scale       (07)
 *   Border Radius Scale (08)
 *   Elevation & Depth   (09)
 *   Responsive Behavior (10)
 *   Footer
 *
 * All styling uses var(--token-*) — no raw hex values.
 * ==================================================================== */

const Showcase: React.FC = () => {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        minHeight: '100vh',
      }}
    >
      <Hero />
      <ColorPalette />
      <Typography />
      <ComponentDemos />
      <ColorBlocks />
      <CardsAndContainers />
      <FormElements />
      <SpacingScale />
      <RadiusScale />
      <Elevation />
      <Responsive />
      <Footer />
    </div>
  );
};

Showcase.displayName = 'Showcase';

/* ---- Storybook metadata ---- */

const meta: Meta<typeof Showcase> = {
  title: 'Design System/figma',
  component: Showcase,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof Showcase>;

export const Overview: Story = {};
