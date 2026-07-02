import React from 'react';

export interface OverviewCoralCalloutCardProps extends React.HTMLAttributes<HTMLElement> {
  className?: string;
}

/** Coral callout card section — section label, coral-background card with display serif heading,
 *  body text, and cream-background CTA button.
 *  Matches reference section 05. */
export function OverviewCoralCalloutCard({ className = '', ...props }: OverviewCoralCalloutCardProps) {
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

  const cardStyle: React.CSSProperties = {
    background: 'var(--color-primary)',
    color: 'var(--color-on-primary)',
    borderRadius: '12px',
    padding: '48px',
  };

  const cardH3Style: React.CSSProperties = {
    fontFamily: 'var(--font-display)',
    fontSize: '36px',
    fontWeight: 400,
    margin: '0 0 16px',
    letterSpacing: '-0.5px',
  };

  const cardPStyle: React.CSSProperties = {
    fontFamily: 'var(--font-sans)',
    fontSize: '16px',
    opacity: 0.9,
    margin: '0 0 24px',
    lineHeight: 1.55,
    maxWidth: '520px',
  };

  const creamBtnStyle: React.CSSProperties = {
    background: 'var(--color-surface)',
    color: 'var(--color-ink)',
    borderRadius: '8px',
    padding: '12px 20px',
    height: '40px',
    fontWeight: 500,
    fontSize: '14px',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'var(--font-sans)',
    lineHeight: 1,
  };

  return (
    <section className={className} style={sectionStyle} {...props}>
      <div style={labelStyle}>05 &mdash; Coral Callout Card</div>
      <div style={cardStyle}>
        <h3 style={cardH3Style}>Start building with Claude</h3>
        <p style={cardPStyle}>
          Free API credits to get started. Production-grade reliability when you scale. Cream-button CTA on the coral surface.
        </p>
        <button style={creamBtnStyle}>Get API access</button>
      </div>
    </section>
  );
}
