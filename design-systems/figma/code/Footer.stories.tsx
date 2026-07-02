import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Text, Stack } from './index';

/**
 * Footer section for the Figma marketing site.
 *
 * Full-width white canvas footer with a 4-column link grid,
 * caption-styled column headings (figmaMono, uppercase), stacked
 * body-sm text links, and a bottom credit row separated by a
 * hairline border with copyright text and social links.
 *
 * Matches the `components.footer` spec in DESIGN.md:
 *   Background  var(--color-canvas)
 *   Text        var(--color-ink)
 *   Headings    var(--typography.caption)  — figmaMono, 12px, uppercase
 *   Links       var(--typography.body-sm)  — figmaSans, 16px, weight 330
 *   Padding     var(--spacing-section) top/bottom, var(--spacing-xl) sides
 *
 * Every visual property traces back to var(--token-*) — no raw hex values.
 */
const Footer = () => {
  const columns = [
    {
      heading: 'Product',
      links: ['Figma', 'FigJam', 'Figma Slides', 'Downloads', "What's New"],
    },
    {
      heading: 'Resources',
      links: ['Blog', 'Community', 'Support', 'Developers', 'Documentation'],
    },
    {
      heading: 'Company',
      links: ['About', 'Careers', 'Press', 'Events', 'Partners'],
    },
    {
      heading: 'Legal',
      links: ['Privacy', 'Terms of Service', 'Cookie Policy', 'GDPR', 'Security'],
    },
  ];

  const socialLinks = ['Twitter', 'GitHub', 'YouTube'];

  return (
    <footer
      style={{
        backgroundColor: 'var(--color-canvas)',
        padding: 'var(--spacing-section) var(--spacing-xl)',
        fontFeatureSettings: '"kern"',
      }}
    >
      {/* Inner container — 1280px max width per layout spec */}
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Wordmark — "Figma" set in display weight at the top-left */}
        <Text
          variant="body-sm"
          as="span"
          style={{
            fontWeight: 'var(--font-weight-card-title)',
            cursor: 'default',
            display: 'block',
            marginBottom: 'var(--spacing-xxl)',
            fontSize: 'var(--font-size-body-lg)',
          }}
        >
          Figma
        </Text>

        {/* 4-column link grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 'var(--spacing-xl)',
          }}
        >
          {columns.map((col) => (
            <Stack key={col.heading} direction="col" gap="sm">
              {/* Column heading — typography.caption: figmaMono, 12px, uppercase */}
              <Text
                variant="caption"
                as="span"
                style={{
                  color: 'var(--color-ink)',
                  marginBottom: 'var(--spacing-xs)',
                }}
              >
                {col.heading}
              </Text>

              {/* Stacked footer links — body-sm per DESIGN.md typography table */}
              {col.links.map((label) => (
                <a
                  key={label}
                  href="#"
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 'var(--font-size-body-sm)',
                    fontWeight: 'var(--font-weight-body-sm)',
                    lineHeight: 'var(--line-height-body-sm)',
                    letterSpacing: 'var(--letter-spacing-body-sm)',
                    color: 'var(--color-ink)',
                    textDecoration: 'none',
                    cursor: 'pointer',
                    transition: 'opacity 0.15s ease',
                    fontFeatureSettings: '"kern"',
                    padding: 'var(--spacing-xxs) 0',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.opacity = '0.6';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.opacity = '1';
                  }}
                >
                  {label}
                </a>
              ))}
            </Stack>
          ))}
        </div>

        {/* Credit row — separated by a hairline border */}
        <div
          style={{
            marginTop: 'var(--spacing-xxl)',
            borderTop: '1px solid var(--color-hairline)',
            paddingTop: 'var(--spacing-lg)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 'var(--spacing-md)',
          }}
        >
          <Text
            variant="caption"
            as="span"
            style={{ color: 'var(--color-ink)' }}
          >
            {'©'} 2026 Figma. All rights reserved.
          </Text>

          {/* Social links */}
          <Stack direction="row" gap="md" align="center">
            {socialLinks.map((label) => (
              <Text
                key={label}
                variant="caption"
                as="a"
                href="#"
                style={{
                  color: 'var(--color-ink)',
                  textDecoration: 'none',
                  cursor: 'pointer',
                }}
              >
                {label}
              </Text>
            ))}
          </Stack>
        </div>
      </div>
    </footer>
  );
};

Footer.displayName = 'Footer';

const meta: Meta<typeof Footer> = {
  title: 'Design System/figma/Footer',
  component: Footer,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof Footer>;

export const Default: Story = {};
