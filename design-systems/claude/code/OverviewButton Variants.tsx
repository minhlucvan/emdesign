import React from 'react';
import { IconButton } from '@ds/IconButton';

export interface OverviewButtonVariantsProps {
  className?: string;
}

/**
 * Overview Button Variants section — 8 variant cards in a responsive grid.
 * Matches section `03 — Button Variants` of the design reference.
 *
 * Layout: responsive auto-fill CSS grid (min 280px per column, 24px gap)
 * preceded by section label, heading, and intro paragraph. */
export function OverviewButtonVariants({ className = '' }: OverviewButtonVariantsProps) {
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

  const cellStyle: React.CSSProperties = {
    border: '1px solid var(--color-border)',
    borderRadius: '12px',
    padding: '28px',
    background: 'var(--color-surface)',
    minWidth: 0,
  };

  const labelTextStyle: React.CSSProperties = {
    fontSize: '13px',
    color: 'var(--color-ink)',
    fontWeight: 500,
    marginBottom: '12px',
  };

  const captionStyle: React.CSSProperties = {
    fontSize: '12px',
    color: 'var(--color-muted)',
    marginTop: '14px',
    lineHeight: 1.5,
  };

  const btnBase: React.CSSProperties = {
    display: 'inline-block',
    padding: '12px 20px',
    height: '40px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 500,
    border: 'none',
    fontFamily: 'var(--font-sans)',
    lineHeight: 1,
  };

  return (
    <section id="components" className={className} style={sectionStyle}>
      <div style={labelStyle}>03 — Button Variants</div>
      <h2 style={headingStyle}>Coral primary, cream secondary</h2>
      <p style={introStyle}>
        Coral CTAs only. Secondary buttons are cream-canvas with hairline
        outline. Dark surfaces get a slightly elevated dark button.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '24px',
        }}
      >
        {/* 1 — button-primary */}
        <div style={cellStyle}>
          <div style={labelTextStyle}>button-primary</div>
          <button style={{ ...btnBase, background: 'var(--color-primary)', color: 'var(--color-on-primary)' }}>
            Try Claude
          </button>
          <div style={captionStyle}>primary coral / on-primary white / md radius</div>
        </div>

        {/* 2 — button-primary-active (pressed state) */}
        <div style={cellStyle}>
          <div style={labelTextStyle}>button-primary-active</div>
          <button style={{ ...btnBase, background: 'var(--color-primary-active)', color: 'white' }}>
            Pressed
          </button>
          <div style={captionStyle}>primary-active darker coral</div>
        </div>

        {/* 3 — button-primary-disabled */}
        <div style={cellStyle}>
          <div style={labelTextStyle}>button-primary-disabled</div>
          <button style={{ ...btnBase, background: 'var(--color-primary-disabled)', color: 'var(--color-muted)' }} disabled>
            Disabled
          </button>
          <div style={captionStyle}>cream-tinted disabled fill</div>
        </div>

        {/* 4 — button-secondary */}
        <div style={cellStyle}>
          <div style={labelTextStyle}>button-secondary</div>
          <button style={{ ...btnBase, background: 'var(--color-surface)', color: 'var(--color-ink)', border: '1px solid var(--color-border)' }}>
            Read the docs
          </button>
          <div style={captionStyle}>cream / ink / hairline outline</div>
        </div>

        {/* 5 — button-secondary-on-dark */}
        <div style={{ ...cellStyle, background: 'var(--color-surface-dark)', borderColor: 'rgba(255,255,255,0.08)' }}>
          <div style={{ ...labelTextStyle, color: 'var(--color-on-dark)' }}>button-secondary-on-dark</div>
          <button style={{ ...btnBase, background: 'var(--color-surface-dark-elevated)', color: 'var(--color-on-dark)', border: '1px solid rgba(255,255,255,0.1)' }}>
            View example
          </button>
          <div style={{ ...captionStyle, color: 'var(--color-on-dark-soft)' }}>surface-dark-elevated / on-dark</div>
        </div>

        {/* 6 — button-text-link */}
        <div style={cellStyle}>
          <div style={labelTextStyle}>button-text-link</div>
          <button style={{ background: 'transparent', color: 'var(--color-ink)', border: 'none', padding: 0, height: 'auto', fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}>
            Sign in
          </button>
          <div style={captionStyle}>No background; inline link-style</div>
        </div>

        {/* 7 — text-link-coral */}
        <div style={cellStyle}>
          <div style={labelTextStyle}>text-link-coral</div>
          <a href="#" style={{ color: 'var(--color-primary)', textDecoration: 'underline', fontFamily: 'var(--font-sans)', fontSize: '14px' }}>
            Read the research &rarr;
          </a>
          <div style={captionStyle}>Inline coral link in body. The signature small detail.</div>
        </div>

        {/* 8 — button-icon-circular */}
        <div style={cellStyle}>
          <div style={labelTextStyle}>button-icon-circular</div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <IconButton aria-label="previous">&lsaquo;</IconButton>
            <IconButton aria-label="next">&rsaquo;</IconButton>
          </div>
          <div style={captionStyle}>36 &times; 36 / canvas / hairline / full radius</div>
        </div>
      </div>
    </section>
  );
}
