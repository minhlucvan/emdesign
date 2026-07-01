import React from 'react';

/* ---- Shared inline styles matching reference-example.html CSS tokens ---- */

const displayFont = "'Inter', 'Sohne', 'SF Pro Display', system-ui, sans-serif";
const bodyFont = "'Inter', system-ui, sans-serif";
const monoFont = 'ui-monospace, Menlo, Monaco, monospace';

const primary = '#533afd';
const ink = '#0d253d';
const muted = '#64748d';
const hairline = '#e3e8ee';
const canvas = '#ffffff';

const s: Record<string, React.CSSProperties> = {
  section: {
    marginTop: '48px',
    paddingTop: '48px',
    borderTop: `1px solid ${hairline}`,
    fontFamily: bodyFont,
    color: ink,
    backgroundColor: canvas,
    WebkitFontSmoothing: 'antialiased',
    boxSizing: 'border-box',
  },
  subhead: {
    fontFamily: displayFont,
    fontWeight: 700,
    fontSize: '22px',
    margin: '32px 0 16px',
    color: ink,
  },
  radiusRow: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap' as const,
    alignItems: 'flex-end',
  },
  stack: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
    alignItems: 'flex-start',
  },
  box: {
    width: '88px',
    height: '88px',
    background: primary,
  },
  lbl: {
    fontFamily: monoFont,
    fontSize: '11px',
    color: muted,
  },
};

/* ---- Data ---- */

interface RadiusEntry {
  name: string;
  value: string;
  radius: string;
}

const radiusEntries: RadiusEntry[] = [
  { name: 'Sharp', value: '0px', radius: '0' },
  { name: 'Subtle', value: '4px', radius: '4px' },
  { name: 'Input', value: '6px', radius: '6px' },
  { name: 'Card', value: '12px', radius: '12px' },
  { name: 'Pill', value: '9999px', radius: '9999px' },
];

/* ---- Radius cell sub-component ---- */

function RadiusCell({ name, value, radius }: RadiusEntry) {
  return (
    <div style={s.stack}>
      <div
        style={{
          ...s.box,
          borderRadius: radius,
        }}
      />
      <div style={s.lbl}>{name} / {value}</div>
    </div>
  );
}

/* ---- Export ---- */

export interface OverviewBorderRadiusScaleProps {
  className?: string;
}

/**
 * OverviewBorderRadiusScale — Stripe-inspired border radius scale subsection.
 * Matches reference-example.html section#radius (nested inside spacing section).
 * Shows visual boxes for each border radius value (Sharp, Subtle, Input, Card, Pill).
 */
export function OverviewBorderRadiusScale({ className = '' }: OverviewBorderRadiusScaleProps) {
  return (
    <section id="radius" className={className} style={s.section}>
      <h3 style={s.subhead}>Border Radius</h3>

      <div style={s.radiusRow}>
        {radiusEntries.map((entry) => (
          <RadiusCell key={entry.name} {...entry} />
        ))}
      </div>
    </section>
  );
}
