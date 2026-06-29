import React, { useState } from 'react';
import { styled } from '@storybook/theming';
import { SectionCard } from './SectionCard';
import type { DesignSystemFull, RefinementScope } from '../constants';

const Field = styled.div(({ theme }) => ({
  marginBottom: 8,
}));

const Label = styled.div(({ theme }) => ({
  font: `600 11px ${theme.typography.fonts.base}`,
  color: theme.textMutedColor,
  marginBottom: 2,
}));

const Value = styled.div(({ theme }) => ({
  font: `13px ${theme.typography.fonts.base}`,
  color: theme.color.defaultText,
}));

const EditInput = styled.input(({ theme }) => ({
  width: '100%',
  boxSizing: 'border-box',
  padding: '4px 6px',
  border: `1px solid ${theme.appBorderColor}`,
  borderRadius: theme.appBorderRadius,
  background: theme.input.background,
  color: theme.input.color,
  font: `13px ${theme.typography.fonts.base}`,
}));

const EditBtn = styled.button(({ theme }) => ({
  cursor: 'pointer',
  padding: '2px 8px',
  borderRadius: theme.appBorderRadius,
  border: `1px solid ${theme.appBorderColor}`,
  background: theme.background.app,
  color: theme.color.defaultText,
  font: `600 11px ${theme.typography.fonts.base}`,
}));

const VoiceExcerpt = styled.div(({ theme }) => ({
  fontStyle: 'italic',
  fontSize: 12,
  color: theme.textMutedColor,
  marginTop: 6,
  padding: 6,
  borderLeft: `2px solid ${theme.appBorderColor}`,
}));

export interface BrandingCardProps {
  system: DesignSystemFull;
  scope?: RefinementScope;
  refinementStatus?: 'idle' | 'refining' | 'queued' | 'success' | 'error';
  onAction?: (payload: { scope: RefinementScope; instruction?: string }) => void;
}

export function BrandingCard({ system, scope = 'branding', refinementStatus, onAction }: BrandingCardProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(system.manifest?.name as string || system.name);
  const [description, setDescription] = useState(system.manifest?.description as string || '');

  const manifest = system.manifest ?? {};
  const category = (manifest.category as string) || '';
  const brandVoice = (manifest.brandVoice as string) || '';

  // Extract brand voice from DESIGN.md section 8 if not in manifest
  const voiceExcerpt = brandVoice || extractBrandVoice(system.designMd);

  return (
    <SectionCard title="Branding" scope={scope} defaultCollapsed={true} refinementStatus={refinementStatus} onAction={onAction}>
      <Field>
        <Label>Name</Label>
        {editing ? (
          <EditInput value={name} onChange={(e) => setName(e.target.value)} />
        ) : (
          <Value>{name}</Value>
        )}
      </Field>
      <Field>
        <Label>Description</Label>
        {editing ? (
          <EditInput value={description} onChange={(e) => setDescription(e.target.value)} />
        ) : (
          <Value>{description || '(no description)'}</Value>
        )}
      </Field>
      {category && (
        <Field>
          <Label>Category</Label>
          <Value>{category}</Value>
        </Field>
      )}
      {voiceExcerpt && (
        <VoiceExcerpt>"{voiceExcerpt}"</VoiceExcerpt>
      )}
      {editing ? (
        <EditBtn onClick={() => setEditing(false)}>Save</EditBtn>
      ) : (
        <EditBtn onClick={() => setEditing(true)}>Edit</EditBtn>
      )}
    </SectionCard>
  );
}

function extractBrandVoice(designMd: string): string {
  if (!designMd) return '';
  // Extract brand voice from DESIGN.md section 8
  const match = designMd.match(/Section\s*8[:\s]*Brand\s*Voice/i);
  if (match) {
    const after = designMd.slice(match.index! + match[0].length);
    // Take the first 2-3 sentences
    const sentences = after.trim().split(/\.\s+/).slice(0, 3).join('. ');
    return sentences.trim();
  }
  return '';
}
