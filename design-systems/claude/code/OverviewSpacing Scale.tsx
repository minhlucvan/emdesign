import React from 'react';

export interface OverviewSpacingScaleProps {
  className?: string;
}

const spacingStops = [
  { width: 4, label: 'xxs · 4px' },
  { width: 8, label: 'xs · 8px' },
  { width: 12, label: 'sm · 12px' },
  { width: 16, label: 'md · 16px' },
  { width: 24, label: 'lg · 24px' },
  { width: 32, label: 'xl · 32px' },
  { width: 48, label: 'xxl · 48px' },
  { width: 96, label: 'section · 96px' },
];

/** Section 10 — Spacing Scale: all 8 stops from xxs (4px) through section (96px)
 *  displayed as coral bars at their pixel width in a wrapping flex row.
 *  Matches reference section styling. */
export function OverviewSpacingScale({ className = '' }: OverviewSpacingScaleProps) {
  const sectionStyle: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '96px 32px',
    borderTop: '1px solid var(--color-border)',
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: 'var(--font-sans)',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    color: 'var(--color-muted)',
    fontWeight: 500,
    marginBottom: '12px',
  };

  return (
    <section className={className} style={sectionStyle}>
      <div style={labelStyle}>10 &mdash; Spacing Scale</div>

      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end' }}>
        {spacingStops.map((stop) => (
          <div key={stop.width} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                background: 'var(--color-primary)',
                height: '28px',
                borderRadius: '4px',
                width: stop.width,
              }}
            />
            <div style={{ fontSize: '11px', color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>
              {stop.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
