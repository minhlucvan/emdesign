import type { Meta, StoryObj } from '@storybook/react';
import { Select } from './Select';

const meta: Meta<typeof Select> = {
  title: 'Components/Select',
  component: Select,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    options: [
      { value: 'active', label: 'Active' },
      { value: 'pending', label: 'Pending' },
      { value: 'completed', label: 'Completed' },
    ],
    placeholder: 'Select status...',
  },
};

export const Disabled: Story = {
  args: {
    options: [
      { value: 'read', label: 'Read' },
      { value: 'write', label: 'Write' },
      { value: 'admin', label: 'Admin' },
    ],
    disabled: true,
  },
};
