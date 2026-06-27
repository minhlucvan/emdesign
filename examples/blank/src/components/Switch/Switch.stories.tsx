import type { Meta, StoryObj } from '@storybook/react';
import { Switch } from './Switch';

const meta: Meta<typeof Switch> = {
  title: 'Components/Switch',
  component: Switch,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    checked: false,
    disabled: false,
    label: 'sample',
    className: 'sample',
  },
};

export const checkedVariant: Story = {
  args: {
    checked: true,
    disabled: false,
    label: 'sample',
    className: 'sample',
  },
  parameters: { charters: ['should render with checked=true'] },
};

export const disabledVariant: Story = {
  args: {
    checked: false,
    disabled: true,
    label: 'sample',
    className: 'sample',
  },
  parameters: { charters: ['should render with disabled=true'] },
};
