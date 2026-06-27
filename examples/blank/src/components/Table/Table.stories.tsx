import type { Meta, StoryObj } from '@storybook/react';
import { Table } from './Table';

const meta: Meta<typeof Table> = {
  title: 'Components/Table',
  component: Table,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    columns: [
      { key: 'name', label: 'Name', sortable: true },
      { key: 'role', label: 'Role' },
      { key: 'status', label: 'Status' },
      { key: 'actions', label: '' },
    ],
    rows: [
      { name: 'Alice', role: 'Admin', status: 'Active' },
      { name: 'Bob', role: 'Editor', status: 'Active' },
      { name: 'Carol', role: 'Viewer', status: 'Inactive' },
    ],
  },
};
