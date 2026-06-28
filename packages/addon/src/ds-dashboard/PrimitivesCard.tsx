import React from 'react';
import { styled } from '@storybook/theming';
import { SectionCard } from './SectionCard';
import type { DesignSystemFull, RefinementScope } from '../constants';

const ComponentList = styled.div({
  display: 'flex',
  flexWrap: 'wrap',
  gap: 6,
});

const ComponentBadge = styled.span(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '4px 10px',
  borderRadius: theme.appBorderRadius,
  border: `1px solid ${theme.appBorderColor}`,
  background: theme.background.app,
  font: `600 11px ${theme.typography.fonts.base}`,
  color: theme.color.defaultText,
}));

const StatusBadge = styled.span<{ status: string }>(({ theme, status }) => ({
  display: 'inline-block',
  padding: '1px 6px',
  borderRadius: 999,
  fontSize: 10,
  fontWeight: 700,
  background: status === 'scaffolded' ? '#d4edda' : theme.background.app,
  color: status === 'scaffolded' ? '#155724' : theme.textMutedColor,
}));

const AddBtn = styled.button(({ theme }) => ({
  cursor: 'pointer',
  padding: '4px 10px',
  borderRadius: theme.appBorderRadius,
  border: `1px dashed ${theme.appBorderColor}`,
  background: theme.background.app,
  color: theme.color.defaultText,
  font: `600 11px ${theme.typography.fonts.base}`,
}));

const EmptyState = styled.div(({ theme }) => ({
  font: `12px ${theme.typography.fonts.base}`,
  color: theme.textMutedColor,
  fontStyle: 'italic',
}));

export interface PrimitivesCardProps {
  system: DesignSystemFull;
  scope?: RefinementScope;
  onAction?: (payload: { scope: RefinementScope }) => void;
}

export function PrimitivesCard({ system, scope = 'primitives', onAction }: PrimitivesCardProps) {
  const components = system.components || [];

  if (components.length === 0) {
    return (
      <SectionCard title="Primitives" scope={scope} defaultCollapsed={false} onAction={onAction}>
        <EmptyState>No primitives scaffolded</EmptyState>
        <div style={{ marginTop: 8 }}>
          <AddBtn onClick={() => {}}>+ Add primitive</AddBtn>
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Primitives" scope={scope} defaultCollapsed={false} onAction={onAction}>
      <ComponentList>
        {components.map((name) => (
          <ComponentBadge key={name}>
            {name}
            <StatusBadge status="scaffolded">scaffolded</StatusBadge>
          </ComponentBadge>
        ))}
      </ComponentList>
      <div style={{ marginTop: 8 }}>
        <AddBtn onClick={() => {}}>+ Add primitive</AddBtn>
      </div>
    </SectionCard>
  );
}
