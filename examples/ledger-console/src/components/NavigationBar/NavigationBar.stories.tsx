import type { Meta, StoryObj } from '@storybook/react';
import { NavigationBar } from './NavigationBar';

const meta: Meta<typeof NavigationBar> = {
  title: 'Generated/NavigationBar',
  component: NavigationBar,
  tags: ['autodocs'],
  args: {
    brand: 'Digits',
    ctaLabel: 'GET STARTED',
  },
  argTypes: {
    brand: { control: 'text' },
    ctaLabel: { control: 'text' },
    onCtaClick: { action: 'cta-clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof NavigationBar>;

export const Default: Story = {};

export const CustomLabels: Story = {
  args: { brand: 'Ledger Console', ctaLabel: 'SEND PAYMENT' },
};

export const Minimal: Story = {
  args: { navLinks: [] },
};
