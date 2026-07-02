import React from 'react';
import { Heading } from './Heading';
import { Text } from './Text';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FooterLink {
  /** Display label for the link. */
  label: string;
  /** Link destination URL. */
  href: string;
}

export interface FooterColumn {
  /** Column heading text. */
  heading: string;
  /** Array of links displayed beneath the heading. */
  links: FooterLink[];
}

export interface FooterProps {
  /** Array of link columns rendered in the grid. */
  columns: FooterColumn[];
  /** Optional content for the bottom bar (copyright, legal, social, etc.). */
  bottomContent?: React.ReactNode;
  /** Additional class names for custom styling. */
  className?: string;
  /** Additional inline styles. */
  style?: React.CSSProperties;
}

// ---------------------------------------------------------------------------
// Style constants — every visual property binds to a Miro CSS custom property
// ---------------------------------------------------------------------------

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
  gap: 'var(--space-xl)',
  maxWidth: 'var(--container-max, 1200px)',
  margin: '0 auto',
  boxSizing: 'border-box',
};

const listStyle: React.CSSProperties = {
  listStyle: 'none',
  padding: 0,
  margin: 'var(--space-md) 0 0',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-sm)',
};

const linkStyle: React.CSSProperties = {
  color: 'var(--color-text-on-dark)',
  textDecoration: 'none',
  fontFamily: 'var(--font-sans)',
  fontSize: 14,
  lineHeight: 1.5,
  transition: 'opacity 120ms ease',
};

const bottomOuterStyle: React.CSSProperties = {
  gridColumn: '1 / -1',
  borderTop: '1px solid var(--miro-hairline-soft)',
  marginTop: 'var(--space-section)',
  paddingTop: 'var(--space-lg)',
};

const bottomInnerStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 'var(--space-md)',
};

// ---------------------------------------------------------------------------
// Footer component
// ---------------------------------------------------------------------------

/**
 * `Footer` — grid-based multi-column footer layout for the Miro design system.
 *
 * Renders a CSS Grid layout of link columns, each with a heading and list of
 * links, plus an optional bottom bar for copyright, legal links, and social
 * icons. Designed to be placed inside `FooterShell` (which provides the dark
 * background, on-dark typography, and outer padding).
 *
 * The grid auto-fits columns with a 160px minimum, wrapping to the next row
 * when space narrows. Every visual property binds to a Miro CSS custom
 * property — no raw hex values, no hardcoded spacing.
 *
 * ```tsx
 * <FooterShell>
 *   <Footer
 *     columns={[
 *       {
 *         heading: 'Product',
 *         links: [
 *           { label: 'Overview', href: '/product' },
 *           { label: 'Pricing', href: '/pricing' },
 *         ],
 *       },
 *       {
 *         heading: 'Resources',
 *         links: [
 *           { label: 'Blog', href: '/blog' },
 *           { label: 'Help Center', href: '/help' },
 *         ],
 *       },
 *     ]}
 *     bottomContent={
 *       <Text variant="small">
 *         &copy; 2024 Miro. All rights reserved.
 *       </Text>
 *     }
 *   />
 * </FooterShell>
 * ```
 */
export function Footer({
  columns,
  bottomContent,
  className,
  style,
  ...rest
}: FooterProps) {
  return (
    <div
      className={className}
      style={{
        ...gridStyle,
        ...style,
      }}
      {...rest}
    >
      {columns.map((column, idx) => (
        <div key={idx}>
          <Heading
            level={6}
            style={{
              color: 'var(--color-text-on-dark)',
              marginBottom: 'var(--space-md)',
            }}
          >
            {column.heading}
          </Heading>
          <ul style={listStyle}>
            {column.links.map((link, linkIdx) => (
              <li key={linkIdx}>
                <a
                  href={link.href}
                  style={linkStyle}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.7';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
      {bottomContent && (
        <div style={bottomOuterStyle}>
          <div style={bottomInnerStyle}>{bottomContent}</div>
        </div>
      )}
    </div>
  );
}

Footer.displayName = 'Footer';

export default Footer;
