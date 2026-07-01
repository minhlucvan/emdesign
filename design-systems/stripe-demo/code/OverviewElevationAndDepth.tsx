import React from 'react';

/* ---- Shared inline styles matching reference-example.html CSS tokens ---- */

const displayFont = "'Inter', 'Sohne', 'SF Pro Display', system-ui, sans-serif";
const bodyFont = "'Inter', system-ui, sans-serif";
const monoFont = 'ui-monospace, Menlo, Monaco, monospace';

const ink = '#0d253d';
const muted = '#64748d';
const hairline = '#e3e8ee';
const canvas = '#ffffff';
const canvasAlt = '#fafafa';
const cardRadius = '12px';

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
    textTransform: 'uppercase',
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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '24px',
    padding: '32px',
    background: canvasAlt,
    borderRadius: cardRadius,
  },
  cell: {
    padding: '24px',
    background: canvas,
    borderRadius: cardRadius,
    minHeight: '120px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
  cellLbl: {
    fontFamily: monoFont,
    fontSize: '11px',
    color: muted,
  },
};

/* ---- Shadow styles per elevation level ---- */

interface ElevationEntry {
  level: number;
  name: string;
  boxShadow?: string;
  border?: string;
}

const elevationEntries: ElevationEntry[] = [
  { level: 0, name: 'None', border: `1px solid ${hairline}` },
  { level: 1, name: 'Subtle', boxShadow: 'rgba(0,0,0,0.1) 0 5px 20px 0' },
  { level: 2, name: 'Medium', boxShadow: 'rgba(0,0,0,0.1) 0 0 32px 0' },
  { level: 3, name: 'High', boxShadow: 'rgba(0,0,0,0.2) 0 1px 10px 0' },
];

/* ---- Sub-components ---- */

function ElevationCell({ level, name, boxShadow, border }: ElevationEntry) {
  const cellStyle: React.CSSProperties = {
    ...s.cell,
    ...(boxShadow ? { boxShadow } : {}),
    ...(border ? { border } : {}),
  };
  return (
    <div style={cellStyle}>
      <div style={s.cellLbl}>{level} / {name}</div>
    </div>
  );
}

/* ---- Export ---- */

export interface OverviewElevationAndDepthProps {
  className?: string;
}

/**
 * OverviewElevationAndDepth — Stripe-inspired elevation and shadow scale section.
 * Uses inline styles to match reference-example.html section#elevation.
 */
export function OverviewElevationAndDepth({ className = '' }: OverviewElevationAndDepthProps) {
  return (
    <section id="elevation" className={className} style={s.section}>
      <p style={s.eyebrow}>07 &mdash; Elevation &amp; Depth</p>
      <h2 style={s.heading}>Elevation &amp; Depth</h2>
      <p style={s.sub}>
        Layered shadow system using box-shadow to create visual hierarchy and
        depth across the interface.
      </p>

      <div style={s.grid}>
        {elevationEntries.map((entry) => (
          <ElevationCell key={entry.level} {...entry} />
        ))}
      </div>
    </section>
  );
}
