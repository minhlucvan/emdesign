/**
 * ActivityFeed — captured by emdesign.
 * Reusable, design-system-bound component. Edit freely; re-capture to update.
 */
import React from 'react';

interface Activity {
  action: string;
  detail: string;
  time: string;
  status?: 'success' | 'warn' | 'danger';
}

export interface ActivityFeedProps {
  activities: Activity[];
}

const statusStyles: Record<string, string> = {
  success: 'bg-success',
  warn: 'bg-warn',
  danger: 'bg-danger',
};

/** Dashboard activity feed: chronological list of recent events. */
export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <div className="bg-surface-raised border border-border rounded p-5">
      <h3 className="text-[15px] font-semibold text-text mb-4">Recent Activity</h3>

      <div className="space-y-0">
        {activities.map((act, i) => (
          <div
            key={i}
            className="flex items-start gap-3 py-3 border-b border-border last:border-b-0"
          >
            {/* Status dot */}
            <div className="mt-1.5 shrink-0">
              <div
                className={'w-2 h-2 rounded-full ' + (act.status ? statusStyles[act.status] : 'bg-border')}
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-[14px] text-text">
                <span className="font-medium">{act.action}</span>
                {' '}
                <span className="text-text-muted">{act.detail}</span>
              </p>
            </div>

            {/* Time */}
            <span className="text-[12px] text-text-muted shrink-0">{act.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
