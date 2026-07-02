import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Stack, Heading, Text } from './index';

/* ---- Border radius data matching the DESIGN.md rounded scale ---- */

interface RadiusEntry {
  token: string;
  value: string;
  label: string;
}

const radiusItems: RadiusEntry[] = [
  { token: 'var(--rounded-xs)', value: '2px', label: 'xs' },
  { token: 'var(--rounded-sm)', value: '6px', label: 'sm' },
  { token: 'var(--rounded-md)', value: '8px', label: 'md' },
  { token: 'var(--rounded-lg)', value: '24px', label: 'lg' },
  { token: 'var(--rounded-xl)', value: '32px', label: 'xl' },
  { token: 'var(--rounded-pill)', value: '50px', label: 'pill' },
  { token: 'var(--rounded-full)', value: '9999px', label: 'full' },
];

/* ---- Component ---- */

const BorderRadiusScale: React.FC = () => {
  return (
    <div
      style={{
        padding: 'var(--spacing-xxl)',
        backgroundColor: 'var(--color-surface-soft)',
        fontFeatureSettings: '"kern"',
      }}
    >
      <Stack direction="col" gap="xxl">
        {/* Section eyebrow — mono uppercase */}
        <Stack direction="col" gap="md">
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
          <Heading level={2}>Radius</Heading>
        </Stack>

        {/* Radius cells — horizontal flex row matching reference preview */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: 'var(--spacing-xl)',
            flexWrap: 'wrap',
          }}
        >
          {radiusItems.map((item) => (
            <div
              key={item.label}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--spacing-sm)',
                alignItems: 'center',
              }}
            >
              {/* 96 x 96 box demonstrating the radius value */}
              <div
                style={{
                  width: '96px',
                  height: '96px',
                  backgroundColor: 'var(--color-surface-soft)',
                  border: '1px solid var(--color-hairline)',
                  borderRadius: item.token,
                }}
              />
              {/* Mono uppercase label: token name + pixel value */}
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--font-size-caption)',
                  lineHeight: '1.0',
                  letterSpacing: '0.60px',
                  textTransform: 'uppercase',
                  color: 'var(--color-ink)',
                  opacity: 0.75,
                  textAlign: 'center',
                  fontFeatureSettings: '"kern"',
                }}
              >
                {item.label} &middot; {item.value}
              </span>
            </div>
          ))}
        </div>
      </Stack>
    </div>
  );
};

BorderRadiusScale.displayName = 'BorderRadiusScale';

/* ---- Storybook metadata ---- */

const meta: Meta<typeof BorderRadiusScale> = {
  title: 'Design System/figma/Border Radius Scale',
  component: BorderRadiusScale,
};

export default meta;
type Story = StoryObj<typeof BorderRadiusScale>;

export const Default: Story = {};
