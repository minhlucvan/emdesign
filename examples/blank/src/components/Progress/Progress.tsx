/**
 * Progress — captured by emdesign.
 * Reusable, design-system-bound component. Edit freely; re-capture to update.
 */
import React from 'react';

type ProgressVariant = 'default' | 'success' | 'warn';

export interface ProgressProps {
  value: number;
  variant?: ProgressVariant;
  size?: 'sm' | 'md';
  showLabel?: boolean;
  className?: string;
}

const barColors = { default: 'bg-accent', success: 'bg-success', warn: 'bg-warn' };

/** Progress bar: determinate or indeterminate. */
export function Progress({ value, variant = 'default', size = 'md', showLabel = false, className = '' }: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`flex-1 bg-surface-hover rounded-full overflow-hidden ${size === 'sm' ? 'h-1.5' : 'h-2.5'}`}>
        <div
          className={`h-full rounded-full transition-[width] duration-[200ms] ${barColors[variant]}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && <span className="text-[13px] text-text-muted font-medium shrink-0">{clamped}%</span>}
    </div>
  );
}

/** Indeterminate progress bar (loading state). */
export function ProgressIndeterminate({ className = '' }: { className?: string }) {
  return (
    <div className={`h-1.5 bg-surface-hover rounded-full overflow-hidden ${className}`}>
      <div className="h-full w-1/3 bg-accent rounded-full animate-[progress-indeterminate_1.5s_ease-in-out_infinite]" />
    </div>
  );
}
