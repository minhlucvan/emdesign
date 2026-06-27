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
    options: undefined,
    value: 'sample',
    value: 'sample',
    placeholder: 'sample',
    disabled: false,
    error: 'sample',
    className: 'sample',
  },
};

export const disabled: Story = {
  args: {
    options: undefined,
    value: 'sample',
    value: 'sample',
    placeholder: 'sample',
    disabled: true,
    error: 'sample',
    className: 'sample',
  },
  parameters: { charters: ['should render with disabled=true'] },
};
