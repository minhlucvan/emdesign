import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button, Heading, Text, Card, Stack, Badge, Link } from './index';

/**
 * CardsAndContainers section — a visual catalog of every card and container
 * variant in the Figma design system: pricing cards, template tiles, promo
 * banners, marquee strips, checkmark rows, and top-nav.
 *
 * Composition: mono uppercase eyebrow -> h2 heading -> responsive pricing
 * grid (tier name, price, feature list, CTA) -> template tiles -> promo
 * banner -> marquee strip with logo list -> checkmark comparison rows ->
 * mini top-nav mock. Every value traces back to var(--token-*).
 */
const CardsAndContainers = () => {
  const pricingTiers = [
    {
      name: 'Starter',
      price: 'Free',
      period: 'forever',
      features: ['3 Figma files', 'Unlimited viewers', 'Cloud libraries', 'Mobile app'],
      cta: 'Get started',
      variant: 'secondary' as const,
    },
    {
      name: 'Professional',
      price: '$12',
      period: '/editor /month',
      features: ['Unlimited files', 'Unlimited viewers', 'Version history', 'Shared fonts', 'Prototyping'],
      cta: 'Start trial',
      variant: 'primary' as const,
    },
    {
      name: 'Organization',
      price: '$45',
      period: '/editor /month',
      features: [
        'All Professional features',
        'Design system analytics',
        'Private plugins',
        'Audit logs',
        'SSO',
      ],
      cta: 'Contact sales',
      variant: 'secondary' as const,
    },
    {
      name: 'Enterprise',
      price: '$75',
      period: '/editor /month',
      features: [
        'All Organization features',
        'Dedicated support',
        'Custom contracts',
        'On-premise option',
        'Volume licensing',
      ],
      cta: 'Contact us',
      variant: 'secondary' as const,
    },
  ];

  const checkmarkFeatures = [
    { name: 'Unlimited viewers', free: true, pro: true, org: true, ent: true },
    { name: 'Version history', free: false, pro: true, org: true, ent: true },
    { name: 'Shared libraries', free: false, pro: true, org: true, ent: true },
    { name: 'Design system analytics', free: false, pro: false, org: true, ent: true },
    { name: 'SSO / SAML', free: false, pro: false, org: true, ent: true },
    { name: 'Dedicated support', free: false, pro: false, org: false, ent: true },
  ];

  const marqueeLogos = [
    'Uber', 'Airbnb', 'Slack', 'Microsoft', 'Disney',
    'Uber', 'Airbnb', 'Slack', 'Microsoft', 'Disney',
    'Uber', 'Airbnb', 'Slack', 'Microsoft', 'Disney',
  ];

  return (
    <section
      style={{
        backgroundColor: 'var(--color-canvas)',
        padding: 'var(--spacing-section) var(--spacing-xl)',
        fontFeatureSettings: '"kern"',
      }}
    >
      {/* ================================================================ */}
      {/*  Section header: eyebrow + heading                               */}
      {/* ================================================================ */}
      <Stack gap="md" style={{ marginBottom: 'var(--spacing-xl)' }}>
        <Text variant="caption">05 — Cards & Containers</Text>
        <Heading level={2}>
          Every card, banner, and container in the system
        </Heading>
      </Stack>

      {/* ================================================================ */}
      {/*  Pricing Cards (4-up grid)                                       */}
      {/* ================================================================ */}
      <Text
        variant="caption"
        as="span"
        style={{ display: 'block', marginBottom: 'var(--spacing-md)' }}
      >
        Pricing Cards
      </Text>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 'var(--spacing-md)',
          marginBottom: 'var(--spacing-section)',
        }}
      >
        {pricingTiers.map((tier) => (
          <Card key={tier.name}>
            <Stack gap="md">
              {/* Tier name — mono uppercase label */}
              <Text variant="caption" as="span" style={{ marginBottom: 'var(--spacing-xxs)' }}>
                {tier.name}
              </Text>

              {/* Price display — card-title scale */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--spacing-xxs)' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 'var(--font-size-card-title)',
                    fontWeight: 'var(--font-weight-card-title)',
                    lineHeight: 'var(--line-height-card-title)',
                    letterSpacing: 'var(--letter-spacing-card-title)',
                    color: 'var(--color-ink)',
                  }}
                >
                  {tier.price}
                </span>
                <Text variant="body-sm" as="span" style={{ color: 'var(--color-ink)' }}>
                  {tier.period}
                </Text>
              </div>

              {/* Feature list — with hairline separator */}
              <div
                style={{
                  borderTop: '1px solid var(--color-hairline)',
                  paddingTop: 'var(--spacing-md)',
                }}
              >
                <Stack gap="sm">
                  {tier.features.map((f) => (
                    <div
                      key={f}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-xs)',
                      }}
                    >
                      {/* Green checkmark glyph — matches comparison-checkmark token */}
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        aria-hidden="true"
                      >
                        <circle cx="8" cy="8" r="8" fill="var(--color-semantic-success)" />
                        <path
                          d="M5 8.5l2 2 4-4"
                          stroke="var(--color-on-primary)"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <Text variant="body-sm" as="span">{f}</Text>
                    </div>
                  ))}
                </Stack>
              </div>

              {/* Pill CTA */}
              <Button variant={tier.variant} size="md" style={{ marginTop: 'var(--spacing-sm)' }}>
                {tier.cta}
              </Button>
            </Stack>
          </Card>
        ))}
      </div>

      {/* ================================================================ */}
      {/*  Template Cards (soft background tiles with thumbnail / badges)   */}
      {/* ================================================================ */}
      <Text
        variant="caption"
        as="span"
        style={{ display: 'block', marginBottom: 'var(--spacing-md)' }}
      >
        Template Cards
      </Text>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 'var(--spacing-md)',
          marginBottom: 'var(--spacing-section)',
        }}
      >
        {/* Template card 1 */}
        <div
          style={{
            backgroundColor: 'var(--color-surface-soft)',
            borderRadius: 'var(--rounded-md)',
            padding: 'var(--spacing-md)',
            border: '1px solid var(--color-hairline)',
          }}
        >
          <Stack gap="md">
            {/* Thumbnail placeholder */}
            <div
              style={{
                backgroundColor: 'var(--color-hairline-soft)',
                borderRadius: 'var(--rounded-sm)',
                height: '180px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-ink)',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--font-size-caption)',
                letterSpacing: 'var(--letter-spacing-caption)',
                textTransform: 'uppercase',
                fontWeight: 'var(--font-weight-caption)',
              }}
            >
              Thumbnail
            </div>
            <Text variant="body-sm" as="span" style={{ display: 'block' }}>
              Wireframe Kit
            </Text>
            <Text variant="body-sm" as="span" style={{ color: 'var(--color-ink)' }}>
              A comprehensive set of low-fidelity wireframe components for rapid prototyping.
            </Text>
            <Stack direction="row" gap="xs" wrap>
              <Badge color="accent">UI Kit</Badge>
              <Badge color="warn">Figma</Badge>
            </Stack>
          </Stack>
        </div>

        {/* Template card 2 */}
        <div
          style={{
            backgroundColor: 'var(--color-surface-soft)',
            borderRadius: 'var(--rounded-md)',
            padding: 'var(--spacing-md)',
            border: '1px solid var(--color-hairline)',
          }}
        >
          <Stack gap="md">
            <div
              style={{
                backgroundColor: 'var(--color-hairline-soft)',
                borderRadius: 'var(--rounded-sm)',
                height: '180px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-ink)',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--font-size-caption)',
                letterSpacing: 'var(--letter-spacing-caption)',
                textTransform: 'uppercase',
                fontWeight: 'var(--font-weight-caption)',
              }}
            >
              Thumbnail
            </div>
            <Text variant="body-sm" as="span" style={{ display: 'block' }}>
              Design System Starter
            </Text>
            <Text variant="body-sm" as="span" style={{ color: 'var(--color-ink)' }}>
              Everything you need to spin up a design system with color tokens, type scale, and components.
            </Text>
            <Stack direction="row" gap="xs" wrap>
              <Badge color="accent">System</Badge>
              <Badge color="success">Featured</Badge>
            </Stack>
          </Stack>
        </div>

        {/* Template card 3 */}
        <div
          style={{
            backgroundColor: 'var(--color-surface-soft)',
            borderRadius: 'var(--rounded-md)',
            padding: 'var(--spacing-md)',
            border: '1px solid var(--color-hairline)',
          }}
        >
          <Stack gap="md">
            <div
              style={{
                backgroundColor: 'var(--color-hairline-soft)',
                borderRadius: 'var(--rounded-sm)',
                height: '180px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-ink)',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--font-size-caption)',
                letterSpacing: 'var(--letter-spacing-caption)',
                textTransform: 'uppercase',
                fontWeight: 'var(--font-weight-caption)',
              }}
            >
              Thumbnail
            </div>
            <Text variant="body-sm" as="span" style={{ display: 'block' }}>
              Mobile Prototype
            </Text>
            <Text variant="body-sm" as="span" style={{ color: 'var(--color-ink)' }}>
              Pre-built mobile screens and flow connectors to quickly prototype app experiences.
            </Text>
            <Stack direction="row" gap="xs" wrap>
              <Badge color="accent">Mobile</Badge>
              <Badge color="warn">Prototype</Badge>
            </Stack>
          </Stack>
        </div>
      </div>

      {/* ================================================================ */}
      {/*  Lilac Promo Banner                                               */}
      {/* ================================================================ */}
      <Text
        variant="caption"
        as="span"
        style={{ display: 'block', marginBottom: 'var(--spacing-md)' }}
      >
        Promo Banner
      </Text>

      <div
        style={{
          backgroundColor: 'var(--color-block-lilac)',
          borderRadius: 'var(--rounded-md)',
          padding: 'var(--spacing-md) var(--spacing-lg)',
          marginBottom: 'var(--spacing-section)',
        }}
      >
        <Stack direction="row" justify="space-between" align="center" wrap style={{ gap: 'var(--spacing-md)' }}>
          {/* Left column — promo text */}
          <div>
            <Stack gap="xs">
              <Text variant="body-sm" as="span" style={{ display: 'block' }}>
                Save your spot at Config 2025
              </Text>
              <Text variant="body-sm" as="span">
                Join us in San Francisco for our annual design conference. Early-bird tickets available now.
              </Text>
            </Stack>
          </div>
          {/* Right column — magenta promo CTA */}
          <Button
            variant="primary"
            size="md"
            style={{ backgroundColor: 'var(--color-accent-magenta)' }}
          >
            Get tickets
          </Button>
        </Stack>
      </div>

      {/* ================================================================ */}
      {/*  Inverse Marquee Strip with logos                                */}
      {/* ================================================================ */}
      <Text
        variant="caption"
        as="span"
        style={{ display: 'block', marginBottom: 'var(--spacing-md)' }}
      >
        Marquee Strip
      </Text>

      <div
        style={{
          backgroundColor: 'var(--color-inverse-canvas)',
          borderRadius: 'var(--rounded-xs)',
          height: '36px',
          overflow: 'hidden',
          marginBottom: 'var(--spacing-section)',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 'var(--spacing-xxl)',
            whiteSpace: 'nowrap',
            padding: '0 var(--spacing-lg)',
          }}
        >
          {marqueeLogos.slice(0, 10).map((logo, i) => (
            <Text
              key={`${logo}-${i}`}
              variant="body-sm"
              as="span"
              style={{
                color: 'var(--color-inverse-ink)',
                fontFamily: 'var(--font-sans)',
                fontWeight: 'var(--font-weight-body-sm)',
                fontSize: '14px',
                letterSpacing: '0.30px',
                opacity: 0.85,
              }}
            >
              {logo}
            </Text>
          ))}
        </div>
      </div>

      {/* ================================================================ */}
      {/*  Feature Comparison Table with checkmark glyphs                  */}
      {/* ================================================================ */}
      <Text
        variant="caption"
        as="span"
        style={{ display: 'block', marginBottom: 'var(--spacing-md)' }}
      >
        Feature Comparison
      </Text>

      <div
        style={{
          border: '1px solid var(--color-hairline)',
          borderRadius: 'var(--rounded-lg)',
          overflow: 'hidden',
          marginBottom: 'var(--spacing-section)',
        }}
      >
        {/* Header row — mono uppercase taxonomy */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
            backgroundColor: 'var(--color-surface-soft)',
            borderBottom: '1px solid var(--color-hairline)',
            padding: 'var(--spacing-sm) var(--spacing-md)',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--font-size-caption)',
            fontWeight: 'var(--font-weight-caption)',
            letterSpacing: 'var(--letter-spacing-caption)',
            textTransform: 'uppercase',
            color: 'var(--color-ink)',
          }}
        >
          <span>Feature</span>
          <span style={{ textAlign: 'center' }}>Free</span>
          <span style={{ textAlign: 'center' }}>Pro</span>
          <span style={{ textAlign: 'center' }}>Org</span>
          <span style={{ textAlign: 'center' }}>Enterprise</span>
        </div>

        {/* Feature rows */}
        {checkmarkFeatures.map((row, idx) => (
          <div
            key={row.name}
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
              borderBottom: idx < checkmarkFeatures.length - 1
                ? '1px solid var(--color-hairline-soft)'
                : 'none',
              padding: 'var(--spacing-sm) var(--spacing-md)',
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--font-size-body-sm)',
              fontWeight: 'var(--font-weight-body-sm)',
              lineHeight: 'var(--line-height-body-sm)',
              letterSpacing: 'var(--letter-spacing-body-sm)',
              color: 'var(--color-ink)',
            }}
          >
            <Text variant="body-sm" as="span">{row.name}</Text>
            {([row.free, row.pro, row.org, row.ent] as const).map((checked, ci) => (
              <div key={ci} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {checked ? (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle cx="8" cy="8" r="8" fill="var(--color-semantic-success)" />
                    <path
                      d="M5 8.5l2 2 4-4"
                      stroke="var(--color-on-primary)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle cx="8" cy="8" r="7.5" stroke="var(--color-hairline)" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* ================================================================ */}
      {/*  Mini Top-Nav Mock                                                */}
      {/* ================================================================ */}
      <Text
        variant="caption"
        as="span"
        style={{ display: 'block', marginBottom: 'var(--spacing-md)' }}
      >
        Top Navigation
      </Text>

      <nav
        style={{
          backgroundColor: 'var(--color-canvas)',
          border: '1px solid var(--color-hairline)',
          borderRadius: 'var(--rounded-xs)',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          padding: '0 var(--spacing-xl)',
        }}
      >
        <Stack
          direction="row"
          justify="space-between"
          align="center"
          style={{ width: '100%', maxWidth: '1280px', margin: '0 auto' }}
        >
          {/* Logo / wordmark */}
          <Text
            variant="body-sm"
            as="span"
            style={{ cursor: 'default' }}
          >
            Figma
          </Text>

          {/* Nav links + pill CTAs */}
          <Stack direction="row" gap="lg" align="center">
            <Link href="#">Design</Link>
            <Link href="#">FigJam</Link>
            <Link href="#">Pricing</Link>
            <Button variant="secondary" size="md">
              Contact sales
            </Button>
            <Button variant="primary" size="md">
              Get started
            </Button>
          </Stack>
        </Stack>
      </nav>
    </section>
  );
};

CardsAndContainers.displayName = 'CardsAndContainers';

const meta: Meta<typeof CardsAndContainers> = {
  title: 'Design System/figma/CardsAndContainers',
  component: CardsAndContainers,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof CardsAndContainers>;

export const Default: Story = {};
