"use client"

import React from 'react'
import { FileText, Image, X } from 'lucide-react'
import { css } from './theme'

interface FilePreviewProps {
  file: File
  onRemove?: () => void
}

export function FilePreview({ file, onRemove }: FilePreviewProps) {
  const isImage = file.type.startsWith('image/')
  const url = URL.createObjectURL(file)

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '4px 8px', borderRadius: 'var(--radius)',
      background: css('--muted'), border: `1px solid ${css('--border')}`,
      fontSize: 11, color: css('--foreground'),
      maxWidth: 180,
    }}>
      {isImage ? (
        <img src={url} alt={file.name} style={{ width: 28, height: 28, borderRadius: 4, objectFit: 'cover' }} />
      ) : (
        <FileText size={16} style={{ color: css('--muted-foreground'), flexShrink: 0 }} />
      )}
      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {file.name}
      </span>
      {onRemove && (
        <button onClick={onRemove} style={{ background: 'none', border: 'none', color: css('--muted-foreground'), cursor: 'pointer', padding: 0, flexShrink: 0 }}>
          <X size={12} />
        </button>
      )}
    </div>
  )
}
