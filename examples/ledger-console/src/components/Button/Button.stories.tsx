import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = { title: 'Generated/Button', component: Button };
export default meta;
type S = StoryObj<typeof Button>;

export const Default: S = { args: { children: 'Primary action', variant: 'primary' } };
export const Primary: S = { args: { children: 'Primary action', variant: 'primary' } };
export const Secondary: S = { args: { children: 'Secondary action', variant: 'secondary' } };
export const Disabled: S = { args: { children: 'Disabled action', variant: 'primary', disabled: true } };
export const FocusVisible: S = {
  args: { children: 'Focus action', variant: 'primary' },
  parameters: { pseudo: { focusVisible: true } },
};
export const Hover: S = {
  args: { children: 'Hover action', variant: 'primary' },
  parameters: { pseudo: { hover: true } },
};
