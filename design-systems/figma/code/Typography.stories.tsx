import React from 'react';
import { Heading, Text, Stack } from './index';

/* ------------------------------------------------------------------ */
/*  Token data                                                         */
/*  Every style value uses var(--token-*) — no raw hex/pixel values.   */
/* ------------------------------------------------------------------ */

interface TypeTokenEntry {
  name: string;
  token: string;
  specs: string;
  sample: string;
  sampleStyle: React.CSSProperties;
  fontFamily: 'sans' | 'mono';
}

const typeTokens: TypeTokenEntry[] = [
  {
    name: 'Display XL',
    token: 'display-xl',
    specs: '86px / 340 / 1.00 / -1.72px',
    sample: 'Build products that everyone can use',
    sampleStyle: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--font-size-display-xl)',
      fontWeight: 'var(--font-weight-display-xl)',
      lineHeight: 'var(--line-height-display-xl)',
      letterSpacing: 'var(--letter-spacing-display-xl)',
      color: 'var(--color-ink)',
      margin: 0,
    },
    fontFamily: 'sans',
  },
  {
    name: 'Display LG',
    token: 'display-lg',
    specs: '64px / 340 / 1.10 / -0.96px',
    sample: 'Build products that everyone can use',
    sampleStyle: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--font-size-display-lg)',
      fontWeight: 'var(--font-weight-display-lg)',
      lineHeight: 'var(--line-height-display-lg)',
      letterSpacing: 'var(--letter-spacing-display-lg)',
      color: 'var(--color-ink)',
      margin: 0,
    },
    fontFamily: 'sans',
  },
  {
    name: 'Headline',
    token: 'headline',
    specs: '26px / 540 / 1.35 / -0.26px',
    sample: 'Build products that everyone can use',
    sampleStyle: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--font-size-headline)',
      fontWeight: 'var(--font-weight-headline)',
      lineHeight: 'var(--line-height-headline)',
      letterSpacing: 'var(--letter-spacing-headline)',
      color: 'var(--color-ink)',
      margin: 0,
    },
    fontFamily: 'sans',
  },
  {
    name: 'Subhead',
    token: 'subhead',
    specs: '26px / 340 / 1.35 / -0.26px',
    sample: 'Build products that everyone can use',
    sampleStyle: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--font-size-subhead)',
      fontWeight: 'var(--font-weight-subhead)',
      lineHeight: 'var(--line-height-subhead)',
      letterSpacing: 'var(--letter-spacing-subhead)',
      color: 'var(--color-ink)',
      margin: 0,
    },
    fontFamily: 'sans',
  },
  {
    name: 'Card Title',
    token: 'card-title',
    specs: '24px / 700 / 1.45 / 0',
    sample: 'Build products that everyone can use',
    sampleStyle: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--font-size-card-title)',
      fontWeight: 'var(--font-weight-card-title)',
      lineHeight: 'var(--line-height-card-title)',
      letterSpacing: 'var(--letter-spacing-card-title)',
      color: 'var(--color-ink)',
      margin: 0,
    },
    fontFamily: 'sans',
  },
  {
    name: 'Body LG',
    token: 'body-lg',
    specs: '20px / 330 / 1.40 / -0.14px',
    sample: 'Build products that everyone can use',
    sampleStyle: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--font-size-body-lg)',
      fontWeight: 'var(--font-weight-body-lg)',
      lineHeight: 'var(--line-height-body-lg)',
      letterSpacing: 'var(--letter-spacing-body-lg)',
      color: 'var(--color-ink)',
      margin: 0,
    },
    fontFamily: 'sans',
  },
  {
    name: 'Body',
    token: 'body',
    specs: '18px / 320 / 1.45 / -0.26px',
    sample: 'Build products that everyone can use',
    sampleStyle: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--font-size-body)',
      fontWeight: 'var(--font-weight-body)',
      lineHeight: 'var(--line-height-body)',
      letterSpacing: 'var(--letter-spacing-body)',
      color: 'var(--color-ink)',
      margin: 0,
    },
    fontFamily: 'sans',
  },
  {
    name: 'Body SM',
    token: 'body-sm',
    specs: '16px / 330 / 1.45 / -0.14px',
    sample: 'Build products that everyone can use',
    sampleStyle: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--font-size-body-sm)',
      fontWeight: 'var(--font-weight-body-sm)',
      lineHeight: 'var(--line-height-body-sm)',
      letterSpacing: 'var(--letter-spacing-body-sm)',
      color: 'var(--color-ink)',
      margin: 0,
    },
    fontFamily: 'sans',
  },
  {
    name: 'Link',
    token: 'link',
    specs: '20px / 480 / 1.40 / -0.10px',
    sample: 'Build products that everyone can use',
    sampleStyle: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--font-size-link)',
      fontWeight: 'var(--font-weight-link)',
      lineHeight: 'var(--line-height-link)',
      letterSpacing: 'var(--letter-spacing-link)',
      color: 'var(--color-ink)',
      margin: 0,
      textDecoration: 'underline',
    },
    fontFamily: 'sans',
  },
  {
    name: 'Button',
    token: 'button',
    specs: '20px / 480 / 1.40 / -0.10px',
    sample: 'Get started for free',
    sampleStyle: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--font-size-button)',
      fontWeight: 'var(--font-weight-button)',
      lineHeight: 'var(--line-height-button)',
      letterSpacing: 'var(--letter-spacing-button)',
      color: 'var(--color-ink)',
      margin: 0,
    },
    fontFamily: 'sans',
  },
  {
    name: 'Eyebrow',
    token: 'eyebrow',
    specs: '18px / 400 / 1.30 / +0.54px',
    sample: 'Typography Scale',
    sampleStyle: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--font-size-eyebrow)',
      fontWeight: 'var(--font-weight-eyebrow)',
      lineHeight: 'var(--line-height-eyebrow)',
      letterSpacing: 'var(--letter-spacing-eyebrow)',
      textTransform: 'uppercase',
      color: 'var(--color-ink)',
      margin: 0,
    },
    fontFamily: 'mono',
  },
  {
    name: 'Caption',
    token: 'caption',
    specs: '12px / 400 / 1.00 / +0.60px',
    sample: 'Typography Scale',
    sampleStyle: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--font-size-caption)',
      fontWeight: 'var(--font-weight-caption)',
      lineHeight: 'var(--line-height-caption)',
      letterSpacing: 'var(--letter-spacing-caption)',
      textTransform: 'uppercase',
      color: 'var(--color-ink)',
      margin: 0,
    },
    fontFamily: 'mono',
  },
];

