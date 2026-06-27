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
    options: undefined,
    value: 'sample',
    value: 'sample',
    disabled: false,
    className: 'sample',
  },
};

export const disabled: Story = {
  args: {
    options: undefined,
    value: 'sample',
    value: 'sample',
    disabled: true,
    className: 'sample',
  },
  parameters: { charters: ['should render with disabled=true'] },
};
