import type { Meta, StoryObj } from '@storybook/react';
import { Modal } from './Modal';

const meta: Meta<typeof Modal> = {
  title: 'Components/Modal',
  component: Modal,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    open: false,
    title: 'sample',
    children: undefined,
    footer: undefined,
    closeOnOverlay: false,
    className: 'sample',
  },
};

export const open: Story = {
  args: {
    open: true,
    title: 'sample',
    children: undefined,
    footer: undefined,
    closeOnOverlay: false,
    className: 'sample',
  },
  parameters: { charters: ['should render with open=true'] },
};

export const closeOnOverlay: Story = {
  args: {
    open: false,
    title: 'sample',
    children: undefined,
    footer: undefined,
    closeOnOverlay: true,
    className: 'sample',
  },
  parameters: { charters: ['should render with closeOnOverlay=true'] },
};
