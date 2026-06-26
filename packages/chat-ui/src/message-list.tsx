"use client"

import React from 'react'
import { css } from './theme'
import { ChatMessage, type Message, type ChatMessageProps } from './chat-message'
import { TypingIndicator } from './typing-indicator'

export interface MessageListProps {
  messages: Message[]
  showTimeStamps?: boolean
  isTyping?: boolean
  messageOptions?: Partial<ChatMessageProps> | ((message: Message) => Partial<ChatMessageProps>)
}

export function MessageList({
  messages,
  showTimeStamps = false,
  isTyping = false,
  messageOptions,
}: MessageListProps) {
  if (messages.length === 0 && !isTyping) {
    return (
      <div style={{ padding: 20, textAlign: 'center', color: css('--muted-foreground'), fontSize: 13 }}>
        Send a message to start chatting
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {messages.map((msg, i) => {
        const extra = typeof messageOptions === 'function' ? messageOptions(msg) : messageOptions
        return (
          <ChatMessage
            key={msg.id || i}
            message={msg}
            showTimeStamp={showTimeStamps}
            {...extra}
          />
        )
      })}
      {isTyping && <TypingIndicator />}
    </div>
  )
}
