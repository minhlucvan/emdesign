import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Button,
  Card,
  Input,
  Badge,
  Heading,
  Text,
  Stack,
  Divider,
} from './index';

/* ---- Button Showcase ---- */

const ButtonShowcase: React.FC = () => (
  <div>
    <Heading level={4} style={{ marginBottom: 'var(--space-lg)' }}>
      Buttons
    </Heading>
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-xl)',
      }}
    >
      {/* Rows by size */}
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Stack key={size} gap="md" align="center">
          <Text
            variant="caption"
            style={{
              width: '50px',
              fontFamily: "'SF Mono', 'Fira Code', monospace",
              color: 'var(--color-ink-mute)',
              margin: 0,
            }}
          >
            {size}
          </Text>
          <Button variant="primary" size={size}>
            Primary
          </Button>
          <Button variant="secondary" size={size}>
            Secondary
          </Button>
          <Button variant="ghost" size={size}>
            Ghost
          </Button>
          <Button variant="primary" size={size} disabled>
            Disabled
          </Button>
        </Stack>
      ))}
    </div>
  </div>
);

/* ---- Card Showcase ---- */

const CardShowcase: React.FC = () => (
  <div>
    <Heading level={4} style={{ marginBottom: 'var(--space-lg)' }}>
      Cards
    </Heading>
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 'var(--space-xl)',
      }}
    >
      <Card variant="default">
        <Heading level={3}>Default</Heading>
        <Text
          variant="body"
          style={{ color: 'var(--color-ink-mute)', marginTop: 'var(--space-sm)' }}
        >
          Standard feature card with hairline border. Used for feature
          explanations and content blocks.
        </Text>
      </Card>
      <Card variant="elevated">
        <Heading level={3}>Elevated</Heading>
        <Text
          variant="body"
          style={{ color: 'var(--color-ink-mute)', marginTop: 'var(--space-sm)' }}
        >
          Raised card with Level 2 shadow. Used for floating panels and
          dashboard mockup chrome.
        </Text>
      </Card>
      <Card variant="interactive">
        <Heading level={3}>Interactive</Heading>
        <Text
          variant="body"
          style={{ color: 'var(--color-ink-mute)', marginTop: 'var(--space-sm)' }}
        >
          Hoverable card with lift effect. Used for selectable options and
          navigation cards.
        </Text>
      </Card>
    </div>
  </div>
);

/* ---- Input Showcase ---- */

const InputShowcase: React.FC = () => (
  <div>
    <Heading level={4} style={{ marginBottom: 'var(--space-lg)' }}>
      Inputs &amp; Forms
    </Heading>
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 'var(--space-xl)',
      }}
    >
      <div>
        <Input label="Email" placeholder="you@example.com" />
      </div>
      <div>
        <Input
          label="Card number"
          placeholder="4242 4242 4242 4242"
          defaultValue="4242 4242 4242 4242"
        />
      </div>
      <div>
        <Input label="Amount" placeholder="$0.00" error="Required field" />
      </div>
    </div>
  </div>
);

/* ---- Badge Showcase ---- */

const BadgeShowcase: React.FC = () => (
  <div>
    <Heading level={4} style={{ marginBottom: 'var(--space-lg)' }}>
      Badges
    </Heading>
    <Stack gap="md" align="center">
      <Badge variant="accent">New</Badge>
      <Badge variant="success">Active</Badge>
      <Badge variant="warn">Pending</Badge>
      <Badge variant="danger">Failed</Badge>
    </Stack>
  </div>
);

/* ---- Divider & Stack Showcase ---- */

const LayoutShowcase: React.FC = () => (
  <div>
    <Heading level={4} style={{ marginBottom: 'var(--space-lg)' }}>
      Dividers &amp; Stack
    </Heading>
    <div
      style={{
        padding: 'var(--space-xl)',
        border: '1px solid var(--color-hairline)',
        borderRadius: 'var(--radius-md)',
      }}
    >
      <Stack direction="row" gap="lg" align="center" justify="space-between">
        <Text variant="body" style={{ margin: 0 }}>
          Item one
        </Text>
        <Text variant="body" style={{ margin: 0 }}>
          Item two
        </Text>
        <Text variant="body" style={{ margin: 0 }}>
          Item three
        </Text>
      </Stack>
      <Divider style={{ margin: 'var(--space-md) 0' }} />
      <Stack direction="column" gap="sm">
        <Text variant="caption" style={{ color: 'var(--color-ink-mute)', margin: 0 }}>
          Stacked column items with sm gap
        </Text>
        <Text variant="caption" style={{ color: 'var(--color-ink-mute)', margin: 0 }}>
          Dividers separate logical groups
        </Text>
        <Text variant="caption" style={{ color: 'var(--color-ink-mute)', margin: 0 }}>
          Horizontal rule uses hairline color
        </Text>
      </Stack>
    </div>
  </div>
);

/* ---- Component ---- */

export const ComponentsSection: React.FC = () => (
  <div
    style={{
      fontFamily: 'var(--font-sans)',
      WebkitFontSmoothing: 'antialiased',
      padding: 'var(--space-huge) var(--space-xxl)',
      maxWidth: '1100px',
      margin: '0 auto',
    }}
  >
    <Heading level={2}>Components</Heading>
    <Text
      variant="body"
      style={{
        color: 'var(--color-ink-mute)',
        marginTop: 'var(--space-sm)',
        marginBottom: 'var(--space-xxl)',
      }}
    >
      Reusable UI primitives that compose into the brand's distinctive surface.
      Every value traces to a design token.
    </Text>

    <ButtonShowcase />

    <Divider style={{ margin: 'var(--space-xxl) 0' }} />

    <CardShowcase />

    <Divider style={{ margin: 'var(--space-xxl) 0' }} />

    <InputShowcase />

    <Divider style={{ margin: 'var(--space-xxl) 0' }} />

    <BadgeShowcase />

    <Divider style={{ margin: 'var(--space-xxl) 0' }} />

    <LayoutShowcase />
  </div>
);

const meta: Meta = {
  title: 'Design System/stripe/Components',
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => <ComponentsSection />,
};
