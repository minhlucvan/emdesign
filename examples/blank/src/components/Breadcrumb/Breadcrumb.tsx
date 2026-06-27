/**
 * Breadcrumb — captured by emdesign.
 * Reusable, design-system-bound component. Edit freely; re-capture to update.
 */
import React from 'react';

interface Crumb { label: string; href?: string; }

export interface BreadcrumbProps {
  items: Crumb[];
  maxItems?: number;
  separator?: string;
  className?: string;
}

/** Breadcrumb navigation with collapse support. */
export function Breadcrumb({ items, maxItems = 0, separator = '/', className = '' }: BreadcrumbProps) {
  const visible = maxItems > 0 && items.length > maxItems
    ? [items[0], { label: '...' }, ...items.slice(items.length - (maxItems - 2))]
    : items;

  return (
    <nav className={`flex items-center gap-1.5 text-[13px] ${className}`} aria-label="Breadcrumb">
      {visible.map((item, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className="text-text-muted">{separator}</span>}
          {item.href ? (
            <a href={item.href} className="text-text-muted hover:text-text transition-colors duration-[120ms]">{item.label}</a>
          ) : (
            <span className={i === visible.length - 1 ? 'text-text font-medium' : 'text-text-muted'}>{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
