import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { OverviewFooter } from './OverviewFooter';

/**
 * Ensures Inter font is loaded so text renders matching the reference.
 * Uses a synchronous <link> element so Playwright's networkidle waits for the
 * font CSS to load before taking the visual diff screenshot.
 */
function withFonts(Story: React.ComponentType) {
  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700&display=swap"
        rel="stylesheet"
      />
      <Story />
    </>
  );
}

const meta = {
  title: 'Pages/Overview',
  component: OverviewFooter,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  decorators: [withFonts],
} satisfies Meta<typeof OverviewFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SectionFooter: Story = {};
