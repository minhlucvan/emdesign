import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Stack, Heading, Text, Swatch } from './index';

/* ---- Color data ---- */

interface ColorInfo {
  token: string;
  hex: string;
  label: string;
  description: string;
}

interface ColorCategory {
  name: string;
  colors: ColorInfo[];
}

const colorCategories: ColorCategory[] = [
  {
    name: 'Brand & Accent',
    colors: [
      {
        token: '--color-primary',
        hex: '#000000',
        label: 'Primary',
        description: 'System primary — every CTA, selected states',
      },
      {
        token: '--color-on-primary',
        hex: '#ffffff',
        label: 'On Primary',
        description: 'Inverse text on black surfaces',
      },
      {
        token: '--color-accent-magenta',
        hex: '#ff3d8b',
        label: 'Magenta Promo',
        description: 'Single promotional CTA color',
      },
    ],
  },
  {
    name: 'Surface',
    colors: [
      {
        token: '--color-canvas',
        hex: '#ffffff',
        label: 'Canvas',
        description: 'Default page background',
      },
      {
        token: '--color-inverse-canvas',
        hex: '#000000',
        label: 'Inverse Canvas',
        description: 'Footer and marquee background',
      },
      {
        token: '--color-surface-soft',
        hex: '#f7f7f5',
        label: 'Surface Soft',
        description: 'Off-white tile background',
      },
      {
        token: '--color-hairline',
        hex: '#e6e6e6',
        label: 'Hairline',
        description: '1px borders on cards and inputs',
      },
      {
        token: '--color-hairline-soft',
        hex: '#f1f1f1',
        label: 'Hairline Soft',
        description: 'Subtle row separators',
      },
      {
        token: '--color-block-lime',
        hex: '#dceeb1',
        label: 'Block Lime',
        description: 'Systems / FAQ / contact block',
      },
      {
        token: '--color-block-lilac',
        hex: '#c5b0f4',
        label: 'Block Lilac',
        description: 'Hero block on /design/',
      },
      {
        token: '--color-block-cream',
        hex: '#f4ecd6',
        label: 'Block Cream',
        description: 'FigJam hero background',
      },
      {
        token: '--color-block-mint',
        hex: '#c8e6cd',
        label: 'Block Mint',
        description: 'FigJam pastel section',
      },
      {
        token: '--color-block-pink',
        hex: '#efd4d4',
        label: 'Block Pink',
        description: 'FigJam pastel section',
      },
      {
        token: '--color-block-coral',
        hex: '#f3c9b6',
        label: 'Block Coral',
        description: 'Home ship-products story block',
      },
      {
        token: '--color-block-navy',
        hex: '#1f1d3d',
        label: 'Block Navy',
        description: 'Deep indigo story block',
      },
    ],
  },
  {
    name: 'Text',
    colors: [
      {
        token: '--color-ink',
        hex: '#000000',
        label: 'Ink',
        description: 'All type on light surfaces',
      },
      {
        token: '--color-inverse-ink',
        hex: '#ffffff',
        label: 'Inverse Ink',
        description: 'Type on dark surfaces',
      },
      {
        token: '--color-on-inverse-soft',
        hex: '#ffffff',
        label: 'On-Inverse Soft',
        description: 'Translucent white on dark sections',
      },
    ],
  },
  {
    name: 'Semantic',
    colors: [
      {
        token: '--color-semantic-success',
        hex: '#1ea64a',
        label: 'Success Green',
        description: 'Comparison checkmark glyph fill',
      },
      {
        token: '--color-overlay-scrim',
        hex: '#000000',
        label: 'Overlay Scrim',
        description: 'Scrim behind modal overlays',
      },
    ],
  },
];

/* ---- Component ---- */

const ColorPalette: React.FC = () => {
  return (
    <Stack gap="xxl" style={{ maxWidth: '1280px', padding: 'var(--spacing-section)' }}>
      {/* Section eyebrow — mono uppercase using typography.eyebrow tokens */}
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--font-size-eyebrow)',
          fontWeight: 'var(--font-weight-eyebrow)',
          lineHeight: 'var(--line-height-eyebrow)',
          letterSpacing: 'var(--letter-spacing-eyebrow)',
          textTransform: 'uppercase',
          color: 'var(--color-ink)',
          fontFeatureSettings: '"kern"',
        }}
      >
        01 — Color Palette
      </span>

      {/* Section heading */}
      <Heading level={2}>Palette</Heading>

      {/* Color categories */}
      {colorCategories.map((category) => (
        <Stack gap="lg" key={category.name}>
          {/* Category label — mono uppercase caption */}
          <Text variant="caption">{category.name}</Text>

          {/* Swatch grid — responsive auto-fill */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fill, minmax(130px, 1fr))',
              gap: 'var(--spacing-lg)',
            }}
          >
            {category.colors.map((color) => (
              <Stack gap="xxs" align="center" key={color.token}>
                <Swatch
                  token={color.token}
                  label={color.label}
                  hex={color.hex}
                />
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--font-size-caption)',
                    color: 'var(--color-ink)',
                    textAlign: 'center',
                    maxWidth: '120px',
                    opacity: 0.65,
                    lineHeight: '1.3',
                  }}
                >
                  {color.description}
                </span>
              </Stack>
            ))}
          </div>
        </Stack>
      ))}
    </Stack>
  );
};

ColorPalette.displayName = 'ColorPalette';

/* ---- Storybook metadata ---- */

const meta: Meta<typeof ColorPalette> = {
  title: 'Design System/figma/Color Palette',
  component: ColorPalette,
};

export default meta;
type Story = StoryObj<typeof ColorPalette>;

export const Default: Story = {};
