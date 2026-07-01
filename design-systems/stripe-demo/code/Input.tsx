import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  background: '#ffffff',
  color: '#0d253d',
  border: '1px solid #e3e8ee',
  borderRadius: '6px',
  padding: '10px 12px',
  fontFamily: "'Inter', system-ui, sans-serif",
  fontSize: '16px',
  lineHeight: 1.5,
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '13px',
  fontWeight: 700,
  color: '#0d253d',
  fontFamily: "'Inter', system-ui, sans-serif",
  margin: '0 0 6px',
};

const fieldStyle: React.CSSProperties = {
  minWidth: 0,
  boxSizing: 'border-box',
};

/** Stripe-style input matching reference-example.css .input + .field label. */
export function Input({ label, style, className = '', ...props }: InputProps) {
  return (
    <div style={fieldStyle}>
      {label && <label style={labelStyle}>{label}</label>}
      <input
        className={className}
        style={{ ...inputStyle, ...style }}
        {...props}
      />
    </div>
  );
}
