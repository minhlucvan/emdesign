import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button, Heading, Text, Card, Stack } from './index';

/**
 * ComponentDemos section — a visual catalog of every button variant
 * in the Figma design system. Each variant is shown inside a bordered
 * Card cell with a mono uppercase label and the rendered component.
 *
 * Composition: mono uppercase eyebrow -> h2 heading -> responsive
 * grid of component cells. Every value traces back to var(--token-*).
 *
 * Includes the full button family: primary, secondary, ghost,
 * magenta promo, pricing tab pills (default + selected), and
 * circular icon button.
 */
const ComponentDemos = () => {
  return (
    <section
      style={{
        backgroundColor: 'var(--color-canvas)',
        padding: 'var(--spacing-section) var(--spacing-xl)',
        fontFeatureSettings: '"kern"',
      }}
    >
      {/* Section header: eyebrow + heading */}
      <Stack gap="md" style={{ marginBottom: 'var(--spacing-xl)' }}>
        <Text variant="caption">03 — Button Variants</Text>
        <Heading level={2}>
          A catalog of every button in the system
        </Heading>
      </Stack>

      {/* Responsive grid of component cells */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 'var(--spacing-md)',
        }}
      >
        {/* Primary button cell */}
        <Card>
          <Stack gap="sm">
            <Text variant="caption">Primary</Text>
            <Button variant="primary" size="md">
              Get started for free
            </Button>
          </Stack>
        </Card>

        {/* Secondary button cell */}
        <Card>
          <Stack gap="sm">
            <Text variant="caption">Secondary</Text>
            <Button variant="secondary" size="md">
              Contact sales
            </Button>
          </Stack>
        </Card>

        {/* Ghost / text-only button cell */}
        <Card>
          <Stack gap="sm">
            <Text variant="caption">Ghost</Text>
            <Button variant="ghost" size="md">
              Learn more
            </Button>
          </Stack>
        </Card>

        {/* Magenta promo button cell */}
        <Card>
          <Stack gap="sm">
            <Text variant="caption">Magenta Promo</Text>
            <Button
              variant="primary"
              size="md"
              style={{ backgroundColor: 'var(--color-accent-magenta)' }}
            >
              Save your spot
            </Button>
          </Stack>
        </Card>

        {/* Pricing tab pills cell: default + selected */}
        <Card>
          <Stack gap="sm">
            <Text variant="caption">Pricing Tabs</Text>
            <div
              style={{
                display: 'flex',
                gap: 'var(--spacing-xs)',
                flexWrap: 'wrap',
              }}
            >
              {/* Default (unselected) pill — canvas bg, ink text, no border */}
              <Button
                variant="secondary"
                size="sm"
                style={{
                  border: 'none',
                  borderRadius: 'var(--rounded-pill)',
                  padding: '8px 18px',
                  fontSize: '16px',
                }}
              >
                Starter
              </Button>
              {/* Selected pill — primary bg, on-primary text */}
              <Button
                variant="primary"
                size="sm"
                style={{
                  borderRadius: 'var(--rounded-pill)',
                  padding: '8px 18px',
                  fontSize: '16px',
                }}
              >
                Professional
              </Button>
              {/* Default (unselected) pill */}
              <Button
                variant="secondary"
                size="sm"
                style={{
                  border: 'none',
                  borderRadius: 'var(--rounded-pill)',
                  padding: '8px 18px',
                  fontSize: '16px',
                }}
              >
                Organization
              </Button>
              {/* Default (unselected) pill */}
              <Button
                variant="secondary"
                size="sm"
                style={{
                  border: 'none',
                  borderRadius: 'var(--rounded-pill)',
                  padding: '8px 18px',
                  fontSize: '16px',
                }}
              >
                Enterprise
              </Button>
            </div>
          </Stack>
        </Card>

        {/* Circular icon button cell */}
        <Card>
          <Stack gap="sm">
            <Text variant="caption">Icon Circular</Text>
            <button
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--rounded-full)',
                backgroundColor: 'var(--color-surface-soft)',
                color: 'var(--color-ink)',
                border: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--font-size-button)',
                fontWeight: 'var(--font-weight-button)',
                lineHeight: 'var(--line-height-button)',
                padding: 0,
              }}
              aria-label="Next"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M7 4l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </Stack>
        </Card>
      </div>
    </section>
  );
};

ComponentDemos.displayName = 'ComponentDemos';

const meta: Meta<typeof ComponentDemos> = {
  title: 'Design System/figma/ComponentDemos',
  component: ComponentDemos,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof ComponentDemos>;

export const Default: Story = {};
