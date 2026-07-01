import React from 'react';

/* ---- Data ---- */

interface Swatch {
  bg: string;
  border?: string;
  name: string;
  hex: string;
  role: string;
}

const corePalette: Swatch[] = [
  { bg: '#533afd', name: 'Primary', hex: '#533afd', role: 'Brand primary surface and CTA color.' },
  { bg: '#0d253d', name: 'Ink', hex: '#0d253d', role: 'Default body text color.' },
  { bg: '#ffffff', border: '#e3e8ee', name: 'On Primary', hex: '#ffffff', role: 'Text on primary surfaces.' },
  { bg: '#ffffff', border: '#e3e8ee', name: 'Canvas', hex: '#ffffff', role: 'Default content surface.' },
  { bg: '#f6f9fc', name: 'Canvas Alt', hex: '#f6f9fc', role: 'Secondary surface / band fill.' },
  { bg: '#e3e8ee', name: 'Hairline', hex: '#e3e8ee', role: '1px divider on cards and tables.' },
  { bg: '#64748d', name: 'Muted', hex: '#64748d', role: 'Secondary text and helper copy.' },
  { bg: '#ea2261', name: 'Accent 2', hex: '#ea2261', role: 'Inline link / second chromatic accent.' },
];

const extendedPalette: Swatch[] = [
  { bg: '#4434d4', name: 'Indigo Deep', hex: '#4434d4', role: 'Gradient mid-stop, press warmth.' },
  { bg: '#665efd', name: 'Indigo Soft', hex: '#665efd', role: 'Product UI accent.' },
  { bg: '#1c1e54', name: 'Brand Dark 900', hex: '#1c1e54', role: 'Featured pricing tier, dashboard chrome.' },
  { bg: '#ea2261', name: 'Ruby', hex: '#ea2261', role: 'Gradient stop, chart accent.' },
  { bg: '#f96bee', name: 'Magenta', hex: '#f96bee', role: 'Gradient bright stop.' },
  { bg: '#9b6829', name: 'Lemon', hex: '#9b6829', role: 'Sherbet warm gradient stop.' },
  { bg: '#f5e9d4', name: 'Canvas Cream', hex: '#f5e9d4', role: 'Warm interlude band.' },
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
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '16px',
  },
  swatch: {
    border: `1px solid ${hairline}`,
    borderRadius: '12px',
    overflow: 'hidden',
    background: canvas,
  },
  chip: {
    height: '96px',
  },
  meta: {
    padding: '12px',
    boxSizing: 'border-box',
  },
  name: {
    fontSize: '13px',
    fontWeight: 700,
    color: ink,
  },
  hexVal: {
    fontFamily: monoFont,
    fontSize: '12px',
    color: muted,
    marginTop: '2px',
  },
  role: {
    fontSize: '12px',
    color: muted,
    marginTop: '6px',
    lineHeight: 1.4,
  },
  subhead: {
    fontFamily: displayFont,
    fontWeight: 700,
    fontSize: '22px',
    margin: '32px 0 16px',
    color: ink,
  },
};

/* ---- Swatch component ---- */

function SwatchCard({ bg, border, name, hex, role }: Swatch) {
  return (
    <div style={s.swatch}>
      <div
        style={{
          ...s.chip,
          background: bg,
          ...(border ? { border: `1px solid ${border}` } : {}),
        }}
      />
      <div style={s.meta}>
        <div style={s.name}>{name}</div>
        <div style={s.hexVal}>{hex}</div>
        <div style={s.role}>{role}</div>
      </div>
    </div>
  );
}

/* ---- Export ---- */

export interface OverviewColorPaletteProps {
  className?: string;
}

/**
 * OverviewColorPalette — Stripe-inspired color palette section.
 * Uses inline styles to match reference-example.html section#palette.
 */
export function OverviewColorPalette({ className = '' }: OverviewColorPaletteProps) {
  return (
    <section id="palette" className={className} style={s.section}>
      <p style={s.eyebrow}>01 &mdash; Colors</p>
      <h2 style={s.heading}>Color Palette</h2>
      <p style={s.sub}>Core brand and surface tokens.</p>

      <div style={s.grid}>
        {corePalette.map((sw) => (
          <SwatchCard key={sw.name} {...sw} />
        ))}
      </div>

      <h3 style={s.subhead}>Brand &amp; Accent (extended)</h3>

      <div style={s.grid}>
        {extendedPalette.map((sw) => (
          <SwatchCard key={sw.name} {...sw} />
        ))}
      </div>
    </section>
  );
}
