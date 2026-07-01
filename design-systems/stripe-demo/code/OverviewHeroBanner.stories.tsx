import React, { useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { OverviewHeroBanner } from './OverviewHeroBanner';

/**
 * Ensures Inter font is loaded so text renders matching the reference.
 */
function withFonts(Story: React.ComponentType) {
  useEffect(() => {
    if (!document.querySelector('link[href*="Inter"]')) {
      const link = document.createElement('link');
      link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
  }, []);
  return <Story />;
}

const meta = {
  title: 'Pages/Overview',
  component: OverviewHeroBanner,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  decorators: [withFonts],
} satisfies Meta<typeof OverviewHeroBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SectionHerobanner: Story = {};
