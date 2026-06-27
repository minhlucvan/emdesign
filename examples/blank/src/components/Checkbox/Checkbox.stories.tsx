import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from './Checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox',
  component: Checkbox,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    checked: false,
    indeterminate: false,
    disabled: false,
    label: 'sample',
    className: 'sample',
  },
};

export const checkedVariant: Story = {
  args: {
    checked: true,
    indeterminate: false,
    disabled: false,
    label: 'sample',
    className: 'sample',
  },
  parameters: { charters: ['should render with checked=true'] },
};

export const indeterminateVariant: Story = {
  args: {
    checked: false,
    indeterminate: true,
    disabled: false,
    label: 'sample',
    className: 'sample',
  },
  parameters: { charters: ['should render with indeterminate=true'] },
};

export const disabledVariant: Story = {
  args: {
    checked: false,
    indeterminate: false,
    disabled: true,
    label: 'sample',
    className: 'sample',
  },
  parameters: { charters: ['should render with disabled=true'] },
};
