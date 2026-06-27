/**
 * Header — captured by emdesign.
 * Reusable, design-system-bound component. Edit freely; re-capture to update.
 */
import React from 'react';

export interface HeaderProps {
  title?: string;
  onSearch?: (query: string) => void;
}

/** Dashboard header: title, search, notifications, user menu. Fixed at top. */
export function Header({ title = 'Overview', onSearch }: HeaderProps) {
  return (
    <header className="h-14 bg-surface-raised border-b border-border flex items-center justify-between px-6 shrink-0">
      {/* Left: Page title */}
      <h1 className="text-[18px] font-semibold text-text">{title}</h1>

      {/* Right: Search + Actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => onSearch?.(e.target.value)}
            className="w-56 h-8 pl-8 pr-3 rounded text-sm bg-surface border border-border text-text placeholder:text-text-muted focus:outline-none focus:border-accent focus:shadow-[var(--focus-ring)] transition-[border-color,box-shadow] duration-[120ms]"
          />
        </div>

        {/* Notifications bell icon */}
        <button className="relative w-8 h-8 flex items-center justify-center rounded text-text-muted hover:text-text hover:bg-surface-hover transition-[background-color] duration-[120ms]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger" />
        </button>

        {/* Settings gear icon */}
        <button className="w-8 h-8 flex items-center justify-center rounded text-text-muted hover:text-text hover:bg-surface-hover transition-[background-color] duration-[120ms]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        </button>
      </div>
    </header>
  );
}
