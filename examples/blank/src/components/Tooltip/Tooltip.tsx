/**
 * Tooltip — captured by emdesign.
 * Reusable, design-system-bound component. Edit freely; re-capture to update.
 */
import React from 'react';

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: TooltipPosition;
  delay?: number;
  className?: string;
}

/** Tooltip that shows on hover with configurable position. */
export function Tooltip({ content, children, position = 'top', delay = 200, className = '' }: TooltipProps) {
  const positionStyles: Record<TooltipPosition, string> = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div className={`relative inline-flex group ${className}`}>
      {children}
      <div
        className={`absolute z-50 px-2 py-1 rounded text-[12px] bg-surface-dark text-text-inverse whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-[120ms] ${positionStyles[position]}`}
        style={{ transitionDelay: `${delay}ms` }}
      >
        {content}
      </div>
    </div>
  );
}
