import React from 'react';

export interface OverviewPricingTiersProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

/** Pricing tiers section — section label "07 — Pricing Tiers" with 4 pricing cards
 *  in a responsive auto-fill grid. Free, Pro (primary CTA), Team (featured dark navy),
 *  and Enterprise. */
export function OverviewPricingTiers({ className = '', ...props }: OverviewPricingTiersProps) {
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

  const pricingGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '20px',
  };

  const tierStyle: React.CSSProperties = {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: '12px',
    padding: '32px',
  };

  const featuredTierStyle: React.CSSProperties = {
    background: 'var(--color-surface-dark)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    padding: '32px',
    color: 'var(--color-on-dark)',
  };

  const nameStyle: React.CSSProperties = {
    fontFamily: 'var(--font-sans)',
    fontSize: '22px',
    fontWeight: 500,
    color: 'var(--color-ink)',
    margin: '0 0 12px',
  };

  const nameFeaturedStyle: React.CSSProperties = {
    fontFamily: 'var(--font-sans)',
    fontSize: '22px',
    fontWeight: 500,
    color: 'var(--color-on-dark)',
    margin: '0 0 12px',
  };

  const priceStyle: React.CSSProperties = {
    fontFamily: 'var(--font-display)',
    fontSize: '36px',
    fontWeight: 400,
    color: 'var(--color-ink)',
    margin: '0 0 16px',
    letterSpacing: '-0.5px',
  };

  const priceFeaturedStyle: React.CSSProperties = {
    fontFamily: 'var(--font-display)',
    fontSize: '36px',
    fontWeight: 400,
    color: 'var(--color-on-dark)',
    margin: '0 0 16px',
    letterSpacing: '-0.5px',
  };

  const ulStyle: React.CSSProperties = {
    listStyle: 'none',
    padding: 0,
    margin: '0 0 24px',
    fontSize: '14px',
  };

  const liStyle: React.CSSProperties = {
    padding: '6px 0',
    color: 'var(--color-body)',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
  };

  const liFeaturedStyle: React.CSSProperties = {
    padding: '6px 0',
    color: 'var(--color-on-dark-soft)',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
  };

  const checkStyle: React.CSSProperties = {
    color: 'var(--color-success)',
    fontWeight: 600,
  };

  const tiers = [
    {
      name: 'Free', price: '$0', featured: false,
      features: ['Limited daily messages', 'Web access', 'Mobile + desktop apps'],
      cta: 'Get started', ctaPrimary: false,
    },
    {
      name: 'Pro', price: '$20', featured: false,
      features: ['5× more usage', 'Project workspaces', 'Advanced research'],
      cta: 'Upgrade to Pro', ctaPrimary: true,
    },
    {
      name: 'Team', price: '$30 / user', featured: true,
      features: ['Centralized billing', 'Admin console', 'Priority bandwidth'],
      cta: 'Contact sales', ctaPrimary: true,
    },
    {
      name: 'Enterprise', price: 'Custom', featured: false,
      features: ['SOC 2 + HIPAA', 'SSO + IDP', 'Custom integrations'],
      cta: 'Contact sales', ctaPrimary: false,
    },
  ];

  const fullWidthBtnStyle: React.CSSProperties = {
    display: 'inline-block',
    padding: '12px 20px',
    height: '40px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 500,
    border: 'none',
    fontFamily: 'var(--font-sans)',
    lineHeight: 1,
    width: '100%',
    cursor: 'pointer',
  };

  return (
    <section className={className} style={sectionStyle} {...props}>
      <div style={labelStyle}>07 &mdash; Pricing Tiers</div>
      <div style={pricingGridStyle}>
        {tiers.map((tier) => {
          const isFeatured = tier.featured;
          const cardStyle = isFeatured ? featuredTierStyle : tierStyle;
          const nStyle = isFeatured ? nameFeaturedStyle : nameStyle;
          const pStyle = isFeatured ? priceFeaturedStyle : priceStyle;
          const lStyle = isFeatured ? liFeaturedStyle : liStyle;

          return (
            <div key={tier.name} style={cardStyle}>
              <h4 style={nStyle}>{tier.name}</h4>
              <div style={pStyle}>{tier.price}</div>
              <ul style={ulStyle}>
                {tier.features.map((f) => (
                  <li key={f} style={lStyle}>
                    <span style={checkStyle}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <button
                style={{
                  ...fullWidthBtnStyle,
                  background: tier.ctaPrimary ? 'var(--color-primary)' : 'var(--color-surface)',
                  color: tier.ctaPrimary ? 'var(--color-on-primary)' : 'var(--color-ink)',
                  border: tier.ctaPrimary ? 'none' : '1px solid var(--color-border)',
                }}
              >
                {tier.cta}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
