import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Heading, Text, Stack, Divider } from './index';

/* ---- Helpers ---- */

interface SwatchProps {
  token: string;
  value: string;
  color: string;
  isTextDark?: boolean;
}

const Swatch: React.FC<SwatchProps> = ({ token, value, color, isTextDark }) => {
  const textColor = isTextDark ? 'var(--color-ink)' : 'var(--color-on-primary)';
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-level-1)',
      }}
    >
      <div
        style={{
          height: '72px',
          backgroundColor: color,
          display: 'flex',
          alignItems: 'flex-end',
          padding: 'var(--space-sm)',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--font-size-micro)',
            fontWeight: 'var(--font-weight-micro)',
            color: textColor,
            opacity: 0.7,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          {value}
        </span>
      </div>
      <div
        style={{
          padding: 'var(--space-sm)',
          backgroundColor: 'var(--color-canvas)',
        }}
      >
        <Text
          variant="caption"
          style={{
            fontFamily: "'SF Mono', 'Fira Code', monospace",
            fontSize: 'var(--font-size-micro)',
            margin: 0,
            color: 'var(--color-ink)',
          }}
        >
          {token}
        </Text>
      </div>
    </div>
  );
};

interface SwatchGroupProps {
  title: string;
  colors: SwatchProps[];
}

const SwatchGroup: React.FC<SwatchGroupProps> = ({ title, colors }) => (
  <div style={{ marginBottom: 'var(--space-xxl)' }}>
    <Heading level={4} style={{ marginBottom: 'var(--space-lg)' }}>
      {title}
    </Heading>
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: 'var(--space-md)',
      }}
    >
      {colors.map((c) => (
        <Swatch key={c.token} {...c} />
      ))}
    </div>
  </div>
);

/* ---- Component ---- */

export const ColorPaletteSection: React.FC = () => (
  <div
    style={{
      fontFamily: 'var(--font-sans)',
      WebkitFontSmoothing: 'antialiased',
      padding: 'var(--space-huge) var(--space-xxl)',
      maxWidth: '1100px',
      margin: '0 auto',
    }}
  >
    <Heading level={2}>Color Palette</Heading>
    <Text
      variant="body"
      style={{
        color: 'var(--color-ink-mute)',
        marginTop: 'var(--space-sm)',
        marginBottom: 'var(--space-xxl)',
      }}
    >
      The Stripe-inspired color system — indigo brand anchor, deep navy ink, and
      warm cream accents.
    </Text>

    <SwatchGroup
      title="Brand & Accent"
      colors={[
        { token: '--color-primary', value: '#533afd', color: '#533afd' },
        { token: '--color-primary-deep', value: '#4434d4', color: '#4434d4' },
        { token: '--color-primary-press', value: '#2e2b8c', color: '#2e2b8c' },
        { token: '--color-primary-soft', value: '#665efd', color: '#665efd' },
        {
          token: '--color-primary-bg-subdued-hover',
          value: '#b9b9f9',
          color: '#b9b9f9',
          isTextDark: true,
        },
        {
          token: '--color-brand-dark-900',
          value: '#1c1e54',
          color: '#1c1e54',
        },
      ]}
    />

    <SwatchGroup
      title="Surface"
      colors={[
        {
          token: '--color-canvas',
          value: '#ffffff',
          color: '#ffffff',
          isTextDark: true,
        },
        {
          token: '--color-canvas-soft',
          value: '#f6f9fc',
          color: '#f6f9fc',
          isTextDark: true,
        },
        {
          token: '--color-canvas-cream',
          value: '#f5e9d4',
          color: '#f5e9d4',
          isTextDark: true,
        },
      ]}
    />

    <SwatchGroup
      title="Text"
      colors={[
        { token: '--color-ink', value: '#0d253d', color: '#0d253d' },
        {
          token: '--color-ink-secondary',
          value: '#273951',
          color: '#273951',
        },
        { token: '--color-ink-mute', value: '#64748d', color: '#64748d' },
        {
          token: '--color-ink-mute-2',
          value: '#61718a',
          color: '#61718a',
        },
        {
          token: '--color-on-primary',
          value: '#ffffff',
          color: '#ffffff',
          isTextDark: true,
        },
      ]}
    />

    <SwatchGroup
      title="Border"
      colors={[
        {
          token: '--color-hairline',
          value: '#e3e8ee',
          color: '#e3e8ee',
          isTextDark: true,
        },
        {
          token: '--color-hairline-input',
          value: '#a8c3de',
          color: '#a8c3de',
          isTextDark: true,
        },
      ]}
    />

    <SwatchGroup
      title="Accent (non-CTA)"
      colors={[
        { token: '--color-ruby', value: '#ea2261', color: '#ea2261' },
        { token: '--color-magenta', value: '#f96bee', color: '#f96bee' },
        { token: '--color-lemon', value: '#9b6829', color: '#9b6829' },
      ]}
    />

    <SwatchGroup
      title="Shadow"
      colors={[
        {
          token: '--color-shadow-blue',
          value: '#003770',
          color: '#003770',
        },
      ]}
    />

    <SwatchGroup
      title="Semantic Roles"
      colors={[
        {
          token: '--color-surface',
          value: '#ffffff',
          color: '#ffffff',
          isTextDark: true,
        },
        {
          token: '--color-surface-raised',
          value: '#f6f9fc',
          color: '#f6f9fc',
          isTextDark: true,
        },
        {
          token: '--color-text',
          value: '#0d253d',
          color: '#0d253d',
        },
        {
          token: '--color-text-muted',
          value: '#64748d',
          color: '#64748d',
        },
        {
          token: '--color-accent',
          value: '#533afd',
          color: '#533afd',
        },
        {
          token: '--color-accent-hover',
          value: '#4434d4',
          color: '#4434d4',
        },
        {
          token: '--color-border',
          value: '#e3e8ee',
          color: '#e3e8ee',
          isTextDark: true,
        },
      ]}
    />
  </div>
);

const meta: Meta = {
  title: 'Design System/stripe/Color Palette',
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => <ColorPaletteSection />,
};
