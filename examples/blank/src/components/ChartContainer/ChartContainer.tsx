/**
 * ChartContainer — captured by emdesign.
 * Reusable, design-system-bound component. Edit freely; re-capture to update.
 */
import React from 'react';
import { Heading } from '@ds';

export interface ChartContainerProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  toolbar?: React.ReactNode;
  height?: number;
}

/** Dashboard chart container: card with title, optional toolbar and chart area. */
export function ChartContainer({ title, subtitle, children, toolbar, height = 300 }: ChartContainerProps) {
  return (
    <div className="bg-surface-raised border border-border rounded p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <Heading level={3}>{title}</Heading>
          {subtitle && (
            <p className="text-[13px] text-text-muted mt-0.5">{subtitle}</p>
          )}
        </div>
        {toolbar && (
          <div className="flex items-center gap-1">{toolbar}</div>
        )}
      </div>

      {/* Chart area */}
      <div
        className="w-full bg-surface rounded flex items-center justify-center"
        style={{ height }}
      >
        {children ?? (
          <p className="text-[13px] text-text-muted">Chart placeholder</p>
        )}
      </div>
    </div>
  );
}
