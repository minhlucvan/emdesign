import type { Meta, StoryObj } from '@storybook/react';
import { StatsCard } from './StatsCard';

const meta: Meta<typeof StatsCard> = {
  title: 'Components/StatsCard',
  component: StatsCard,
};
export default meta;
type Story = StoryObj<typeof StatsCard>;

export const Default: Story = {
  args: {
    label: 'Total Revenue',
    value: '$48,250',
    trend: 'up',
    trendLabel: '12.5% from last month',
  },
};

export const Down: Story = {
  args: {
    label: 'Bounce Rate',
    value: '24.3%',
    trend: 'down',
    trendLabel: '3.2% increase',
  },
};
