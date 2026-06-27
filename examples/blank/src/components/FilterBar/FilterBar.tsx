/**
 * FilterBar — captured by emdesign.
 * Reusable, design-system-bound component. Edit freely; re-capture to update.
 */
import React from 'react';

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterBarProps {
  onFilter?: (filters: Record<string, string>) => void;
}

/** Dashboard filter bar: horizontal stack of search, select, and action controls. */
export function FilterBar({ onFilter }: FilterBarProps) {
  return (
    <div className="bg-surface-raised border border-border rounded p-3 flex items-center gap-2 flex-wrap">
      {/* Search */}
      <input
        type="text"
        placeholder="Search..."
        onChange={() => {}}
        className="h-8 px-3 rounded text-sm bg-surface border border-border text-text placeholder:text-text-muted focus:outline-none focus:border-accent focus:shadow-[var(--focus-ring)] w-48 transition-[border-color,box-shadow] duration-[120ms]"
      />

      {/* Status filter */}
      <select className="h-8 px-3 rounded text-sm bg-surface border border-border text-text focus:outline-none focus:border-accent cursor-pointer">
        <option value="">All Status</option>
        <option value="active">Active</option>
        <option value="pending">Pending</option>
        <option value="completed">Completed</option>
      </select>

      {/* Date filter */}
      <select className="h-8 px-3 rounded text-sm bg-surface border border-border text-text focus:outline-none focus:border-accent cursor-pointer">
        <option value="">All Time</option>
        <option value="today">Today</option>
        <option value="week">This Week</option>
        <option value="month">This Month</option>
        <option value="quarter">This Quarter</option>
      </select>

      {/* Apply button */}
      <button
        onClick={() => onFilter?.({})}
        className="h-8 px-4 rounded text-sm font-medium bg-accent text-white hover:bg-accent-hover transition-[background-color] duration-[120ms]"
      >
        Apply
      </button>

      {/* Reset */}
      <button className="h-8 px-3 rounded text-sm text-text-muted hover:text-text hover:bg-surface-hover transition-[background-color] duration-[120ms]">
        Reset
      </button>
    </div>
  );
}
