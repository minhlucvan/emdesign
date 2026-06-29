import React, { useState } from 'react';
import { styled } from '@storybook/theming';
import { SectionCard } from './SectionCard';
import type { DesignSystemFull, RefinementScope } from '../constants';

const PreviewText = styled.div(({ theme }) => ({
  font: `12px/1.6 ${theme.typography.fonts.mono}`,
  color: theme.color.defaultText,
  whiteSpace: 'pre-wrap',
  overflow: 'hidden',
}));

const ExpandBtn = styled.button(({ theme }) => ({
  cursor: 'pointer',
  padding: '2px 8px',
  borderRadius: theme.appBorderRadius,
  border: `1px solid ${theme.appBorderColor}`,
  background: theme.background.app,
  color: theme.color.defaultText,
  font: `600 11px ${theme.typography.fonts.base}`,
  marginTop: 6,
}));

const EditTextarea = styled.textarea(({ theme }) => ({
  width: '100%',
  boxSizing: 'border-box',
  minHeight: 120,
  padding: '6px 8px',
  border: `1px solid ${theme.appBorderColor}`,
  borderRadius: theme.appBorderRadius,
  background: theme.input.background,
  color: theme.input.color,
  font: `12px/1.5 ${theme.typography.fonts.mono}`,
}));

const EmptyState = styled.div(({ theme }) => ({
  font: `12px ${theme.typography.fonts.base}`,
  color: theme.textMutedColor,
  fontStyle: 'italic',
}));

export interface DesignMdCardProps {
  system: DesignSystemFull;
  scope?: RefinementScope;
  refinementStatus?: 'idle' | 'refining' | 'queued' | 'success' | 'error';
  onAction?: (payload: { scope: RefinementScope; instruction?: string }) => void;
}

export function DesignMdCard({ system, scope = 'design-md', refinementStatus, onAction }: DesignMdCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(system.designMd || '');

  const handleSave = () => {
    setEditing(false);
    // Persist via callback — parent wires to api
  };

  if (!system.designMd) {
    return (
      <SectionCard title="DESIGN.md" scope={scope} defaultCollapsed={true} refinementStatus={refinementStatus} onAction={onAction}>
        <EmptyState>No DESIGN.md content</EmptyState>
      </SectionCard>
    );
  }

  const lines = system.designMd.split('\n');
  const collapsedContent = lines.slice(0, 3).join('\n');

  return (
    <SectionCard title="DESIGN.md" scope={scope} defaultCollapsed={true} refinementStatus={refinementStatus} onAction={onAction}>
      {editing ? (
        <>
          <EditTextarea value={content} onChange={(e) => setContent(e.target.value)} />
          <div style={{ marginTop: 6, display: 'flex', gap: 6 }}>
            <ExpandBtn onClick={handleSave}>Save</ExpandBtn>
            <ExpandBtn onClick={() => { setEditing(false); setContent(system.designMd); }}>Cancel</ExpandBtn>
          </div>
        </>
      ) : (
        <>
          <PreviewText>
            {expanded ? content : (collapsedContent + (lines.length > 3 ? '\n…' : ''))}
          </PreviewText>
          {lines.length > 3 && (
            <ExpandBtn onClick={() => setExpanded(!expanded)}>
              {expanded ? 'Collapse' : 'Expand'}
            </ExpandBtn>
          )}
          <ExpandBtn onClick={() => setEditing(true)} style={{ marginLeft: 6 }}>
            Edit
          </ExpandBtn>
        </>
      )}
    </SectionCard>
  );
}
