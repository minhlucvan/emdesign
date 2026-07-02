import React from 'react';

export interface OverviewColorPaletteProps {
  className?: string;
}

/** Overview Color Palette section — Brand, Surface, and Text swatch groups.
 *  Matches reference section: max-width 1200px, centered, 96px/32px padding,
 *  hairline border-top, cream surface background. */
export function OverviewColorPalette({ className = '' }: OverviewColorPaletteProps) {
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

  const groupHeadingStyle: React.CSSProperties = {
    fontFamily: 'var(--font-display)',
    fontSize: '20px',
    fontWeight: 400,
    color: 'var(--color-ink)',
    margin: '0 0 20px',
    letterSpacing: '-0.3px',
  };

  const paletteGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '20px',
  };

  const swatchStyle: React.CSSProperties = {
    border: '1px solid var(--color-border)',
    borderRadius: '12px',
    overflow: 'hidden',
    background: 'var(--color-surface)',
  };

  const swatchMetaStyle: React.CSSProperties = {
    padding: '12px 14px',
  };

  const swatchNameStyle: React.CSSProperties = {
    fontWeight: 500,
    fontSize: '13px',
    color: 'var(--color-ink)',
    marginBottom: '4px',
  };

  const swatchHexStyle: React.CSSProperties = {
    fontFamily: 'var(--font-mono)',
    fontSize: '12px',
    color: 'var(--color-muted)',
    marginBottom: '6px',
  };

  const swatchRoleStyle: React.CSSProperties = {
    fontSize: '12px',
    color: 'var(--color-body)',
    lineHeight: 1.5,
  };

  const groupContainerStyle: React.CSSProperties = {
    marginBottom: '56px',
  };

  return (
    <section id="colors" className={className} style={sectionStyle}>
      <div style={labelStyle}>01 — Color Palette</div>
      <h2 style={headingStyle}>Cream + coral + dark navy</h2>
      <p style={introStyle}>
        The trinity. Cream canvas as the editorial floor, coral as the brand
        voltage, dark navy as the product-chrome surface. No fourth surface
        tone.
      </p>

      <div style={groupContainerStyle}>
        <h3 style={groupHeadingStyle}>Brand</h3>
        <div style={paletteGridStyle}>
          <div style={swatchStyle}>
            <div style={{ height: '80px', background: '#cc785c' }} />
            <div style={swatchMetaStyle}>
              <div style={swatchNameStyle}>primary (coral)</div>
              <div style={swatchHexStyle}>#cc785c</div>
              <div style={swatchRoleStyle}>All primary CTAs and full-bleed callout cards.</div>
            </div>
          </div>
          <div style={swatchStyle}>
            <div style={{ height: '80px', background: '#a9583e' }} />
            <div style={swatchMetaStyle}>
              <div style={swatchNameStyle}>primary-active</div>
              <div style={swatchHexStyle}>#a9583e</div>
              <div style={swatchRoleStyle}>Press state on coral buttons.</div>
            </div>
          </div>
          <div style={swatchStyle}>
            <div style={{ height: '80px', background: '#5db8a6' }} />
            <div style={swatchMetaStyle}>
              <div style={swatchNameStyle}>accent-teal</div>
              <div style={swatchHexStyle}>#5db8a6</div>
              <div style={swatchRoleStyle}>Status indicators, &ldquo;active connection&rdquo; dots.</div>
            </div>
          </div>
          <div style={swatchStyle}>
            <div style={{ height: '80px', background: '#e8a55a' }} />
            <div style={swatchMetaStyle}>
              <div style={swatchNameStyle}>accent-amber</div>
              <div style={swatchHexStyle}>#e8a55a</div>
              <div style={swatchRoleStyle}>Category badges, inline highlights.</div>
            </div>
          </div>
        </div>
      </div>

      <div style={groupContainerStyle}>
        <h3 style={groupHeadingStyle}>Surface</h3>
        <div style={paletteGridStyle}>
          <div style={swatchStyle}>
            <div style={{ height: '80px', background: '#faf9f5' }} />
            <div style={swatchMetaStyle}>
              <div style={swatchNameStyle}>canvas (cream)</div>
              <div style={swatchHexStyle}>#faf9f5</div>
              <div style={swatchRoleStyle}>Default page floor — tinted cream, deliberately not pure white.</div>
            </div>
          </div>
          <div style={swatchStyle}>
            <div style={{ height: '80px', background: '#f5f0e8' }} />
            <div style={swatchMetaStyle}>
              <div style={swatchNameStyle}>surface-soft</div>
              <div style={swatchHexStyle}>#f5f0e8</div>
              <div style={swatchRoleStyle}>Section dividers, soft band backgrounds.</div>
            </div>
          </div>
          <div style={swatchStyle}>
            <div style={{ height: '80px', background: '#efe9de' }} />
            <div style={swatchMetaStyle}>
              <div style={swatchNameStyle}>surface-card</div>
              <div style={swatchHexStyle}>#efe9de</div>
              <div style={swatchRoleStyle}>Feature cards, content cards.</div>
            </div>
          </div>
          <div style={swatchStyle}>
            <div style={{ height: '80px', background: '#181715' }} />
            <div style={swatchMetaStyle}>
              <div style={swatchNameStyle}>surface-dark</div>
              <div style={swatchHexStyle}>#181715</div>
              <div style={swatchRoleStyle}>Code editor mockups, model cards, footer.</div>
            </div>
          </div>
          <div style={swatchStyle}>
            <div style={{ height: '80px', background: '#252320' }} />
            <div style={swatchMetaStyle}>
              <div style={swatchNameStyle}>surface-dark-elevated</div>
              <div style={swatchHexStyle}>#252320</div>
              <div style={swatchRoleStyle}>Elevated cards inside dark bands.</div>
            </div>
          </div>
          <div style={swatchStyle}>
            <div style={{ height: '80px', background: '#e6dfd8' }} />
            <div style={swatchMetaStyle}>
              <div style={swatchNameStyle}>hairline</div>
              <div style={swatchHexStyle}>#e6dfd8</div>
              <div style={swatchRoleStyle}>1px borders on cream surfaces.</div>
            </div>
          </div>
        </div>
      </div>

      <div style={groupContainerStyle}>
        <h3 style={groupHeadingStyle}>Text</h3>
        <div style={paletteGridStyle}>
          <div style={swatchStyle}>
            <div style={{ height: '80px', background: '#141413' }} />
            <div style={swatchMetaStyle}>
              <div style={swatchNameStyle}>ink</div>
              <div style={swatchHexStyle}>#141413</div>
              <div style={swatchRoleStyle}>Headlines and primary text. Warm dark.</div>
            </div>
          </div>
          <div style={swatchStyle}>
            <div style={{ height: '80px', background: '#3d3d3a' }} />
            <div style={swatchMetaStyle}>
              <div style={swatchNameStyle}>body</div>
              <div style={swatchHexStyle}>#3d3d3a</div>
              <div style={swatchRoleStyle}>Default running-text.</div>
            </div>
          </div>
          <div style={swatchStyle}>
            <div style={{ height: '80px', background: '#6c6a64' }} />
            <div style={swatchMetaStyle}>
              <div style={swatchNameStyle}>muted</div>
              <div style={swatchHexStyle}>#6c6a64</div>
              <div style={swatchRoleStyle}>Sub-headings, breadcrumbs, footer.</div>
            </div>
          </div>
          <div style={swatchStyle}>
            <div style={{ height: '80px', background: '#8e8b82' }} />
            <div style={swatchMetaStyle}>
              <div style={swatchNameStyle}>muted-soft</div>
              <div style={swatchHexStyle}>#8e8b82</div>
              <div style={swatchRoleStyle}>Captions, fine-print, copyright.</div>
            </div>
          </div>
          <div style={swatchStyle}>
            <div style={{ height: '80px', background: '#faf9f5', border: '1px solid var(--color-hairline)' }} />
            <div style={swatchMetaStyle}>
              <div style={swatchNameStyle}>on-dark</div>
              <div style={swatchHexStyle}>#faf9f5</div>
              <div style={swatchRoleStyle}>Cream-tinted white on dark surfaces.</div>
            </div>
          </div>
          <div style={swatchStyle}>
            <div style={{ height: '80px', background: '#a09d96' }} />
            <div style={swatchMetaStyle}>
              <div style={swatchNameStyle}>on-dark-soft</div>
              <div style={swatchHexStyle}>#a09d96</div>
              <div style={swatchRoleStyle}>Footer body — slightly muted on dark.</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
