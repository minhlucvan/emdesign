import React from 'react';

export interface FooterColumnProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Column heading (e.g. "VoltAgent Framework"). */
  title: string;
  /** List of link/text items under the heading. */
  items: string[];
  className?: string;
}

/** Footer link column — bold label + muted link stack on dark surface.
 *  Intended for use inside a dark footer band (.footer).
 *  Matches the .footer-col pattern from the Claude design reference. */
export function FooterColumn({ title, items, className = '', ...props }: FooterColumnProps) {
  return (
    <div className={className} {...props}>
      <h6 className="text-sm font-bold leading-[1.2] text-text mb-3.5">{title}</h6>
      {items.map((item, i) => (
        <span
          key={i}
          className="block text-sm leading-[1.35] text-text-muted opacity-[0.72] mb-2.5"
        >
          {item}
        </span>
      ))}
    </div>
  );
}
