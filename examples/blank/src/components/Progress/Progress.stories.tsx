import type { Meta, StoryObj } from '@storybook/react';
import { Progress } from './Progress';

const meta: Meta<typeof Progress> = {
  title: 'Components/Progress',
  component: Progress,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 0,
    variant: undefined,
    showLabel: false,
    className: 'sample',
  },
};

export const showLabel: Story = {
  args: {
    value: 0,
    variant: undefined,
    showLabel: true,
    className: 'sample',
  },
  parameters: { charters: ['should render with showLabel=true'] },
};
