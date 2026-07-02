import React from 'react';

interface OverviewCardsAndContainersProps {
  className?: string;
}

/** Section 04 — Cards & Containers: 3 FeatureCards, 1 CodeWindow, 2 ModelComparisonCards
 *  in a responsive auto-fill grid at 320px min-column-width with 24px gap.
 *  Cream feature cards, dark code mockup, canvas model-comparison cards
 *  with hairline border and coral text-link CTAs.
 *
 *  Matches reference section styling. */
export function OverviewCardsAndContainers({ className = '' }: OverviewCardsAndContainersProps) {
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

  const cardGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '24px',
    minWidth: 0,
  };

  const featureCardStyle: React.CSSProperties = {
    background: 'var(--color-surface-card)',
    borderRadius: '12px',
    padding: '32px',
  };

  const iconStyle: React.CSSProperties = {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    background: 'var(--color-surface)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
    fontSize: '18px',
  };

  const cardH4Style: React.CSSProperties = {
    fontFamily: 'var(--font-display)',
    fontSize: '22px',
    fontWeight: 400,
    color: 'var(--color-ink)',
    margin: '0 0 8px',
    letterSpacing: '-0.3px',
  };

  const cardPStyle: React.CSSProperties = {
    fontFamily: 'var(--font-sans)',
    fontSize: '14px',
    color: 'var(--color-body)',
    lineHeight: 1.55,
    margin: 0,
  };

  const darkCardStyle: React.CSSProperties = {
    background: 'var(--color-surface-dark)',
    color: 'var(--color-on-dark)',
    borderRadius: '12px',
    padding: '32px',
  };

  const darkH4Style: React.CSSProperties = {
    fontFamily: 'var(--font-display)',
    fontSize: '22px',
    fontWeight: 400,
    margin: '0 0 16px',
    letterSpacing: '-0.3px',
  };

  const darkPStyle: React.CSSProperties = {
    fontFamily: 'var(--font-sans)',
    fontSize: '14px',
    color: 'var(--color-on-dark-soft)',
    margin: '0 0 16px',
  };

  const codeWindowStyle: React.CSSProperties = {
    background: 'var(--color-surface-dark)',
    borderRadius: '12px',
    padding: '24px',
    color: 'var(--color-on-dark)',
  };

  const codeHeaderStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px',
    paddingBottom: '12px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  };

  const filenameStyle: React.CSSProperties = {
    fontFamily: 'var(--font-mono)',
    fontSize: '12px',
    color: 'var(--color-on-dark-soft)',
  };

  const preStyle: React.CSSProperties = {
    background: 'var(--color-surface-dark-soft)',
    borderRadius: '6px',
    padding: '16px',
    fontFamily: 'var(--font-mono)',
    fontSize: '13px',
    lineHeight: 1.7,
    overflowX: 'auto' as const,
    margin: 0,
  };

  const modelCardStyle: React.CSSProperties = {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: '12px',
    padding: '32px',
  };

  const textLinkStyle: React.CSSProperties = {
    color: 'var(--color-primary)',
    textDecoration: 'underline',
    fontFamily: 'var(--font-sans)',
    fontSize: '14px',
  };

  return (
    <section className={className} style={sectionStyle}>
      <div style={labelStyle}>04 — Cards & Containers</div>
      <h2 style={headingStyle}>Cream cards + dark mockups + coral callouts</h2>

      <div style={cardGridStyle}>
        {/* FeatureCard — Reason through complexity */}
        <div style={featureCardStyle}>
          <div style={iconStyle} aria-hidden="true">⚡</div>
          <h4 style={cardH4Style}>Reason through complexity</h4>
          <p style={cardPStyle}>
            Claude excels at multi-step reasoning, drawing on long context to think through problems carefully.
          </p>
        </div>

        {/* FeatureCard — Code understanding */}
        <div style={featureCardStyle}>
          <div style={iconStyle} aria-hidden="true">📚</div>
          <h4 style={cardH4Style}>Code understanding</h4>
          <p style={cardPStyle}>
            From small refactors to large codebase migrations, Claude reads code with the depth of a senior engineer.
          </p>
        </div>

        {/* FeatureCard — Safe by design */}
        <div style={featureCardStyle}>
          <div style={iconStyle} aria-hidden="true">🛡️</div>
          <h4 style={cardH4Style}>Safe by design</h4>
          <p style={cardPStyle}>
            Built with constitutional AI training to be helpful, harmless, and honest across diverse use cases.
          </p>
        </div>

        {/* CodeWindow — dark code-mockup card */}
        <div style={codeWindowStyle}>
          <div style={codeHeaderStyle}>
            <span style={filenameStyle}>refactor.py &middot; agent</span>
          </div>
          <pre style={preStyle}>
            <span style={{ color: '#c898b9' }}>async def</span>{' '}
            <span style={{ color: '#87b8c4' }}>migrate</span>(file):
            {'\n'}    code = <span style={{ color: '#d4a37c' }}>&quot;&quot;&quot;...&quot;&quot;&quot;</span>
            {'\n'}    <span style={{ color: 'var(--color-muted-soft)' }}># Claude reads, plans, and rewrites</span>
            {'\n'}    <span style={{ color: '#c898b9' }}>return</span> claude.refactor(code)
          </pre>
        </div>

        {/* ModelComparisonCard — Opus 4 */}
        <div style={modelCardStyle}>
          <h4 style={{ ...cardH4Style, color: 'var(--color-ink)', fontSize: '28px', letterSpacing: '-0.5px' }}>
            Opus 4
          </h4>
          <p style={cardPStyle}>
            Our most intelligent model for complex agentic tasks and long-horizon reasoning.
          </p>
          <a href="#" style={textLinkStyle}>View capabilities &rarr;</a>
        </div>

        {/* ModelComparisonCard — Sonnet 4 */}
        <div style={modelCardStyle}>
          <h4 style={{ ...cardH4Style, color: 'var(--color-ink)', fontSize: '28px', letterSpacing: '-0.5px' }}>
            Sonnet 4
          </h4>
          <p style={cardPStyle}>
            Balanced speed and capability — the everyday workhorse for production systems.
          </p>
          <a href="#" style={textLinkStyle}>View capabilities &rarr;</a>
        </div>
      </div>
    </section>
  );
}
