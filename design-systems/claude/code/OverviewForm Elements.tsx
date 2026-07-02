import React from 'react';

export interface OverviewFormElementsProps {
  className?: string;
}

/** Section 08 — Form Elements: responsive CSS grid (auto-fill, 280px min) with 4 form cells.
 *  Each cell vertically stacks a form-label above a form-input. The fourth cell uses a
 *  "wide" variant spanning 2 columns, collapsing to 1 on mobile.
 *
 *  Matches reference section styling. */
export function OverviewFormElements({ className = '' }: OverviewFormElementsProps) {
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

  const formGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '24px',
  };

  const formLabelStyle: React.CSSProperties = {
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--color-ink)',
    marginBottom: '8px',
    display: 'block',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--color-surface)',
    color: 'var(--color-ink)',
    border: '1px solid var(--color-border)',
    padding: '10px 14px',
    height: '40px',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'var(--font-sans)',
    boxSizing: 'border-box' as const,
  };

  const focusedInputStyle: React.CSSProperties = {
    ...inputStyle,
    borderColor: 'var(--color-primary)',
    boxShadow: '0 0 0 3px rgba(204,120,92,0.2)',
    outline: 'none',
  };

  return (
    <section className={className} style={sectionStyle}>
      <div style={labelStyle}>08 &mdash; Form Elements</div>

      <div style={formGridStyle}>
        {/* Email address */}
        <div style={{ minWidth: 0 }}>
          <label style={formLabelStyle} htmlFor="form-email">Email address</label>
          <input style={inputStyle} id="form-email" type="email" placeholder="you@example.com" />
        </div>

        {/* Email (focused) — show focused appearance */}
        <div style={{ minWidth: 0 }}>
          <label style={formLabelStyle} htmlFor="form-email-focused">Email (focused)</label>
          <input style={focusedInputStyle} id="form-email-focused" type="email" defaultValue="alex@studio.com" />
        </div>

        {/* Use case */}
        <div style={{ minWidth: 0 }}>
          <label style={formLabelStyle} htmlFor="form-usecase">Use case</label>
          <input style={inputStyle} id="form-usecase" type="text" placeholder="What will you build?" />
        </div>

        {/* Tell us more (wide — spans 2 columns, collapses on mobile) */}
        <div style={{ minWidth: 0, gridColumn: 'span 2' }}>
          <label style={formLabelStyle} htmlFor="form-tellmore">Tell us more</label>
          <input style={inputStyle} id="form-tellmore" type="text" placeholder="Anything you want us to know..." />
        </div>
      </div>
    </section>
  );
}
