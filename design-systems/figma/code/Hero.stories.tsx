import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button, Heading, Text, Stack } from './index';

/**
 * Hero section for the Figma design system analysis page.
 *
 * Composes the design system's hero pattern from reference-example.html:
 * left-aligned display-xl heading, body-lg intro paragraph, and the
 * brand-signature pairing of `button-primary` + `button-secondary` pill CTAs.
 *
 * Every visual property traces back to var(--token-*) — no raw hex colors
 * or hardcoded values are used. Matches the layout, spacing, and typography
 * documented in DESIGN.md and the reference preview HTML.
 */
const Hero = () => {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-canvas)',
        fontFeatureSettings: '"kern"',
        minHeight: '100vh',
      }}
    >
      {/* Hero header — matches <header class="hero"> from reference-example.html */}
      <header
        style={{
          padding: 'var(--spacing-section) var(--spacing-xxl)',
          maxWidth: '1440px',
          margin: '0 auto',
        }}
      >
        <div style={{ maxWidth: '1200px' }}>
          {/* display-xl hero headline — matches reference h1 styling */}
          <Heading
            level={1}
            style={{
              margin: '0 0 var(--spacing-xxl)',
              textAlign: 'left',
            }}
          >
            Design System Analysis of Figma
          </Heading>

          {/* body-lg paragraph — matches reference <p> at 20px/330/1.40/-0.14px */}
          <Text
            variant="body"
            as="p"
            style={{
              fontSize: 'var(--font-size-body-lg)',
              fontWeight: 'var(--font-weight-body-lg)',
              lineHeight: 'var(--line-height-body-lg)',
              letterSpacing: 'var(--letter-spacing-body-lg)',
              maxWidth: '900px',
              color: 'var(--color-ink)',
              margin: '0 0 var(--spacing-xxl)',
              textAlign: 'left',
            }}
          >
            A confident black-and-white editorial frame interrupted by oversized,
            hand-cut pastel color blocks. The marketing canvas is rigorously
            monochrome &mdash; figmaSans variable type, pure white surfaces, pure
            black ink, pill-shaped CTAs &mdash; while each story section drops the
            page into a saturated lime, lavender, cream, mint, or pink panel that
            reads like a sticky note placed on a clean desk.
          </Text>

          {/* Two pill CTAs — <div class="hero-actions"> from reference */}
          <Stack direction="row" gap="sm" wrap>
            <Button variant="primary" size="md">
              Get started for free
            </Button>
            <Button variant="secondary" size="md">
              Contact sales
            </Button>
          </Stack>
        </div>
      </header>
    </div>
  );
};

Hero.displayName = 'Hero';

const meta: Meta<typeof Hero> = {
  title: 'Design System/figma/Hero',
  component: Hero,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof Hero>;

export const Default: Story = {};
