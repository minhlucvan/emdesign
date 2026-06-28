import React, { useState } from 'react';
import { styled } from '@storybook/theming';
import { SectionCard } from './SectionCard';
import type { DesignSystemFull, RefinementScope } from '../constants';

const FontGrid = styled.div({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
  gap: 8,
});

const FontCard = styled.div(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  padding: '8px 10px',
  border: `1px solid ${theme.appBorderColor}`,
  borderRadius: theme.appBorderRadius,
  cursor: 'pointer',
}));

const FontRole = styled.div(({ theme }) => ({
  font: `600 10px ${theme.typography.fonts.mono}`,
  color: theme.textMutedColor,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
}));

const FontValue = styled.div<{ family: string }>(({ family }) => ({
  fontFamily: family,
  fontSize: 16,
  lineHeight: 1.4,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}));

const PreviewText = styled.div<{ family: string }>(({ family, theme }) => ({
  fontFamily: family,
  fontSize: 12,
  lineHeight: 1.5,
  color: theme.textMutedColor,
  fontStyle: 'italic',
}));

const FontInput = styled.input(({ theme }) => ({
  width: '100%',
  boxSizing: 'border-box',
  padding: '2px 4px',
  border: `1px solid ${theme.color.secondary}`,
  borderRadius: theme.appBorderRadius,
  font: `11px ${theme.typography.fonts.mono}`,
  background: theme.input.background,
  color: theme.input.color,
}));

const EmptyState = styled.div(({ theme }) => ({
  font: `12px ${theme.typography.fonts.base}`,
  color: theme.textMutedColor,
  fontStyle: 'italic',
}));

const PREVIEW_SENTENCE = 'The quick brown fox jumps over the lazy dog';

export interface TypographyCardProps {
  system: DesignSystemFull;
  scope?: RefinementScope;
  onAction?: (payload: { scope: RefinementScope }) => void;
}

export function TypographyCard({ system, scope = 'typography', onAction }: TypographyCardProps) {
  const fontTokens = system.tokens.filter((t) => t.kind === 'font');
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  if (fontTokens.length === 0) {
    return (
      <SectionCard title="Typography" scope={scope} defaultCollapsed={false} onAction={onAction}>
        <EmptyState>No font tokens</EmptyState>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Typography" scope={scope} defaultCollapsed={false} onAction={onAction}>
      <FontGrid>
        {fontTokens.map((t) => (
          <FontCard key={t.role} onClick={() => { setEditingRole(t.role); setEditValue(t.value); }}>
            <FontRole>--{t.role}</FontRole>
            {editingRole === t.role ? (
              <FontInput
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={() => setEditingRole(null)}
                onKeyDown={(e) => e.key === 'Enter' && setEditingRole(null)}
                autoFocus
              />
            ) : (
              <FontValue family={t.value}>{t.value}</FontValue>
            )}
            <PreviewText family={t.value}>{PREVIEW_SENTENCE}</PreviewText>
          </FontCard>
        ))}
      </FontGrid>
    </SectionCard>
  );
}
