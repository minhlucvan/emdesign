import React from 'react';
import { styled } from '@storybook/theming';

const Strip = styled.div({
  display: 'flex',
  gap: 2,
  borderRadius: 4,
  overflow: 'hidden',
});

const Swatch = styled.div<{ color: string }>(({ color }) => ({
  width: 32,
  height: 32,
  backgroundColor: color,
  flex: 'none',
}));

export interface ColorStripProps {
  tokens: Array<{ role: string; kind: string; value: string }>;
  max?: number;
}

export function ColorStrip({ tokens, max = 8 }: ColorStripProps) {
  const items = tokens.slice(0, max);
  return (
    <Strip>
      {items.map((t, i) => (
        <Swatch key={i} color={t.value} title={`${t.role}: ${t.value}`} />
      ))}
    </Strip>
  );
}
