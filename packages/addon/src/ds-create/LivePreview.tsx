import React from 'react';
import { styled } from '@storybook/theming';
import { api } from '../api';
import { Muted } from '../ui';

const PreviewFrame = styled.iframe({
  width: '100%', height: 400, border: '1px solid rgba(0,0,0,0.1)', borderRadius: 6,
});

const Fallback = styled.div<{ $accent: string }>(({ $accent }) => ({
  width: '100%', height: 400, borderRadius: 6, border: '1px solid rgba(0,0,0,0.1)',
  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16,
  background: `linear-gradient(135deg, ${$accent}22, ${$accent}44)`,
}));

const SwatchRow = styled.div({ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' });
const MiniSwatch = styled.div<{ color: string }>(({ color }) => ({
  width: 32, height: 32, borderRadius: 4, border: '1px solid rgba(0,0,0,0.1)',
  background: color,
}));

interface LivePreviewProps {
  baseId: string;
  overrides: Record<string, string>;
  hasPreview: boolean;
  accentColor: string;
  tokens: Array<{ role: string; kind: string; value: string }>;
}

export function LivePreview({ baseId, overrides, hasPreview, accentColor, tokens }: LivePreviewProps) {
  if (!hasPreview) {
    const colorTokens = tokens.filter((t) => t.kind === 'color');
    return (
      <Fallback $accent={accentColor}>
        <Muted>Live preview not available for this base</Muted>
        {colorTokens.length > 0 && (
          <SwatchRow>
            {colorTokens.map((t, i) => <MiniSwatch key={i} color={t.value} title={t.role} />)}
          </SwatchRow>
        )}
      </Fallback>
    );
  }

  const src = api.getBasePreviewUrl(baseId, overrides);
  return <PreviewFrame src={src} title="Design system preview" />;
}
