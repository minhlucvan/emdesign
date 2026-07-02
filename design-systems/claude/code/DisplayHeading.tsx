import React from 'react';

export interface DisplayHeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {}

/** Hero display heading — singular page-greeting headline at display-xl (64px serif).
 *  Uses --font-display (Copernicus/EB Garamond), weight 400, -1.5px tracking.
 *  Matches reference: h1 at 64px/400/1.05/-1.5px, font-family:var(--font-display), color:var(--color-ink).
 *  Never use font-sans or weight 500+ for display headlines. */
export function DisplayHeading({ className = '', style, ...props }: DisplayHeadingProps) {
  return (
    <h1
      className={className}
      style={{
        fontFamily: 'var(--font-display)',
        fontSize: '64px',
        fontWeight: 400,
        lineHeight: 1.05,
        letterSpacing: '-1.5px',
        color: 'var(--color-ink)',
        margin: 0,
        ...style,
      }}
      {...props}
    />
  );
}
