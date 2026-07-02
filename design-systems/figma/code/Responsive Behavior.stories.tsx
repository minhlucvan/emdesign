import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Badge, Heading, Text, Stack, Card } from './index';

/**
 * Responsive Behavior section documenting the Figma design system's
 * breakpoint ladder, touch-target requirements, and collapsing strategy.
 *
 * Composition: mono uppercase eyebrow ("10 — Responsive Behavior") →
 * h2 heading → breakpoint table (Name / Width / Key Changes) →
 * visual device ladder → side-by-side Touch Targets + Collapsing
 * Strategy columns. Every value traces back to var(--token-*).
 */
const ResponsiveBehavior = () => {
  const breakpoints = [
    { name: '4k', width: '1920px', changes: 'Max content width holds at 1280px; gutters expand' },
    { name: 'Desktop-XL', width: '1440px', changes: 'Default desktop layout' },
    { name: 'Desktop', width: '1400px', changes: 'Comparison table column widths normalize' },
    { name: 'Desktop-S', width: '1280px', changes: 'Pricing 4-up tier grid maintained' },
    { name: 'Tablet', width: '960px', changes: 'Pricing collapses 4-up to 2-up; nav becomes hamburger' },
    { name: 'Mobile-L', width: '768px', changes: 'Color-block sections become full-bleed (no rounded corners on edges)' },
    { name: 'Mobile', width: '560px', changes: 'Display-xl reduces from 86px to ~48px; pill CTAs go full-width' },
    { name: 'Mobile-XS', width: '559px', changes: 'Two-column footer collapses to single column' },
  ];

  const deviceLadder = [
    { label: '1440', widthPx: 1440 },
    { label: '1280', widthPx: 1280 },
    { label: '960', widthPx: 960 },
    { label: '768', widthPx: 768 },
    { label: '560', widthPx: 560 },
    { label: '375', widthPx: 375 },
  ];

  const touchTargets = [
    'Pill buttons (button-primary, button-secondary) maintain a minimum 44px tap height across all viewports — achieved by combining typography.button 20px line-height with the documented vertical padding.',
    'Circular icon buttons (button-icon-circular) are 40px on desktop and grow to 44px on touch viewports.',
    'Form input minimum tap target on /contact/ is 48px high.',
  ];

  const collapsingStrategy = [
    'Nav: desktop horizontal nav with two right-anchored pills collapses to a hamburger overlay below 960px. The two pills (Contact sales, Get started for free) stay visible on the bar above 560px and stack in the overlay below.',
    'Pricing tier grid: 4-up to 2-up at 960px to 1-up below 768px. The pill toggle stays horizontal and scrolls horizontally if needed below 560px.',
    'Color-block sections: above 768px the section keeps spacing.xxl of canvas around it so the rounded corners read; below 768px the corners are removed and the block bleeds to viewport edge for a poster effect.',
    'Comparison table: below 960px the matrix collapses into per-tier accordions to avoid horizontal scroll.',
  ];

  return (
    <section
      style={{
        backgroundColor: 'var(--color-surface-soft)',
        fontFeatureSettings: '"kern"',
        padding: 'var(--spacing-section) var(--spacing-xl)',
      }}
    >
      <Stack
        direction="col"
        gap="xl"
        style={{ maxWidth: '1280px', margin: '0 auto' }}
      >
        {/* ── Section header: eyebrow + heading ── */}
        <Badge color="accent" style={{ alignSelf: 'flex-start' }}>
          10 — Responsive Behavior
        </Badge>

        <Heading level={2} style={{ margin: 0 }}>
          Responsive
        </Heading>

        {/* ── Breakpoint Table ── */}
        <Card variant="default" style={{ padding: 0, overflow: 'hidden' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontFamily: 'var(--font-sans)',
              color: 'var(--color-ink)',
              fontSize: 'var(--font-size-body-sm)',
              lineHeight: 'var(--line-height-body-sm)',
              letterSpacing: 'var(--letter-spacing-body-sm)',
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: 'var(--color-surface-soft)',
                  textAlign: 'left',
                }}
              >
                {['Name', 'Width', 'Key Changes'].map((header) => (
                  <th
                    key={header}
                    style={{
                      padding: 'var(--spacing-sm) var(--spacing-lg)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--font-size-caption)',
                      fontWeight: 'var(--font-weight-caption)',
                      letterSpacing: 'var(--letter-spacing-caption)',
                      lineHeight: 'var(--line-height-caption)',
                      textTransform: 'uppercase',
                      borderBottom: '1px solid var(--color-hairline)',
                    }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {breakpoints.map((bp) => (
                <tr
                  key={bp.name}
                  style={{
                    borderBottom: '1px solid var(--color-hairline-soft)',
                  }}
                >
                  <td
                    style={{
                      padding: 'var(--spacing-sm) var(--spacing-lg)',
                      fontWeight: 'var(--font-weight-button)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {bp.name}
                  </td>
                  <td
                    style={{
                      padding: 'var(--spacing-sm) var(--spacing-lg)',
                      fontFamily: 'var(--font-mono)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {bp.width}
                  </td>
                  <td
                    style={{
                      padding: 'var(--spacing-sm) var(--spacing-lg)',
                      fontSize: 'var(--font-size-body-sm)',
                    }}
                  >
                    {bp.changes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* ── Device Width Ladder ── */}
        <Stack direction="col" gap="md">
          <Text variant="caption" as="span">
            Device Width Ladder
          </Text>

          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: 'var(--spacing-md)',
              flexWrap: 'wrap',
            }}
          >
            {deviceLadder.map((rung) => {
              const basePercent = (rung.widthPx / 1440) * 100;
              const widthPercent = Math.max(basePercent, 10);
              return (
                <div
                  key={rung.label}
                  style={{
                    flex: `0 0 ${widthPercent}%`,
                    minWidth: '48px',
                    maxWidth: '200px',
                  }}
                >
                  <div
                    style={{
                      height: `${Math.max(24, (rung.widthPx / 1440) * 40)}px`,
                      backgroundColor: 'var(--color-surface-soft)',
                      borderRadius: 'var(--rounded-xs) var(--rounded-xs) 0 0',
                      border: '1px solid var(--color-hairline)',
                      borderBottom: 'none',
                    }}
                  />
                  <div
                    style={{
                      textAlign: 'center',
                      padding: 'var(--spacing-xxs) 0',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--font-size-caption)',
                      color: 'var(--color-ink)',
                      lineHeight: '1.3',
                    }}
                  >
                    {rung.label}px
                  </div>
                </div>
              );
            })}
          </div>
        </Stack>

        {/* ── Side-by-side: Touch Targets + Collapsing Strategy ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'var(--spacing-xl)',
            marginTop: 'var(--spacing-md)',
          }}
        >
          {/* Touch Targets */}
          <Card
            variant="default"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-sm)',
            }}
          >
            <Text variant="caption" as="span">
              Touch Targets
            </Text>
            <ul
              style={{
                margin: 0,
                paddingLeft: 'var(--spacing-lg)',
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--font-size-body-sm)',
                fontWeight: 'var(--font-weight-body)',
                lineHeight: 'var(--line-height-body)',
                color: 'var(--color-ink)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--spacing-sm)',
              }}
            >
              {touchTargets.map((item) => (
                <li key={item.slice(0, 20)}>{item}</li>
              ))}
            </ul>
          </Card>

          {/* Collapsing Strategy */}
          <Card
            variant="default"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-sm)',
            }}
          >
            <Text variant="caption" as="span">
              Collapsing Strategy
            </Text>
            <ul
              style={{
                margin: 0,
                paddingLeft: 'var(--spacing-lg)',
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--font-size-body-sm)',
                fontWeight: 'var(--font-weight-body)',
                lineHeight: 'var(--line-height-body)',
                color: 'var(--color-ink)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--spacing-sm)',
              }}
            >
              {collapsingStrategy.map((item) => (
                <li key={item.slice(0, 20)}>{item}</li>
              ))}
            </ul>
          </Card>
        </div>
      </Stack>
    </section>
  );
};

ResponsiveBehavior.displayName = 'ResponsiveBehavior';

const meta: Meta<typeof ResponsiveBehavior> = {
  title: 'Design System/figma/Responsive Behavior',
  component: ResponsiveBehavior,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof ResponsiveBehavior>;

export const Default: Story = {};
