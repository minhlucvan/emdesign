/**
 * NavigationBar — captured by emdesign.
 * Reusable, design-system-bound component. Edit freely; re-capture to update.
 */
import React from 'react';

export interface NavLink {
  label: string;
  href?: string;
  active?: boolean;
}

export interface NavigationBarProps {
  brand?: string;
  ctaLabel?: string;
  onCtaClick?: () => void;
  navLinks?: NavLink[];
  className?: string;
}

/**
 * NavigationBar — Swiss-grid nav: brand left, nav links center, CTA right.
 *
 * - 48px height, hairline bottom border, px-4 padding
 * - Brand in font-display (22px, weight 900, tight tracking)
 * - Optional nav links in font-sans (13px, muted ink)
 * - Single ink-accent CTA (--color-accent bg, white text)
 *
 * Token roles only. Dark mode via dark: variants. Non-deterministic-free.
 */
export function NavigationBar({
  brand = 'Digits',
  ctaLabel = 'GET STARTED',
  onCtaClick,
  navLinks = [
    { label: 'Products', href: '#' },
    { label: 'Pricing', href: '#' },
    { label: 'Docs', href: '#' },
  ],
  className = '',
}: NavigationBarProps) {
  return (
    <nav aria-label="Primary navigation">
      <div
        className={
          'flex items-center justify-between gap-4 ' +
          'h-12 min-h-[48px] px-4 ' +
          'border-b border-border bg-surface text-text ' +
          'dark:bg-surface dark:border-border dark:text-text ' +
          className
        }
      >
        {/* Brand wordmark — left */}
        <span className="font-display text-[20px] font-black uppercase tracking-[-0.03em] leading-none text-text dark:text-text select-none">
          {brand}
        </span>

        {/* Nav links — center cluster */}
        {navLinks.length > 0 && (
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href || '#'}
                className={
                  'font-sans text-[13px] font-medium uppercase tracking-[0.06em] leading-none ' +
                  (link.active
                    ? 'text-text dark:text-text'
                    : 'text-text-muted dark:text-text-muted hover:text-text dark:hover:text-text') +
                  ' transition-colors duration-[120ms] no-underline'
                }
              >
                {link.label}
              </a>
            ))}
          </div>
        )}

        {/* Spacer on small screens when no links visible */}
        {navLinks.length === 0 && <div className="flex-1" />}

        {/* Ink accent CTA — right */}
        <button
          onClick={onCtaClick}
          className={
            'inline-flex items-center justify-center ' +
            'px-[18px] py-[9px] ' +
            'bg-accent text-white ' +
            'font-sans text-[12px] font-semibold uppercase tracking-[0.04em] leading-none ' +
            'rounded-none ' +
            'transition-opacity duration-[120ms] ' +
            'hover:opacity-80 ' +
            'focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)] ' +
            'disabled:opacity-45 disabled:pointer-events-none ' +
            'dark:bg-accent dark:text-[var(--color-highlight-ink)]'
          }
        >
          {ctaLabel}
        </button>
      </div>
    </nav>
  );
}
