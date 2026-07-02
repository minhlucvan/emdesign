import React from 'react';

export interface CalloutCardProps extends React.HTMLAttributes<HTMLDivElement> {}

/** Coral callout card for high-voltage CTAs — accent background, white text, rounded-lg.
 *  Compose Heading (serif display), Body, and Button (!bg-surface !text-text) inside.
 *  Never use coral-on-coral children; the CTA must be cream/canvas surface. */
export function CalloutCard({ className = '', ...props }: CalloutCardProps) {
  return (
    <div
      className={`bg-accent text-white rounded-lg p-12 ${className}`}
      {...props}
    />
  );
}
