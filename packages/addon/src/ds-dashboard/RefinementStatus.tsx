import React from 'react';
import { styled } from '@storybook/theming';

const Spinner = styled.div(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  font: `12px ${theme.typography.fonts.base}`,
  color: theme.color.secondary,
  padding: '4px 0',
}));

const SpinnerDot = styled.span({
  display: 'inline-block',
  width: 10,
  height: 10,
  borderRadius: '50%',
  border: '2px solid currentColor',
  borderTopColor: 'transparent',
  animation: 'spin 0.6s linear infinite',
  '@keyframes spin': {
    to: { transform: 'rotate(360deg)' },
  },
});

const ResultBox = styled.div(({ theme }) => ({
  padding: '6px 8px',
  border: `1px solid ${theme.appBorderColor}`,
  borderRadius: theme.appBorderRadius,
  background: theme.background.app,
  fontSize: 12,
  lineHeight: 1.5,
}));

const SuccessText = styled.div(({ theme }) => ({
  color: theme.color.defaultText,
}));

const ChangeMeta = styled.div(({ theme }) => ({
  color: theme.textMutedColor,
  fontSize: 11,
  marginTop: 2,
}));

const ErrorText = styled.div(({ theme }) => ({
  color: theme.color.negative || '#c0392b',
  fontWeight: 600,
}));

const RevertBtn = styled.button(({ theme }) => ({
  cursor: 'pointer',
  padding: '3px 8px',
  borderRadius: theme.appBorderRadius,
  border: `1px solid ${theme.appBorderColor}`,
  background: theme.background.app,
  color: theme.color.defaultText,
  font: `600 11px ${theme.typography.fonts.base}`,
  marginTop: 6,
}));

export interface RefinementResult {
  status: 'success' | 'error';
  summary?: string;
  filesChanged?: number;
  tokenChanges?: { added: number; modified: number; removed: number };
  snapshotId?: string;
  message?: string;
}

export interface RefinementStatusProps {
  status: 'idle' | 'refining' | 'success' | 'error';
  result?: RefinementResult | null;
  onRevert?: () => void;
  hasSnapshot?: boolean;
}

export function RefinementStatus({ status, result, onRevert, hasSnapshot }: RefinementStatusProps) {
  if (status === 'idle') return null;

  if (status === 'refining') {
    return (
      <Spinner>
        <SpinnerDot />
        Refining…
      </Spinner>
    );
  }

  if (status === 'error' && result) {
    return (
      <ResultBox>
        <ErrorText>{result.message || 'Refinement failed'}</ErrorText>
      </ResultBox>
    );
  }

  if (status === 'success' && result) {
    return (
      <ResultBox>
        <SuccessText>{result.summary || 'No changes applied'}</SuccessText>
        {result.filesChanged !== undefined && (
          <ChangeMeta>{result.filesChanged} file(s) changed</ChangeMeta>
        )}
        {result.tokenChanges && (
          <ChangeMeta>
            {result.tokenChanges.added > 0 && `${result.tokenChanges.added} token(s) added `}
            {result.tokenChanges.modified > 0 && `${result.tokenChanges.modified} modified`}
            {result.tokenChanges.removed > 0 && ` ${result.tokenChanges.removed} removed`}
          </ChangeMeta>
        )}
        {hasSnapshot !== false && onRevert && (
          <RevertBtn onClick={onRevert}>Revert last change</RevertBtn>
        )}
      </ResultBox>
    );
  }

  return null;
}
