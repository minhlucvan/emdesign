import React from 'react';
import { styled } from '@storybook/theming';
import { Btn, Muted } from '../ui';

const Wrapper = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  padding: '48px 24px',
  minHeight: 300,
});

const Brand = styled.div(({ theme }) => ({
  font: `700 24px ${theme.typography.fonts.base}`,
  color: theme.color.defaultText,
  marginBottom: 8,
}));

const Subtitle = styled.div(({ theme }) => ({
  font: `13px ${theme.typography.fonts.base}`,
  color: theme.textMutedColor,
  maxWidth: 320,
  marginBottom: 24,
  lineHeight: 1.5,
}));

const Divider = styled.div(({ theme }) => ({
  font: `11px ${theme.typography.fonts.base}`,
  color: theme.textMutedColor,
  margin: '16px 0',
}));

const PillRow = styled.div({
  display: 'flex',
  gap: 8,
  flexWrap: 'wrap',
  justifyContent: 'center',
});

const StartPill = styled.button(({ theme }) => ({
  cursor: 'pointer',
  padding: '4px 14px',
  borderRadius: 999,
  border: `1px solid ${theme.appBorderColor}`,
  background: theme.background.app,
  color: theme.color.defaultText,
  font: `600 12px ${theme.typography.fonts.base}`,
  whiteSpace: 'nowrap',
  '&:hover': {
    borderColor: theme.color.secondary,
    color: theme.color.secondary,
  },
}));

export interface WelcomeViewProps {
  onStart: (mode: 'from-prompt' | 'gallery' | 'design-md') => void;
}

export function WelcomeView({ onStart }: WelcomeViewProps) {
  return (
    <Wrapper>
      <Brand>Design System</Brand>
      <Subtitle>
        Create your first design system to set the visual foundation for your project.
      </Subtitle>
      <Btn primary onClick={() => onStart('from-prompt')}>
        Create your first Design System
      </Btn>
      <Divider>Or start from:</Divider>
      <PillRow>
        <StartPill onClick={() => onStart('from-prompt')}>From Prompt</StartPill>
        <StartPill onClick={() => onStart('gallery')}>From Gallery</StartPill>
        <StartPill onClick={() => onStart('design-md')}>DESIGN.md</StartPill>
      </PillRow>
    </Wrapper>
  );
}
