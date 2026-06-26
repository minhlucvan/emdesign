/**
 * A button with intentional lint violations for testing the consistency gate.
 * Uses raw hex colors and hardcoded values instead of token roles.
 */
import React from 'react';

interface ViolatingButtonProps {
  label: string;
}

export function ViolatingButton({ label }: ViolatingButtonProps) {
  return (
    <button
      style={{
        backgroundColor: '#4F46E5', // Violation: raw hex instead of var(--color-accent)
        color: '#FFFFFF',           // Violation: raw hex instead of var(--color-surface)
        borderRadius: '6px',        // Violation: hardcoded value instead of var(--radius-md)
        padding: '12px 24px',       // Violation: hardcoded value instead of var(--space-md) / var(--space-lg)
        fontFamily: 'Inter',        // Violation: raw font name instead of var(--font-body)
        fontSize: '14px',           // Minor or acceptable depending on DS rules
        border: 'none',
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  );
}