/* ------------------------------------------------------------------ */
/*  Component — composed from Heading, Text, Stack primitives          */
/* ------------------------------------------------------------------ */

const TypographySection: React.FC = () => (
  <div
    style={{
      padding: 'var(--spacing-xxl)',
      backgroundColor: 'var(--color-surface)',
      fontFeatureSettings: '"kern"',
    }}
  >
    <Stack direction="col" gap="xxl">
      {/* --- Section header: eyebrow + heading --- */}
      <Stack direction="col" gap="md">
        <Text variant="caption" as="span">
          02 — Typography Scale
        </Text>
        <Heading level={2}>Typography</Heading>
      </Stack>

      {/* --- Hairline divider --- */}
      <div
        style={{
          height: 'var(--spacing-hair)',
          backgroundColor: 'var(--color-border)',
          width: '100%',
        }}
      />

      {/* --- Type rows --- */}
      <Stack direction="col" gap="0">
        {typeTokens.map((token, i) => (
          <div
            key={token.token}
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: 'var(--spacing-xl)',
              alignItems: 'center',
              paddingTop: 'var(--spacing-lg)',
              paddingBottom: 'var(--spacing-lg)',
              borderBottom:
                i < typeTokens.length - 1
                  ? '1px solid var(--color-border-soft)'
                  : 'none',
            }}
          >
            {/* Left column: token name + mono specs */}
            <Stack
              direction="col"
              gap="xs"
              style={{ minWidth: '220px', flexShrink: 0 }}
            >
              <Text variant="body-sm" as="span" style={{ fontWeight: '540' }}>
                {token.name}
              </Text>
              <Text variant="caption" as="span" style={{ letterSpacing: '0.3px' }}>
                {token.specs}
              </Text>
            </Stack>

            {/* Right column: live sample at the token's actual size */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={token.sampleStyle}>{token.sample}</span>
            </div>
          </div>
        ))}
      </Stack>
    </Stack>
  </div>
);

TypographySection.displayName = 'TypographySection';

/* ------------------------------------------------------------------ */
/*  Storybook export                                                   */
/* ------------------------------------------------------------------ */

export default {
  title: 'Design System/figma/Typography',
  component: TypographySection,
};

export const Overview = {};
