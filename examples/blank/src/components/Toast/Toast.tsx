/**
 * Toast — captured by emdesign.
 * Reusable, design-system-bound component. Edit freely; re-capture to update.
 */
import React from 'react';

type ToastVariant = 'success' | 'warn' | 'danger' | 'info';

export interface ToastProps {
  message: string;
  variant?: ToastVariant;
  action?: { label: string; onClick: () => void };
  onDismiss?: () => void;
  className?: string;
}

const variantStyles: Record<ToastVariant, { bg: string; icon: string }> = {
  success: { bg: 'bg-success', icon: '✓' },
  warn: { bg: 'bg-warn', icon: '!' },
  danger: { bg: 'bg-danger', icon: '✕' },
  info: { bg: 'bg-surface-dark', icon: 'i' },
};

/** Toast notification for status messages. */
export function Toast({ message, variant = 'info', action, onDismiss, className = '' }: ToastProps) {
  const s = variantStyles[variant];
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded shadow-raised text-white min-w-[300px] max-w-md ${s.bg} ${className}`}>
      <span className="text-[14px] font-bold w-5 h-5 flex items-center justify-center rounded-full bg-white/20 shrink-0">{s.icon}</span>
      <span className="flex-1 text-[14px]">{message}</span>
      {action && (
        <button onClick={action.onClick} className="text-[13px] font-medium underline hover:no-underline shrink-0">{action.label}</button>
      )}
      {onDismiss && (
        <button onClick={onDismiss} className="text-white/70 hover:text-white shrink-0">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>
      )}
    </div>
  );
}
