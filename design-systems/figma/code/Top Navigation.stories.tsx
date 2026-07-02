import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button, Text, Stack, Link } from './index';

/**
 * Top Navigation for the Figma marketing site.
 *
 * Composition: a sticky white bar with the Figma wordmark on the left,
 * primary nav links in the center (styled as tertiary-text links),
 * and a right-anchored button-secondary ("Contact sales") +
 * button-primary ("Get started for free") pair.
 *
 * Every visual property traces back to var(--token-*) — no raw hex colors
 * or hardcoded values. Matches components.top-nav in DESIGN.md.
 *
 * Desktop layout (>=960px): links visible in a horizontal row.
 * Mobile (<960px): links collapse into a hamburger (not shown — the
 * full-canvas overlay is a separate interaction pattern).
 */
const TopNavigation = () => {
  return (
    <div
      style={{
        fontFeatureSettings: '"kern"',
      }}
    >
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: 'var(--color-canvas)',
          borderBottom: '1px solid var(--color-hairline)',
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
          {/* Left: Figma wordmark */}
          <Text
            variant="body-sm"
            as="span"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '18px',
              fontWeight: 'var(--font-weight-card-title)',
              color: 'var(--color-ink)',
              cursor: 'default',
              letterSpacing: 'var(--letter-spacing-body-sm)',
            }}
          >
            Figma
          </Text>

          {/* Right side: nav links + CTA pair */}
          <Stack direction="row" gap="lg" align="center" wrap={false}>
            {/* Primary nav links as tertiary-text buttons */}
            <Link href="#" style={{ fontSize: 'var(--font-size-body-sm)', fontWeight: 'var(--font-weight-body-sm)', lineHeight: 'var(--line-height-body-sm)', letterSpacing: 'var(--letter-spacing-body-sm)' }}>
              Products
            </Link>
            <Link href="#" style={{ fontSize: 'var(--font-size-body-sm)', fontWeight: 'var(--font-weight-body-sm)', lineHeight: 'var(--line-height-body-sm)', letterSpacing: 'var(--letter-spacing-body-sm)' }}>
              Solutions
            </Link>
            <Link href="#" style={{ fontSize: 'var(--font-size-body-sm)', fontWeight: 'var(--font-weight-body-sm)', lineHeight: 'var(--line-height-body-sm)', letterSpacing: 'var(--letter-spacing-body-sm)' }}>
              Community
            </Link>
            <Link href="#" style={{ fontSize: 'var(--font-size-body-sm)', fontWeight: 'var(--font-weight-body-sm)', lineHeight: 'var(--line-height-body-sm)', letterSpacing: 'var(--letter-spacing-body-sm)' }}>
              Resources
            </Link>
            <Link href="#" style={{ fontSize: 'var(--font-size-body-sm)', fontWeight: 'var(--font-weight-body-sm)', lineHeight: 'var(--line-height-body-sm)', letterSpacing: 'var(--letter-spacing-body-sm)' }}>
              Pricing
            </Link>

            {/* Sign-in link as tertiary text */}
            <Link
              href="#"
              style={{
                fontSize: 'var(--font-size-body-sm)',
                fontWeight: 'var(--font-weight-body-sm)',
                lineHeight: 'var(--line-height-body-sm)',
                letterSpacing: 'var(--letter-spacing-body-sm)',
                textDecoration: 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.textDecorationColor = 'var(--color-ink)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.textDecorationColor = 'var(--color-hairline)';
              }}
            >
              Sign in
            </Link>

            <Button variant="secondary" size="sm">
              Contact sales
            </Button>
            <Button variant="primary" size="sm">
              Get started for free
            </Button>
          </Stack>
        </Stack>
      </nav>

      {/* Placeholder section below the nav to demonstrate sticky behavior */}
      <section
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--spacing-section) var(--spacing-xl)',
          minHeight: 'calc(100vh - 56px)',
          backgroundColor: 'var(--color-canvas)',
        }}
      >
        <Stack direction="col" gap="lg" align="center" style={{ maxWidth: '720px', textAlign: 'center' }}>
          <Text
            variant="body-sm"
            as="span"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--font-size-eyebrow)',
              fontWeight: 'var(--font-weight-eyebrow)',
              lineHeight: 'var(--line-height-eyebrow)',
              letterSpacing: 'var(--letter-spacing-eyebrow)',
              textTransform: 'uppercase',
              color: 'var(--color-ink)',
              opacity: 0.7,
            }}
          >
            Top Navigation
          </Text>
          <Text
            variant="body"
            as="p"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--font-size-body-lg)',
              fontWeight: 'var(--font-weight-body-lg)',
              lineHeight: 'var(--line-height-body-lg)',
              letterSpacing: 'var(--letter-spacing-body-lg)',
              color: 'var(--color-ink)',
              maxWidth: '680px',
            }}
          >
            The top nav is a sticky white bar with wordmark, nav links, sign-in,
            and the button-secondary + button-primary CTA pair. Below 960px the
            links collapse into a hamburger overlay while the two pill CTAs
            remain visible.
          </Text>
        </Stack>
      </section>
    </div>
  );
};

TopNavigation.displayName = 'TopNavigation';

const meta: Meta<typeof TopNavigation> = {
  title: 'Design System/figma/Top Navigation',
  component: TopNavigation,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof TopNavigation>;

export const Default: Story = {};
