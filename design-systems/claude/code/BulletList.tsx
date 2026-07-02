import React from 'react';

export interface BulletListProps extends React.HTMLAttributes<HTMLUListElement> {
  /** Short string items to render as <li> elements. When provided, children are ignored. */
  items?: string[];
}

/** Unordered list for semantic rules, feature lists, and bullet-point content.
 *
 * Visual spec:
 * - font-size 14px (body-sm)
 * - color: text-text (body)
 * - padding-left: 20px
 * - each <li>: margin-bottom 8px
 *
 * Used in sections like Touch Targets and Collapsing Strategy. */
export function BulletList({ items, className = '', children, ...props }: BulletListProps) {
  return (
    <ul
      className={`text-sm text-text font-[var(--font-sans)] pl-5 ${className}`}
      {...props}
    >
      {items
        ? items.map((item, i) => (
            <li key={i} className="mb-2 last:mb-0">
              {item}
            </li>
          ))
        : children}
    </ul>
  );
}
