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
    open: true,
    title: 'Confirm Delete',
    children: 'Are you sure you want to delete this item? This action cannot be undone.',
    closeOnOverlay: false,
  },
};

export const WithFooter: Story = {
  args: {
    open: true,
    title: 'Save Changes',
    children: 'You have unsaved changes. Do you want to save before leaving?',
    footer: 'Cancel  Save',
    closeOnOverlay: false,
  },
};

export const closeOnOverlay: Story = {
  args: {
    open: true,
    title: 'Dismissible Dialog',
    children: 'Click outside or press Escape to close.',
    closeOnOverlay: true,
  },
};
