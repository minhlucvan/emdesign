/**
 * ChartersTab — Storybook addon panel showing ALL validation/inspection results.
 *
 * Unifies five tiers of rules into a single view:
 *   core         — anti-slop lint + token binding + framework geometry charters
 *   doctor       — production-readiness design review rules (plugin-core + tailwindcss)
 *   rendered     — DOM geometry/contrast rules (from plugin rendered rules)
 *   designSystem — DS-level Element Charters
 *   story        — CSF story charters (from the preview iframe via channel)
 *
 * Data comes from two sources:
 *   1. Channel event EVT_CHARTER_RESULT — live story charter evaluation from the iframe
 *   2. Backend API POST /api/charters   — all other rule tiers
 */

import React, { useEffect, useState, useCallback } from 'react';
import { addons } from '@storybook/manager-api';
import { styled } from '@storybook/theming';
import { EVT_CHARTER_RESULT } from './channel';
import { api } from '../api';
import { Page, PageTitle, Sub, Section, Row, Pill, Muted, sevTone } from '../ui';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Finding {
  id: string;
  title: string;
  severity: 'P0' | 'P1' | 'P2';
  pass: boolean;
  message?: string;
  fix?: string;
  target?: string;
}

interface ChannelResult {
  component: string;
  story: string;
  findings: Array<{
    id: string; component: string; story: string; charterName: string;
    severity: 'P0' | 'P1' | 'P2'; pass: boolean; message: string;
    target?: string; fix?: string;
  }>;
  passed: number; failed: number; allPass: boolean;
}

// ── Section descriptors — each tier gets one section in the UI ────────
interface SectionDef {
  key: string;
  label: string;
  /** Icon shown in the header. */
  icon: string;
  /** Get findings for this section from the available data sources. */
  getFindings: (data: SectionData) => Finding[];
}

interface SectionData {
  apiTiers: Record<string, Finding[]> | null;
  channelResult: ChannelResult | null;
}

const SECTIONS: SectionDef[] = [
  {
    key: 'core',
    label: 'Core Rules',
    icon: '⚙️',
    getFindings: (d) => d.apiTiers?.core ?? [],
  },
  {
    key: 'doctor',
    label: 'Doctor',
    icon: '🏥',
    getFindings: (d) => d.apiTiers?.doctor ?? [],
  },
  {
    key: 'rendered',
    label: 'Rendered',
    icon: '🖼️',
    getFindings: (d) => d.apiTiers?.rendered ?? [],
  },
  {
    key: 'designSystem',
    label: 'Design System',
    icon: '🎨',
    getFindings: (d) => d.apiTiers?.designSystem ?? [],
  },
  {
    key: 'story',
    label: 'Story Charters',
    icon: '📖',
    getFindings: (d) => {
      if (!d.channelResult) return [];
      const { component, story } = d.channelResult;
      return d.channelResult.findings.map((f) => ({
        id: f.id,
        title: f.charterName,
        severity: f.severity,
        pass: f.pass,
        message: f.message,
        fix: f.fix,
        target: f.target,
      }));
    },
  },
];

// ---------------------------------------------------------------------------
// Styled components
// ---------------------------------------------------------------------------

const SummaryRow = styled.div({
  display: 'flex',
  gap: 8,
  alignItems: 'center',
  marginBottom: 16,
  flexWrap: 'wrap',
});

const SectionHeader = styled.button<{ $open: boolean }>(({ theme, $open }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  width: '100%',
  padding: '8px 10px',
  border: `1px solid ${theme.appBorderColor}`,
  borderRadius: theme.appBorderRadius,
  background: theme.background.content,
  color: theme.color.defaultText,
  font: `600 13px ${theme.typography.fonts.base}`,
  cursor: 'pointer',
  textAlign: 'left',
  marginBottom: $open ? 8 : 0,
  '&:hover': { background: theme.background.hoverable ?? theme.background.content },
}));

const Chevron = styled.span<{ $open: boolean }>(({ $open }) => ({
  display: 'inline-block',
  transition: 'transform 0.15s',
  transform: $open ? 'rotate(90deg)' : 'rotate(0deg)',
  fontSize: 11,
  marginRight: 2,
}));

const SectionStats = styled.span({
  marginLeft: 'auto',
  display: 'flex',
  gap: 6,
  alignItems: 'center',
  fontSize: 11,
  fontWeight: 600,
});

const FindingsList = styled.div({
  padding: '0 10px 10px',
});

const FindingRow = styled.div<{ $pass: boolean }>(({ theme, $pass }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: 8,
  padding: '6px 0',
  borderBottom: `1px solid ${theme.appBorderColor}`,
  opacity: $pass ? 0.7 : 1,
  '&:last-child': { borderBottom: 'none' },
}));

