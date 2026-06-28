import React, { useState, useRef, useCallback } from 'react';
import { styled } from '@storybook/theming';
import { createFromDesignMd } from '../api';
import { Section, SectionTitle, Row, Muted, Input, Btn, Pill } from '../ui';

const DropZone = styled.div<{ active?: boolean }>(({ theme, active }) => ({
  border: `2px dashed ${active ? theme.color.secondary : theme.appBorderColor}`,
  borderRadius: theme.appBorderRadius,
  padding: 24,
  textAlign: 'center',
  cursor: 'pointer',
  background: active ? `${theme.color.secondary}11` : theme.background.content,
  transition: 'border-color 0.15s, background 0.15s',
  '&:hover': { borderColor: theme.color.secondary },
}));

const HiddenInput = styled.input({ display: 'none' });

interface ParsedMd {
  name?: string;
  category?: string;
  sections: string[];
  raw: string;
}

function parseFrontmatter(text: string): { frontmatter: Record<string, string>; body: string } | null {
  const match = text.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!match) return null;
  const lines = match[1].split('\n');
  const frontmatter: Record<string, string> = {};
  for (const line of lines) {
    const kv = line.match(/^(\w[\w ]*?):\s*(.*)$/);
    if (kv) frontmatter[kv[1].trim()] = kv[2].trim();
  }
  return { frontmatter, body: match[2] };
}

function extractSections(body: string): string[] {
  const headings = body.match(/^#{2,3}\s+(.+)$/gm);
  return headings ? headings.map((h) => h.replace(/^#{2,3}\s+/, '')) : [];
}

interface DesignMdUploadFormProps {
  onProgress?: (sessionId: string) => void;
}

export function DesignMdUploadForm({ onProgress }: DesignMdUploadFormProps) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [parsed, setParsed] = useState<ParsedMd | null>(null);
  const [name, setName] = useState('');
  const [id, setId] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndParse = useCallback(async (f: File) => {
    setError(null);
    setParsed(null);
    if (!f.name.endsWith('.md')) {
      setError('Only .md files are accepted');
      return;
    }
    const text = await f.text();
    const result = parseFrontmatter(text);
    if (!result) {
      setError('File must contain YAML frontmatter (--- ... ---)');
      return;
    }
    setFile(f);
    const sections = extractSections(result.body);
    setName(result.frontmatter['name'] || f.name.replace(/\.md$/, ''));
    setParsed({ name: result.frontmatter['name'], category: result.frontmatter['category'], sections, raw: text });
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer.files[0];
    if (f) validateAndParse(f);
  }, [validateAndParse]);

  const handleFilePick = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) validateAndParse(f);
  }, [validateAndParse]);

  const handleSubmit = async () => {
    if (!parsed || !name.trim()) return;
    try {
      const result = await createFromDesignMd(parsed.raw, name.trim(), id.trim() || undefined);
      onProgress?.(result.sessionId);
    } catch { /* parent handles error */ }
  };

  return (
    <Section>
      <SectionTitle>DESIGN.md Upload</SectionTitle>
      <DropZone
        active={dragActive}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        {file ? file.name : 'Drop a DESIGN.md file here, or click to browse'}
      </DropZone>
      <HiddenInput ref={inputRef} type="file" accept=".md" onChange={handleFilePick} />

      {error && <Muted style={{ color: '#e03', marginTop: 6 }}>{error}</Muted>}

      {parsed && (
        <div style={{ marginTop: 8 }}>
          {parsed.name && <Muted style={{ display: 'block' }}>Name: {parsed.name}</Muted>}
          {parsed.category && <Muted style={{ display: 'block' }}>Category: {parsed.category}</Muted>}
          {parsed.sections.length > 0 && (
            <div style={{ marginTop: 4 }}>
              <Muted style={{ display: 'block', marginBottom: 3 }}>Sections found:</Muted>
              <Row gap={4} wrap>
                {parsed.sections.map((s, i) => <Pill key={i}>{s}</Pill>)}
              </Row>
            </div>
          )}
        </div>
      )}

      <Row gap={8} style={{ marginTop: 10 }}>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" style={{ maxWidth: 160 }} />
        <Input value={id} onChange={(e) => setId(e.target.value)} placeholder="ID (optional)" style={{ maxWidth: 120 }} />
        <Btn primary disabled={!parsed || !name.trim()} onClick={handleSubmit}>Generate Design System</Btn>
      </Row>
    </Section>
  );
}
