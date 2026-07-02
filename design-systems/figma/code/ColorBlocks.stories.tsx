import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button, Heading, Text, Stack } from './index';

/**
 * ColorBlocks section showcases the Figma design system's signature
 * pastel color-block palette. Each panel is a full-width container
 * with rounded-lg corners and xxl interior padding, containing a
 * centered editorial column — matching the color-block-section
 * components documented in DESIGN.md.
 *
 * Tokens: colors.block-lime, colors.block-lilac, colors.block-cream,
 * colors.block-mint, colors.block-pink, colors.block-coral,
 * colors.block-navy / spacing.xxl / rounded.lg / typography.eyebrow,
 * typography.headline, typography.body / components.button-primary,
 * components.button-secondary.
 */
const ColorBlocks = () => {
  const blocks = [
    {
      eyebrow: 'Systems',
      heading: 'Collaborative by design',
      description:
        'Build your design system once, and let it power every screen. '
        + 'Figma keeps your components, styles, and variables in sync across your entire team.',
      cta: 'Explore design systems',
      bg: 'var(--color-block-lime)',
      text: 'var(--color-ink)',
      buttonVariant: 'primary' as const,
    },
    {
      eyebrow: 'Design',
      heading: 'Where ideas take shape',
      description:
        'From wireframes to prototypes, Figma gives your team a shared canvas '
        + 'to explore, iterate, and present work at every fidelity.',
      cta: 'Start designing',
      bg: 'var(--color-block-lilac)',
      text: 'var(--color-ink)',
      buttonVariant: 'primary' as const,
    },
    {
      eyebrow: 'Brainstorm',
      heading: 'Think better together',
      description:
        'FigJam transforms sticky notes and diagrams into collaborative sessions '
        + 'that capture every voice and every idea — whether you\'re in the room or on the road.',
      cta: 'Try FigJam',
      bg: 'var(--color-block-cream)',
      text: 'var(--color-ink)',
      buttonVariant: 'primary' as const,
    },
    {
      eyebrow: 'Playground',
      heading: 'Explore possibilities',
      description:
        'Let your team experiment freely with virtual whiteboards, '
        + 'stickies, and templates that make every brainstorming session more productive.',
      cta: 'Open FigJam',
      bg: 'var(--color-block-mint)',
      text: 'var(--color-ink)',
      buttonVariant: 'primary' as const,
    },
    {
      eyebrow: 'Community',
      heading: 'Learn from the best',
      description:
        'Access thousands of community-made templates, plugins, and widgets '
        + 'that extend what Figma and FigJam can do — built by designers, for designers.',
      cta: 'Browse community',
      bg: 'var(--color-block-pink)',
      text: 'var(--color-ink)',
      buttonVariant: 'primary' as const,
    },
    {
      eyebrow: 'Develop',
      heading: 'Ship with confidence',
      description:
        'Inspect, export, and hand off with developer-friendly specs. '
        + 'Every layer, every measurement, every asset — ready for production.',
      cta: 'View developer tools',
      bg: 'var(--color-block-coral)',
      text: 'var(--color-ink)',
      buttonVariant: 'primary' as const,
    },
    {
      eyebrow: 'Enterprise',
      heading: 'Scale securely',
      description:
        'Enterprise-grade security, admin controls, and dedicated support '
        + 'keep your organization running smoothly at any scale.',
      cta: 'Contact sales',
      bg: 'var(--color-block-navy)',
      text: 'var(--color-inverse-ink)',
      buttonVariant: 'secondary' as const,
    },
  ];

  return (
    <div
      style={{
        backgroundColor: 'var(--color-canvas)',
        fontFeatureSettings: '"kern"',
        padding: 'var(--spacing-section) var(--spacing-xl)',
        minHeight: '100vh',
      }}
    >
      {/* Section intro */}
      <Stack
        direction="col"
        gap="lg"
        style={{ maxWidth: '900px', margin: '0 auto var(--spacing-section)', textAlign: 'center' }}
      >
        <Heading level={2} style={{ margin: 0 }}>
          Color blocks
        </Heading>
        <Text
          variant="body"
          as="p"
          style={{
            color: 'var(--color-ink)',
            maxWidth: '680px',
            margin: '0 auto',
          }}
        >
          Figma&apos;s marketing canvas is defined by oversized pastel color blocks
          that break the monochrome frame. Each block spans the full content width
          with generous padding and rounded corners, creating a deliberate rhythm
          of saturated storytelling surfaces drawn from the block-* palette.
        </Text>
      </Stack>

      {/* Full-width color-block panels — one per row */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-lg)',
          maxWidth: '1280px',
          margin: '0 auto',
        }}
      >
        {blocks.map((block, i) => (
          <div
            key={i}
            style={{
              backgroundColor: block.bg,
              color: block.text,
              borderRadius: 'var(--rounded-lg)',
              padding: 'var(--spacing-xxl)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {/* Narrow centered editorial column inside the block */}
            <div
              style={{
                maxWidth: '680px',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--spacing-md)',
              }}
            >
              {/* Mono uppercase eyebrow — figmaMono, 18px/400/0.54px */}
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--font-size-eyebrow)',
                  fontWeight: 'var(--font-weight-eyebrow)',
                  lineHeight: 'var(--line-height-eyebrow)',
                  letterSpacing: 'var(--letter-spacing-eyebrow)',
                  color: block.text,
                  textTransform: 'uppercase',
                  fontFeatureSettings: '"kern"',
                }}
              >
                {block.eyebrow}
              </span>

              {/* Bold h3 heading — headline role, 26px / 540 weight */}
              <Heading level={3} style={{ margin: 0, color: block.text }}>
                {block.heading}
              </Heading>

              {/* Body paragraph — body role, 18px / 320 weight */}
              <Text variant="body" as="p" style={{ color: block.text, margin: 0 }}>
                {block.description}
              </Text>

              {/* Pill CTA button */}
              <div style={{ marginTop: 'var(--spacing-md)' }}>
                <Button variant={block.buttonVariant} size="md">
                  {block.cta}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

ColorBlocks.displayName = 'ColorBlocks';

const meta: Meta<typeof ColorBlocks> = {
  title: 'Design System/figma/ColorBlocks',
  component: ColorBlocks,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof ColorBlocks>;

export const Default: Story = {};
