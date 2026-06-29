import React, { useState } from 'react';
import { styled } from '@storybook/theming';
import { Btn, Muted, Input, Pill, Row, Section } from '../ui';
import { ColorStrip } from './ColorStrip';

const HeroSection = styled(Section)({
  padding: '12px 12px 8px',
});

const NameRow = styled(Row)({
  marginBottom: 4,
});

const SystemName = styled.span(({ theme }) => ({
  font: `700 16px ${theme.typography.fonts.base}`,
  color: theme.color.defaultText,
}));

const Meta = styled.div(({ theme }) => ({
  font: `11px ${theme.typography.fonts.base}`,
  color: theme.textMutedColor,
  marginBottom: 8,
  lineHeight: 1.4,
}));

const AiRow = styled.div({
  display: 'flex',
  gap: 6,
});

export interface SystemHeroProps {
  name: string;
  description?: string;
  category?: string;
  tokens: Array<{ role: string; kind: string; value: string }>;
  validationOk: boolean;
  componentsCount: number;
  sectionsCount: number;
  tokensCount: number;
  onRequestChange: (text: string) => void;
}

export function SystemHero({
  name,
  description,
  category,
  tokens,
  validationOk,
  componentsCount,
  sectionsCount,
  tokensCount,
  onRequestChange,
}: SystemHeroProps) {
  const [aiInput, setAiInput] = useState('');

  const colorTokens = tokens.filter((t) => t.kind === 'color');
  const bodyToken = tokens.find(
    (t) => t.role === 'font-body' || t.role === 'body-font',
  );
  const bodyLabel = bodyToken ? `Body: ${bodyToken.value}` : null;

  const handleSubmit = () => {
    if (aiInput.trim()) {
      onRequestChange(aiInput.trim());
      setAiInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && aiInput.trim()) {
      handleSubmit();
    }
  };

  return (
    <HeroSection>
      <NameRow gap={8} wrap>
        <SystemName>{name}</SystemName>
        <Pill tone={validationOk ? 'ok' : 'bad'}>
          {validationOk ? 'Valid' : 'Issues'}
        </Pill>
        <Pill tone="muted">active</Pill>
      </NameRow>

      {category && (
        <Meta>
          {category}
          {description ? ` — ${description}` : ''}
        </Meta>
      )}
      {!category && description && <Meta>{description}</Meta>}

      {colorTokens.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          <ColorStrip tokens={colorTokens} max={12} />
        </div>
      )}

      {/* Font preview */}
      <div style={{ marginBottom: 8 }}>
        <Muted
          as="div"
          style={{
            fontSize: 13,
            fontFamily: bodyToken?.value || undefined,
          }}
        >
          The quick brown fox jumps over the lazy dog.
        </Muted>
        {bodyLabel && (
          <Muted style={{ fontSize: 10, display: 'block', marginTop: 2 }}>
            {bodyLabel}
          </Muted>
        )}
      </div>

      {/* Stats row */}
      <Row gap={4} wrap>
        <Muted>{componentsCount} components</Muted>
        <Muted aria-hidden>·</Muted>
        <Muted>{sectionsCount} sections</Muted>
        <Muted aria-hidden>·</Muted>
        <Muted>{tokensCount} tokens</Muted>
      </Row>

      {/* Quick AI input */}
      <AiRow style={{ marginTop: 8 }}>
        <Input
          value={aiInput}
          onChange={(e) => setAiInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask AI to change the system..."
          style={{ flex: 1 }}
        />
        <Btn onClick={handleSubmit} disabled={!aiInput.trim()}>
          Send
        </Btn>
      </AiRow>
    </HeroSection>
  );
}
