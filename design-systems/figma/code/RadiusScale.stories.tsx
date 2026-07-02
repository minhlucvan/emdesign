import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Stack, Heading, Text } from './index';

/* ---- Radius data ---- */

interface RadiusInfo {
  token: string;
  value: string;
  label: string;
  description: string;
}

const radiusItems: RadiusInfo[] = [
  {
    token: '--rounded-xs',
    value: '2px',
    label: 'XS',
    description: 'Anchor / link decoration corners',
  },
  {
    token: '--rounded-sm',
    value: '6px',
    label: 'SM',
    description: 'Small chips, sub-nav tabs',
  },
  {
    token: '--rounded-md',
    value: '8px',
    label: 'MD',
    description: 'Form inputs, list items, image frames',
  },
  {
    token: '--rounded-lg',
    value: '24px',
    label: 'LG',
    description: 'Pricing cards, color-block sections',
  },
  {
    token: '--rounded-xl',
    value: '32px',
    label: 'XL',
    description: 'Hero feature panels, oversized callouts',
  },
  {
    token: '--rounded-pill',
    value: '50px',
    label: 'PILL',
    description: 'All text CTAs',
  },
  {
    token: '--rounded-full',
    value: '9999px',
    label: 'FULL',
    description: 'Circular icon buttons, checkmark glyphs',
  },
];

/* ---- Component ---- */

const RadiusScale: React.FC = () => {
  return (
    <Stack gap="xxl" style={{ maxWidth: '1280px', padding: 'var(--spacing-xxl)' }}>
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
        08 — Border Radius Scale
      </span>

      {/* Section heading */}
      <Heading level={2}>Border Radius Scale</Heading>

      {/* Radius cells — horizontal flex row */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: 'var(--spacing-xl)',
          flexWrap: 'wrap',
        }}
      >
        {radiusItems.map((item) => (
          <Stack gap="sm" align="center" key={item.token}>
            {/* 96px box demonstrating the radius */}
            <div
              style={{
                width: '96px',
                height: '96px',
                backgroundColor: 'var(--color-surface-soft)',
                borderRadius: `var(${item.token})`,
                border: '1px solid var(--color-hairline)',
              }}
            />
            {/* Token label and value */}
            <Stack gap="xxs" align="center">
              <Text variant="caption">{item.label}</Text>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--font-size-caption)',
                  lineHeight: '1.0',
                  letterSpacing: '0.60px',
                  textTransform: 'uppercase',
                  color: 'var(--color-ink)',
                  opacity: 0.55,
                  fontFeatureSettings: '"kern"',
                }}
              >
                {item.token.replace('--rounded-', 'rounded.')} / {item.value}
              </span>
            </Stack>
          </Stack>
        ))}
      </div>
    </Stack>
  );
};

RadiusScale.displayName = 'RadiusScale';

/* ---- Storybook metadata ---- */

const meta: Meta<typeof RadiusScale> = {
  title: 'Design System/figma/RadiusScale',
  component: RadiusScale,
};

export default meta;
type Story = StoryObj<typeof RadiusScale>;

export const Default: Story = {};
