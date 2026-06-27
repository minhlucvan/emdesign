/**
 * Tabs — captured by emdesign.
 * Reusable, design-system-bound component. Edit freely; re-capture to update.
 */
import React from 'react';

interface Tab { id: string; label: string; badge?: string; }

export interface TabsProps {
  tabs: Tab[];
  activeTab?: string;
  onChange?: (id: string) => void;
  variant?: 'underline' | 'pills' | 'segments';
  className?: string;
}

const variantStyles = {
  underline: {
    container: 'border-b border-border gap-0',
    tab: (active: boolean) =>
      `h-8 px-3 text-[13px] font-medium border-b-2 transition-colors duration-[120ms] ${
        active ? 'border-accent text-accent' : 'border-transparent text-text-muted hover:text-text'
      }`,
  },
  pills: {
    container: 'gap-1',
    tab: (active: boolean) =>
      `h-8 px-3 rounded text-[13px] font-medium transition-colors duration-[120ms] ${
        active ? 'bg-accent text-white' : 'text-text-muted hover:text-text hover:bg-surface-hover'
      }`,
  },
  segments: {
    container: 'bg-surface-hover rounded p-0.5 gap-0',
    tab: (active: boolean) =>
      `h-7 px-3 rounded text-[13px] font-medium transition-colors duration-[120ms] ${
        active ? 'bg-surface-raised text-text shadow-sm' : 'text-text-muted hover:text-text'
      }`,
  },
};

/** Tab navigation: underline, pills, or segments variant. */
export function Tabs({ tabs, activeTab, onChange, variant = 'underline', className = '' }: TabsProps) {
  const s = variantStyles[variant];
  return (
    <div className={`inline-flex items-center ${s.container} ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange?.(tab.id)}
          className={`inline-flex items-center gap-1.5 ${s.tab(tab.id === activeTab)}`}
        >
          {tab.label}
          {tab.badge && (
            <span className="text-[10px] font-semibold bg-accent-muted text-accent px-1.5 py-0.5 rounded-full">{tab.badge}</span>
          )}
        </button>
      ))}
    </div>
  );
}
