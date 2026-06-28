import React from 'react';
import { styled } from '@storybook/theming';
import { SectionCard } from './SectionCard';
import type { DesignSystemFull, RefinementScope } from '../constants';

const TokenGrid = styled.div({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
  gap: 8,
});

const TokenCard = styled.div(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  padding: '8px 10px',
  border: `1px solid ${theme.appBorderColor}`,
  borderRadius: theme.appBorderRadius,
}));

const TokenRole = styled.div(({ theme }) => ({
  font: `600 10px ${theme.typography.fonts.mono}`,
  color: theme.textMutedColor,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
}));

const TokenValue = styled.div(({ theme }) => ({
  font: `13px ${theme.typography.fonts.mono}`,
  color: theme.color.defaultText,
}));

const PreviewBox = styled.div<{ duration: string }>(({ duration }) => ({
  width: 12,
  height: 12,
  borderRadius: 2,
  background: 'var(--color-secondary, #1ea7fd)',
  animation: `slide ${duration} ease-in-out infinite alternate`,
  marginTop: 4,
  '@keyframes slide': {
    '0%': { transform: 'translateX(0)' },
    '100%': { transform: 'translateX(40px)' },
  },
}));

const EmptyState = styled.div(({ theme }) => ({
  font: `12px ${theme.typography.fonts.base}`,
  color: theme.textMutedColor,
  fontStyle: 'italic',
}));

export interface MotionCardProps {
  system: DesignSystemFull;
  scope?: RefinementScope;
  onAction?: (payload: { scope: RefinementScope }) => void;
}

export function MotionCard({ system, scope = 'motion', onAction }: MotionCardProps) {
  const durationTokens = system.tokens.filter((t) => t.kind === 'duration');
  const easingTokens = system.tokens.filter((t) => t.kind === 'easing');

  if (durationTokens.length === 0 && easingTokens.length === 0) {
    return (
      <SectionCard title="Motion" scope={scope} defaultCollapsed={false} onAction={onAction}>
        <EmptyState>No motion tokens</EmptyState>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Motion" scope={scope} defaultCollapsed={false} onAction={onAction}>
      {durationTokens.length > 0 && (
        <>
          <TokenGrid>
            {durationTokens.map((t) => (
              <TokenCard key={t.role}>
                <TokenRole>--{t.role}</TokenRole>
                <TokenValue>{t.value}</TokenValue>
                <PreviewBox duration={t.value} />
              </TokenCard>
            ))}
          </TokenGrid>
        </>
      )}
      {easingTokens.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <TokenGrid>
            {easingTokens.map((t) => (
              <TokenCard key={t.role}>
                <TokenRole>--{t.role}</TokenRole>
                <TokenValue>{t.value}</TokenValue>
              </TokenCard>
            ))}
          </TokenGrid>
        </div>
      )}
    </SectionCard>
  );
}
