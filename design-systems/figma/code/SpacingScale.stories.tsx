import React from 'react';
import { Heading, Text, Stack } from './index';

/* ------------------------------------------------------------------ */
/*  Spacing token data                                                 */
/* ------------------------------------------------------------------ */

interface SpacingEntry {
  token: string;
  value: string;
  label: string;
  pixelValue: string;
}

const spacingTokens: SpacingEntry[] = [
  { token: 'hair',    value: 'var(--spacing-hair)',    label: 'Hair',    pixelValue: '1px' },
  { token: 'xxs',     value: 'var(--spacing-xxs)',     label: 'XXS',     pixelValue: '4px' },
  { token: 'xs',      value: 'var(--spacing-xs)',      label: 'XS',      pixelValue: '8px' },
  { token: 'sm',      value: 'var(--spacing-sm)',      label: 'SM',      pixelValue: '12px' },
  { token: 'md',      value: 'var(--spacing-md)',      label: 'MD',      pixelValue: '16px' },
  { token: 'lg',      value: 'var(--spacing-lg)',      label: 'LG',      pixelValue: '24px' },
  { token: 'xl',      value: 'var(--spacing-xl)',      label: 'XL',      pixelValue: '32px' },
  { token: 'xxl',     value: 'var(--spacing-xxl)',     label: 'XXL',     pixelValue: '48px' },
  { token: 'section', value: 'var(--spacing-section)', label: 'Section', pixelValue: '96px' },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const SpacingScaleSection: React.FC = () => (
  <div
    style={{
      padding: 'var(--spacing-xxl)',
      backgroundColor: 'var(--color-canvas)',
      fontFeatureSettings: '"kern"',
    }}
  >
    <Stack direction="col" gap="xxl">
      {/* --- Section header --- */}
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
          07 — Spacing Scale
        </span>
        <Heading level={2}>Spacing</Heading>
      </Stack>

      {/* --- Hairline divider --- */}
      <div
        style={{
          height: 'var(--spacing-hair)',
          backgroundColor: 'var(--color-hairline)',
          width: '100%',
        }}
      />

      {/* --- Spacing cells --- */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: 'var(--spacing-xl)',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
        }}
      >
        {spacingTokens.map((s) => (
          <div
            key={s.token}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--spacing-sm)',
            }}
          >
            {/* Black bar whose width matches the spacing token */}
            <div
              style={{
                width: s.value,
                height: '24px',
                backgroundColor: 'var(--color-primary)',
                borderRadius: 'var(--rounded-xs)',
                flexShrink: 0,
              }}
            />
            {/* Mono uppercase label with token name and pixel value */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 'var(--spacing-xxs)',
              }}
            >
              <Text variant="caption" as="span">
                {s.label}
              </Text>
              <Text
                variant="caption"
                as="span"
                style={{ opacity: 0.55 }}
              >
                {s.pixelValue}
              </Text>
            </div>
          </div>
        ))}
      </div>
    </Stack>
  </div>
);

SpacingScaleSection.displayName = 'SpacingScaleSection';

/* ------------------------------------------------------------------ */
/*  Storybook export                                                   */
/* ------------------------------------------------------------------ */

export default {
  title: 'Design System/figma/SpacingScale',
  component: SpacingScaleSection,
};

export const Overview = {};
