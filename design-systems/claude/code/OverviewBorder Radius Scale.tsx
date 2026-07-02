import React from 'react';

export interface OverviewBorderRadiusScaleProps {
  className?: string;
}

interface RadiusItem {
  label: string;
  radius: number | string;
}

const radiusItems: RadiusItem[] = [
  { label: '4 · xs', radius: 4 },
  { label: '6 · sm', radius: 6 },
  { label: '8 · md', radius: 8 },
  { label: '12 · lg', radius: 12 },
  { label: '16 · xl', radius: 16 },
  { label: 'pill', radius: 9999 },
  { label: 'full', radius: '50%' },
];

/** Overview Border Radius Scale section — 7 equal-sized square blocks each
 *  demonstrating a distinct border-radius token: xs (4px) through full (50%).
 *  Laid out as a wrapping horizontal flex row.
 *  Matches reference section styling. */
export function OverviewBorderRadiusScale({ className = '' }: OverviewBorderRadiusScaleProps) {
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
      <div style={labelStyle}>11 — Border Radius Scale</div>

      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
        {radiusItems.map((item) => (
          <div
            key={item.label}
            style={{
              width: '96px',
              height: '96px',
              background: 'var(--color-surface-card)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              color: 'var(--color-ink)',
              fontWeight: 500,
              fontFamily: 'var(--font-mono)',
              borderRadius: item.radius,
            }}
          >
            {item.label}
          </div>
        ))}
      </div>
    </section>
  );
}
