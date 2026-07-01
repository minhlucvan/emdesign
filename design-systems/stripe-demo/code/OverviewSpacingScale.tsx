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
    fontFamily: bodyFont,
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
  subhead: {
    fontFamily: displayFont,
    fontWeight: 700,
    fontSize: '22px',
    margin: '32px 0 16px',
    color: ink,
  },
  spacingRow: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap' as const,
    alignItems: 'flex-end',
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
  bar: {
    background: primary,
    height: '32px',
    borderRadius: '4px',
    minWidth: '4px',
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
  divider: {
    marginTop: '48px',
    paddingTop: '48px',
    borderTop: `1px solid ${hairline}`,
  },
};

/* ---- Data ---- */

interface SpacingEntry {
  name: string;
  value: string;
  width: number; /* px width for the visual bar */
}

interface RadiusEntry {
  name: string;
  value: string;
  radius: string;
}

const spacingEntries: SpacingEntry[] = [
  { name: '4px', value: '4px', width: 16 },
  { name: '6px', value: '6px', width: 24 },
  { name: '8px', value: '8px', width: 32 },
  { name: '12px', value: '12px', width: 48 },
  { name: '16px', value: '16px', width: 64 },
  { name: '20px', value: '20px', width: 80 },
  { name: '24px', value: '24px', width: 96 },
  { name: '32px', value: '32px', width: 120 },
  { name: '40px', value: '40px', width: 140 },
  { name: '48px', value: '48px', width: 160 },
  { name: '64px', value: '64px', width: 200 },
];

const radiusEntries: RadiusEntry[] = [
  { name: 'Sharp', value: '0px', radius: '0' },
  { name: 'Subtle', value: '4px', radius: '4px' },
  { name: 'Input', value: '6px', radius: '6px' },
  { name: 'Card', value: '12px', radius: '12px' },
  { name: 'Pill', value: '9999px', radius: '9999px' },
];

/* ---- Sub-components ---- */

function SpacingCell({ name, value, width }: SpacingEntry) {
  return (
    <div style={s.stack}>
      <div style={{ ...s.bar, width: `${width}px` }} />
      <div style={s.lbl}>
        {name} / {value}
      </div>
    </div>
  );
}

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

export interface OverviewSpacingScaleProps {
  className?: string;
}

/**
 * OverviewSpacingScale — Stripe-inspired spacing and radius scale section.
 * Uses inline styles to match reference-example.css `.spacing-row` and `.radius-row` patterns.
 * Shows visual bars for each spacing value and boxes for each radius value.
 */
export function OverviewSpacingScale({ className = '' }: OverviewSpacingScaleProps) {
  return (
    <section id="spacing" className={className} style={s.section}>
      <p style={s.eyebrow}>06 &mdash; Spacing &amp; Radius</p>
      <h2 style={s.heading}>Spacing Scale</h2>
      <p style={s.sub}>
        Consistent spacing units and border radius scale used throughout
        the design system, from tight inline gaps to generous section padding.
      </p>

      <h3 style={s.subhead}>Spacing</h3>
      <div style={s.spacingRow}>
        {spacingEntries.map((entry) => (
          <SpacingCell key={entry.name} {...entry} />
        ))}
      </div>

      <div style={s.divider}>
        <h3 style={s.subhead}>Border Radius</h3>
        <div style={s.radiusRow}>
          {radiusEntries.map((entry) => (
            <RadiusCell key={entry.name} {...entry} />
          ))}
        </div>
      </div>
    </section>
  );
}
