import type { Meta, StoryObj } from '@storybook/react';
import { Breadcrumb } from './Breadcrumb';

const meta: Meta<typeof Breadcrumb> = {
  title: 'Components/Breadcrumb',
  component: Breadcrumb,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Products' },
      { label: 'Analytics' },
    ],
  },
};

export const ManyItems: Story = {
  args: {
    items: [
      { label: 'Dashboard' },
      { label: 'Analytics' },
      { label: 'Reports' },
      { label: 'Q2 2026' },
      { label: 'Revenue' },
    ],
    maxItems: 3,
  },
};
