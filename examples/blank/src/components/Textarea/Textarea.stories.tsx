import type { Meta, StoryObj } from '@storybook/react';
import { Textarea } from './Textarea';

const meta: Meta<typeof Textarea> = {
  title: 'Components/Textarea',
  component: Textarea,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'sample',
    value: 'sample',
    e: undefined,
    placeholder: 'sample',
    error: 'sample',
    disabled: false,
    rows: 0,
    maxLength: 0,
    className: 'sample',
  },
};

export const disabled: Story = {
  args: {
    label: 'sample',
    value: 'sample',
    e: undefined,
    placeholder: 'sample',
    error: 'sample',
    disabled: true,
    rows: 0,
    maxLength: 0,
    className: 'sample',
  },
  parameters: { charters: ['should render with disabled=true'] },
};
