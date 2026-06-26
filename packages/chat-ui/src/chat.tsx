"use client"

import React, { forwardRef, useRef, useState, useCallback } from 'react'
import { css } from './theme'
import { useAutoScroll } from './hooks/use-auto-scroll'
import { MessageList, type MessageListProps } from './message-list'
import { MessageInput, type MessageInputProps } from './message-input'
import type { Message } from './chat-message'

// ── ChatContainer ──────────────────────────────────────────────────

export const ChatContainer = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ style, ...props }, ref) => (
    <div
      ref={ref}
      style={{
        display: 'grid',
        gridTemplateRows: '1fr auto',
        maxHeight: '100%',
        height: '100%',
        overflow: 'hidden',
        ...style,
      }}
      {...props}
    />
  )
)
ChatContainer.displayName = 'ChatContainer'

// ── ChatMessages ───────────────────────────────────────────────────

export function ChatMessages({
  messages,
  children,
}: React.PropsWithChildren<{ messages: Message[] }>) {
  const { containerRef, scrollToBottom, handleScroll, shouldAutoScroll, handleTouchStart } =
    useAutoScroll([messages])

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      onTouchStart={handleTouchStart}
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        overflowY: 'auto',
        paddingBottom: 8,
      }}
    >
      <div style={{ gridColumn: '1/1', gridRow: '1/1', maxWidth: '100%' }}>
        {children}
      </div>
      {!shouldAutoScroll && (
        <div style={{ pointerEvents: 'none', display: 'flex', flex: 1, alignItems: 'flex-end', justifyContent: 'flex-end', gridColumn: '1/1', gridRow: '1/1' }}>
          <div style={{ position: 'sticky', bottom: 0, left: 0, display: 'flex', width: '100%', justifyContent: 'flex-end' }}>
            <button
              onClick={scrollToBottom}
              style={{
                pointerEvents: 'auto',
                width: 28, height: 28, borderRadius: '50%',
                border: `1px solid ${css('--border')}`,
                background: css('--muted'),
                color: css('--foreground'),
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14,
              }}
            >
              ↓
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── ChatForm ───────────────────────────────────────────────────────

interface ChatFormProps {
  isPending: boolean
  handleSubmit: () => void
  children: React.ReactNode
}

export const ChatForm = forwardRef<HTMLFormElement, ChatFormProps>(
  ({ children, handleSubmit, isPending, ...props }, ref) => {
    const onSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      if (!isPending) handleSubmit()
    }
    return (
      <form ref={ref} onSubmit={onSubmit} style={{ marginTop: 'auto' }} {...props}>
        {children}
      </form>
    )
  }
)
ChatForm.displayName = 'ChatForm'

// ── Chat (prebuilt composite) ──────────────────────────────────────

export interface ChatProps {
  messages: Message[]
  input: string
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  handleSubmit: () => void
  isGenerating: boolean
  stop?: () => void
  placeholder?: string
}

export function Chat({
  messages,
  input,
  handleInputChange,
  handleSubmit,
  isGenerating,
  stop,
  placeholder,
}: ChatProps) {
  return (
    <ChatContainer>
      <ChatMessages messages={messages}>
        <MessageList messages={messages} />
      </ChatMessages>
      <ChatForm isPending={isGenerating} handleSubmit={handleSubmit}>
        <MessageInput
          value={input}
          onChange={handleInputChange}
          onSubmit={handleSubmit}
          isGenerating={isGenerating}
          stop={stop}
          placeholder={placeholder}
        />
      </ChatForm>
    </ChatContainer>
  )
}
