import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useStorybookApi } from '@storybook/manager-api';
import { styled } from '@storybook/theming';
import { api } from './api';
import {
  useStudioState, Page, PageTitle, Sub, Section, SectionTitle, Row, Stack, Muted, Btn, Input, Pill, Chip, Mono, sevTone, ErrorBanner,
} from './ui';
import { VIEW_MODE_CREATE } from './constants';
import type { DesignSystemSummary, DesignSystemFull } from './constants';
import { CatalogView } from './ds-browser/CatalogView';
import { PathSelector } from './ds-create/PathSelector';
import { FromPromptForm } from './ds-create/FromPromptForm';
import { DesignMdUploadForm } from './ds-create/DesignMdUploadForm';
import { GalleryPath } from './ds-create/GalleryPath';
import { ProgressView } from './ds-create/ProgressView';
import { IntermediatePreview } from './ds-create/IntermediatePreview';
import { BrandingCard } from './ds-dashboard/BrandingCard';
import { DesignMdCard } from './ds-dashboard/DesignMdCard';
import { ColorsCard } from './ds-dashboard/ColorsCard';
import { TypographyCard } from './ds-dashboard/TypographyCard';
import { SpacingCard } from './ds-dashboard/SpacingCard';
import { MotionCard } from './ds-dashboard/MotionCard';
import { PrimitivesCard } from './ds-dashboard/PrimitivesCard';
import { RefinementStatus, type RefinementResult } from './ds-dashboard/RefinementStatus';
import type { RefinementScope } from './constants';

type TabView = 'my-systems' | 'catalog' | 'create';

/** The "System" tab: pick a design system, inspect it deeply (tokens · diagnostics · conflicts ·
 *  manifest · raw source), switch it, or request a change. Now also features a catalog of vendored
 *  bases for browsing and cloning, and a "Create New" view for generating design systems. */
