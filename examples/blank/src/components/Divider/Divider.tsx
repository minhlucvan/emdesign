/**
 * Divider — captured by emdesign.
 * Reusable, design-system-bound component. Edit freely; re-capture to update.
 */
import React from 'react';

export interface DividerProps {
  label?: string;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

/** A horizontal or vertical divider with optional label. */
export function Divider({ label, orientation = 'horizontal', className = '' }: DividerProps) {
  if (orientation === 'vertical') {
    return (
      <div className={`w-px bg-border self-stretch mx-2 ${className}`} />
    );
  }
  if (label) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="flex-1 h-px bg-border" />
        <span className="text-[12px] font-medium text-text-muted uppercase tracking-[0.04em] shrink-0">{label}</span>
        <div className="flex-1 h-px bg-border" />
      </div>
    );
  }
  return <div className={`h-px bg-border w-full ${className}`} />;
}
