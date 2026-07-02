import React from 'react';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Accessible label for the icon-only button */
  'aria-label': string;
}

/** 36x36 circular icon button used for directional controls like previous/next arrows.
 *  Matches reference: 36×36 / canvas / hairline / full radius. */
export function IconButton({ className = '', style, ...props }: IconButtonProps) {
  return (
    <button
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        background: 'var(--color-surface)',
        color: 'var(--color-ink)',
        border: '1px solid var(--color-border)',
        cursor: 'pointer',
        fontFamily: 'var(--font-sans)',
        fontSize: '14px',
        ...style,
      }}
      {...props}
    />
  );
}
