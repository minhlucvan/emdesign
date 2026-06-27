import type { Meta, StoryObj } from '@storybook/react';
import { Tabs } from './Tabs';

const meta: Meta<typeof Tabs> = {
  title: 'Components/Tabs',
  component: Tabs,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    tabs: [
      { id: 'overview', label: 'Overview' },
      { id: 'analytics', label: 'Analytics', badge: '12' },
      { id: 'settings', label: 'Settings' },
    ],
    activeTab: 'overview',
  },
};

export const PillVariant: Story = {
  args: {
    tabs: [
      { id: 'day', label: 'Day' },
      { id: 'week', label: 'Week' },
      { id: 'month', label: 'Month' },
    ],
    activeTab: 'week',
    variant: 'pills',
  },
};
