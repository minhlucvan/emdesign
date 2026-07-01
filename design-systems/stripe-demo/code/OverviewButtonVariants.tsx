import React from 'react';
import { Button } from './Button';

/* ---- Shared inline styles matching reference-example.html section#buttons ---- */

const displayFont = "'Inter', 'Sohne', 'SF Pro Display', system-ui, sans-serif";
const bodyFont = "'Inter', system-ui, sans-serif";
const monoFont = 'ui-monospace, Menlo, Monaco, monospace';

const primary = '#533afd';
const ink = '#0d253d';
const muted = '#64748d';
const hairline = '#e3e8ee';
const canvas = '#ffffff';

const s: Record<string, React.CSSProperties> = {
  section: {
    padding: '96px 48px',
    maxWidth: '1440px',
    margin: '0 auto',
    borderTop: `1px solid ${hairline}`,
    fontFamily: bodyFont,
    color: ink,
    backgroundColor: canvas,
    WebkitFontSmoothing: 'antialiased',
    boxSizing: 'border-box',
  },
  eyebrow: {
    fontFamily: bodyFont,
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '0.96px',
    textTransform: 'uppercase' as const,
    color: muted,
    margin: '0 0 12px',
  },
  heading: {
    fontFamily: displayFont,
    fontSize: '50px',
    fontWeight: 700,
    letterSpacing: '-0.6px',
    lineHeight: 1.12,
    color: ink,
    margin: '0 0 16px',
  },
  sub: {
    fontFamily: bodyFont,
    fontSize: '18px',
    color: ink,
    maxWidth: '720px',
    margin: '0 0 48px',
    lineHeight: 1.55,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px',
  },
  cell: {
    padding: '24px',
    border: `1px solid ${hairline}`,
    borderRadius: '12px',
    background: canvas,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-start',
    gap: '12px',
    minWidth: 0,
    boxSizing: 'border-box',
  },
  label: {
    fontFamily: monoFont,
    fontSize: '11px',
    color: muted,
  },
};

/* ---- Data ---- */

interface ButtonEntry {
  label: string;
  variant: 'primary' | 'secondary' | 'outline';
  text: string;
}

const buttonVariants: ButtonEntry[] = [
  { label: 'primary / .btn-primary', variant: 'primary', text: 'Get started' },
  { label: 'secondary / .btn-secondary', variant: 'secondary', text: 'Talk to sales' },
  { label: 'outline / .btn-outline', variant: 'outline', text: 'Learn more' },
];

/* ---- Sub-components ---- */

function ButtonCell({ label, variant, text }: ButtonEntry) {
  return (
    <div style={s.cell}>
      <div style={s.label}>{label}</div>
      <Button variant={variant}>{text}</Button>
    </div>
  );
}

/* ---- Export ---- */

export interface OverviewButtonVariantsProps {
  className?: string;
}

/**
 * OverviewButtonVariants — Stripe-inspired button variants section.
 * Uses inline styles and the Button primitive to match reference-example.html section#buttons CSS.
 */
export function OverviewButtonVariants({ className = '' }: OverviewButtonVariantsProps) {
  return (
    <section id="buttons" className={className} style={s.section}>
      <p style={s.eyebrow}>03 &mdash; Buttons</p>
      <h2 style={s.heading}>Button Variants</h2>
      <p style={s.sub}>
        Pill-shaped buttons with full, subtle, and outline treatments.
      </p>

      <div style={s.grid}>
        {buttonVariants.map((btn) => (
          <ButtonCell key={btn.label} {...btn} />
        ))}
      </div>
    </section>
  );
}
