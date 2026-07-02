import React from 'react';

export interface OverviewBadgesProps {
  className?: string;
}

/** Overview Badges section — neutral-surface pill badges and coral uppercase badges.
 *  Matches reference section styling. */
export function OverviewBadges({ className = '' }: OverviewBadgesProps) {
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

  const introStyle: React.CSSProperties = {
    fontFamily: 'var(--font-sans)',
    fontSize: '16px',
    color: 'var(--color-body)',
    maxWidth: '720px',
    marginBottom: '48px',
    lineHeight: '1.55',
  };

  const pillBadge: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 12px',
    borderRadius: '9999px',
    background: 'var(--color-surface-card)',
    color: 'var(--color-ink)',
    fontSize: '13px',
    fontWeight: 500,
  };

  const coralBadge: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 12px',
    borderRadius: '9999px',
    background: 'var(--color-primary)',
    color: 'var(--color-on-primary)',
    fontSize: '12px',
    fontWeight: 500,
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
  };

  return (
    <section className={className} style={sectionStyle}>
      <div style={labelStyle}>09 — Badges</div>
      <p style={introStyle}>
        Pill badges in cream-card or coral fill. Coral-uppercase for &ldquo;NEW&rdquo; / &ldquo;BETA&rdquo; emphasis.
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
        <span style={pillBadge}>Featured</span>
        <span style={pillBadge}>Limited beta</span>
        <span style={coralBadge}>NEW</span>
        <span style={coralBadge}>BETA</span>
        <span style={coralBadge}>CLAUDE 4</span>
      </div>
    </section>
  );
}
