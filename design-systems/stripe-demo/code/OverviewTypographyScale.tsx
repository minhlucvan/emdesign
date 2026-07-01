import React from 'react';

/* ---- Data ---- */

interface TypeEntry {
  label: string;
  sample: string;
  family: string;
  size: string;
  weight: string;
  lineHeight: string;
  letterSpacing: string;
  usage: string;
}

const typeScale: TypeEntry[] = [
  {
    label: 'Hero H1',
    sample: 'Payments infrastructure for the internet',
    family: 'Inter, Sohne, SF Pro Display',
    size: '56px',
    weight: '300',
    lineHeight: '1.12',
    letterSpacing: '-1.4px',
    usage: 'Marketing hero headline (thin weight, generous tracking).',
  },
  {
    label: 'Section Heading',
    sample: 'The platform that grows with you',
    family: 'Inter, Sohne, SF Pro Display',
    size: '50px',
    weight: '700',
    lineHeight: '1.12',
    letterSpacing: '-0.6px',
    usage: 'Major section headings on marketing pages.',
  },
  {
    label: 'Subhead',
    sample: 'Global scale, local feel',
    family: 'Inter, Sohne, SF Pro Display',
    size: '22px',
    weight: '700',
    lineHeight: '1.3',
    letterSpacing: '-0.1px',
    usage: 'Card titles, subsection headings.',
  },
  {
    label: 'Card Heading',
    sample: 'Everything you need to manage payments',
    family: 'Inter, Sohne, SF Pro Display',
    size: '24px',
    weight: '700',
    lineHeight: '1.25',
    letterSpacing: '-0.1px',
    usage: 'Featured card and pricing tier titles.',
  },
  {
    label: 'Body Large',
    sample: 'A global payment platform built for growth businesses of every size — from startups to public companies.',
    family: 'Inter, system-ui',
    size: '18px',
    weight: '400',
    lineHeight: '1.55',
    letterSpacing: '0',
    usage: 'Hero / section description copy.',
  },
  {
    label: 'Body Default',
    sample: 'Sell in 135+ currencies, accept 80+ payment methods, and let Stripe handle compliance, reporting, and fraud prevention.',
    family: 'Inter, system-ui',
    size: '16px',
    weight: '400',
    lineHeight: '1.55',
    letterSpacing: '0',
    usage: 'Card body copy, general content.',
  },
  {
    label: 'Body Small',
    sample: 'Integrate Stripe with a single SDK and start accepting payments in minutes.',
    family: 'Inter, system-ui',
    size: '14px',
    weight: '400',
    lineHeight: '1.6',
    letterSpacing: '0',
    usage: 'Navigation, metadata, compact prose.',
  },
  {
    label: 'Label / Eyebrow',
    sample: '01 — Typography',
    family: 'Inter, system-ui',
    size: '12px',
    weight: '700',
    lineHeight: '1.4',
    letterSpacing: '0.96px',
    usage: 'Section eyebrows, uppercase labels, table headers.',
  },
  {
    label: 'Swatch Label',
    sample: 'Primary',
    family: 'Inter, system-ui',
    size: '13px',
    weight: '700',
    lineHeight: '1.4',
    letterSpacing: '0',
    usage: 'Component labels, swatch names.',
  },
  {
    label: 'Code / Mono',
    sample: '#533afd',
    family: 'ui-monospace, Menlo, Monaco, monospace',
    size: '12px',
    weight: '400',
    lineHeight: '1.5',
    letterSpacing: '0',
    usage: 'Code snippets, hex values, technical data.',
  },
  {
    label: 'Meta / Small Mono',
    sample: 'font-size: 11px; line-height: 1.5;',
    family: 'ui-monospace, Menlo, Monaco, monospace',
    size: '11px',
    weight: '400',
    lineHeight: '1.5',
    letterSpacing: '0',
    usage: 'Tiny metadata, spacing/radius labels.',
  },
];

/* ---- Shared inline styles ---- */

const displayFont = "'Inter', 'Sohne', 'SF Pro Display', system-ui, sans-serif";
const bodyFont = "'Inter', system-ui, sans-serif";
const monoFont = 'ui-monospace, Menlo, Monaco, monospace';

