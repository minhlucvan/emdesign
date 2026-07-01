import React from 'react';
import { Input } from './Input';

/* ---- Shared inline styles matching reference-example.html section form CSS ---- */

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
    gap: '24px',
  },
  fieldGroup: {
    padding: '0',
    minWidth: 0,
    boxSizing: 'border-box',
  },
  groupLabel: {
    fontFamily: monoFont,
    fontSize: '11px',
    color: muted,
    display: 'block',
    marginBottom: '8px',
  },
  divider: {
    marginTop: '32px',
    paddingTop: '32px',
    borderTop: `1px solid ${hairline}`,
  },
  subhead: {
    fontFamily: displayFont,
    fontWeight: 700,
    fontSize: '22px',
    margin: '32px 0 16px',
    color: ink,
  },
  row: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap' as const,
  },
  flex1: {
    flex: 1,
    minWidth: '140px',
  },
};

/* ---- Data ---- */

interface FormField {
  label: string;
  placeholder?: string;
  type?: string;
  defaultValue?: string;
}

const textFields: FormField[] = [
  { label: 'Full name', placeholder: 'Jenny Rosen', type: 'text' },
  { label: 'Email address', placeholder: 'jenny@example.com', type: 'email' },
  { label: 'Company', placeholder: 'Acme Corp', type: 'text' },
  { label: 'Phone', placeholder: '+1 (555) 000-0000', type: 'tel' },
];

const cardFields: FormField[] = [
  { label: 'Card number', placeholder: '4242 4242 4242 4242', type: 'text' },
  { label: 'Expiry', placeholder: 'MM / YY', type: 'text' },
  { label: 'CVC', placeholder: '123', type: 'text' },
  { label: 'ZIP / Postal code', placeholder: '94107', type: 'text' },
];

/* ---- Sub-components ---- */

function FieldCell({ field }: { field: FormField }) {
  return (
    <div style={s.fieldGroup}>
      <Input
        label={field.label}
        placeholder={field.placeholder}
        type={field.type}
        defaultValue={field.defaultValue}
      />
    </div>
  );
}

/* ---- Export ---- */

export interface OverviewFormElementsProps {
  className?: string;
}

/**
 * OverviewFormElements — Stripe-inspired form elements section.
 * Uses inline styles and the Input primitive to match reference-example.css form tokens.
 */
export function OverviewFormElements({ className = '' }: OverviewFormElementsProps) {
  return (
    <section id="forms" className={className} style={s.section}>
      <p style={s.eyebrow}>05 &mdash; Form Elements</p>
      <h2 style={s.heading}>Form Elements</h2>
      <p style={s.sub}>
        Clean input fields with subtle borders, clear labels, and focus states
        that align with Stripe's payment-form design language.
      </p>

      <h3 style={s.subhead}>Text Inputs</h3>
      <div style={s.grid}>
        {textFields.map((field) => (
          <FieldCell key={field.label} field={field} />
        ))}
      </div>

      <div style={s.divider}>
        <h3 style={s.subhead}>Card-like Inputs</h3>
        <p style={{ margin: '0 0 24px', fontSize: '18px', lineHeight: 1.55 }}>
          Grouped fields simulating a payment card entry form.
        </p>
        <div style={s.grid}>
          {cardFields.map((field) => (
            <FieldCell key={field.label} field={field} />
          ))}
        </div>
      </div>
    </section>
  );
}
