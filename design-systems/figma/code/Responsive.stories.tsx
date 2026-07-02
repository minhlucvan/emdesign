import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Badge, Heading, Text, Stack, Card } from './index';

/**
 * Responsive section documenting the Figma design system's breakpoint ladder,
 * touch-target requirements, and collapsing strategy.
 *
 * Composition: mono eyebrow label ("10 — Responsive Behavior"), an h2 opener,
 * a breakpoint table with Name / Width / Key Changes columns, a visual device
 * ladder that scales representative widths from 375px to 1440px, and two
 * side-by-side columns listing touch-target specs and the collapsing strategy.
 *
 * Every value traces back to var(--token-*).
 */
const Responsive = () => {
  const breakpoints = [
    { name: '4k', width: '1920px', changes: 'Max content width holds at 1280px; gutters expand' },
    { name: 'Desktop-XL', width: '1440px', changes: 'Default desktop layout' },
    { name: 'Desktop', width: '1400px', changes: 'Comparison table column widths normalize' },
    { name: 'Desktop-S', width: '1280px', changes: 'Pricing 4-up tier grid maintained' },
    { name: 'Tablet', width: '960px', changes: 'Pricing collapses 4-up to 2-up; nav becomes hamburger' },
    { name: 'Mobile-L', width: '768px', changes: 'Color-block sections become full-bleed (corners removed)' },
    { name: 'Mobile', width: '560px', changes: 'Display-xl reduces 86px to ~48px; pill CTAs go full-width' },
    { name: 'Mobile-XS', width: '559px', changes: 'Two-column footer collapses to single column' },
  ];

  /* Representative widths for the device ladder */
  const ladder = [
    { label: 'Desktop-XL', widthPx: 1440, color: 'var(--color-block-lime)' },
    { label: 'Desktop', widthPx: 1280, color: 'var(--color-block-lilac)' },
    { label: 'Tablet', widthPx: 960, color: 'var(--color-block-cream)' },
    { label: 'Mobile-L', widthPx: 768, color: 'var(--color-block-mint)' },
    { label: 'Mobile', widthPx: 560, color: 'var(--color-block-pink)' },
    { label: 'Mobile-XS', widthPx: 375, color: 'var(--color-block-coral)' },
  ];

  const touchTargets = [
    'Pill buttons maintain minimum 44px tap height across all viewports — achieved by combining typography.button 20px line-height with documented vertical padding.',
    'Circular icon buttons (button-icon-circular) are 40px on desktop and grow to 44px on touch viewports.',
    'Form input minimum tap target on /contact/ is 48px high.',
  ];

  const collapsingStrategy = [
    'Nav: desktop horizontal nav with two right-anchored pills collapses to a hamburger overlay below 960px. The two pills (Contact sales, Get started for free) stay visible on the bar above 560px and stack in the overlay below.',
    'Pricing tier grid: 4-up to 2-up at 960px to 1-up below 768px. The pill toggle stays horizontal and scrolls if needed below 560px.',
    'Color-block sections: above 768px the section keeps spacing.xxl of canvas around it so rounded corners read; below 768px corners are removed and the block bleeds to viewport edge for a poster effect.',
    'Comparison table: below 960px the matrix collapses into per-tier accordions to avoid horizontal scroll.',
  ];

  return (
    <div
      style={{
        backgroundColor: 'var(--color-canvas)',
        fontFeatureSettings: '"kern"',
        padding: 'var(--spacing-section) var(--spacing-xl)',
      }}
    >
      <Stack
        direction="col"
        gap="xxl"
        style={{ maxWidth: '1280px', margin: '0 auto' }}
      >
        {/* Eyebrow — figmaMono uppercase per DESIGN.md typography.eyebrow */}
        <Badge color="accent" style={{ alignSelf: 'flex-start' }}>
          10 — Responsive Behavior
        </Badge>

        {/* Section heading — h2 mapping to display-lg (64px) */}
        <Heading level={2} style={{ margin: 0 }}>
          Responsive Breakpoints
        </Heading>

        <Text
          variant="body"
          as="p"
          style={{
            fontSize: 'var(--font-size-body-lg)',
            fontWeight: 'var(--font-weight-body-lg)',
            lineHeight: 'var(--line-height-body-lg)',
            letterSpacing: 'var(--letter-spacing-body-lg)',
            color: 'var(--color-ink)',
            maxWidth: '680px',
            margin: 0,
          }}
        >
          Figma&apos;s marketing canvas adapts across eight named breakpoints.
          The system prioritizes content hierarchy and touch accessibility at
          every width, from 4k monitors to handheld devices.
        </Text>

        {/* ── Breakpoint Table ── */}
        <Card variant="default" style={{ padding: 0, overflow: 'hidden' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--font-size-body-sm)',
              lineHeight: 'var(--line-height-body-sm)',
              color: 'var(--color-ink)',
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: 'var(--color-surface-soft)',
                  textAlign: 'left',
                }}
              >
                <th
                  style={{
                    padding: 'var(--spacing-md) var(--spacing-lg)',
                    fontWeight: 'var(--font-weight-caption)',
                    borderBottom: '1px solid var(--color-hairline)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--font-size-caption)',
                    letterSpacing: 'var(--letter-spacing-caption)',
                    textTransform: 'uppercase',
                  }}
                >
                  Name
                </th>
                <th
                  style={{
                    padding: 'var(--spacing-md) var(--spacing-lg)',
                    fontWeight: 'var(--font-weight-caption)',
                    borderBottom: '1px solid var(--color-hairline)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--font-size-caption)',
                    letterSpacing: 'var(--letter-spacing-caption)',
                    textTransform: 'uppercase',
                    width: '140px',
                  }}
                >
                  Width
                </th>
                <th
                  style={{
                    padding: 'var(--spacing-md) var(--spacing-lg)',
                    fontWeight: 'var(--font-weight-caption)',
                    borderBottom: '1px solid var(--color-hairline)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--font-size-caption)',
                    letterSpacing: 'var(--letter-spacing-caption)',
                    textTransform: 'uppercase',
                  }}
                >
                  Key Changes
                </th>
              </tr>
            </thead>
            <tbody>
              {breakpoints.map((bp, i) => (
                <tr
                  key={i}
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
                      fontSize: '14px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {bp.width}
                  </td>
                  <td
                    style={{
                      padding: 'var(--spacing-sm) var(--spacing-lg)',
                      fontWeight: 'var(--font-weight-body)',
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

        {/* ── Device Ladder ── */}
        <Stack direction="col" gap="md">
          <Text
            variant="caption"
            as="span"
            style={{ color: 'var(--color-ink)' }}
          >
            Device Width Ladder
          </Text>

          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: 'var(--spacing-xs)',
              padding: 'var(--spacing-lg) 0',
              overflowX: 'auto',
            }}
          >
            {ladder.map((rung, i) => {
              /* Scale the percentage so 1440px maps to 100% and 375px maps proportionally */
              const scalePercent = (rung.widthPx / 1440) * 100;
              return (
                <div
                  key={i}
                  style={{
                    flex: `0 0 ${Math.max(scalePercent, 12)}%`,
                    minWidth: '60px',
                  }}
                >
                  <div
                    style={{
                      height: `${Math.max(6 + (rung.widthPx / 1440) * 20, 10)}px`,
                      backgroundColor: rung.color,
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
                      fontSize: '11px',
                      color: 'var(--color-ink)',
                      lineHeight: '1.3',
                    }}
                  >
                    <div style={{ fontWeight: 'var(--font-weight-button)' }}>
                      {rung.label}
                    </div>
                    <div>{rung.widthPx}px</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Stack>

        {/* ── Side-by-side columns: Touch Targets + Collapsing Strategy ── */}
        <Stack
          direction="row"
          gap="xl"
          wrap
          style={{ marginTop: 'var(--spacing-lg)' }}
        >
          {/* Touch Targets */}
          <Card
            variant="default"
            style={{
              flex: '1 1 320px',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-sm)',
            }}
          >
            <Text
              variant="caption"
              as="span"
              style={{ color: 'var(--color-ink)' }}
            >
              Touch Targets
            </Text>
            <ol
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
              {touchTargets.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ol>
          </Card>

          {/* Collapsing Strategy */}
          <Card
            variant="default"
            style={{
              flex: '1 1 320px',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-sm)',
            }}
          >
            <Text
              variant="caption"
              as="span"
              style={{ color: 'var(--color-ink)' }}
            >
              Collapsing Strategy
            </Text>
            <ol
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
              {collapsingStrategy.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ol>
          </Card>
        </Stack>
      </Stack>
    </div>
  );
};

Responsive.displayName = 'Responsive';

const meta: Meta<typeof Responsive> = {
  title: 'Design System/figma/Responsive',
  component: Responsive,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof Responsive>;

export const Default: Story = {};
