import React from 'react';

export interface OverviewResponsiveBehaviorProps {
  className?: string;
}

/** Section 13 — Responsive Behavior: breakpoint table, device ladder, touch-target rules,
 *  and collapsing-strategy rules.
 *  Matches reference section and content. */
export function OverviewResponsiveBehavior({ className = '' }: OverviewResponsiveBehaviorProps) {
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

  const headingStyle: React.CSSProperties = {
    fontFamily: 'var(--font-display)',
    fontSize: '48px',
    fontWeight: 400,
    color: 'var(--color-ink)',
    margin: '0 0 ',
    letterSpacing: '-1px',
  };

  const subHeadingStyle: React.CSSProperties = {
    fontFamily: 'var(--font-display)',
    fontSize: '22px',
    fontWeight: 400,
    color: 'var(--color-ink)',
    margin: '0 0 12px',
    letterSpacing: '-0.3px',
  };

  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '32px',
    fontSize: '14px',
  };

  const thStyle: React.CSSProperties = {
    textAlign: 'left',
    padding: '14px 16px',
    borderBottom: '1px solid var(--color-border)',
    fontWeight: 500,
    color: 'var(--color-ink)',
    fontSize: '13px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  };

  const tdStyle: React.CSSProperties = {
    textAlign: 'left',
    padding: '14px 16px',
    borderBottom: '1px solid var(--color-border)',
    color: 'var(--color-body)',
  };

  const deviceBarStyle = (width: number, height: number): React.CSSProperties => ({
    background: 'var(--color-surface-card)',
    borderRadius: '6px',
    color: 'var(--color-muted)',
    textAlign: 'center',
    padding: '8px',
    fontSize: '11px',
    fontFamily: 'var(--font-mono)',
    flexShrink: 0,
    width,
    height,
  });

  const breakpoints = [
    { name: 'Mobile', width: '< 768px', changes: 'Hamburger nav; hero h1 64→32px; hero-art stacks below; feature grids 1-up; pricing 1-up.' },
    { name: 'Tablet', width: '768–1024px', changes: 'Top nav tightens; feature cards 2-up; connector tiles 3-up; pricing 2-up.' },
    { name: 'Desktop', width: '1024–1440px', changes: 'Full top-nav; 3-up feature cards; 4-6 up connector tiles; 4-up pricing.' },
    { name: 'Wide', width: '> 1440px', changes: 'Same as desktop with more breathing room; max content 1200px.' },
  ];

  const devices = [
    { w: 60, h: 120, label: '375', name: 'mobile' },
    { w: 90, h: 140, label: '600', name: 'small phone' },
    { w: 140, h: 160, label: '768', name: 'tablet' },
    { w: 200, h: 180, label: '1024', name: 'laptop' },
    { w: 260, h: 200, label: '1280', name: 'desktop' },
    { w: 320, h: 220, label: '1440', name: 'wide' },
  ];

  return (
    <section id="responsive" className={className} style={sectionStyle}>
      <div style={labelStyle}>13 — Responsive Behavior</div>
      <h2 style={{ ...headingStyle, marginBottom: '48px' }}>Responsive breakpoints and device behavior</h2>

      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Name</th>
            <th style={thStyle}>Width</th>
            <th style={thStyle}>Key Changes</th>
          </tr>
        </thead>
        <tbody>
          {breakpoints.map((bp) => (
            <tr key={bp.name}>
              <td style={{ ...tdStyle, fontWeight: 500, color: 'var(--color-ink)' }}>{bp.name}</td>
              <td style={tdStyle}>{bp.width}</td>
              <td style={tdStyle}>{bp.changes}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
        {devices.map((d) => (
          <div key={d.label} style={deviceBarStyle(d.w, d.h)}>
            {d.label}<br />{d.name}
          </div>
        ))}
      </div>

      <div style={{ marginTop: '32px' }}>
        <h4 style={subHeadingStyle}>Touch Targets</h4>
        <ul style={{ paddingLeft: '20px', color: 'var(--color-body)', fontSize: '14px' }}>
          <li style={{ marginBottom: '8px' }}>Primary CTA at min 40 &times; 40px.</li>
          <li style={{ marginBottom: '8px' }}>Icon button at 36 &times; 36 — slightly under 44, visually centered.</li>
          <li style={{ marginBottom: '8px' }}>Text input height 40px.</li>
        </ul>
      </div>

      <div style={{ marginTop: '32px' }}>
        <h4 style={subHeadingStyle}>Collapsing Strategy</h4>
        <ul style={{ paddingLeft: '20px', color: 'var(--color-body)', fontSize: '14px' }}>
          <li style={{ marginBottom: '8px' }}>Top nav collapses to hamburger at &lt; 768px; menu opens as full-screen cream sheet.</li>
          <li style={{ marginBottom: '8px' }}>Hero 6-6 grid &rarr; single-column on mobile.</li>
          <li style={{ marginBottom: '8px' }}>Feature grids reduce columns rather than scaling.</li>
          <li style={{ marginBottom: '8px' }}>Code blocks retain font-size; horizontal scroll inside the card on mobile.</li>
          <li style={{ marginBottom: '8px' }}>Pricing tier cards collapse 4 &rarr; 2 &rarr; 1; featured stays distinct.</li>
        </ul>
      </div>
    </section>
  );
}
