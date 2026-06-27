import type { Meta, StoryObj } from '@storybook/react';
import { FormField } from './FormField';

const meta: Meta<typeof FormField> = {
  title: 'Components/FormField',
  component: FormField,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'sample',
    required: false,
    error: 'sample',
    helperText: 'sample',
    children: undefined,
    className: 'sample',
  },
};

export const required: Story = {
  args: {
    label: 'sample',
    required: true,
    error: 'sample',
    helperText: 'sample',
    children: undefined,
    className: 'sample',
  },
  parameters: { charters: ['should render with required=true'] },
};
