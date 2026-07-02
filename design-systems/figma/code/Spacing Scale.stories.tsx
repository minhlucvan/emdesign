import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Heading, Text } from './index';

/* ---- Spacing token data ---- */

interface SpacingEntry {
  token: string;
  value: string;
  label: string;
  description: string;
}

const spacingTokens: SpacingEntry[] = [
  {
    token: '--spacing-hair',
    value: '1px',
    label: 'Hair',
    description: 'hair',
  },
  {
    token: '--spacing-xxs',
    value: '4px',
    label: 'XXS',
    description: 'xxs',
  },
  {
    token: '--spacing-xs',
    value: '8px',
    label: 'XS',
    description: 'xs',
  },
  {
    token: '--spacing-sm',
    value: '12px',
    label: 'SM',
    description: 'sm',
  },
  {
    token: '--spacing-md',
    value: '16px',
    label: 'MD',
    description: 'md',
  },
  {
    token: '--spacing-lg',
    value: '24px',
    label: 'LG',
    description: 'lg',
  },
  {
    token: '--spacing-xl',
    value: '32px',
    label: 'XL',
    description: 'xl',
  },
  {
    token: '--spacing-xxl',
    value: '48px',
    label: 'XXL',
    description: 'xxl',
  },
  {
    token: '--spacing-section',
    value: '96px',
    label: 'Section',
    description: 'section',
  },
];

/* ---- Component ---- */

const SpacingScale: React.FC = () => {
  return (
    <div
      style={{
        padding: 'var(--spacing-xxl)',
        backgroundColor: 'var(--color-canvas)',
        maxWidth: '1280px',
        fontFeatureSettings: '"kern"',
      }}
    >
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
          display: 'block',
          marginBottom: 'var(--spacing-md)',
          opacity: 0.7,
        }}
      >
        07 — Spacing Scale
      </span>

      {/* Section heading */}
      <Heading level={2}>Spacing</Heading>

      {/* Hairline divider */}
      <div
        style={{
          height: 'var(--spacing-hair)',
          backgroundColor: 'var(--color-hairline)',
          width: '100%',
          margin: 'var(--spacing-xl) 0',
        }}
      />

      {/* Spacing cells — horizontal flex row matching reference HTML layout */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: 'var(--spacing-lg)',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
        }}
      >
        {spacingTokens.map((s) => (
          <div
            key={s.description}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              alignItems: 'flex-start',
            }}
          >
            {/* Black bar whose width matches the spacing token value */}
            <div
              style={{
                width: `var(${s.token})`,
                height: '24px',
                backgroundColor: 'var(--color-primary)',
                borderRadius: 'var(--rounded-xs)',
                flexShrink: 0,
                minWidth: s.value === '1px' ? '1px' : undefined,
              }}
            />
            {/* Mono uppercase label with token name and pixel value */}
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: '400',
                lineHeight: '1.0',
                letterSpacing: '0.6px',
                textTransform: 'uppercase',
                color: 'var(--color-ink)',
                opacity: 0.75,
                fontFeatureSettings: '"kern"',
              }}
            >
              {s.description} &middot; {s.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

SpacingScale.displayName = 'SpacingScale';

/* ---- Storybook metadata ---- */

const meta: Meta<typeof SpacingScale> = {
  title: 'Design System/figma/Spacing Scale',
  component: SpacingScale,
};

export default meta;
type Story = StoryObj<typeof SpacingScale>;

export const Default: Story = {};
