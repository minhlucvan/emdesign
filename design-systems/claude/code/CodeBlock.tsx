import React from 'react';

export interface CodeBlockProps extends React.HTMLAttributes<HTMLDivElement> {}

/** Dark terminal-style code block with macOS traffic-light dots and a <pre> block.
 *  Used in hero-art / product-mockup cards. Pass syntax-highlighted code as children. */
export function CodeBlock({ style, children, ...props }: CodeBlockProps) {
  return (
    <div
      style={{
        background: 'var(--color-surface-dark)',
        borderRadius: 'var(--radius-xl, 16px)',
        padding: '24px',
        ...style,
      }}
      {...props}
    >
      {/* macOS traffic-light terminal bar */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }} aria-hidden="true">
        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f57', display: 'inline-block' }} />
        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffbd2e', display: 'inline-block' }} />
        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#28c840', display: 'inline-block' }} />
      </div>
      <pre
        style={{
          background: 'var(--color-surface-dark-soft)',
          borderRadius: 'var(--radius-md, 8px)',
          padding: '16px',
          fontFamily: 'var(--font-mono)',
          fontSize: '13px',
          color: 'var(--color-on-dark)',
          lineHeight: 1.7,
          overflowX: 'auto',
          margin: 0,
        }}
      >
        {children}
      </pre>
    </div>
  );
}
