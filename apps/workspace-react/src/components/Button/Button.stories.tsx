import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Generated/Button',
  component: Button,
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'danger'],
    },
    size: {
      control: 'select',
      options: ['default', 'small'],
    },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
    children: { control: 'text' },
  },
};

export default meta;

/** Default story (base name, no variant suffix) — used by visual-test runner. */
export const Default: StoryObj<typeof Button> = {
  args: {
    variant: 'primary',
    children: 'Click me',
  },
};

export const Primary: StoryObj<typeof Button> = {
  args: {
    variant: 'primary',
    children: 'Continue',
  },
};

export const Secondary: StoryObj<typeof Button> = {
  args: {
    variant: 'secondary',
    children: 'Cancel',
  },
};

export const Danger: StoryObj<typeof Button> = {
  args: {
    variant: 'danger',
    children: 'Delete item',
  },
};

export const Small: StoryObj<typeof Button> = {
  args: {
    variant: 'secondary',
    size: 'small',
    children: 'Edit',
  },
};

export const Disabled: StoryObj<typeof Button> = {
  args: {
    variant: 'primary',
    disabled: true,
    children: 'Submit',
  },
};

export const Loading: StoryObj<typeof Button> = {
  args: {
    variant: 'primary',
    loading: true,
    children: 'Saving...',
  },
};

export const SmallPrimary: StoryObj<typeof Button> = {
  args: {
    variant: 'primary',
    size: 'small',
    children: 'Confirm',
  },
};

export const DangerDisabled: StoryObj<typeof Button> = {
  args: {
    variant: 'danger',
    disabled: true,
    children: 'Delete',
  },
};
