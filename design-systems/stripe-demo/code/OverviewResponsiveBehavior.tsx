import React from 'react';

/* ---- Shared inline styles matching reference-example.html CSS tokens ---- */

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
    lineHeight: 'normal',
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
  subhead: {
    fontFamily: displayFont,
    fontWeight: 700,
    fontSize: '22px',
    margin: '32px 0 16px',
    color: ink,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: '14px',
  },
  th: {
    fontFamily: monoFont,
    fontWeight: 700,
    fontSize: '11px',
    letterSpacing: '0.2px',
    textTransform: 'uppercase' as const,
    color: ink,
    textAlign: 'left' as const,
    padding: '14px 16px',
    borderBottom: `1px solid ${hairline}`,
  },
  td: {
    textAlign: 'left' as const,
    padding: '14px 16px',
    borderBottom: `1px solid ${hairline}`,
    color: ink,
  },
  deviceLadder: {
    display: 'flex',
    gap: '16px',
    alignItems: 'flex-end',
    flexWrap: 'wrap' as const,
    marginTop: '32px',
  },
  stack: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
  },
  device: {
    background: ink,
    borderRadius: '8px',
    minWidth: '60px',
  },
  lbl: {
    fontFamily: monoFont,
    fontSize: '11px',
    color: muted,
    marginTop: '8px',
  },
};

/* ---- Breakpoint data ---- */

interface BreakpointEntry {
  name: string;
  minWidth: string;
  layout: string;
  nav: string;
  typeScale: string;
}

const breakpoints: BreakpointEntry[] = [
  {
    name: 'Desktop',
    minWidth: '1440px+',
    layout: 'Multi-column grid, max-width 1440px',
    nav: 'Full horizontal navigation with CTA',
    typeScale: 'Hero 56px, section heading 50px',
  },
  {
    name: 'Tablet',
    minWidth: '1024px',
    layout: 'Reduced column gap, 64px section padding',
    nav: 'Full nav, CTA hidden',
    typeScale: 'Hero 44px, section heading 36px',
  },
  {
    name: 'Mobile Landscape',
    minWidth: '720px',
    layout: 'Single-column grid forced, 48px padding',
    nav: 'Nav links hidden, brand only',
    typeScale: 'Hero 32px, section heading 28px',
  },
  {
    name: 'Mobile',
    minWidth: '375px',
    layout: 'Single-column, fluid padding',
    nav: 'Nav links hidden, brand only',
    typeScale: 'Hero 28px, section heading 24px',
  },
];

/* ---- Device data (dimensions match reference-example.html) ---- */

interface DeviceEntry {
  label: string;
  width: number;
  height: number;
}

const devices: DeviceEntry[] = [
  { label: 'Desktop', width: 144, height: 48 },
  { label: 'Laptop', width: 108, height: 40 },
  { label: 'Tablet', width: 80, height: 80 },
  { label: 'Phone', width: 60, height: 112 },
];

/* ---- Sub-components ---- */

function DeviceLadderItem({ label, width, height }: DeviceEntry) {
  return (
    <div style={s.stack}>
      <div className="device" style={{ ...s.device, width, height }} />
      <div style={s.lbl}>{label}</div>
    </div>
  );
}

/* ---- Export ---- */

export interface OverviewResponsiveBehaviorProps {
  className?: string;
}

/**
 * OverviewResponsiveBehavior — Stripe-inspired responsive behavior section.
 * Uses inline styles to match reference-example.html section#responsive.
 */
export function OverviewResponsiveBehavior({ className = '' }: OverviewResponsiveBehaviorProps) {
  return (
    <section id="responsive" className={className} style={s.section}>
      <p style={s.eyebrow}>08 &mdash; Responsive Behavior</p>
      <h2 style={s.heading}>Responsive Behavior</h2>
      <p style={s.sub}>
        The design system adapts across four breakpoints with adjusted typography,
        layout density, and navigation visibility to ensure a consistent experience
        on every device.
      </p>

      <table style={s.table} className="responsive-table">
        <thead>
          <tr>
            <th style={s.th}>Breakpoint</th>
            <th style={s.th}>Min Width</th>
            <th style={s.th}>Layout</th>
            <th style={s.th}>Navigation</th>
            <th style={s.th}>Type Scale</th>
          </tr>
        </thead>
        <tbody>
          {breakpoints.map((bp) => (
            <tr key={bp.name}>
              <td style={s.td}>{bp.name}</td>
              <td style={{ ...s.td, fontFamily: monoFont }}>{bp.minWidth}</td>
              <td style={s.td}>{bp.layout}</td>
              <td style={s.td}>{bp.nav}</td>
              <td style={s.td}>{bp.typeScale}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={s.subhead}>Device Ladder</h3>
      <p style={{ fontFamily: bodyFont, fontSize: '16px', lineHeight: 1.55, color: ink, margin: '0 0 16px' }}>
        Visual representation of supported device widths and their relative proportions.
      </p>
      <div style={s.deviceLadder} className="device-ladder">
        {devices.map((device) => (
          <DeviceLadderItem key={device.label} {...device} />
        ))}
      </div>
    </section>
  );
}
