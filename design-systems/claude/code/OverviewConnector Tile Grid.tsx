import React from 'react';

interface OverviewConnectorTileGridProps {
  className?: string;
}

/** Section 06 — Connector Tile Grid: 6 integration tiles in a responsive auto-fill grid
 *  at 220px min-column-width. Each tile has a single-letter logo badge, service name,
 *  and muted description matching the reference visual. */
export function OverviewConnectorTileGrid({ className = '' }: OverviewConnectorTileGridProps) {
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
    margin: '0 0 48px',
    letterSpacing: '-1px',
  };

  const tileStyle: React.CSSProperties = {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: '12px',
    padding: '20px',
  };

  const logoSyle: React.CSSProperties = {
    width: '36px',
    height: '36px',
    background: 'var(--color-surface-card)',
    borderRadius: '8px',
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--color-ink)',
    margin: '0 0 4px',
  };

  const descStyle: React.CSSProperties = {
    fontSize: '12px',
    color: 'var(--color-muted)',
    lineHeight: 1.5,
    margin: 0,
  };

  const tiles = [
    { logo: 'G', title: 'Google Drive', desc: 'Read, summarize, draft — across all your Drive docs.' },
    { logo: 'S', title: 'Slack', desc: 'Bring Claude into your team conversations.' },
    { logo: 'N', title: 'Notion', desc: 'Search, edit, and reorganize your knowledge base.' },
    { logo: 'G', title: 'GitHub', desc: 'Review PRs, run agentic refactors, fix issues.' },
    { logo: 'L', title: 'Linear', desc: 'Triage tickets and draft responses in your team\'s voice.' },
    { logo: 'F', title: 'Figma', desc: 'Read design specs and translate them to working code.' },
  ];

  return (
    <section className={className} style={sectionStyle}>
      <div style={labelStyle}>06 — Connector Tile Grid</div>
      <h2 style={headingStyle}>Connect everything Claude needs</h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '24px',
        }}
      >
        {tiles.map((tile) => (
          <div key={tile.title} style={tileStyle}>
            <div style={logoSyle}>{tile.logo}</div>
            <h5 style={titleStyle}>{tile.title}</h5>
            <p style={descStyle}>{tile.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
