import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Heading, Text, Stack, Divider } from './index';

/* ---- Helpers ---- */

interface TypeRowProps {
  token: string;
  sample: string;
  style: React.CSSProperties;
  details: string;
}

const TypeRow: React.FC<TypeRowProps> = ({ token, sample, style, details }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: '200px 1fr 160px',
      gap: 'var(--space-xl)',
      alignItems: 'baseline',
      padding: 'var(--space-lg) var(--space-md)',
      borderBottom: '1px solid var(--color-hairline)',
    }}
  >
    <div>
      <Text
        variant="caption"
        style={{
          fontFamily: "'SF Mono', 'Fira Code', monospace",
          color: 'var(--color-ink-mute)',
          margin: 0,
        }}
      >
        {token}
      </Text>
    </div>
    <div style={style}>{sample}</div>
    <Text
      variant="caption"
      style={{
        fontFamily: "'SF Mono', 'Fira Code', monospace",
        color: 'var(--color-ink-mute)',
        textAlign: 'right',
        margin: 0,
      }}
    >
      {details}
    </Text>
  </div>
);

/* ---- Component ---- */

export const TypographySection: React.FC = () => (
  <div
    style={{
      fontFamily: 'var(--font-sans)',
      WebkitFontSmoothing: 'antialiased',
      padding: 'var(--space-huge) var(--space-xxl)',
      maxWidth: '1100px',
      margin: '0 auto',
    }}
  >
    <Heading level={2}>Typography</Heading>
    <Text
      variant="body"
      style={{
        color: 'var(--color-ink-mute)',
        marginTop: 'var(--space-sm)',
        marginBottom: 'var(--space-xxl)',
      }}
    >
      Sohne at weight 300 with negative letter-spacing — the brand's
      editorial-density display signature. Tabular figures for money.
    </Text>

    {/* Display Tiers */}
    <Heading
      level={5}
      style={{
        marginBottom: 'var(--space-md)',
        color: 'var(--color-ink-mute)',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        fontSize: 'var(--font-size-micro-cap)',
      }}
    >
      Display
    </Heading>

    <TypeRow
      token="display-xxl"
      sample="Payments infrastructure"
      style={{
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--font-size-display-xxl)',
        fontWeight: 'var(--font-weight-display-xxl)',
        lineHeight: 'var(--line-height-display-xxl)',
        letterSpacing: 'var(--letter-spacing-display-xxl)',
        color: 'var(--color-ink)',
      }}
      details="56px / 300 / -1.4px"
    />

    <TypeRow
      token="display-xl"
      sample="A global payment platform"
      style={{
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--font-size-display-xl)',
        fontWeight: 'var(--font-weight-display-xl)',
        lineHeight: 'var(--line-height-display-xl)',
        letterSpacing: 'var(--letter-spacing-display-xl)',
        color: 'var(--color-ink)',
      }}
      details="48px / 300 / -0.96px"
    />

    <TypeRow
      token="display-lg"
      sample="Built for growing businesses"
      style={{
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--font-size-display-lg)',
        fontWeight: 'var(--font-weight-display-lg)',
        lineHeight: 'var(--line-height-display-lg)',
        letterSpacing: 'var(--letter-spacing-display-lg)',
        color: 'var(--color-ink)',
      }}
      details="32px / 300 / -0.64px"
    />

    <TypeRow
      token="display-md"
      sample="Simple, transparent pricing"
      style={{
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--font-size-display-md)',
        fontWeight: 'var(--font-weight-display-md)',
        lineHeight: 'var(--line-height-display-md)',
        letterSpacing: 'var(--letter-spacing-display-md)',
        color: 'var(--color-ink)',
      }}
      details="26px / 300 / -0.26px"
    />

    {/* Headings */}
    <Heading
      level={5}
      style={{
        marginTop: 'var(--space-xl)',
        marginBottom: 'var(--space-md)',
        color: 'var(--color-ink-mute)',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        fontSize: 'var(--font-size-micro-cap)',
      }}
    >
      Heading
    </Heading>

    <TypeRow
      token="heading-lg"
      sample="Pricing tier name"
      style={{
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--font-size-heading-lg)',
        fontWeight: 'var(--font-weight-heading-lg)',
        lineHeight: 'var(--line-height-heading-lg)',
        letterSpacing: 'var(--letter-spacing-heading-lg)',
        color: 'var(--color-ink)',
      }}
      details="22px / 300 / -0.22px"
    />

    <TypeRow
      token="heading-md"
      sample="Section sub-heading"
      style={{
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--font-size-heading-md)',
        fontWeight: 'var(--font-weight-heading-md)',
        lineHeight: 'var(--line-height-heading-md)',
        letterSpacing: 'var(--letter-spacing-heading-md)',
        color: 'var(--color-ink)',
      }}
      details="20px / 300 / -0.2px"
    />

    <TypeRow
      token="heading-sm"
      sample="Mini-section label"
      style={{
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--font-size-heading-sm)',
        fontWeight: 'var(--font-weight-heading-sm)',
        lineHeight: 'var(--line-height-heading-sm)',
        letterSpacing: 'var(--letter-spacing-heading-sm)',
        color: 'var(--color-ink)',
      }}
      details="18px / 300 / 0"
    />

    {/* Body */}
    <Heading
      level={5}
      style={{
        marginTop: 'var(--space-xl)',
        marginBottom: 'var(--space-md)',
        color: 'var(--color-ink-mute)',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        fontSize: 'var(--font-size-micro-cap)',
      }}
    >
      Body
    </Heading>

    <TypeRow
      token="body-lg"
      sample="Marketing body lead text that introduces a section."
      style={{
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--font-size-body-lg)',
        fontWeight: 'var(--font-weight-body-lg)',
        lineHeight: 'var(--line-height-body-lg)',
        letterSpacing: 'var(--letter-spacing-body-lg)',
        color: 'var(--color-ink)',
      }}
      details="16px / 300 / 0"
    />

    <TypeRow
      token="body-md"
      sample="Default UI body text across the brand experience."
      style={{
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--font-size-body-md)',
        fontWeight: 'var(--font-weight-body-md)',
        lineHeight: 'var(--line-height-body-md)',
        letterSpacing: 'var(--letter-spacing-body-md)',
        color: 'var(--color-ink)',
      }}
      details="15px / 300 / 0"
    />

    <TypeRow
      token="body-tabular"
      sample="$12,450.00 · 1,247 transactions"
      style={{
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--font-size-body-tabular)',
        fontWeight: 'var(--font-weight-body-tabular)',
        lineHeight: 'var(--line-height-body-tabular)',
        letterSpacing: 'var(--letter-spacing-body-tabular)',
        fontFeatureSettings: '"tnum"',
        color: 'var(--color-ink)',
      }}
      details="14px / 300 / -0.42px"
    />

    {/* Button & UI */}
    <Heading
      level={5}
      style={{
        marginTop: 'var(--space-xl)',
        marginBottom: 'var(--space-md)',
        color: 'var(--color-ink-mute)',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        fontSize: 'var(--font-size-micro-cap)',
      }}
    >
      Button & UI
    </Heading>

    <TypeRow
      token="button-md"
      sample="Start now"
      style={{
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--font-size-button-md)',
        fontWeight: 'var(--font-weight-button-md)',
        lineHeight: 'var(--line-height-button-md)',
        letterSpacing: 'var(--letter-spacing-button-md)',
        color: 'var(--color-ink)',
      }}
      details="16px / 400 / 0"
    />

    <TypeRow
      token="button-sm"
      sample="Learn more"
      style={{
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--font-size-button-sm)',
        fontWeight: 'var(--font-weight-button-sm)',
        lineHeight: 'var(--line-height-button-sm)',
        letterSpacing: 'var(--letter-spacing-button-sm)',
        color: 'var(--color-ink)',
      }}
      details="14px / 400 / 0"
    />

    <TypeRow
      token="caption"
      sample="Last updated Jan 12, 2025 · 1,247 transactions"
      style={{
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--font-size-caption)',
        fontWeight: 'var(--font-weight-caption)',
        lineHeight: 'var(--line-height-caption)',
        letterSpacing: 'var(--letter-spacing-caption)',
        fontFeatureSettings: '"tnum"',
        color: 'var(--color-ink-mute)',
      }}
      details="13px / 400 / -0.39px"
    />

    <TypeRow
      token="micro"
      sample="Fine print and legal text"
      style={{
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--font-size-micro)',
        fontWeight: 'var(--font-weight-micro)',
        lineHeight: 'var(--line-height-micro)',
        letterSpacing: 'var(--letter-spacing-micro)',
        color: 'var(--color-text-muted)',
      }}
      details="11px / 300 / 0"
    />

    <TypeRow
      token="micro-cap"
      sample="NEW FEATURE"
      style={{
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--font-size-micro-cap)',
        fontWeight: 'var(--font-weight-micro-cap)',
        lineHeight: 'var(--line-height-micro-cap)',
        letterSpacing: 'var(--letter-spacing-micro-cap)',
        textTransform: 'uppercase',
        color: 'var(--color-ink-mute)',
      }}
      details="10px / 400 / +0.1px"
    />
  </div>
);

const meta: Meta = {
  title: 'Design System/stripe/Typography',
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => <TypographySection />,
};
