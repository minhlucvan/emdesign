/**
 * PromptSuggestions — clickable suggestion chips above the chat input.
 *
 * Adapted from shadcn-chatbot-kit's PromptSuggestions pattern.
 */
import React from 'react';
import { css } from './theme';

export interface PromptSuggestion {
  title: string;
  action: string;
}

export interface PromptSuggestionsProps {
  label: string;
  suggestions: PromptSuggestion[];
  append: (action: string) => void;
}

export function PromptSuggestions({ label, suggestions, append }: PromptSuggestionsProps) {
  if (!suggestions.length) return null;

  return (
    <div style={{ marginBottom: 8 }}>
      {label && (
        <div style={{
          fontSize: 10, color: css('--muted-foreground'), marginBottom: 6,
          letterSpacing: '0.03em', textTransform: 'uppercase', opacity: 0.6,
        }}>
          {label}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {suggestions.map((s, i) => (
          <button key={i} onClick={() => append(s.action)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, width: '100%',
              padding: '8px 10px', borderRadius: 'var(--radius)',
              border: `1px solid ${css('--border')}`,
              background: css('--muted'), color: css('--foreground'),
              cursor: 'pointer', fontSize: 11, lineHeight: 1.4,
              textAlign: 'left', transition: 'all 0.12s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = css('--primary'); }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = css('--border'); }}>
            <span style={{ flexShrink: 0, fontSize: 13, lineHeight: 1, opacity: 0.6 }}>→</span>
            <span>{s.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
