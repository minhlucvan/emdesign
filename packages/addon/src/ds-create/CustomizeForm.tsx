import React, { useEffect, useState, useRef, useCallback } from 'react';
import { styled } from '@storybook/theming';
import { api } from '../api';
import type { BaseDetail } from '../constants';
import { Section, SectionTitle, Row, Muted, Input, Btn, Select, Pill, ErrorBanner } from '../ui';
import { LivePreview } from './LivePreview';

const FormGrid = styled.div({
  display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16, marginTop: 8,
});

const FormSection = styled.div({
  display: 'flex', flexDirection: 'column', gap: 8,
});

const Label = styled(Muted)({
  fontWeight: 600, display: 'block', marginBottom: 2,
});

const Slider = styled.input({
  width: '100%', margin: 0,
});

const ToggleGroup = styled.div({
  display: 'flex', gap: 4,
});

const ToggleBtn = styled.button<{ $active: boolean }>(({ theme, $active }) => ({
  padding: '4px 12px', fontSize: 12, cursor: 'pointer',
  border: `1px solid ${theme.appBorderColor}`,
  background: $active ? theme.color.secondary : theme.background.app,
  color: $active ? theme.color.lightest : theme.color.defaultText,
  borderRadius: theme.appBorderRadius,
  '&:hover': { opacity: 0.85 },
}));

const FONT_OPTIONS = ['Inter', 'Manrope', 'Space Grotesk', 'Work Sans', 'IBM Plex Sans', 'DM Sans', 'Epilogue', 'Geist'];

interface CustomizeFormProps {
  baseId: string;
  onComplete?: (id: string) => void;
  onProgress?: (sessionId: string) => void;
}

export function CustomizeForm({ baseId, onComplete, onProgress }: CustomizeFormProps) {
  const [base, setBase] = useState<BaseDetail | null>(null);
  const [name, setName] = useState('');
  const [id, setId] = useState('');
  const [seedColor, setSeedColor] = useState('#6b7280');
  const [headlineFont, setHeadlineFont] = useState('Inter');
  const [bodyFont, setBodyFont] = useState('Inter');
  const [roundness, setRoundness] = useState(8);
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    api.getBaseDetail(baseId).then((d) => {
      setBase(d);
      setName(d.name);
      setId(d.id);
      setSeedColor(d.accentColor || '#6b7280');
      setHeadlineFont(d.fonts?.display || 'Inter');
      setBodyFont(d.fonts?.body || 'Inter');
    }).catch(() => {});
  }, [baseId]);

  const debouncedUpdate = useCallback((fn: () => void) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(fn, 300);
  }, []);

  // Derived preview URL
  const previewOverrides: Record<string, string> = {
    seedColor,
    headlineFont,
    bodyFont,
    roundness: String(roundness),
    mode,
  };

  const handleSubmit = async () => {
    if (!name.trim() || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await api.customizeDesignSystem({
        baseRef: baseId,
        id: id.trim() || name.trim().toLowerCase().replace(/\s+/g, '-'),
        name: name.trim(),
        customizations: {
          seedColor,
          headlineFont,
          bodyFont,
          roundness,
          colorMode: mode,
        },
      });
      onComplete?.(result.id);
    } catch (e: any) {
      setError(e.message || 'Failed to create design system');
    } finally {
      setSubmitting(false);
    }
  };

  if (!base) return <Section><Muted>Loading base details…</Muted></Section>;

  return (
    <div>
      <SectionTitle>Quick Customize</SectionTitle>
      {error && <ErrorBanner error={error} />}
      <FormGrid>
        <FormSection>
          <div>
            <Label>Name *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="My Design System" />
          </div>
          <div>
            <Label>ID</Label>
            <Input value={id} onChange={(e) => setId(e.target.value)} placeholder="my-design-system" />
          </div>
          <div>
            <Label>Seed Color</Label>
            <Input type="color" value={seedColor} onChange={(e) => { setSeedColor(e.target.value); }} />
          </div>
          <div>
            <Label>Headline Font</Label>
            <Select value={headlineFont} onChange={(e) => setHeadlineFont(e.target.value)}>
              {FONT_OPTIONS.map((f) => <option key={f}>{f}</option>)}
            </Select>
          </div>
          <div>
            <Label>Body Font</Label>
            <Select value={bodyFont} onChange={(e) => setBodyFont(e.target.value)}>
              {FONT_OPTIONS.map((f) => <option key={f}>{f}</option>)}
            </Select>
          </div>
          <div>
            <Label>Roundness: {roundness}px</Label>
            <Slider type="range" min={0} max={24} value={roundness}
              onChange={(e) => debouncedUpdate(() => setRoundness(Number(e.target.value)))} />
          </div>
          <div>
            <Label>Color Mode</Label>
            <ToggleGroup>
              <ToggleBtn $active={mode === 'light'} onClick={() => setMode('light')}>Light</ToggleBtn>
              <ToggleBtn $active={mode === 'dark'} onClick={() => setMode('dark')}>Dark</ToggleBtn>
            </ToggleGroup>
          </div>
          <Btn primary disabled={!name.trim() || submitting} style={{ marginTop: 8 }} onClick={handleSubmit}>
            {submitting ? 'Creating…' : 'Create Design System'}
          </Btn>
        </FormSection>
        <LivePreview baseId={baseId} overrides={previewOverrides} hasPreview={base.hasPreview}
          accentColor={seedColor} tokens={base.tokens} />
      </FormGrid>
    </div>
  );
}
