import type { Preview } from '@storybook/react';
import '../src/index.css';
import { charterDecorator } from '@emdesign/addon/charters/preview';

const preview: Preview = {
  parameters: {
    layout: 'centered',
    backgrounds: { disable: true },
  },
  decorators: [charterDecorator],
};
export default preview;