export function DesignSystemTab() {
  const { error, refresh } = useStudioState(3000);
  const sbApi = useStorybookApi();
  const [view, setView] = useState<TabView>('my-systems');
  const [systems, setSystems] = useState<DesignSystemSummary[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [detail, setDetail] = useState<DesignSystemFull | null>(null);
  const [req, setReq] = useState('');
  const [showRaw, setShowRaw] = useState<'none' | 'design' | 'tokens'>('none');
  const [creationMode, setCreationMode] = useState<'gallery' | 'from-prompt' | 'design-md' | null>(null);
  const [workflowSession, setWorkflowSession] = useState<string | null>(null);
  const [creationPath, setCreationPath] = useState<'from-prompt' | 'design-md'>('from-prompt');
  const [refinementStatus, setRefinementStatus] = useState<Record<string, 'idle' | 'refining' | 'queued' | 'success' | 'error'>>({});
  const [refinementResults, setRefinementResults] = useState<Record<string, RefinementResult | null>>({});
  const detailBeforeRefinement = useRef<string | null>(null);

  const loadSystems = useCallback(async () => {
    try {
      const r = await api.listDesignSystems();
      setSystems(r.systems);
      setActive(r.active);
      setSelected((s) => s ?? r.active ?? r.systems[0]?.id ?? null);
      // Default to Create New when no systems exist
      if (r.systems.length === 0 && !r.active) {
        setView('create');
      }
    } catch { /* down */ }
  }, []);
  useEffect(() => { loadSystems(); }, [loadSystems]);
  useEffect(() => { if (selected) api.getDesignSystemFull(selected).then(setDetail).catch(() => setDetail(null)); }, [selected]);

  // Poll for refinement completion when status is 'queued'
  useEffect(() => {
    const queuedScopes = Object.entries(refinementStatus)
      .filter(([_, s]) => s === 'queued')
      .map(([scope]) => scope);
    if (queuedScopes.length === 0 || !selected) return;

    const poll = setInterval(async () => {
      try {
        const updated = await api.getDesignSystemFull(selected);
        const snapshot = JSON.stringify(updated);
        // Detect when the system detail has changed from the pre-submission snapshot
        if (snapshot !== detailBeforeRefinement.current) {
          detailBeforeRefinement.current = null;
          setDetail(updated);
          setRefinementStatus((prev) => {
            const next = { ...prev };
            for (const scope of queuedScopes) next[scope] = 'success';
            return next;
          });
          setRefinementResults((prev) => {
            const next = { ...prev };
            for (const scope of queuedScopes) {
              next[scope] = { status: 'success', summary: `${scope} updated`, filesChanged: 1, tokenChanges: { added: 0, modified: 1, removed: 0 } };
            }
            return next;
          });
        }
      } catch { /* polling — will retry */ }
    }, 2000);

    return () => clearInterval(poll);
  }, [refinementStatus, selected]);

  const use = async (id: string) => { await api.useDesignSystem(id); await loadSystems(); refresh(); };
  const openCreate = () => {
    const storyId = (sbApi as any)?.getUrlState?.().storyId ?? '*';
    try { (sbApi as any)?.navigateUrl?.(`/${VIEW_MODE_CREATE}/${storyId}`, { plain: false }); } catch { /* top-bar tab */ }
  };

  const handleRefine = async (systemId: string, scope: RefinementScope) => {
    setRefinementStatus((prev) => ({ ...prev, [scope]: 'refining' }));
    setRefinementResults((prev) => ({ ...prev, [scope]: null }));
    try {
      // Snapshot current detail before submitting so the follow-up poll can detect change
      detailBeforeRefinement.current = JSON.stringify(detail);
      await api.submitIntent({
        type: 'refine-design-system',
        instruction: `Update ${scope}: `,
        payload: { id: systemId, scope },
      });
      // Intent is queued — don't report success yet. A follow-up poll detects completion.
      setRefinementStatus((prev) => ({ ...prev, [scope]: 'queued' }));
    } catch (e) {
      setRefinementStatus((prev) => ({ ...prev, [scope]: 'error' }));
      setRefinementResults((prev) => ({
        ...prev,
        [scope]: { status: 'error', message: (e as Error).message },
      }));
    }
  };

  const handleRevert = async (systemId: string, scope: string) => {
    try {
      await api.revertDesignSystem(systemId);
      const updated = await api.getDesignSystemFull(systemId);
      setDetail(updated);
      setRefinementStatus((prev) => ({ ...prev, [scope]: 'idle' }));
      setRefinementResults((prev) => ({ ...prev, [scope]: null }));
    } catch (e) {
      setRefinementResults((prev) => ({
        ...prev,
        [scope]: { status: 'error', message: (e as Error).message },
      }));
    }
  };

  if (error) return <Page><ErrorBanner error={error} /></Page>;

  const manifest = (detail?.manifest ?? {}) as Record<string, any>;
  const diagnostics = detail?.validation.diagnostics ?? [];
  const conflicts = detail?.conflicts ?? [];

  return (
    <Page>
        <PageTitle>Design System</PageTitle>
        <Sub>browse · inspect · switch · request changes</Sub>

        {/* Tab toggle: My Systems | Catalog | Create New */}
        <Row gap={6} style={{ marginBottom: 16 }}>
          <Btn primary={view === 'my-systems'} onClick={() => setView('my-systems')}>My Systems</Btn>
          <Btn primary={view === 'catalog'} onClick={() => setView('catalog')}>Catalog</Btn>
          <Btn primary={view === 'create'} onClick={() => setView('create')}>Create New</Btn>
        </Row>

        {view === 'catalog' && <CatalogView />}

        {view === 'my-systems' && (<>
        {/* Picker — horizontal chips (active system marked with a dot) */}
        <Row gap={8} wrap style={{ marginBottom: 16 }}>
          {systems.map((s) => (
            <Chip key={s.id} selected={selected === s.id} onClick={() => setSelected(s.id)}>
              {active === s.id && <span style={{ width: 6, height: 6, borderRadius: 999, background: '#3fb950', display: 'inline-block' }} />}
              {s.name}
            </Chip>
          ))}
          <Btn onClick={openCreate}>+ New</Btn>
          {systems.length === 0 && <Muted>none — create one →</Muted>}
        </Row>

        {detail ? (
          <Stack gap={14}>
            {/* Header */}
            <Section>
              <Row gap={10} wrap>
                <div style={{ fontSize: 18, fontWeight: 700, flex: 1 }}>{detail.name}</div>
                <Pill tone={detail.validation.ok ? 'ok' : 'bad'}>{detail.validation.ok ? 'valid' : 'invalid'}</Pill>
                {conflicts.length > 0 && <Pill tone="warn">{conflicts.length} conflicts</Pill>}
                {active === detail.id ? <Pill tone="ok">active</Pill> : <Btn primary onClick={() => use(detail.id)}>Use this system</Btn>}
              </Row>
              {manifest.category && <Muted style={{ display: 'block', marginTop: 6 }}>{manifest.category}{manifest.description ? ` — ${manifest.description}` : ''}</Muted>}
              <Row gap={6} wrap style={{ marginTop: 8 }}>
                <Pill>{detail.components.length} components</Pill>
                <Pill>{detail.sections.length} sections</Pill>
                <Pill>{detail.tokens.length} tokens</Pill>
                {manifest.source && <Pill>via {manifest.source.skill ?? manifest.source.type}</Pill>}
              </Row>
              <Muted style={{ display: 'block', marginTop: 8 }}>{detail.components.join(' · ') || '—'}</Muted>
              <Row gap={8} style={{ marginTop: 12 }}>
                <Input value={req} onChange={(e) => setReq(e.target.value)} placeholder="request a change to this system… e.g. shift the accent warmer"
                  onKeyDown={(e) => { if (e.key === 'Enter' && req.trim()) { api.submitIntent({ type: 'update-design-system', instruction: req.trim(), payload: { id: detail.id } }).then(refresh); setReq(''); } }} />
                <Btn primary disabled={!req.trim()} onClick={() => { api.submitIntent({ type: 'update-design-system', instruction: req.trim(), payload: { id: detail.id } }).then(refresh); setReq(''); }}>Request</Btn>
              </Row>
            </Section>

            {/* Section-card dashboard */}
            <Section>
              <SectionTitle>Dashboard</SectionTitle>
              <BrandingCard
                system={detail}
                onAction={(payload) => handleRefine(detail.id, payload.scope)}
              />
              <DesignMdCard
                system={detail}
                onAction={(payload) => handleRefine(detail.id, payload.scope)}
              />
              <ColorsCard
                system={detail}
                onAction={(payload) => handleRefine(detail.id, payload.scope)}
              />
              <TypographyCard
                system={detail}
                onAction={(payload) => handleRefine(detail.id, payload.scope)}
              />
              <SpacingCard
                system={detail}
                onAction={(payload) => handleRefine(detail.id, payload.scope)}
              />
              <MotionCard
                system={detail}
                onAction={(payload) => handleRefine(detail.id, payload.scope)}
              />
              <PrimitivesCard
                system={detail}
                onAction={(payload) => handleRefine(detail.id, payload.scope)}
              />
              {Object.entries(refinementStatus).map(([scope, status]) => (
                status !== 'idle' ? (
                  <RefinementStatus
                    key={scope}
                    status={status}
                    result={refinementResults[scope]}
                    onRevert={() => handleRevert(detail.id, scope)}
                  />
                ) : null
              ))}
            </Section>

            {/* Diagnostics & conflicts */}
            {(diagnostics.length > 0 || conflicts.length > 0) && (
              <Section>
                <SectionTitle>Diagnostics &amp; conflicts</SectionTitle>
                <Stack gap={6}>
                  {diagnostics.map((d, i) => (
                    <Row key={`d${i}`} gap={8}>
                      <Pill tone={sevTone(d.severity)}>{d.severity}</Pill>
                      <Muted style={{ flex: 1 }}>{d.message}{d.where ? ` · ${d.where.file}${d.where.line ? `:${d.where.line}` : ''}` : ''}{d.fix ? ` — fix: ${d.fix}` : ''}</Muted>
                    </Row>
                  ))}
                  {conflicts.map((c, i) => (
                    <Row key={`c${i}`} gap={8}>
                      <Pill tone={sevTone(c.severity)}>{c.kind}</Pill>
                      <Muted style={{ flex: 1 }}>{c.message}{c.subjects?.length ? ` · ${c.subjects.join(', ')}` : ''}</Muted>
                    </Row>
                  ))}
                </Stack>
              </Section>
            )}

            {/* Source */}
            <Section>
              <Row gap={8} wrap>
                <SectionTitle style={{ margin: 0, flex: 1 }}>Source</SectionTitle>
                <Btn primary={showRaw === 'design'} onClick={() => setShowRaw(showRaw === 'design' ? 'none' : 'design')}>DESIGN.md</Btn>
                <Btn primary={showRaw === 'tokens'} onClick={() => setShowRaw(showRaw === 'tokens' ? 'none' : 'tokens')}>tokens.css</Btn>
              </Row>
              {showRaw === 'design' && <Mono style={{ marginTop: 8 }}>{detail.designMd || '(empty)'}</Mono>}
              {showRaw === 'tokens' && <Mono style={{ marginTop: 8 }}>{detail.tokensCss || '(empty)'}</Mono>}
              {manifest.source?.license && <Muted style={{ display: 'block', marginTop: 8 }}>{manifest.source.license}{manifest.source.upstream ? ` · ${manifest.source.upstream}` : ''}</Muted>}
            </Section>
          </Stack>
        ) : <Section><Muted>select a system above</Muted></Section>}
        </>)}

        {/* Create New view */}
        {view === 'create' && (
          <>
            {workflowSession ? (
              <Row gap={16} style={{ alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <ProgressView
                    sessionId={workflowSession}
                    creationMode={creationPath}
                    onComplete={(id) => {
                      setWorkflowSession(null);
                      setCreationMode(null);
                      setSelected(id);
                      setView('my-systems');
                      loadSystems();
                    }}
                    onError={() => {}}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <IntermediatePreview />
                </div>
              </Row>
            ) : creationMode === 'gallery' ? (
              <GalleryPath
                onProgress={(sessionId) => { setWorkflowSession(sessionId); setCreationPath('from-prompt'); }}
                onComplete={(id) => {
                  setCreationMode(null);
                  setSelected(id);
                  setView('my-systems');
                  loadSystems();
                }}
              />
            ) : creationMode === 'from-prompt' ? (
              <FromPromptForm
                onProgress={(sessionId) => { setWorkflowSession(sessionId); setCreationPath('from-prompt'); }}
              />
            ) : creationMode === 'design-md' ? (
              <DesignMdUploadForm
                onProgress={(sessionId) => { setWorkflowSession(sessionId); setCreationPath('design-md'); }}
              />
            ) : (
              <PathSelector
                onSelect={(pathId) => {
                  if (pathId === 'gallery') setCreationMode('gallery');
                  else if (pathId === 'from-prompt') setCreationMode('from-prompt');
                  else if (pathId === 'design-md') setCreationMode('design-md');
                }}
              />
            )}
          </>
        )}
    </Page>
  );
}