const FindingName = styled.span(({ theme }) => ({
  font: `600 11px ${theme.typography.fonts.base}`,
  color: theme.color.defaultText,
  minWidth: 140,
  maxWidth: 180,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  flexShrink: 0,
}));

const FindingMessage = styled.span(({ theme }) => ({
  font: `11px ${theme.typography.fonts.base}`,
  color: theme.textMutedColor,
  flex: 1,
  minWidth: 0,
  lineHeight: 1.4,
}));

const FindingFix = styled.code(({ theme }) => ({
  font: `10px ${theme.typography.fonts.mono}`,
  background: theme.background.app,
  border: `1px solid ${theme.appBorderColor}`,
  borderRadius: 4,
  padding: '2px 6px',
  marginTop: 3,
  display: 'block',
  whiteSpace: 'pre-wrap',
  lineHeight: 1.4,
}));

const EmptyState = styled.div(({ theme }) => ({
  padding: 24,
  textAlign: 'center',
  color: theme.textMutedColor,
  font: `13px ${theme.typography.fonts.base}`,
}));

const Icon = styled.span<{ $pass: boolean; $severity?: string }>(({ $pass, $severity }) => ({
  fontSize: 13,
  lineHeight: '18px',
  flexShrink: 0,
  width: 18,
  textAlign: 'center',
}));

function statusIcon(pass: boolean, severity?: string): string {
  if (pass) return '✅';
  if (severity === 'P0') return '❌';
  if (severity === 'P1') return '⚠️';
  return '⚪';
}

function countPassed(findings: Finding[]): number {
  return findings.filter((f) => f.pass).length;
}

// ---------------------------------------------------------------------------
// Tab component
// ---------------------------------------------------------------------------

