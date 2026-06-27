import type { Preview } from '@storybook/react';
import '../src/index.css';

const preview: Preview = {
  parameters: {
    layout: 'centered',
    backgrounds: { disable: true },
    docs: { disable: true },
  },
  tags: ['!autodocs'],
};
export default preview;
