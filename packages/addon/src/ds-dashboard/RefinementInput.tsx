import React, { useRef, useCallback } from 'react';
import { styled, keyframes } from '@storybook/theming';
import { Input, Btn, Muted } from '../ui';

// ── Styled components ──────────────────────────────────────────────────────────

const Row = styled.div({
  display: 'flex',
  alignItems: 'center',
  gap: 6,
});

const statusPulse = keyframes`
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
`;

const Pulse = styled.span(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  font: `600 11px ${theme.typography.fonts.base}`,
  color: theme.color.secondary,
  animation: `${statusPulse} 1s ease-in-out infinite`,
}));

const QueuedText = styled(Muted)({ fontStyle: 'italic' });

const SuccessBadge = styled.span(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  color: theme.color.positive || '#0b8a4a',
  font: `600 11px ${theme.typography.fonts.base}`,
}));

const ErrorMsg = styled.div(({ theme }) => ({
  marginTop: 4,
  color: theme.color.negative || '#c0392b',
  fontSize: 11,
  lineHeight: 1.4,
}));

// ── Component ──────────────────────────────────────────────────────────────────

export interface RefinementInputProps {
  scope: string;
  onSubmit: (text: string) => void;
  status: 'idle' | 'refining' | 'queued' | 'success' | 'error';
  /** Optional custom error text shown when status is 'error'. Defaults to a generic message. */
  errorText?: string;
}

export function RefinementInput({ scope, onSubmit, status, errorText }: RefinementInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = useCallback(() => {
    const text = inputRef.current?.value.trim();
    if (!text || status === 'refining') return;
    inputRef.current!.value = '';
    onSubmit(text);
  }, [onSubmit, status]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') handleSend();
    },
    [handleSend],
  );

  const currentValue = inputRef.current?.value ?? '';
  const canSend = currentValue.trim().length > 0 && status !== 'refining';

  return (
    <div>
      <Row>
        <Input
          ref={inputRef as React.Ref<HTMLInputElement>}
          placeholder={`Ask AI to adjust ${scope}...`}
          onKeyDown={handleKeyDown}
          disabled={status === 'refining'}
          style={{ flex: 1 }}
          aria-label={`Ask AI to adjust ${scope}`}
        />
        {status === 'refining' ? (
          <Pulse>Refining</Pulse>
        ) : status === 'queued' ? (
          <QueuedText>Queued...</QueuedText>
        ) : status === 'success' ? (
          <SuccessBadge>&#10003;</SuccessBadge>
        ) : (
          <Btn
            primary
            disabled={!canSend}
            onClick={handleSend}
            title="Send refinement request"
            style={{ flexShrink: 0 }}
          >
            Send
          </Btn>
        )}
      </Row>
      {status === 'error' && (
        <ErrorMsg>{errorText || 'Refinement failed. Try a different prompt.'}</ErrorMsg>
      )}
    </div>
  );
}
