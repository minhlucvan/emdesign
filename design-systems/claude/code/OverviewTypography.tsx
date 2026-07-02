import React from 'react';

export interface OverviewTypographyProps {
  className?: string;
}

/** Typography overview section — full type scale from display-xl through nav-link,
 *  each rendered as a type-row with meta and sample columns.
 *  Slab-serif display (Copernicus/EB Garamond) for headlines, humanist sans (Inter/StyreneB) for body.
 *
 *  Matches reference: section max-width 1200px centered, 96px/32px padding, hairline border-top. */
export function OverviewTypography({ className = '' }: OverviewTypographyProps) {
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
    margin: '0 0 16px',
    letterSpacing: '-1px',
  };

  const introStyle: React.CSSProperties = {
    fontFamily: 'var(--font-sans)',
    fontSize: '16px',
    color: 'var(--color-body)',
    maxWidth: '720px',
    marginBottom: '48px',
    lineHeight: '1.55',
  };

  const rowStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '320px 1fr',
    gap: '32px',
    alignItems: 'baseline',
    padding: '20px 0',
    borderBottom: '1px solid var(--color-border)',
  };

  const metaStyle: React.CSSProperties = {
    fontSize: '12px',
    color: 'var(--color-muted)',
    lineHeight: 1.5,
  };

  const strongStyle: React.CSSProperties = {
    display: 'block',
    color: 'var(--color-ink)',
    fontWeight: 500,
    fontSize: '13px',
    marginBottom: '4px',
  };

  const sampleStyle: React.CSSProperties = {
    color: 'var(--color-ink)',
  };

  return (
    <section id="typography" className={className} style={sectionStyle}>
      <div style={labelStyle}>02 — Typography</div>
      <h2 style={headingStyle}>Copernicus serif + StyreneB sans</h2>
      <p style={introStyle}>
        Slab-serif display for headlines (substituted with EB Garamond),
        humanist sans for body (Inter). The serif character is the
        editorial brand voice — switching to sans display would flatten
        Anthropic into another AI tool.
      </p>

      <div>
        {/* display-xl */}
        <div style={rowStyle}>
          <div style={metaStyle}>
            <strong style={strongStyle}>display-xl</strong>
            64px / 400 / 1.05 / -1.5px<br />
            Copernicus serif
          </div>
          <div style={{ ...sampleStyle, fontFamily: 'var(--font-display)', fontSize: '64px', fontWeight: 400, lineHeight: 1.05, letterSpacing: '-1.5px' }}>
            Meet your thinking partner
          </div>
        </div>

        {/* display-lg */}
        <div style={rowStyle}>
          <div style={metaStyle}>
            <strong style={strongStyle}>display-lg</strong>
            48px / 400 / 1.1 / -1px
          </div>
          <div style={{ ...sampleStyle, fontFamily: 'var(--font-display)', fontSize: '48px', fontWeight: 400, letterSpacing: '-1px' }}>
            For the curious, the careful, the brilliant
          </div>
        </div>

        {/* display-md */}
        <div style={rowStyle}>
          <div style={metaStyle}>
            <strong style={strongStyle}>display-md</strong>
            36px / 400 / 1.15 / -0.5px
          </div>
          <div style={{ ...sampleStyle, fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: 400, letterSpacing: '-0.5px' }}>
            Build with Claude
          </div>
        </div>

        {/* display-sm */}
        <div style={rowStyle}>
          <div style={metaStyle}>
            <strong style={strongStyle}>display-sm</strong>
            28px / 400 / 1.2 / -0.3px
          </div>
          <div style={{ ...sampleStyle, fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 400, letterSpacing: '-0.3px' }}>
            Pricing for every team
          </div>
        </div>

        {/* title-lg */}
        <div style={rowStyle}>
          <div style={metaStyle}>
            <strong style={strongStyle}>title-lg</strong>
            22px / 500 / 1.3<br />
            StyreneB sans
          </div>
          <div style={{ ...sampleStyle, fontFamily: 'var(--font-sans)', fontSize: '22px', fontWeight: 500 }}>
            Pro &middot; $20 / month
          </div>
        </div>

        {/* title-md */}
        <div style={rowStyle}>
          <div style={metaStyle}>
            <strong style={strongStyle}>title-md</strong>
            18px / 500 / 1.4
          </div>
          <div style={{ ...sampleStyle, fontFamily: 'var(--font-sans)', fontSize: '18px', fontWeight: 500 }}>
            Code understanding at depth
          </div>
        </div>

        {/* title-sm */}
        <div style={rowStyle}>
          <div style={metaStyle}>
            <strong style={strongStyle}>title-sm</strong>
            16px / 500 / 1.4
          </div>
          <div style={{ ...sampleStyle, fontFamily: 'var(--font-sans)', fontSize: '16px', fontWeight: 500 }}>
            Connect Slack workspace
          </div>
        </div>

        {/* body-md */}
        <div style={rowStyle}>
          <div style={metaStyle}>
            <strong style={strongStyle}>body-md</strong>
            16px / 400 / 1.55
          </div>
          <div style={{ ...sampleStyle, fontFamily: 'var(--font-sans)', fontSize: '16px', lineHeight: 1.55 }}>
            Claude reasons through complex problems with the patience and
            care of a thoughtful colleague — drawing on context across long
            conversations and large codebases.
          </div>
        </div>

        {/* body-sm */}
        <div style={rowStyle}>
          <div style={metaStyle}>
            <strong style={strongStyle}>body-sm</strong>
            14px / 400 / 1.55
          </div>
          <div style={{ ...sampleStyle, fontFamily: 'var(--font-sans)', fontSize: '14px' }}>
            Footer body, fine-print legal text — same Inter face at smaller
            size.
          </div>
        </div>

        {/* caption */}
        <div style={rowStyle}>
          <div style={metaStyle}>
            <strong style={strongStyle}>caption</strong>
            13px / 500 / 1.4
          </div>
          <div style={{ ...sampleStyle, fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500, color: 'var(--color-muted)' }}>
            Limited beta &middot; Available in API
          </div>
        </div>

        {/* caption-uppercase */}
        <div style={rowStyle}>
          <div style={metaStyle}>
            <strong style={strongStyle}>caption-uppercase</strong>
            12px / 500 / 1.5px
          </div>
          <div style={{ ...sampleStyle, fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: 500, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
            NEW &middot; CLAUDE OPUS 4
          </div>
        </div>

        {/* code */}
        <div style={rowStyle}>
          <div style={metaStyle}>
            <strong style={strongStyle}>code</strong>
            14px / 400 / 1.6<br />
            JetBrains Mono
          </div>
          <code style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', lineHeight: 1.6, color: 'var(--color-ink)' }}>
            {'claude.messages.create({ model: "opus" })'}
          </code>
        </div>

        {/* button */}
        <div style={rowStyle}>
          <div style={metaStyle}>
            <strong style={strongStyle}>button</strong>
            14px / 500 / 1.0
          </div>
          <div style={{ ...sampleStyle, fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 500 }}>
            Try Claude
          </div>
        </div>

        {/* nav-link (last row — no bottom border) */}
        <div style={{ ...rowStyle, borderBottom: 'none' }}>
          <div style={metaStyle}>
            <strong style={strongStyle}>nav-link</strong>
            14px / 500 / 1.4
          </div>
          <div style={{ ...sampleStyle, fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 500 }}>
            Product &middot; Solutions &middot; Use Cases &middot; Pricing &middot; Research
          </div>
        </div>
      </div>
    </section>
  );
}
