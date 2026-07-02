import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FooterLink {
  /** Link label text. */
  label: string;
  /** Optional URL — renders as an anchor when provided, as a span otherwise. */
  href?: string;
}

export interface FooterColumn {
  /** Column heading text (rendered as h6). */
  title: string;
  /** List of links or text items within this column. */
  links: FooterLink[];
}

export interface FooterGridProps {
  /** Column data for the link grid sections. */
  columns?: FooterColumn[];
  /** Additional CSS class names. */
  className?: string;
  /** Additional inline styles. */
  style?: React.CSSProperties;
}

// ---------------------------------------------------------------------------
// Default column data — Miro product footer
// ---------------------------------------------------------------------------

const defaultColumns: FooterColumn[] = [
  {
    title: 'VoltAgent Framework',
    links: [
      { label: 'TypeScript agents' },
      { label: 'Tool orchestration' },
      { label: 'Multi-agent workflows' },
    ],
  },
  {
    title: 'VoltOps LLM Observability',
    links: [
      { label: 'LLM tracing' },
      { label: 'Live debugging' },
      { label: 'Visual timelines' },
    ],
  },
  {
    title: 'Production',
    links: [
      { label: 'Evaluations' },
      { label: 'Prompt management' },
      { label: 'Guardrails' },
    ],
  },
  {
    title: 'Platform',
    links: [
      { label: 'VoltOps console' },
      { label: 'Open source core' },
      { label: 'Agent engineering' },
    ],
  },
];

// ---------------------------------------------------------------------------
// Styles — every value binds to a Miro semantic CSS custom property
// ---------------------------------------------------------------------------

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: 'var(--space-xxl)',
  fontFamily: 'var(--font-sans)',
  boxSizing: 'border-box',
};

const columnStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-sm)',
};

const headingStyle: React.CSSProperties = {
  fontSize: 'var(--font-size-body-sm)',
  fontWeight: 'var(--font-weight-medium)',
  lineHeight: 1.2,
  color: 'var(--color-text-on-primary)',
  margin: 0,
  marginBottom: 'var(--space-xs)',
};

const linkStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 'var(--font-size-body-sm)',
  lineHeight: 1.35,
  color: 'var(--color-text-muted)',
  padding: 'var(--space-xxs) 0',
  textDecoration: 'none',
  fontFamily: 'var(--font-sans)',
};

// ---------------------------------------------------------------------------
// FooterGrid component
// ---------------------------------------------------------------------------

/**
 * `FooterGrid` — responsive multi-column link grid for page footers.
 *
 * Renders a 4-column grid of link groups, each with an h6 heading followed by
 * a list of text links or labels. All colors, spacing, and typography reference
 * Miro design-system CSS custom properties — no raw values or hardcoded pixels.
 *
 * The component ships with default Miro product footer content but accepts
 * custom column data via the `columns` prop.
 *
 * ```tsx
 * <FooterGrid />
 * <FooterGrid columns={customColumns} />
 * ```
 */
export function FooterGrid({
  columns = defaultColumns,
  className,
  style,
  ...rest
}: FooterGridProps & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={className}
      style={{
        ...gridStyle,
        ...style,
      }}
      {...rest}
    >
      {columns.map((col, idx) => (
        <div key={idx} style={columnStyle}>
          <h6 style={headingStyle}>{col.title}</h6>
          {col.links.map((link, linkIdx) =>
            link.href ? (
              <a key={linkIdx} href={link.href} style={linkStyle}>
                {link.label}
              </a>
            ) : (
              <span key={linkIdx} style={linkStyle}>
                {link.label}
              </span>
            ),
          )}
        </div>
      ))}
    </div>
  );
}

FooterGrid.displayName = 'FooterGrid';

export default FooterGrid;