const ink = '#0d253d';
const muted = '#64748d';
const hairline = '#e3e8ee';
const canvas = '#ffffff';

const s: Record<string, React.CSSProperties> = {
  section: {
    padding: '96px 48px',
    maxWidth: '1440px',
    margin: '0 auto',
    borderTop: `1px solid ${hairline}`,
    fontFamily: bodyFont,
    color: ink,
    backgroundColor: canvas,
    WebkitFontSmoothing: 'antialiased',
    boxSizing: 'border-box',
  },
  eyebrow: {
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '0.96px',
    textTransform: 'uppercase' as const,
    color: muted,
    margin: '0 0 12px',
  },
  heading: {
    fontFamily: displayFont,
    fontSize: '50px',
    fontWeight: 700,
    letterSpacing: '-0.6px',
    lineHeight: 1.12,
    color: ink,
    margin: '0 0 16px',
  },
  sub: {
    fontFamily: bodyFont,
    fontSize: '18px',
    color: ink,
    maxWidth: '720px',
    margin: '0 0 48px',
    lineHeight: 1.55,
  },
  typeRow: {
    display: 'grid',
    gridTemplateColumns: '240px 1fr',
    gap: '24px',
    padding: '16px 0',
    borderBottom: `1px solid ${hairline}`,
    alignItems: 'baseline' as const,
    minWidth: 0,
  },
  typeMeta: {
    fontFamily: monoFont,
    fontSize: '12px',
    color: muted,
    lineHeight: 1.5,
    minWidth: 0,
  },
  typeMetaLabel: {
    display: 'block',
    fontFamily: bodyFont,
    fontSize: '13px',
    fontWeight: 700,
    color: ink,
    marginBottom: '4px',
  },
  sampleBlock: {
    minWidth: 0,
  },
};

/* ---- CSS font-family lookup ---- */

/** Maps a display-oriented family label to the full CSS font-family with fallbacks. */
function getSampleFont(family: string): string {
  if (family.includes('Sohne') || family.includes('SF Pro')) return displayFont;
  if (family.includes('ui-monospace')) return monoFont;
  return bodyFont;
}

/* TypeRow component */

function TypeRow({ entry }: { entry: TypeEntry }) {
  const sampleStyle: React.CSSProperties = {
    fontFamily: getSampleFont(entry.family),
    fontSize: entry.size,
    fontWeight: entry.weight as any,
    lineHeight: entry.lineHeight as any,
    letterSpacing: entry.letterSpacing,
    color: ink,
    margin: 0,
    ...(entry.label.includes('Eyebrow') && { textTransform: 'uppercase' as const }),
  };

  return (
    <div style={s.typeRow}>
      <div style={s.typeMeta}>
        <strong style={s.typeMetaLabel}>{entry.label}</strong>
        {entry.family}
        <br />
        {entry.size} / {entry.weight}
        <br />
        {entry.lineHeight} leading / {entry.letterSpacing} tracking
      </div>
      <div style={s.sampleBlock}>
        <p style={sampleStyle}>{entry.sample}</p>
        <div style={{ ...s.typeMeta, marginTop: '8px' }}>{entry.usage}</div>
      </div>
    </div>
  );
}

/* ---- Export ---- */

export interface OverviewTypographyScaleProps {
  className?: string;
}

/**
 * OverviewTypographyScale — Stripe-inspired typography scale section.
 * Uses inline styles to match reference-example.html section#typography.
 */
export function OverviewTypographyScale({ className = '' }: OverviewTypographyScaleProps) {
  return (
    <section id="typography" className={className} style={s.section}>
      <p style={s.eyebrow}>02 &mdash; Typography</p>
      <h2 style={s.heading}>Typography Scale</h2>
      <p style={s.sub}>
        Complete type system. Inter dominates for its clean, readable
        forms across all weights; display roles switch to Sohne's
        distinctive character.
      </p>

      {typeScale.map((entry) => (
        <TypeRow key={entry.label} entry={entry} />
      ))}
    </section>
  );
}
