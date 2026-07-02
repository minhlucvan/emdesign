import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Heading, Text, Stack, Card, Divider } from './index';

/* ---- Spacing Bar ---- */

interface SpacingBarProps {
  token: string;
  value: string;
  width: number;
}

const SpacingBar: React.FC<SpacingBarProps> = ({ token, value, width }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-lg)',
      marginBottom: 'var(--space-md)',
    }}
  >
    <div
      style={{
        width: '120px',
        textAlign: 'right',
        flexShrink: 0,
      }}
    >
      <Text
        variant="caption"
        style={{
          fontFamily: "'SF Mono', 'Fira Code', monospace",
          color: 'var(--color-ink)',
          fontWeight: 'var(--font-weight-body-md)',
          margin: 0,
        }}
      >
        {token}
      </Text>
    </div>
    <div
      style={{
        height: value === '2px' ? '4px' : '12px',
        width: `${width}px`,
        backgroundColor: 'var(--color-primary)',
        borderRadius: value === '2px' ? '1px' : 'var(--radius-xs)',
        transition: 'width 0.2s',
        flexShrink: 0,
      }}
    />
    <Text
      variant="caption"
      style={{
        fontFamily: "'SF Mono', 'Fira Code', monospace",
        color: 'var(--color-ink-mute)',
        margin: 0,
      }}
    >
      {value}
    </Text>
  </div>
);

/* ---- Radius Demo ---- */

interface RadiusDemoProps {
  token: string;
  value: string;
  radius: string;
}

const RadiusDemo: React.FC<RadiusDemoProps> = ({ token, value, radius }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 'var(--space-sm)',
    }}
  >
    <div
      style={{
        width: '80px',
        height: '80px',
        backgroundColor: 'var(--color-primary-soft)',
        borderRadius: radius,
      }}
    />
    <Text
      variant="caption"
      style={{
        fontFamily: "'SF Mono', 'Fira Code', monospace",
        color: 'var(--color-ink)',
        margin: 0,
        textAlign: 'center',
      }}
    >
      {token}
    </Text>
    <Text
      variant="caption"
      style={{
        fontFamily: "'SF Mono', 'Fira Code', monospace",
        color: 'var(--color-ink-mute)',
        margin: 0,
      }}
    >
      {value}
    </Text>
  </div>
);

/* ---- Shadow Demo ---- */

interface ShadowDemoProps {
  token: string;
  shadow: string;
}

const ShadowDemo: React.FC<ShadowDemoProps> = ({ token, shadow }) => (
  <Card
    variant="default"
    style={{
      boxShadow: shadow,
      padding: 'var(--space-xl) var(--space-xxl)',
      textAlign: 'center',
      minHeight: '120px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    }}
  >
    <Text
      variant="caption"
      style={{
        fontFamily: "'SF Mono', 'Fira Code', monospace",
        color: 'var(--color-ink)',
        margin: 0,
        fontWeight: 'var(--font-weight-body-md)',
      }}
    >
      {token}
    </Text>
  </Card>
);

/* ---- Component ---- */

export const SpacingShapesSection: React.FC = () => (
  <div
    style={{
      fontFamily: 'var(--font-sans)',
      WebkitFontSmoothing: 'antialiased',
      padding: 'var(--space-huge) var(--space-xxl)',
      maxWidth: '1100px',
      margin: '0 auto',
    }}
  >
    <Heading level={2}>Spacing &amp; Layout</Heading>
    <Text
      variant="body"
      style={{
        color: 'var(--color-ink-mute)',
        marginTop: 'var(--space-sm)',
        marginBottom: 'var(--space-xxl)',
      }}
    >
      An 8px-based spacing scale with sub-tokens for fine work. Section padding
      ranges from 64px on marketing surfaces to 24px on dashboard mockups.
    </Text>

    <div style={{ maxWidth: '500px', marginBottom: 'var(--space-huge)' }}>
      <SpacingBar token="space-xxs" value="2px" width={2} />
      <SpacingBar token="space-xs" value="4px" width={4} />
      <SpacingBar token="space-sm" value="8px" width={8} />
      <SpacingBar token="space-md" value="12px" width={12} />
      <SpacingBar token="space-lg" value="16px" width={16} />
      <SpacingBar token="space-xl" value="24px" width={24} />
      <SpacingBar token="space-xxl" value="32px" width={32} />
      <SpacingBar token="space-huge" value="64px" width={64} />
    </div>

    <Divider style={{ marginBottom: 'var(--space-huge)' }} />

    {/* Border Radius */}
    <Heading level={2} style={{ marginBottom: 'var(--space-lg)' }}>
      Shapes &amp; Border Radius
    </Heading>
    <Text
      variant="body"
      style={{
        color: 'var(--color-ink-mute)',
        marginBottom: 'var(--space-xxl)',
      }}
    >
      Pill-shaped buttons, rounded cards, and subtle input radii define the
      brand's geometry.
    </Text>

    <div
      style={{
        display: 'flex',
        gap: 'var(--space-xl)',
        flexWrap: 'wrap',
        marginBottom: 'var(--space-huge)',
      }}
    >
      <RadiusDemo token="radius-xs" value="4px" radius="var(--radius-xs)" />
      <RadiusDemo token="radius-sm" value="6px" radius="var(--radius-sm)" />
      <RadiusDemo token="radius-md" value="8px" radius="var(--radius-md)" />
      <RadiusDemo token="radius-lg" value="12px" radius="var(--radius-lg)" />
      <RadiusDemo token="radius-xl" value="16px" radius="var(--radius-xl)" />
      <RadiusDemo token="radius-pill" value="9999px" radius="var(--radius-pill)" />
    </div>

    <Divider style={{ marginBottom: 'var(--space-huge)' }} />

    {/* Elevation */}
    <Heading level={2} style={{ marginBottom: 'var(--space-lg)' }}>
      Elevation &amp; Depth
    </Heading>
    <Text
      variant="body"
      style={{
        color: 'var(--color-ink-mute)',
        marginBottom: 'var(--space-xxl)',
      }}
    >
      Subtle shadow for card lift and a raised level for floating panels and
      dashboard mockup chrome.
    </Text>

    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 'var(--space-xl)',
      }}
    >
      <ShadowDemo token="Level 0 — Flat" shadow="none" />
      <ShadowDemo
        token="Level 1 — Card lift"
        shadow="var(--shadow-level-1)"
      />
      <ShadowDemo
        token="Level 2 — Raised"
        shadow="var(--shadow-raised)"
      />
    </div>
  </div>
);

const meta: Meta = {
  title: 'Design System/stripe/Spacing & Shapes',
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => <SpacingShapesSection />,
};
