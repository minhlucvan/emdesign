import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button, Heading, Text, Stack, Card } from './index';

export const HeroSection: React.FC = () => (
  <div
    style={{
      fontFamily: 'var(--font-sans)',
      WebkitFontSmoothing: 'antialiased',
    }}
  >
    {/* Gradient Mesh Banner */}
    <div
      style={{
        background:
          'linear-gradient(135deg, var(--color-canvas-cream) 0%, #f5d5a0 15%, #d4b8e0 30%, var(--color-primary) 50%, var(--color-ruby) 65%, var(--color-magenta) 85%)',
        padding: 'var(--space-xl) var(--space-xxl) var(--space-huge)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Navigation Bar */}
      <div
        style={{
          width: '100%',
          maxWidth: '1100px',
          backgroundColor: 'var(--color-canvas)',
          borderRadius: 'var(--radius-xs)',
          padding: 'var(--space-lg) var(--space-xl)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: 'var(--shadow-level-1)',
          marginBottom: 'var(--space-xxl)',
          boxSizing: 'border-box',
        }}
      >
        <Heading
          level={6}
          style={{
            margin: 0,
            fontSize: 'var(--font-size-heading-sm)',
            letterSpacing: 'var(--letter-spacing-heading-sm)',
          }}
        >
          Stripe
        </Heading>
        <Stack gap="lg" align="center">
          <Text
            variant="body"
            style={{ color: 'var(--color-ink-secondary)', cursor: 'pointer' }}
          >
            Products
          </Text>
          <Text
            variant="body"
            style={{ color: 'var(--color-ink-secondary)', cursor: 'pointer' }}
          >
            Pricing
          </Text>
          <Text
            variant="body"
            style={{ color: 'var(--color-ink-secondary)', cursor: 'pointer' }}
          >
            Docs
          </Text>
          <Button variant="secondary" size="sm">
            Sign in
          </Button>
          <Button variant="primary" size="sm">
            Start now
          </Button>
        </Stack>
      </div>

      {/* Hero Content */}
      <div style={{ textAlign: 'center', maxWidth: '700px' }}>
        <Heading level={1} style={{ color: 'var(--color-on-primary)' }}>
          Payments infrastructure
          <br />
          for the internet
        </Heading>
        <Text
          variant="body"
          style={{
            fontSize: 'var(--font-size-body-lg)',
            color: 'var(--color-on-primary)',
            opacity: 0.85,
            marginTop: 'var(--space-lg)',
            marginBottom: 'var(--space-xl)',
          }}
        >
          Millions of companies of all sizes use Stripe to accept payments,
          manage subscriptions, and build scalable revenue models.
        </Text>
        <Button variant="primary" size="lg">
          Start now →
        </Button>
      </div>
    </div>

    {/* Feature Cards Band */}
    <div
      style={{
        padding: 'var(--space-huge) var(--space-xxl)',
        backgroundColor: 'var(--color-canvas-soft)',
      }}
    >
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 'var(--space-xl)',
        }}
      >
        <Card variant="elevated">
          <Heading level={3}>Payment Links</Heading>
          <Text
            variant="body"
            style={{ color: 'var(--color-ink-mute)', marginTop: 'var(--space-sm)' }}
          >
            Create a payment link in seconds and share it anywhere — no code
            required.
          </Text>
        </Card>
        <Card variant="elevated">
          <Heading level={3}>Checkout</Heading>
          <Text
            variant="body"
            style={{ color: 'var(--color-ink-mute)', marginTop: 'var(--space-sm)' }}
          >
            A prebuilt, optimized payment form designed to convert more
            customers.
          </Text>
        </Card>
        <Card variant="elevated">
          <Heading level={3}>Invoicing</Heading>
          <Text
            variant="body"
            style={{ color: 'var(--color-ink-mute)', marginTop: 'var(--space-sm)' }}
          >
            Send professional invoices and get paid faster with automatic
            collection.
          </Text>
        </Card>
      </div>
    </div>
  </div>
);

const meta: Meta = {
  title: 'Design System/stripe/Hero',
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => <HeroSection />,
};
