import type { Meta, StoryObj } from '@storybook/react';
import { Dropdown } from './Dropdown';

const meta: Meta<typeof Dropdown> = {
  title: 'Components/Dropdown',
  component: Dropdown,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    trigger: 'Actions',
    items: [
      { label: 'Edit', value: 'edit' },
      { label: 'Duplicate', value: 'duplicate' },
      { label: 'Delete', value: 'delete', disabled: true },
    ],
  },
};

export const WithIcons: Story = {
  args: {
    trigger: 'Menu',
    items: [
      { label: 'Settings', value: 'settings' },
      { label: 'Help', value: 'help' },
      { label: 'Sign out', value: 'signout' },
    ],
  },
};
