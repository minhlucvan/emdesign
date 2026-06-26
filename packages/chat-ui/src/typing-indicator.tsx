"use client"

import React from 'react'
import { css } from './theme'

// Inject typing animation keyframes once
if (typeof document !== 'undefined' && !document.getElementById('emdesign-typing-style')) {
  const style = document.createElement('style');
  style.id = 'emdesign-typing-style';
  style.textContent = `
    @keyframes typing-dot-bounce {
      0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
      30% { transform: translateY(-4px); opacity: 1; }
    }
    .emdesign-typing-dot {
      width: 6px; height: 6px;
      border-radius: 50%;
      background: ${css('--muted-foreground')};
      animation: typing-dot-bounce 1.25s ease-in-out infinite;
    }
  `;
  document.head.appendChild(style);
}

export function TypingIndicator() {
  return (
    <div style={{ display: 'flex', padding: '4px 8px' }}>
      <div style={{
        padding: '8px 12px',
        borderRadius: 'var(--radius)',
        background: css('--muted'),
        display: 'flex',
        alignItems: 'center',
        gap: 3,
      }}>
        <div className="emdesign-typing-dot" style={{ animationDelay: '0ms' }} />
        <div className="emdesign-typing-dot" style={{ animationDelay: '160ms' }} />
        <div className="emdesign-typing-dot" style={{ animationDelay: '320ms' }} />
      </div>
    </div>
  )
}
