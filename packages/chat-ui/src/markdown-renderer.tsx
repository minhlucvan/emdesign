"use client"

import React from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { css } from './theme'

interface MarkdownRendererProps {
  children: string
}

export function MarkdownRenderer({ children }: MarkdownRendererProps) {
  return (
    <div style={wrapperStyle}>
      <Markdown remarkPlugins={[remarkGfm]} components={COMPONENTS}>
        {children}
      </Markdown>
    </div>
  )
}

const wrapperStyle: React.CSSProperties = {
  fontSize: 'inherit', lineHeight: 1.6,
}

const heading = (level: number): React.CSSProperties => ({
  fontWeight: 600,
  marginTop: level <= 2 ? 12 : 8,
  marginBottom: level <= 2 ? 6 : 4,
  color: 'inherit',
  fontSize: level === 1 ? 15 : level === 2 ? 14 : level === 3 ? 13 : 12,
})

const COMPONENTS: any = {
  p: ({ children, ...props }: any) => (
    <p style={{ margin: '4px 0', lineHeight: 1.6, whiteSpace: 'pre-wrap', color: 'inherit' }} {...props}>{children}</p>
  ),
  ul: ({ children, ...props }: any) => (
    <ul style={{ margin: '4px 0', paddingLeft: 16, listStyle: 'disc', color: 'inherit' }} {...props}>{children}</ul>
  ),
  ol: ({ children, ...props }: any) => (
    <ol style={{ margin: '4px 0', paddingLeft: 16, listStyle: 'decimal', color: 'inherit' }} {...props}>{children}</ol>
  ),
  li: ({ children, ...props }: any) => <li style={{ margin: '2px 0' }} {...props}>{children}</li>,
  h1: ({ children, ...props }: any) => <h1 style={heading(1)} {...props}>{children}</h1>,
  h2: ({ children, ...props }: any) => <h2 style={heading(2)} {...props}>{children}</h2>,
  h3: ({ children, ...props }: any) => <h3 style={heading(3)} {...props}>{children}</h3>,
  h4: ({ children, ...props }: any) => <h4 style={heading(4)} {...props}>{children}</h4>,
  strong: ({ children, ...props }: any) => <strong style={{ fontWeight: 700 }} {...props}>{children}</strong>,
  em: ({ children, ...props }: any) => <em style={{ fontStyle: 'italic' }} {...props}>{children}</em>,
  code: ({ inline, children, className, ...props }: any) => {
    // Extract text to check if it's a single word/phrase (should be inline)
    const codeText = typeof children === 'string' ? children : '';
    const isShort = codeText.length < 60 && !codeText.includes('\n');

    if (inline || isShort) {
      return (
        <code style={{
          background: css('--muted'), padding: '1px 4px', borderRadius: 3,
          fontSize: '0.85em', fontFamily: 'monospace', color: css('--foreground'),
        }} {...props}>{children}</code>
      )
    }
    return (
      <div style={{ margin: '4px 0', borderRadius: 4, overflow: 'hidden' }}>
        <pre style={{
          background: css('--muted'), padding: '6px 8px', margin: 0,
          overflow: 'auto', fontSize: '0.85em', lineHeight: 1.4, fontFamily: 'monospace',
          color: css('--foreground'),
        }}>
          <code {...props}>{children}</code>
        </pre>
      </div>
    )
  },
  pre: ({ children }: any) => <>{children}</>,
  a: ({ href, children, ...props }: any) => (
    <a href={href} target="_blank" rel="noreferrer" style={{ color: css('--primary'), textDecoration: 'underline' }} {...props}>{children}</a>
  ),
  blockquote: ({ children, ...props }: any) => (
    <blockquote style={{
      borderLeft: `3px solid ${css('--border')}`, paddingLeft: 12, margin: '6px 0',
      color: css('--muted-foreground'),
    }} {...props}>{children}</blockquote>
  ),
  table: ({ children, ...props }: any) => (
    <div style={{ overflow: 'auto', margin: '8px 0', borderRadius: 'var(--radius)', border: `1px solid ${css('--border')}` }}>
      <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '0.9em' }} {...props}>{children}</table>
    </div>
  ),
  th: ({ children, ...props }: any) => (
    <th style={{ border: `1px solid ${css('--border')}`, padding: '6px 10px', textAlign: 'left', fontWeight: 600, background: css('--muted') }} {...props}>{children}</th>
  ),
  td: ({ children, ...props }: any) => (
    <td style={{ border: `1px solid ${css('--border')}`, padding: '6px 10px' }} {...props}>{children}</td>
  ),
  hr: (props: any) => <hr style={{ border: 'none', borderTop: `1px solid ${css('--border')}`, margin: '8px 0' }} {...props} />,
}
