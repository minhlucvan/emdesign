"use client"

import React, { useState, useCallback } from 'react'
import { Check, Loader2, X, Clock } from 'lucide-react'
import { css } from './theme'

// ── Types ──────────────────────────────────────────────────────────────────

export interface QuestionOption {
  label: string
  description: string
  preview?: string
}

export interface Question {
  /** Full question text displayed to the user */
  question: string
  /** Short chip label (max 12 chars) */
  header?: string
  /** 2–4 answer options */
  options: QuestionOption[]
  /** true = checkboxes (multi-select), false = radio buttons (single-select) */
  multiSelect?: boolean
}

export interface QuestionCardProps {
  /** 1–4 questions to display */
  questions: Question[]
  /** Called when user clicks Submit — passes { "question text": "selected label" | ["label1","label2"] } */
  onSubmit: (answers: Record<string, string | string[]>) => void
  /** Called when user clicks Cancel */
  onCancel?: () => void
  /** Visual state */
  state?: 'interactive' | 'pending' | 'answered' | 'expired'
  /** Pre-filled answers (for answered state playback) */
  answers?: Record<string, string | string[]>
  /** Timeout duration in seconds (shown in expired state) */
  timeoutSeconds?: number
}

// ── Helpers ────────────────────────────────────────────────────────────────

function isAllAnswered(questions: Question[], selections: Record<string, string | string[]>): boolean {
  return questions.every(q => {
    const val = selections[q.question]
    if (!val) return false
    if (Array.isArray(val)) return val.length > 0
    return val.length > 0
  })
}

// ── Component ──────────────────────────────────────────────────────────────

