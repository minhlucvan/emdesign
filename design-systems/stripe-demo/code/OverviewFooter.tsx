import React from 'react';

/* ---- Inline style values matching reference-example.html CSS tokens ---- */

const bodyFont = "'Inter', system-ui, sans-serif";
const ink = '#0d253d';
const muted = '#64748d';
const hairline = '#e3e8ee';
const canvas = '#ffffff';

export interface OverviewFooterProps {
  className?: string;
}

/**
 * OverviewFooter — Stripe-inspired page footer.
 * Uses inline styles to match reference-example.html .footer computed values.
 *
 * Reference CSS:
 *   .footer { padding: 32px 48px; border-top: 1px solid var(--hairline);
 *             text-align: center; font-size: 14px; color: var(--muted); }
 *   .footer a { color: var(--ink); }
 *   @media (max-width: 720px) {
 *     .footer { padding: 24px 16px; font-size: 12px; }
 *   }
 */
export function OverviewFooter({ className = '' }: OverviewFooterProps) {
  return (
    <footer
      className={`footer ${className}`.trim()}
      style={{
        padding: '32px 48px',
        borderTop: `1px solid ${hairline}`,
        textAlign: 'center',
        fontSize: '14px',
        color: muted,
        fontFamily: bodyFont,
        backgroundColor: canvas,
        WebkitFontSmoothing: 'antialiased',
        boxSizing: 'border-box',
        lineHeight: 'normal',
      }}
    >
      <span>&copy; 2026 Stripi, Inc. All rights reserved.</span>
      {' '}&middot;{' '}
      <a href="#" style={{ color: ink }}>Privacy</a>
      {' '}&middot;{' '}
      <a href="#" style={{ color: ink }}>Terms</a>
      {' '}&middot;{' '}
      <a href="#" style={{ color: ink }}>Cookie Preferences</a>
    </footer>
  );
}
