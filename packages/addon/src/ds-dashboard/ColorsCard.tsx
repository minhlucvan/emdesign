import React, { useState } from 'react';
import { styled } from '@storybook/theming';
import { SectionCard } from './SectionCard';
import type { DesignSystemFull, RefinementScope } from '../constants';

const SwatchGrid = styled.div({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
  gap: 8,
});

const ColorGroupLabel = styled.div(({ theme }) => ({
  font: `600 11px ${theme.typography.fonts.base}`,
  color: theme.textMutedColor,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  marginBottom: 6,
  marginTop: 10,
  '&:first-child': { marginTop: 0 },
}));

const SwatchItem = styled.div(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '6px 8px',
  border: `1px solid ${theme.appBorderColor}`,
  borderRadius: theme.appBorderRadius,
  cursor: 'pointer',
}));

const SwatchCircle = styled.span<{ color: string }>(({ color, theme }) => ({
  display: 'inline-block',
  width: 20,
  height: 20,
  borderRadius: 4,
  background: color,
  border: `1px solid ${theme.appBorderColor}`,
  flexShrink: 0,
}));

const SwatchRole = styled.div(({ theme }) => ({
  font: `600 10px ${theme.typography.fonts.mono}`,
  color: theme.textMutedColor,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}));

const SwatchValue = styled.div(({ theme }) => ({
  font: `11px ${theme.typography.fonts.mono}`,
  color: theme.color.defaultText,
}));

const HexInput = styled.input(({ theme }) => ({
  width: 80,
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

function isValidHex(value: string): boolean {
  return /^#[0-9a-fA-F]{3}$|^#[0-9a-fA-F]{6}$/.test(value);
}

export interface ColorsCardProps {
  system: DesignSystemFull;
  scope?: RefinementScope;
  onAction?: (payload: { scope: RefinementScope }) => void;
}

const COLOR_GROUPS: Record<string, string[]> = {
  'Surface colors': ['color-surface', 'color-surface-alt'],
  'Text colors': ['color-text', 'color-text-muted'],
  'Accent colors': ['color-primary', 'color-accent'],
  'Border colors': ['color-border'],
  'Status colors': ['color-success', 'color-error', 'color-warning'],
};

export function ColorsCard({ system, scope = 'colors', onAction }: ColorsCardProps) {
  const colorTokens = system.tokens.filter((t) => t.kind === 'color');
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleSwatchClick = (token: { role: string; value: string }) => {
    setEditingRole(token.role);
    setEditValue(token.value);
  };

  const handleHexSave = (role: string) => {
    if (isValidHex(editValue)) {
      // Would call api.updateTokens in a real flow
    }
    setEditingRole(null);
  };

  if (colorTokens.length === 0) {
    return (
      <SectionCard title="Colors" scope={scope} defaultCollapsed={false} onAction={onAction}>
        <EmptyState>No color tokens</EmptyState>
      </SectionCard>
    );
  }

  // Group tokens by kind
  const tokenByRole = new Map(colorTokens.map((t) => [t.role, t]));

  return (
    <SectionCard title="Colors" scope={scope} defaultCollapsed={false} onAction={onAction}>
      {Object.entries(COLOR_GROUPS).map(([groupLabel, roles]) => {
        const groupTokens = roles.map((r) => tokenByRole.get(r)).filter(Boolean);
        if (groupTokens.length === 0) return null;
        return (
          <div key={groupLabel}>
            <ColorGroupLabel>{groupLabel}</ColorGroupLabel>
            <SwatchGrid>
              {groupTokens.map((t) => t && (
                <SwatchItem key={t.role} onClick={() => handleSwatchClick(t)} title={`--${t.role}: ${t.value}`}>
                  <SwatchCircle color={t.value} />
                  <div style={{ minWidth: 0 }}>
                    <SwatchRole>--{t.role}</SwatchRole>
                    {editingRole === t.role ? (
                      <HexInput
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => handleHexSave(t.role)}
                        onKeyDown={(e) => e.key === 'Enter' && handleHexSave(t.role)}
                        autoFocus
                      />
                    ) : (
                      <SwatchValue>{t.value}</SwatchValue>
                    )}
                  </div>
                </SwatchItem>
              ))}
            </SwatchGrid>
          </div>
        );
      })}
    </SectionCard>
  );
}
