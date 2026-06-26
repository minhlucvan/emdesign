"use client"

import React, { useRef, useEffect, useState } from 'react'
import { ArrowUp, Square, Paperclip, X } from 'lucide-react'
import { css } from './theme'

export interface MessageInputProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onSubmit: () => void
  isGenerating: boolean
  stop?: () => void
  placeholder?: string
  allowAttachments?: boolean
  files?: File[] | null
  setFiles?: React.Dispatch<React.SetStateAction<File[] | null>>
}

export function MessageInput({
  value,
  onChange,
  onSubmit,
  isGenerating,
  stop,
  placeholder = 'Ask AI...',
  allowAttachments,
  files,
  setFiles,
  ...props
}: MessageInputProps) {
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const [showFileList, setShowFileList] = useState(false)

  // Auto-resize
  useEffect(() => {
    const el = textAreaRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = Math.min(el.scrollHeight, 120) + 'px'
    }
  }, [value, showFileList])

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!isGenerating && value.trim()) {
        e.currentTarget.form?.requestSubmit()
      } else if (isGenerating && stop) {
        stop()
      }
    }
  }

  const addFiles = (newFiles: File[] | null) => {
    if (!allowAttachments || !setFiles) return
    setFiles((current: File[] | null) => {
      if (!current) return newFiles
      if (!newFiles) return current
      return [...current, ...newFiles]
    })
  }

  const removeFile = (file: File) => {
    if (!allowAttachments || !setFiles || !files) return
    const filtered = files.filter(f => f !== file)
    setFiles(filtered.length > 0 ? filtered : null)
  }

  return (
    <div style={{ position: 'relative', display: 'flex', width: '100%' }}>
      <div style={{ position: 'relative', display: 'flex', width: '100%', alignItems: 'center', gap: 8 }}>
        <textarea
          ref={textAreaRef}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          rows={1}
          style={{
            flex: 1,
            resize: 'none',
            padding: '10px 12px',
            paddingRight: 80,
            borderRadius: 'var(--radius)',
            border: `1px solid ${css('--input')}`,
            background: css('--background'),
            color: css('--foreground'),
            fontSize: 13,
            lineHeight: 1.5,
            fontFamily: 'inherit',
            outline: 'none',
            transition: 'border-color 0.15s',
            maxHeight: 120,
            overflow: 'auto',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = css('--primary') }}
          onBlur={(e) => { e.currentTarget.style.borderColor = css('--input') }}
        />

        {/* Button bar — positioned at top-right like the kit */}
        <div style={{
          position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
          display: 'flex', gap: 4, zIndex: 10,
        }}>
          {allowAttachments && (
            <button
              type="button"
              onClick={() => {
                const input = document.createElement('input')
                input.type = 'file'
                input.multiple = true
                input.onchange = () => {
                  if (input.files) addFiles(Array.from(input.files))
                }
                input.click()
              }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 28, height: 28, borderRadius: 'var(--radius)',
                border: `1px solid ${css('--border')}`,
                background: 'transparent', color: css('--muted-foreground'),
                cursor: 'pointer',
              }}
            >
              <Paperclip size={14} />
            </button>
          )}
          {isGenerating && stop ? (
            <button
              type="button"
              onClick={stop}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 28, height: 28, borderRadius: 'var(--radius)',
                border: 'none',
                background: css('--primary'), color: css('--primary-foreground'),
                cursor: 'pointer',
              }}
            >
              <Square size={14} fill="currentColor" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!value.trim()}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 28, height: 28, borderRadius: 'var(--radius)',
                border: 'none',
                background: value.trim() ? css('--primary') : css('--muted'),
                color: value.trim() ? css('--primary-foreground') : css('--muted-foreground'),
                cursor: value.trim() ? 'pointer' : 'default',
                opacity: value.trim() ? 1 : 0.5,
              }}
            >
              <ArrowUp size={16} />
            </button>
          )}
        </div>
      </div>

      {/* File previews */}
      {allowAttachments && files && files.length > 0 && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex', gap: 8, padding: '4px 8px', overflowX: 'auto' }}>
          {files.map((file) => (
            <div key={file.name + file.lastModified} style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '2px 6px', borderRadius: 'var(--radius)',
              background: css('--muted'), fontSize: 10,
              color: css('--foreground'), whiteSpace: 'nowrap',
            }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 80 }}>{file.name}</span>
              <button onClick={() => removeFile(file)} style={{ background: 'none', border: 'none', color: css('--muted-foreground'), cursor: 'pointer', padding: 0 }}>
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
