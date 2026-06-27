import type { Preview } from '@storybook/react';
import '../src/index.css';
import { charterDecorator } from '@emdesign/addon/charters/preview';

/**
 * Global preview config. The active design system's tokens.css is imported by index.css,
 * so every story renders against the selected design system by construction.
 */
const preview: Preview = {
  parameters: {
    layout: 'centered',
    backgrounds: { disable: true }, // backgrounds come from the design system, not Storybook
  },
  decorators: [charterDecorator],
};

export default preview;
