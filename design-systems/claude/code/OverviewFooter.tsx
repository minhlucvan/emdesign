import React from 'react';

export interface OverviewFooterProps extends React.HTMLAttributes<HTMLElement> {
  className?: string;
}

/** Footer section for the Claude Design System overview — dark band with
 *  4-column link grid (collapsing to 2 at 760px) and credit bar.
 *  Matches reference footer pattern. */
export function OverviewFooter({ className = '', ...props }: OverviewFooterProps) {
  const footerStyle: React.CSSProperties = {
    background: 'var(--color-surface-dark)',
    color: 'var(--color-on-dark-soft)',
    padding: '64px 48px',
    fontSize: '13px',
    textAlign: 'left',
  };

  const innerStyle: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto',
  };

  const brandStyle: React.CSSProperties = {
    color: 'var(--color-on-dark)',
    fontFamily: 'var(--font-display)',
    fontSize: '22px',
    fontWeight: 400,
    marginBottom: '24px',
    letterSpacing: '-0.3px',
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '32px',
  };

  const colHeadingStyle: React.CSSProperties = {
    margin: '0 0 14px',
    color: 'inherit',
    font: 'inherit',
    fontWeight: 700,
    fontSize: '14px',
    lineHeight: 1.2,
  };

  const colItemStyle: React.CSSProperties = {
    display: 'block',
    margin: '0 0 10px',
    color: 'inherit',
    opacity: 0.72,
    fontSize: '14px',
    lineHeight: 1.35,
  };

  const creditStyle: React.CSSProperties = {
    marginTop: '48px',
    paddingTop: '24px',
    borderTop: '1px solid currentColor',
    color: 'inherit',
    opacity: 0.78,
    fontSize: '13px',
    lineHeight: 1.4,
  };

  const columns = [
    {
      title: 'VoltAgent Framework',
      items: ['TypeScript agents', 'Tool orchestration', 'Multi-agent workflows'],
    },
    {
      title: 'VoltOps LLM Observability',
      items: ['LLM tracing', 'Live debugging', 'Visual timelines'],
    },
    {
      title: 'Production',
      items: ['Evaluations', 'Prompt management', 'Guardrails'],
    },
    {
      title: 'Platform',
      items: ['VoltOps console', 'Open source core', 'Agent engineering'],
    },
  ];

  return (
    <footer className={className} style={footerStyle} {...props}>
      <div style={innerStyle}>
        <div style={gridStyle}>
          {columns.map((col) => (
            <div key={col.title}>
              <h6 style={colHeadingStyle}>{col.title}</h6>
              {col.items.map((item) => (
                <span key={item} style={colItemStyle}>{item}</span>
              ))}
            </div>
          ))}
        </div>
        <div style={creditStyle}>
          Maintained by{' '}
          <a
            href="https://github.com/VoltAgent/voltagent"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'inherit', textDecoration: 'none', fontWeight: 600 }}
          >
            <img
              src="https://github.com/VoltAgent.png?size=32"
              alt="VoltAgent"
              width={14}
              height={14}
              style={{ borderRadius: '3px', verticalAlign: '-2px', marginRight: '3px' }}
            />
            VoltAgent
          </a>{' '}
          team
        </div>
      </div>
    </footer>
  );
}
