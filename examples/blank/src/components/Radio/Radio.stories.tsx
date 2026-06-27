import type { Meta, StoryObj } from '@storybook/react';
import { Radio } from './Radio';

const meta: Meta<typeof Radio> = {
  title: 'Components/Radio',
  component: Radio,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    options: [{ value: 'monthly', label: 'Monthly' }, { value: 'yearly', label: 'Yearly' }],
    value: 'monthly',
  },
};

export const Disabled: Story = {
  args: {
    options: [{ value: 'free', label: 'Free' }, { value: 'pro', label: 'Pro' }, { value: 'enterprise', label: 'Enterprise' }],
    value: 'pro',
    disabled: true,
  },
};
