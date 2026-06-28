import React from 'react';
import { styled } from '@storybook/theming';
import { Section, SectionTitle, Row, Muted, Pill, Swatch } from '../ui';

const PreviewPanel = styled.div({
  maxHeight: 400, overflowY: 'auto', fontSize: 12, lineHeight: 1.5,
});

const SwatchGrid = styled.div({
  display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6,
});

const SwatchItem = styled.div({ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, fontSize: 10 });

const ColorSwatch = styled.div<{ color: string }>(({ color }) => ({
  width: 28, height: 28, borderRadius: 4, border: '1px solid rgba(0,0,0,0.1)',
  background: color,
}));

const FontPreview = styled.div<{ font: string }>(({ font }) => ({
  fontFamily: font, fontSize: 16, padding: 8, borderBottom: '1px solid rgba(0,0,0,0.06)',
}));

const PrimitiveList = styled.div({ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 3 });

interface IntermediatePreviewProps {
  designMdLines?: string[];
  colorTokens?: Array<{ name: string; value: string }>;
  headlineFont?: string;
  bodyFont?: string;
  primitives?: Array<{ name: string; value: string }>;
  validation?: { ok: boolean; diagnostics?: Array<{ message: string; severity: string }>; conflictCount?: number };
}

export function IntermediatePreview({
  designMdLines,
  colorTokens,
  headlineFont,
  bodyFont,
  primitives,
  validation,
}: IntermediatePreviewProps) {
  return (
    <Section>
      <SectionTitle>Preview</SectionTitle>
      <PreviewPanel>
        {/* DESIGN.md lines */}
        {designMdLines && designMdLines.length > 0 && (
          <div style={{ marginBottom: 8 }}>
            <Muted style={{ fontWeight: 600, display: 'block', marginBottom: 4 }}>DESIGN.md</Muted>
            {designMdLines.map((line, i) => (
              <div key={i} style={{ paddingLeft: line.startsWith('#') ? 0 : 12 }}>{line}</div>
            ))}
          </div>
        )}

        {/* Color swatches */}
        {colorTokens && colorTokens.length > 0 && (
          <div style={{ marginBottom: 8 }}>
            <Muted style={{ fontWeight: 600, display: 'block', marginBottom: 4 }}>Colors</Muted>
            <SwatchGrid>
              {colorTokens.map((c, i) => (
                <SwatchItem key={i}>
                  <ColorSwatch color={c.value} />
                  <span>{c.name}</span>
                </SwatchItem>
              ))}
            </SwatchGrid>
          </div>
        )}

        {/* Font preview */}
        {(headlineFont || bodyFont) && (
          <div style={{ marginBottom: 8 }}>
            <Muted style={{ fontWeight: 600, display: 'block', marginBottom: 4 }}>Typography</Muted>
            {headlineFont && <FontPreview font={headlineFont}>Headline — The quick brown fox jumps over the lazy dog</FontPreview>}
            {bodyFont && <FontPreview font={bodyFont}>Body — The quick brown fox jumps over the lazy dog</FontPreview>}
          </div>
        )}

        {/* Primitives */}
        {primitives && primitives.length > 0 && (
          <div style={{ marginBottom: 8 }}>
            <Muted style={{ fontWeight: 600, display: 'block', marginBottom: 4 }}>Primitives</Muted>
            <PrimitiveList>
              {primitives.map((p, i) => (
                <Row key={i} gap={6}>
                  <Muted>{p.name}</Muted>
                  <span>{p.value}</span>
                </Row>
              ))}
            </PrimitiveList>
          </div>
        )}

        {/* Validation */}
        {validation && (
          <div style={{ marginBottom: 8 }}>
            <Muted style={{ fontWeight: 600, display: 'block', marginBottom: 4 }}>Validation</Muted>
            <Row gap={6}>
              <Pill tone={validation.ok ? 'ok' : 'bad'}>{validation.ok ? 'pass' : 'fail'}</Pill>
              {validation.conflictCount != null && validation.conflictCount > 0 && <Pill tone="warn">{validation.conflictCount} conflicts</Pill>}
            </Row>
            {validation.diagnostics && validation.diagnostics.length > 0 && (
              <PrimitiveList>
                {validation.diagnostics.map((d, i) => (
                  <Muted key={i}>{d.severity}: {d.message}</Muted>
                ))}
              </PrimitiveList>
            )}
          </div>
        )}

        {!designMdLines && !colorTokens && !headlineFont && !bodyFont && !primitives && !validation && (
          <Muted>Waiting for artifacts…</Muted>
        )}
      </PreviewPanel>
    </Section>
  );
}
