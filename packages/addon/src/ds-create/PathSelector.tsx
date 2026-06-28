import React from 'react';
import { styled } from '@storybook/theming';

type PathId = 'gallery' | 'from-prompt' | 'design-md';

interface PathOption {
  id: PathId;
  icon: string;
  title: string;
  description: string;
}

const PATHS: PathOption[] = [
  { id: 'gallery', icon: '🏛️', title: 'Gallery', description: 'Pick a vendor base and customize it' },
  { id: 'from-prompt', icon: '✨', title: 'From Prompt', description: 'Describe your design system in natural language' },
  { id: 'design-md', icon: '📄', title: 'DESIGN.md', description: 'Upload an existing DESIGN.md file' },
];

const CardRow = styled.div({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: 12,
  marginBottom: 16,
});

const Card = styled.div<{ interactive?: boolean }>(({ theme }) => ({
  border: `1px solid ${theme.appBorderColor}`,
  borderRadius: theme.appBorderRadius,
  padding: 16,
  cursor: 'pointer',
  background: theme.background.content,
  transition: 'border-color 0.15s, box-shadow 0.15s',
  '&:hover': {
    borderColor: theme.color.secondary,
    boxShadow: `0 0 0 2px ${theme.color.secondary}33`,
  },
}));

const Icon = styled.div({ fontSize: 28, marginBottom: 8 });
const Title = styled.div(({ theme }) => ({ fontWeight: 700, fontSize: 14, color: theme.color.defaultText, marginBottom: 4 }));
const Desc = styled.div(({ theme }) => ({ fontSize: 12, color: theme.textMutedColor, lineHeight: 1.4 }));

interface PathSelectorProps {
  onSelect: (pathId: PathId) => void;
}

export function PathSelector({ onSelect }: PathSelectorProps) {
  return (
    <CardRow>
      {PATHS.map((p) => (
        <Card key={p.id} onClick={() => onSelect(p.id)}>
          <Icon>{p.icon}</Icon>
          <Title>{p.title}</Title>
          <Desc>{p.description}</Desc>
        </Card>
      ))}
    </CardRow>
  );
}
