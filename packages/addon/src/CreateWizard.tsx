import React, { useState } from 'react';
import { api } from './api';
import {
  useStudioState, Page, PageTitle, Sub, Section, SectionTitle, Row, Muted, Btn, Input, Textarea, Pill, ErrorBanner,
} from './ui';
import type { IntentType } from './constants';

type Kind = 'component' | 'story' | 'view';
const KINDS: Array<{ kind: Kind; label: string; blurb: string }> = [
  { kind: 'component', label: 'Component', blurb: 'a new on-system React component' },
  { kind: 'story', label: 'Story', blurb: 'variants & states for a component' },
  { kind: 'view', label: 'View / Page', blurb: 'compose components into a screen' },
];

/** The "+ Create" wizard: pick a kind, fill the form, enqueue the typed intent for the agent loop. */
export function CreateWizard() {
  const { state, error, refresh } = useStudioState(2500);
  const [kind, setKind] = useState<Kind>('component');
  const [sent, setSent] = useState<string | null>(null);

  const submit = async (type: IntentType, instruction: string, payload?: Record<string, unknown>) => {
    await api.submitIntent({ type, instruction, payload });
    setSent(`${type} queued`);
    refresh();
    window.setTimeout(() => setSent(null), 2500);
  };

  if (error) return <Page><ErrorBanner error={error} /></Page>;

  return (
    <Page>
      <PageTitle>Create</PageTitle>
      <Sub>scaffold a component, story, or view — the agent drains it from /mds:inbox</Sub>

      <Row gap={8} wrap style={{ marginBottom: 16 }}>
        {KINDS.map((k) => (
          <Btn key={k.kind} primary={kind === k.kind} onClick={() => setKind(k.kind)}>{k.label}</Btn>
        ))}
      </Row>
      <Muted style={{ display: 'block', marginBottom: 12 }}>{KINDS.find((k) => k.kind === kind)?.blurb}</Muted>

      {kind === 'component' && <ComponentForm onSubmit={submit} />}
      {kind === 'story' && <StoryForm onSubmit={submit} />}
      {kind === 'view' && <ViewForm onSubmit={submit} />}

      {sent && <Section style={{ marginTop: 12 }}><Row gap={8}><Pill tone="ok">queued</Pill><Muted>{sent} — watch the <strong>emdesign</strong> tab’s Activity.</Muted></Row></Section>}
    </Page>
  );
}

type Submit = (type: IntentType, instruction: string, payload?: Record<string, unknown>) => void;

function ComponentForm({ onSubmit }: { onSubmit: Submit }) {
  const [name, setName] = useState(''); const [desc, setDesc] = useState('');
  return (
    <Section>
      <SectionTitle>New component</SectionTitle>
      <Row gap={8}><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="PascalName" style={{ maxWidth: 180 }} /></Row>
      <Textarea rows={3} style={{ marginTop: 8 }} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="describe it… e.g. a pricing tier card with a highlighted plan" />
      <Btn primary disabled={!name.trim() || !desc.trim()} style={{ marginTop: 8 }} onClick={() => { onSubmit('create-component', desc.trim(), { name: name.trim() }); setName(''); setDesc(''); }}>Create component</Btn>
    </Section>
  );
}

function StoryForm({ onSubmit }: { onSubmit: Submit }) {
  const [component, setComponent] = useState(''); const [desc, setDesc] = useState('');
  return (
    <Section>
      <SectionTitle>New story</SectionTitle>
      <Row gap={8}><Input value={component} onChange={(e) => setComponent(e.target.value)} placeholder="component (PascalName)" style={{ maxWidth: 200 }} /></Row>
      <Textarea rows={3} style={{ marginTop: 8 }} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="variants & states… e.g. default, hover, disabled, long-text" />
      <Btn primary disabled={!component.trim() || !desc.trim()} style={{ marginTop: 8 }} onClick={() => { onSubmit('create-story', desc.trim(), { component: component.trim() }); setComponent(''); setDesc(''); }}>Create story</Btn>
    </Section>
  );
}

function ViewForm({ onSubmit }: { onSubmit: Submit }) {
  const [name, setName] = useState(''); const [desc, setDesc] = useState('');
  return (
    <Section>
      <SectionTitle>New view / page</SectionTitle>
      <Row gap={8}><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="PageName" style={{ maxWidth: 180 }} /></Row>
      <Textarea rows={3} style={{ marginTop: 8 }} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="describe the page… e.g. a SaaS landing page: hero, features, pricing, footer" />
      <Muted style={{ display: 'block', marginTop: 6 }}>Views are large multi-component builds — the agent confirms before running.</Muted>
      <Btn primary disabled={!name.trim() || !desc.trim()} style={{ marginTop: 8 }} onClick={() => { onSubmit('create-view', desc.trim(), { name: name.trim() }); setName(''); setDesc(''); }}>Create view</Btn>
    </Section>
  );
}

