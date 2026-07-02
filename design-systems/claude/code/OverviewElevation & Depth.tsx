import React from 'react';

export interface OverviewElevationAndDepthProps {
  className?: string;
}

/** Section 12 — Elevation & Depth: colour-block-first depth with 6 ElevationCard
 *  instances demonstrating flat, raised, dark, and coral elevation variants
 *  in a responsive auto-fill grid at 240px min-column-width with 24px gap.
 *  Matches reference section styling. */
export function OverviewElevationAndDepth({ className = '' }: OverviewElevationAndDepthProps) {
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

  const cardBase: React.CSSProperties = {
    borderRadius: '12px',
    padding: '24px',
    fontSize: '13px',
  };

  const cards = [
    { title: 'Flat / Canvas', desc: 'Body sections, top nav.', style: { ...cardBase, background: 'var(--color-surface)', border: '1px solid var(--color-border)' } },
    { title: 'Cream card', desc: 'Feature cards, content cards.', style: { ...cardBase, background: 'var(--color-surface-card)' } },
    { title: 'Dark mockup card', desc: 'Code editors, model cards, footer.', style: { ...cardBase, background: 'var(--color-surface-dark)', color: 'var(--color-on-dark)' } },
    { title: 'Coral callout', desc: 'Full-bleed CTA card with cream-button inside.', style: { ...cardBase, background: 'var(--color-primary)', color: 'var(--color-on-primary)' } },
    { title: 'Card with hairline', desc: 'Cream card with 1px hairline border.', style: { ...cardBase, background: 'var(--color-surface)', border: '1px solid var(--color-border)' } },
    { title: 'Coral focus ring', desc: '3px coral at 20% alpha around focused inputs.', style: { ...cardBase, background: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: '0 0 0 3px rgba(204,120,92,0.2)' } },
  ];

  return (
    <section className={className} style={sectionStyle}>
      <div style={labelStyle}>12 — Elevation & Depth</div>
      <p style={introStyle}>
        Color-block first, shadow rare. The cream-vs-dark contrast does most of the elevation work.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '24px',
        }}
      >
        {cards.map((card) => (
          <div key={card.title} style={card.style}>
            <h5 style={{ fontWeight: 500, color: 'inherit', margin: '0 0 6px', fontSize: '13px' }}>
              {card.title}
            </h5>
            <p style={{ color: 'inherit', opacity: card.style.color ? 0.85 : undefined, margin: 0, fontSize: '12px' }}>
              {card.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
