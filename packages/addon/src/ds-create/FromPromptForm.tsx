import React, { useState } from 'react';
import { styled } from '@storybook/theming';
import { createFromPrompt } from '../api';
import { Section, SectionTitle, Row, Muted, Input, Textarea, Btn } from '../ui';

const EXAMPLE_PROMPTS = [
  'Dark editorial with lime accent, serif headlines',
  'Minimal fintech, blue primary, rounded cards',
  'Playful brand, coral accent, rounded everything',
  'SaaS dashboard, muted palette, compact spacing',
];

const ExampleList = styled.div({ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 3 });
const Example = styled.button(({ theme }) => ({
  background: 'none', border: 'none', cursor: 'pointer',
  fontSize: 11, color: theme.textMutedColor, textAlign: 'left', padding: '2px 0',
  '&:hover': { color: theme.color.secondary },
}));

interface FromPromptFormProps {
  onProgress?: (sessionId: string) => void;
}

export function FromPromptForm({ onProgress }: FromPromptFormProps) {
  const [prompt, setPrompt] = useState('');
  const [name, setName] = useState('');
  const [id, setId] = useState('');

  const handleSubmit = async () => {
    if (!name.trim()) return;
    try {
      const result = await createFromPrompt(prompt.trim(), name.trim(), id.trim() || undefined);
      onProgress?.(result.sessionId);
    } catch { /* parent handles error */ }
  };

  return (
    <Section>
      <SectionTitle>From Prompt</SectionTitle>
      <Textarea rows={4} value={prompt} onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe your design system… e.g. dark editorial with lime accent" />
      <ExampleList>
        <Muted style={{ fontSize: 11 }}>example prompts:</Muted>
        {EXAMPLE_PROMPTS.map((ex, i) => (
          <Example key={i} onClick={() => setPrompt(ex)}>{ex}</Example>
        ))}
      </ExampleList>
      <Row gap={8} style={{ marginTop: 10 }}>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" style={{ maxWidth: 160 }} />
        <Input value={id} onChange={(e) => setId(e.target.value)} placeholder="ID (optional)" style={{ maxWidth: 120 }} />
        <Btn primary disabled={!name.trim()} onClick={handleSubmit}>Generate</Btn>
      </Row>
    </Section>
  );
}
