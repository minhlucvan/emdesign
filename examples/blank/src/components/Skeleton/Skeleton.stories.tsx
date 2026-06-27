import type { Meta, StoryObj } from '@storybook/react';
import { Skeleton } from './Skeleton';

const meta: Meta<typeof Skeleton> = {
  title: 'Components/Skeleton',
  component: Skeleton,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: 'text',
    count: 3,
  },
};

export const Card: Story = {
  args: {
    variant: 'card',
    count: 1,
    width: '300px',
    height: '120px',
  },
};
