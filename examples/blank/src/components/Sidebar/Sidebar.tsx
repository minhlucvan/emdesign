/**
 * Sidebar — captured by emdesign.
 * Reusable, design-system-bound component. Edit freely; re-capture to update.
 */
import React from 'react';

interface NavItem {
  label: string;
  icon: string;
  active?: boolean;
  badge?: string;
  href?: string;
}

export interface SidebarProps {
  items?: NavItem[];
  userName?: string;
  userEmail?: string;
}

const defaultItems: NavItem[] = [
  { label: 'Overview', icon: '▦', active: true },
  { label: 'Analytics', icon: '◈', badge: '12' },
  { label: 'Transactions', icon: '⇄' },
  { label: 'Customers', icon: '●' },
  { label: 'Products', icon: '♦' },
  { label: 'Settings', icon: '⚙' },
];

/** Dashboard sidebar: dark background, navigation links, user section at bottom. */
export function Sidebar({ items = defaultItems, userName = 'John Doe', userEmail = 'john@acme.com' }: SidebarProps) {
  return (
    <aside className="w-[240px] h-screen bg-surface-dark flex flex-col shrink-0">
      {/* Logo / Brand */}
      <div className="h-14 flex items-center px-5 border-b border-white/10">
        <span className="text-text-inverse text-[15px] font-semibold">Acme Dashboard</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {items.map((item) => (
          <a
            key={item.label}
            href={item.href ?? '#'}
            className={
              'flex items-center gap-3 h-8 px-2 rounded text-sm transition-[background-color] duration-[120ms] ' +
              (item.active
                ? 'bg-accent/15 text-accent font-medium'
                : 'text-text-muted hover:bg-white/5 hover:text-text-inverse')
            }
          >
            <span className="text-[16px] w-5 text-center shrink-0">{item.icon}</span>
            <span className="flex-1 truncate">{item.label}</span>
            {item.badge && (
              <span className="text-[11px] font-semibold bg-accent/20 text-accent px-1.5 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
          </a>
        ))}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs font-semibold">
            {userName.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-text-inverse text-[13px] font-medium truncate">{userName}</p>
            <p className="text-text-muted text-[11px] truncate">{userEmail}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
