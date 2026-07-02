import React from 'react';
import { NavBar } from '@ds/NavBar';
import { NavLink } from '@ds/NavLink';
import { Button } from '@ds/Button';

export interface OverviewNavigationProps {
  className?: string;
}

/** Top navigation: brand left + GitHub badge, centered page links, CTA right — 3-column grid.
 *  Matches reference: nav.nav with brand-link wrapping nav-brand span, nav-github badge,
 *  nav-links list, and nav-cta button. */
export function OverviewNavigation({ className = '' }: OverviewNavigationProps) {
  return (
    <NavBar className={className}>
      {/* Left column: brand text + GitHub badge */}
      <div className="nav-left" style={{ display: 'flex', alignItems: 'center', gap: '20px', justifySelf: 'start' }}>
        <a
          href="https://getdesign.md/"
          target="_blank"
          rel="noopener noreferrer"
          className="nav-brand-link"
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <span
            className="nav-brand"
            style={{
              fontFamily: "'EB Garamond', 'Tiempos Headline', serif",
              fontWeight: 400,
              fontSize: '20px',
              color: 'var(--color-ink)',
              letterSpacing: '-0.3px',
            }}
          >
            getdesign.md
          </span>
        </a>
        <a
          className="nav-github"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontFamily: 'Inter, -apple-system, sans-serif',
            fontSize: '12px',
            fontWeight: 500,
            color: 'inherit',
            textDecoration: 'none',
            padding: '5px 10px',
            border: '1px solid rgba(128,128,128,0.3)',
            borderRadius: '6px',
            opacity: 0.75,
            lineHeight: 1,
            whiteSpace: 'nowrap',
          }}
          href="https://github.com/VoltAgent/awesome-design-md"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="awesome-design-md on GitHub"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2 .37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
          </svg>
          awesome-design-md
        </a>
      </div>

      {/* Center column: page-section nav links */}
      <ul
        style={{
          display: 'flex',
          gap: '28px',
          alignItems: 'center',
          justifySelf: 'center',
          listStyle: 'none',
          margin: 0,
          padding: 0,
        }}
      >
        <li><NavLink href="#colors">Colors</NavLink></li>
        <li><NavLink href="#typography">Typography</NavLink></li>
        <li><NavLink href="#components">Components</NavLink></li>
        <li><NavLink href="#responsive">Responsive</NavLink></li>
      </ul>

      {/* Right column: primary CTA */}
      <div style={{ justifySelf: 'end' }}>
        <Button>Try Claude</Button>
      </div>
    </NavBar>
  );
}
