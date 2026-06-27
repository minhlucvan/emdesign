/**
 * StatsCard — captured by emdesign.
 * Reusable, design-system-bound component. Edit freely; re-capture to update.
 */
import React from 'react';
import { Card, Stack } from '@ds';

interface StatProps {
  label: string;
  value: string;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
}

export function StatsCard({ label, value, trend, trendLabel }: StatProps) {
  const trendColor = trend === 'up' ? 'text-success'
    : trend === 'down' ? 'text-danger'
    : 'text-text-muted';

  return (
    <Card>
      <Stack gap={2}>
        <p className="text-text-muted text-[12px] font-semibold uppercase tracking-[0.04em]">{label}</p>
        <p className="text-text text-[32px] font-bold leading-[1.1] tracking-[-0.5px]">{value}</p>
        {trend && (
          <p className={`${trendColor} text-[14px]`}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendLabel}
          </p>
        )}
      </Stack>
    </Card>
  );
}
