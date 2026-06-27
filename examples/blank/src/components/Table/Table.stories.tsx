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
    columns: undefined,
    rows: undefined,
    sortKey: 'sample',
    key: 'sample',
    row: undefined,
    className: 'sample',
  },
};


