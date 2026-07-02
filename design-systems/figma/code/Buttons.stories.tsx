import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button, Heading, Text, Card, Stack } from './index';

/**
 * Buttons section — a visual catalog of every button variant
 * in the Figma design system. Each variant is shown inside a bordered
 * Card cell with a mono uppercase label and the rendered component.
 *
 * Matches the reference preview HTML layout: a responsive grid of
 * button cells covering primary, secondary, ghost, magenta promo,
 * pricing tabs, circular icon buttons (light and inverse), and a
 * pressed-state demo.
 *
 * All values trace back to var(--token-*) CSS custom properties.
 */
const Buttons = () => {
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
          Buttons
        </Heading>
      </Stack>

      {/* Responsive grid of button cells */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 'var(--spacing-md)',
        }}
      >
        {/* button-primary */}
        <Card>
          <Stack gap="sm">
            <Text variant="caption">button-primary</Text>
            <Button variant="primary" size="md">
              Get started for free
            </Button>
          </Stack>
        </Card>

        {/* button-secondary */}
        <Card>
          <Stack gap="sm">
            <Text variant="caption">button-secondary</Text>
            <Button variant="secondary" size="md">
              Contact sales
            </Button>
          </Stack>
        </Card>

        {/* button-tertiary-text — ghost/link style */}
        <Card>
          <Stack gap="sm">
            <Text variant="caption">button-tertiary-text</Text>
            <Button variant="ghost" size="md">
              Learn more
            </Button>
          </Stack>
        </Card>

        {/* button-magenta-promo — primary variant overridden with magenta bg */}
        <Card>
          <Stack gap="sm">
            <Text variant="caption">button-magenta-promo</Text>
            <Button
              variant="primary"
              size="md"
              style={{ backgroundColor: 'var(--color-accent-magenta)' }}
            >
              Save your spot
            </Button>
          </Stack>
        </Card>

        {/* button-icon-circular */}
        <Card>
          <Stack gap="sm">
            <Text variant="caption">button-icon-circular</Text>
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

        {/* button-icon-circular-inverse — on dark bg */}
        <Card
          style={{
            backgroundColor: 'var(--color-block-navy)',
            border: 'none',
          }}
        >
          <Stack gap="sm">
            <Text
              variant="caption"
              style={{ color: 'var(--color-inverse-ink)' }}
            >
              button-icon-circular-inverse
            </Text>
            <button
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--rounded-full)',
                backgroundColor: 'rgba(255,255,255,0.16)',
                color: 'var(--color-inverse-ink)',
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

        {/* button-primary-pressed */}
        <Card>
          <Stack gap="sm">
            <Text variant="caption">button-primary-pressed</Text>
            <Button
              variant="primary"
              size="md"
              style={{ transform: 'scale(0.97)' }}
            >
              Get started for free
            </Button>
          </Stack>
        </Card>

        {/* Pricing tabs: default + selected pills */}
        <Card>
          <Stack gap="sm">
            <Text variant="caption">
              pricing-tab-default + pricing-tab-selected
            </Text>
            <div
              style={{
                display: 'flex',
                gap: 'var(--spacing-xs)',
                flexWrap: 'wrap',
              }}
            >
              {/* Default tab */}
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
              {/* Selected tab */}
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
              {/* Default tab */}
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
              {/* Default tab */}
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
      </div>
    </section>
  );
};

Buttons.displayName = 'Buttons';

const meta: Meta<typeof Buttons> = {
  title: 'Design System/figma/Buttons',
  component: Buttons,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof Buttons>;

export const Default: Story = {};
