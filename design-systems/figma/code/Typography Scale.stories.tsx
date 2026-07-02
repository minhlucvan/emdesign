import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Heading, Text, Stack } from './index';

/* ------------------------------------------------------------------ */
/*  Token data                                                          */
/*  Every style value uses var(--token-*) — no raw hex/pixel values.   */
/* ------------------------------------------------------------------ */

interface TypeScaleEntry {
  name: string;
  token: string;
  specs: string;
  sample: string;
  sampleStyle: React.CSSProperties;
  fontFamily: 'sans' | 'mono';
}

const typeScale: TypeScaleEntry[] = [
  {
    name: 'display-xl',
    token: 'display-xl',
    specs: '86px / 340 / 1.00 / -1.72px / figmaSans',
    sample: 'Bring everyone together',
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
    name: 'display-lg',
    token: 'display-lg',
    specs: '64px / 340 / 1.10 / -0.96px / figmaSans',
    sample: 'Pick your plan',
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
    name: 'headline',
    token: 'headline',
    specs: '26px / 540 / 1.35 / -0.26px / figmaSans',
    sample: 'A faster, more efficient way of working',
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
    name: 'subhead',
    token: 'subhead',
    specs: '26px / 340 / 1.35 / -0.26px / figmaSans',
    sample: 'Better ideas start with better brainstorming tools',
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
    name: 'card-title',
    token: 'card-title',
    specs: '24px / 700 / 1.45 / 0 / figmaSans',
    sample: 'Professional',
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
    name: 'body-lg',
    token: 'body-lg',
    specs: '20px / 330 / 1.40 / -0.14px / figmaSans',
    sample: 'Customize your plan with add-ons that fit how your team works.',
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
    name: 'body',
    token: 'body',
    specs: '18px / 320 / 1.45 / -0.26px / figmaSans',
    sample: 'Default body copy stays at near-zero letter-spacing for readability while display sizes pull tracking in tight.',
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
    name: 'body-sm',
    token: 'body-sm',
    specs: '16px / 330 / 1.45 / -0.14px / figmaSans',
    sample: 'Card body and footer link list run at 16px with subtle negative tracking.',
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
    name: 'link',
    token: 'link',
    specs: '20px / 480 / 1.40 / -0.10px / figmaSans',
    sample: 'Inline link emphasis',
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
    name: 'button',
    token: 'button',
    specs: '20px / 480 / 1.40 / -0.10px / figmaSans',
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
    name: 'eyebrow',
    token: 'eyebrow',
    specs: '18px / 400 / 1.30 / +0.54px / figmaMono',
    sample: 'Section eyebrow label',
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
    name: 'caption',
    token: 'caption',
    specs: '12px / 400 / 1.00 / +0.60px / figmaMono',
    sample: 'Footer column caption',
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
/*  Component — matches reference-example.html Typography Scale layout */
/* ------------------------------------------------------------------ */

const TypographyScale: React.FC = () => (
  <div
    style={{
      padding: 'var(--spacing-xxl)',
      backgroundColor: 'var(--color-surface-soft)',
      fontFeatureSettings: '"kern"',
      maxWidth: '1440px',
    }}
  >
    <Stack direction="col" gap="lg">
      {/* Section header: eyebrow + heading */}
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
        02 — Typography Scale
      </span>
      <Heading level={2}>Typography</Heading>

      {/* Type rows matching reference HTML layout */}
      {typeScale.map((token, i) => (
        <div
          key={token.token}
          style={{
            display: 'grid',
            gridTemplateColumns: '280px 1fr',
            gap: 'var(--spacing-xl)',
            alignItems: 'baseline',
            paddingTop: 'var(--spacing-lg)',
            paddingBottom: 'var(--spacing-lg)',
            borderBottom:
              i < typeScale.length - 1
                ? '1px solid var(--color-border-soft)'
                : 'none',
          }}
        >
          {/* Left column: token name + mono specs */}
          <Stack direction="col" gap="xs" style={{ minWidth: 0 }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--font-size-caption)',
                letterSpacing: 'var(--letter-spacing-caption)',
                textTransform: 'uppercase',
                color: 'var(--color-ink)',
                opacity: 0.7,
                lineHeight: '1.6',
                fontFeatureSettings: '"kern"',
              }}
            >
              <strong
                style={{
                  fontWeight: '500',
                  opacity: 1,
                  display: 'block',
                  marginBottom: 'var(--spacing-xxs)',
                  textTransform: 'none',
                  letterSpacing: '0',
                  fontSize: 'var(--font-size-body-sm)',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                {token.name}
              </strong>
              {token.specs}
            </span>
          </Stack>

          {/* Right column: live sample */}
          <div style={{ minWidth: 0 }}>
            <span style={token.sampleStyle}>{token.sample}</span>
          </div>
        </div>
      ))}
    </Stack>
  </div>
);

TypographyScale.displayName = 'TypographyScale';

/* ------------------------------------------------------------------ */
/*  Storybook export                                                   */
/* ------------------------------------------------------------------ */

const meta: Meta<typeof TypographyScale> = {
  title: 'Design System/figma/Typography Scale',
  component: TypographyScale,
};

export default meta;
type Story = StoryObj<typeof TypographyScale>;

export const Default: Story = {};
