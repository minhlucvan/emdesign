import React from 'react';
import { styled } from '@storybook/theming';
import { Muted } from '../ui';

// ── Styled components ──────────────────────────────────────────────────────────

const Row = styled.div({
  display: 'flex',
  alignItems: 'flex-start',
  gap: 12,
});

const LabelCol = styled.div(({ theme }) => ({
  font: `600 11px ${theme.typography.fonts.base}`,
  color: theme.color.defaultText,
  minWidth: 80,
  paddingTop: 4,
  flexShrink: 0,
}));

const ColumnPair = styled.div({
  display: 'flex',
  gap: 8,
  flex: 1,
});

const Column = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  flex: 1,
  minWidth: 0,
});

const ColumnHeader = styled.div(({ theme }) => ({
  font: `600 10px ${theme.typography.fonts.mono}`,
  color: theme.textMutedColor,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
}));

const ValueBox = styled.div(({ theme }) => ({
  padding: '6px 8px',
  border: `1px solid ${theme.appBorderColor}`,
  borderRadius: theme.appBorderRadius,
  background: theme.background.app,
  font: `12px ${theme.typography.fonts.base}`,
  color: theme.color.defaultText,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}));

// Color-specific

const ColorSwatches = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
});

const SwatchRow = styled.div({
  display: 'flex',
  alignItems: 'center',
  gap: 6,
});

const Swatch = styled.span<{ color: string }>(({ color, theme }) => ({
  display: 'inline-block',
  width: 28,
  height: 28,
  borderRadius: 4,
  background: color,
  border: `1px solid ${theme.appBorderColor}`,
  flexShrink: 0,
}));

const HexLabel = styled.span(({ theme }) => ({
  font: `11px ${theme.typography.fonts.mono}`,
  color: theme.color.defaultText,
}));

// Typography-specific

const FontName = styled.div(({ theme }) => ({
  font: `13px ${theme.typography.fonts.base}`,
  color: theme.color.defaultText,
}));

// ── Helpers ────────────────────────────────────────────────────────────────────

function isHexColor(v: string): boolean {
  return /^#[0-9a-fA-F]{3,8}$/.test(v);
}

function extractHexColor(v: string): string {
  // If the value is already a plain hex, return it.
  if (isHexColor(v)) return v;
  // Try to find a hex colour inside a larger string.
  const m = v.match(/#[0-9a-fA-F]{3,8}/);
  return m ? m[0] : v;
}

// ── Component ──────────────────────────────────────────────────────────────────

export interface BeforeAfterDiffProps {
  type: 'color' | 'typography' | 'spacing' | 'other';
  before: string;
  after: string;
  label: string;
}

export function BeforeAfterDiff({ type, before, after, label }: BeforeAfterDiffProps) {
  const renderValue = (value: string) => {
    switch (type) {
      case 'color': {
        const hex = extractHexColor(value);
        return (
          <ColorSwatches>
            <SwatchRow>
              <Swatch color={hex} />
              <HexLabel>{hex}</HexLabel>
            </SwatchRow>
          </ColorSwatches>
        );
      }
      case 'typography':
        return <FontName>{value}</FontName>;
      case 'spacing':
        return <ValueBox>{value}</ValueBox>;
      default:
        return <ValueBox>{value}</ValueBox>;
    }
  };

  return (
    <Row>
      <LabelCol>{label}</LabelCol>
      <ColumnPair>
        <Column>
          <ColumnHeader>Before</ColumnHeader>
          {renderValue(before)}
        </Column>
        <Column>
          <ColumnHeader>After</ColumnHeader>
          {renderValue(after)}
        </Column>
      </ColumnPair>
    </Row>
  );
}