export function ChartersTab() {
  const [channelResult, setChannelResult] = useState<ChannelResult | null>(null);
  const [apiTiers, setApiTiers] = useState<Record<string, Finding[]> | null>(null);
  const [renderViewport, setRenderViewport] = useState<{ width: number; height: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [backendOk, setBackendOk] = useState<boolean | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [currentComponent, setCurrentComponent] = useState<string | null>(null);

  // ── Backend health check (polls until available) ────────────────────
  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    const poll = () => {
      if (cancelled) return;
      api.getHealth()
        .then(() => {
          if (!cancelled) { setBackendOk(true); setError(null); }
        })
        .catch(() => {
          if (!cancelled) {
            attempts++;
            setBackendOk(false);
            setError(`Backend unreachable after ${attempts * 3}s`);
            setTimeout(poll, 3000);
          }
        });
    };
    poll();
    return () => { cancelled = true; };
  }, []);

  // ── Channel listener: story charters from the iframe ────────────────
  useEffect(() => {
    const channel = addons.getChannel();
    const handler = (payload: ChannelResult) => {
      setChannelResult(payload);
      setCurrentComponent(payload.component);
      setLoading(false);
    };
    channel.on(EVT_CHARTER_RESULT, handler);
    return () => { channel.off(EVT_CHARTER_RESULT, handler); };
  }, []);

  // ── API fetcher: all other rule tiers ───────────────────────────────
  useEffect(() => {
    if (!currentComponent) return;

    let cancelled = false;
    setError(null);

    api.validateComponent(currentComponent)
      .then((res) => {
        if (!cancelled) {
          setApiTiers(res.tiers as Record<string, Finding[]>);
          if (res.renderViewport) setRenderViewport(res.renderViewport);
          setBackendOk(true); // Backend is reachable — clear any stale error
          setError(null);
          setLoading(false);
        }
      })
      .catch((e: Error) => {
        if (!cancelled) {
          setError(e.message);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [currentComponent]);

  // ── Backend health fallback: clear loading if backend is down ──────
  useEffect(() => {
    if (backendOk === false && loading) {
      // Backend is down — don't leave the user staring at "Waiting…"
      const timer = setTimeout(() => setLoading(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [backendOk, loading]);

  // ── Collapse / expand toggle ─────────────────────────────────────────
  const toggle = useCallback((key: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  // ── Compute data for sections ───────────────────────────────────────
  const sectionData: SectionData = { apiTiers, channelResult };

  // Calculate total counts from ALL sections
  let totalPassed = 0;
  let totalFailed = 0;
  for (const sec of SECTIONS) {
    const findings = sec.getFindings(sectionData);
    totalPassed += countPassed(findings);
    totalFailed += findings.length - countPassed(findings);
  }
  const total = totalPassed + totalFailed;

  // ── Render ──────────────────────────────────────────────────────────
  return (
    <Page>
      <PageTitle>Charters</PageTitle>
      <Sub>Component-level validation assertions defined in CSF</Sub>

      {/* Summary */}
      {!loading && total > 0 && (
        <SummaryRow>
          <Pill tone="ok">{totalPassed} passed</Pill>
          {totalFailed > 0 && <Pill tone="bad">{totalFailed} failed</Pill>}
          {totalFailed === 0 && <Pill tone="ok">All passing</Pill>}
          {channelResult && (
            <Muted>
              {channelResult.component} / {channelResult.story}
            </Muted>
          )}
        </SummaryRow>
      )}

      {/* Backend-down banner (always visible when backend is unreachable) */}
      {backendOk === false && (
        <Section style={{ borderColor: '#c0392b', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
            <Muted>
              <strong>Backend not reachable</strong> ({error || 'connection failed'}).<br />
              Core, Doctor, Rendered, and Design System rules won't load without it.<br />
              Start it with <code>emdesign serve</code> on port 4321.
            </Muted>
          </div>
        </Section>
      )}

      {/* Loading state */}
      {loading && backendOk !== false && (
        <EmptyState>Waiting for story to render…</EmptyState>
      )}

      {/* Stuck loading fallback */}
      {loading && backendOk === false && (
        <EmptyState>Story hasn't rendered yet.</EmptyState>
      )}

      {/* All-passing + no findings at all */}
      {!loading && !error && total === 0 && (
        <EmptyState>
          No charters or rules evaluated for this story.
          {' '}<a href="https://emdesign.dev/docs/research/story-charters" target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>Learn about charters →</a>
        </EmptyState>
      )}

      {/* Section rows */}
      {!loading && total > 0 && (
        <>
          {SECTIONS.map((sec) => {
            const findings = sec.getFindings(sectionData);
            const passed = countPassed(findings);
            const failed = findings.length - passed;
            const isCollapsed = collapsed.has(sec.key);

            // Skip empty sections
            if (findings.length === 0 && sec.key !== 'rendered') return null;
            // Always show rendered if it has data
            if (findings.length === 0 && sec.key === 'rendered') {
              // Show rendered only if there are rendered rules (tier exists)
              const hasRendered = apiTiers?.rendered !== undefined;
              if (!hasRendered) return null;
            }

            return (
              <div key={sec.key} style={{ marginBottom: 10 }}>
                <SectionHeader
                  $open={!isCollapsed}
                  onClick={() => toggle(sec.key)}
                >
                  <Chevron $open={!isCollapsed}>▶</Chevron>
                  {sec.icon} {sec.label}
                  {sec.key === 'rendered' && renderViewport && (
                    <Muted style={{ fontSize: 10 }}>
                      @{renderViewport.width}×{renderViewport.height}
                    </Muted>
                  )}
                  <SectionStats>
                    {findings.length > 0 && (
                      <>
                        <span style={{ color: '#2ecc71' }}>{passed}✓</span>
                        {failed > 0 && <span style={{ color: '#e74c3c' }}>{failed}✗</span>}
                      </>
                    )}
                    {findings.length === 0 && <Muted>0 rules</Muted>}
                  </SectionStats>
                </SectionHeader>

                {!isCollapsed && findings.length === 0 && (
                  <div style={{ padding: '8px 10px' }}>
                    <Muted>No rules evaluated in this tier.</Muted>
                  </div>
                )}

                {!isCollapsed && findings.length > 0 && (
                  <FindingsList>
                    {findings.map((f) => (
                      <FindingRow key={f.id} $pass={f.pass}>
                        <Icon $pass={f.pass} $severity={f.severity}>
                          {statusIcon(f.pass, f.severity)}
                        </Icon>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <Row gap={8} wrap>
                            <FindingName title={f.title}>{f.title}</FindingName>
                            <Pill tone={f.pass ? 'ok' : sevTone(f.severity)}>
                              {f.severity}
                            </Pill>
                            <Pill tone={f.pass ? 'ok' : 'bad'} style={{ fontSize: 10 }}>
                              {f.pass ? 'PASS' : 'FAIL'}
                            </Pill>
                          </Row>
                          {f.message && (
                            <FindingMessage>{f.message}</FindingMessage>
                          )}
                          {f.fix && !f.pass && (
                            <FindingFix>{f.fix}</FindingFix>
                          )}
                        </div>
                      </FindingRow>
                    ))}
                  </FindingsList>
                )}
              </div>
            );
          })}
        </>
      )}
    </Page>
  );
}
