"use client"

import React, { useState } from 'react'
import { ChevronRight, ChevronDown, Loader2, Terminal, FileText, Search, Code2 } from 'lucide-react'
import { css } from './theme'
import { MarkdownRenderer } from './markdown-renderer'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt?: Date
  reasoning?: string
  toolCalls?: ToolInvocation[]
}

export interface ToolInvocation {
  state: 'call' | 'result' | 'partial-call'
  toolName: string
  result?: any
}

export interface ChatMessageProps {
  message: Message
  showTimeStamp?: boolean
}

export function ChatMessage({ message, showTimeStamp = false }: ChatMessageProps) {
  const { role, content, createdAt, reasoning, toolCalls } = message
  const isUser = role === 'user'

  const formattedTime = createdAt?.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit',
  })

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: isUser ? 'flex-end' : 'flex-start',
      marginBottom: 4,
    }}>
      {content && (
        <div style={{
          padding: '8px 12px',
          borderRadius: 'var(--radius)',
          maxWidth: '100%',
          wordBreak: 'break-word',
          fontSize: 13,
          lineHeight: 1.6,
          background: isUser ? css('--primary') : css('--muted'),
          color: isUser ? css('--primary-foreground') : css('--foreground'),
        }}>
          {isUser ? (
            <div style={{ whiteSpace: 'pre-wrap' }}>{content}</div>
          ) : (
            <MarkdownRenderer>{content}</MarkdownRenderer>
          )}
        </div>
      )}

      {reasoning && <ReasoningBlock text={reasoning} />}
      {toolCalls && toolCalls.length > 0 && <ToolCallBlock invocations={toolCalls} />}

      {showTimeStamp && createdAt && (
        <time dateTime={createdAt.toISOString()} style={{ display: 'block', marginTop: 2, padding: '0 4px', fontSize: 10, color: css('--muted-foreground'), opacity: 0.5 }}>
          {formattedTime}
        </time>
      )}
    </div>
  )
}

function ReasoningBlock({ text }: { text: string }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div style={{ width: '100%', marginBottom: 8, borderRadius: 'var(--radius)', border: `1px solid ${css('--border')}`, overflow: 'hidden' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px', width: '100%', border: 'none', background: css('--muted'), color: css('--muted-foreground'), cursor: 'pointer', fontSize: 11, textAlign: 'left' }}
      >
        <ChevronRight size={14} style={{ transition: 'transform 0.2s', transform: isOpen ? 'rotate(90deg)' : 'none' }} />
        <span>Thinking</span>
      </button>
      {isOpen && (
        <div style={{ padding: '4px 8px', fontSize: 10, color: css('--muted-foreground'), whiteSpace: 'pre-wrap', borderTop: `1px solid ${css('--border')}` }}>
          {text}
        </div>
      )}
    </div>
  )
}

function ToolCallBlock({ invocations }: { invocations: ToolInvocation[] }) {
  const [expanded, setExpanded] = useState(false)
  if (!invocations?.length) return null

  return (
    <div style={{ marginTop: 4 }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex', alignItems: 'center', gap: 4,
          padding: '2px 6px',
          borderRadius: 4, border: `1px solid ${css('--border')}`,
          background: css('--muted'), color: css('--muted-foreground'),
          cursor: 'pointer', fontSize: 10, textAlign: 'left',
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{ fontSize: 10 }}>▶▶</span>
        <span>{invocations.length} tool{invocations.length > 1 ? 's' : ''}</span>
        {expanded ? <ChevronDown size={8} /> : <ChevronRight size={8} />}
      </button>
      {expanded && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 2 }}>
          {invocations.map((inv, i) => (
            <ToolCallRow key={i} invocation={inv} />
          ))}
        </div>
      )}
    </div>
  )
}

function toolLabel(inv: ToolInvocation): string {
  const input = inv.result
  if (inv.toolName === 'bash' && input?.command) return `$ ${input.command}`
  if ((inv.toolName === 'read' || inv.toolName === 'write' || inv.toolName === 'edit') && input?.file_path) return `${inv.toolName} ${input.file_path}`
  if (inv.toolName === 'grep' && input?.pattern) return `grep ${input.pattern}`
  if (inv.toolName === 'glob' && input?.pattern) return `glob ${input.pattern}`
  if (input?.description) return input.description
  return inv.toolName
}

function toolIcon(toolName: string) {
  switch (toolName) {
    case 'bash': return <Terminal size={12} />
    case 'read':
    case 'write':
    case 'edit': return <FileText size={12} />
    case 'grep':
    case 'glob':
    case 'search': return <Search size={12} />
    default: return <Code2 size={12} />
  }
}

function ToolCallRow({ invocation }: { invocation: ToolInvocation }) {
  const [expanded, setExpanded] = useState(false)
  // If state is 'call' but we already have result data (from tool_result matching), show as result
  const effectiveState = (invocation.state === 'call' && invocation.result?.output) ? 'result' : invocation.state
  const isRunning = effectiveState === 'call' || effectiveState === 'partial-call'
  const resultText = invocation.result?.output || (invocation.result ? JSON.stringify(invocation.result, null, 2) : '')

  return (
    <div style={{
      borderRadius: 4,
      border: `1px solid ${css('--border')}`,
      background: css('--muted'),
      overflow: 'hidden',
    }}>
      <button
        onClick={() => effectiveState === 'result' && setExpanded(!expanded)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '3px 6px', width: '100%',
          border: 'none', background: 'transparent',
          color: css('--muted-foreground'), cursor: effectiveState === 'result' ? 'pointer' : 'default',
          fontSize: 10, textAlign: 'left',
        }}
      >
        {toolIcon(invocation.toolName)}
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'monospace' }}>
          {toolLabel(invocation)}
        </span>
        {isRunning && <Loader2 size={10} style={{ animation: 'spin 1s linear infinite' }} />}
        {effectiveState === 'result' && !isRunning && (
          expanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />
        )}
      </button>
      {expanded && effectiveState === 'result' && resultText && (
        <div style={{
          padding: '6px 8px', borderTop: `1px solid ${css('--border')}`,
          fontSize: 11, lineHeight: 1.5, color: css('--foreground'),
          maxHeight: 300, overflow: 'auto', background: css('--background'),
        }}>
          <MarkdownRenderer>{resultText}</MarkdownRenderer>
        </div>
      )}
    </div>
  )
}