export function QuestionCard({
  questions,
  onSubmit,
  onCancel,
  state: propState = 'interactive',
  answers: propAnswers,
  timeoutSeconds = 120,
}: QuestionCardProps) {
  const [selections, setSelections] = useState<Record<string, string | string[]>>({})
  const [submitted, setSubmitted] = useState(false)

  // Resolve effective state: parent drives via propState, but we auto-transition
  // to 'pending' the moment submit is clicked (before parent can respond)
  const effectiveState = propState === 'answered' || propState === 'expired'
    ? propState
    : submitted
      ? 'pending'
      : propState

  const handleSelect = useCallback((questionText: string, optionLabel: string, multiSelect: boolean) => {
    if (effectiveState !== 'interactive') return
    setSelections(prev => {
      if (multiSelect) {
        const current = (prev[questionText] as string[]) || []
        const exists = current.includes(optionLabel)
        return {
          ...prev,
          [questionText]: exists
            ? current.filter(l => l !== optionLabel)
            : [...current, optionLabel],
        }
      } else {
        return { ...prev, [questionText]: optionLabel }
      }
    })
  }, [effectiveState])

  const handleSubmit = useCallback(() => {
    if (!isAllAnswered(questions, selections)) return
    setSubmitted(true)
    onSubmit(selections)
  }, [questions, selections, onSubmit])

  const handleCancel = useCallback(() => {
    setSubmitted(false)
    onCancel?.()
  }, [onCancel])

  // Build display answers: use propAnswers for answered state, selections for interactive
  const displayAnswers = propAnswers || selections

  return (
    <div style={{
      margin: '8px 0',
      borderRadius: 'var(--radius)',
      border: `1px solid ${css('--border')}`,
      background: css('--muted'),
      overflow: 'hidden',
      opacity: effectiveState === 'expired' ? 0.5 : 1,
      transition: 'opacity 0.3s',
    }}>
      {/* Header */}
      <div style={{
        padding: '8px 10px',
        borderBottom: effectiveState === 'interactive' || effectiveState === 'pending' ? `1px solid ${css('--border')}` : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {effectiveState === 'answered' && (
            <Check size={14} color={css('--primary')} />
          )}
          {effectiveState === 'expired' && (
            <Clock size={14} color={css('--muted-foreground')} />
          )}
          <span style={{ fontSize: 12, fontWeight: 600, color: css('--foreground') }}>
            {effectiveState === 'answered' && 'Answered'}
            {effectiveState === 'expired' && `Question expired`}
            {effectiveState === 'pending' && 'Submitting...'}
            {effectiveState === 'interactive' && 'AI needs your input'}
          </span>
        </div>
        {effectiveState === 'expired' && (
          <span style={{ fontSize: 10, color: css('--muted-foreground') }}>
            ⏱ {timeoutSeconds}s timeout
          </span>
        )}
      </div>

      {/* Questions */}
      <div style={{ padding: '6px 10px 8px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {questions.map((q, qi) => {
          const selectedValue = displayAnswers[q.question]
          const isAnswered = !!selectedValue && (Array.isArray(selectedValue) ? selectedValue.length > 0 : true)

          return (
            <div key={qi}>
              {/* Question header + text */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                {q.header && (
                  <span style={{
                    fontSize: 9,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    padding: '1px 5px',
                    borderRadius: 3,
                    background: css('--background'),
                    color: css('--muted-foreground'),
                  }}>
                    {q.header}
                  </span>
                )}
                <span style={{ fontSize: 12, color: css('--foreground'), lineHeight: 1.4 }}>
                  {q.question}
                </span>
                {!isAnswered && effectiveState === 'interactive' && (
                  <span style={{ fontSize: 9, color: css('--destructive'), marginLeft: 'auto' }}>
                    Required
                  </span>
                )}
              </div>

              {/* Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {q.options.map((opt, oi) => {
                  const isSelected = Array.isArray(selectedValue)
                    ? selectedValue.includes(opt.label)
                    : selectedValue === opt.label

                  return (
                    <button
                      key={oi}
                      onClick={() => handleSelect(q.question, opt.label, !!q.multiSelect)}
                      disabled={effectiveState !== 'interactive'}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 8,
                        padding: '6px 8px',
                        borderRadius: 4,
                        border: `1px solid ${isSelected ? css('--primary') : css('--border')}`,
                        background: isSelected ? 'hsla(var(--primary) / 0.08)' : css('--background'),
                        cursor: effectiveState === 'interactive' ? 'pointer' : 'default',
                        textAlign: 'left',
                        width: '100%',
                        transition: 'border-color 0.15s, background 0.15s',
                        opacity: effectiveState === 'interactive' ? 1 : 0.7,
                      }}
                    >
                      {/* Radio / Checkbox indicator */}
                      <span style={{
                        flexShrink: 0,
                        width: 16,
                        height: 16,
                        borderRadius: q.multiSelect ? 3 : 8,
                        border: `1.5px solid ${isSelected ? css('--primary') : css('--muted-foreground')}`,
                        background: isSelected ? css('--primary') : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: 1,
                        transition: 'all 0.15s',
                      }}>
                        {isSelected && (
                          q.multiSelect
                            ? <Check size={10} color={css('--primary-foreground')} strokeWidth={3} />
                            : <div style={{ width: 6, height: 6, borderRadius: 3, background: css('--primary-foreground') }} />
                        )}
                      </span>

                      {/* Label + Description */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 12,
                          fontWeight: 500,
                          color: css('--foreground'),
                          lineHeight: 1.3,
                        }}>
                          {opt.label}
                        </div>
                        <div style={{
                          fontSize: 10,
                          color: css('--muted-foreground'),
                          lineHeight: 1.4,
                          marginTop: 1,
                        }}>
                          {opt.description}
                        </div>
                        {opt.preview && (
                          <div style={{
                            marginTop: 4,
                            padding: 4,
                            borderRadius: 3,
                            background: css('--muted'),
                            fontSize: 10,
                            color: css('--muted-foreground'),
                            overflow: 'hidden',
                          }} dangerouslySetInnerHTML={{ __html: opt.preview }} />
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer actions */}
      {(effectiveState === 'interactive' || effectiveState === 'pending') && (
        <div style={{
          padding: '6px 10px 8px',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 6,
          borderTop: `1px solid ${css('--border')}`,
        }}>
          {onCancel && (
            <button
              onClick={handleCancel}
              disabled={effectiveState === 'pending'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '5px 10px',
                borderRadius: 4,
                border: `1px solid ${css('--border')}`,
                background: 'transparent',
                color: css('--muted-foreground'),
                cursor: effectiveState === 'interactive' ? 'pointer' : 'default',
                fontSize: 11,
                opacity: effectiveState === 'pending' ? 0.5 : 1,
              }}
            >
              <X size={12} />
              Cancel
            </button>
          )}
          <button
            onClick={handleSubmit}
            disabled={!isAllAnswered(questions, selections) || effectiveState === 'pending'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '5px 12px',
              borderRadius: 4,
              border: 'none',
              background: css('--primary'),
              color: css('--primary-foreground'),
              cursor: isAllAnswered(questions, selections) && effectiveState !== 'pending' ? 'pointer' : 'default',
              fontSize: 11,
              fontWeight: 500,
              opacity: isAllAnswered(questions, selections) && effectiveState !== 'pending' ? 1 : 0.5,
              transition: 'opacity 0.15s',
            }}
          >
            {effectiveState === 'pending' ? (
              <>
                <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
                Submitting...
              </>
            ) : (
              <>
                <Check size={12} />
                Submit
              </>
            )}
          </button>
        </div>
      )}

      {/* Answered summary */}
      {effectiveState === 'answered' && (
        <div style={{
          padding: '6px 10px 8px',
          borderTop: `1px solid ${css('--border')}`,
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}>
          {questions.map((q, qi) => {
            const val = displayAnswers[q.question]
            const displayVal = Array.isArray(val) ? val.join(', ') : val
            return (
              <div key={qi} style={{ fontSize: 10, color: css('--muted-foreground'), lineHeight: 1.4 }}>
                <span style={{ fontWeight: 500 }}>{q.question}</span>
                <span style={{ marginLeft: 4 }}>{displayVal}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
