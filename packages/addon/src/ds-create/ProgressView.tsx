import React, { useEffect, useRef, useState } from 'react';
import { styled } from '@storybook/theming';
import { getWorkflowStreamUrl, cancelWorkflow } from '../api';
import { Section, SectionTitle, Row, Muted, Btn, Pill } from '../ui';
import type { WorkflowStage, WorkflowStageStatus } from '../constants';

const StageList = styled.div({ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 });

const StageRow = styled.div<{ $status: WorkflowStageStatus }>(({ theme, $status }) => ({
  display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px',
  borderRadius: theme.appBorderRadius,
  background: $status === 'running' ? `${theme.color.secondary}11` : 'transparent',
  fontSize: 13,
}));

const StatusIcon = styled.span<{ $status: WorkflowStageStatus }>(({ $status }) => ({
  width: 18, textAlign: 'center', fontSize: 14,
  color: $status === 'error' ? '#e03'
    : $status === 'done' ? '#2a8'
    : $status === 'running' ? '#68c'
    : '#999',
}));

const StageName = styled.span({ flex: 1 });
const Elapsed = styled(Muted)({ fontSize: 11 });

const PROMPT_STAGES: WorkflowStage[] = [
  { id: 0, name: 'Analyzing', status: 'pending' },
  { id: 1, name: 'Generating DESIGN.md', status: 'pending' },
  { id: 2, name: 'Generating tokens.css', status: 'pending' },
  { id: 3, name: 'Scaffolding', status: 'pending' },
  { id: 4, name: 'Building graph', status: 'pending' },
  { id: 5, name: 'Validating', status: 'pending' },
];

const MD_STAGES: WorkflowStage[] = [
  { id: 0, name: 'Parsing DESIGN.md', status: 'pending' },
  { id: 1, name: 'Extracting tokens', status: 'pending' },
  { id: 2, name: 'Scaffolding', status: 'pending' },
  { id: 3, name: 'Building graph', status: 'pending' },
  { id: 4, name: 'Validating', status: 'pending' },
];

const IMPORT_STAGES: WorkflowStage[] = [
  { id: 0, name: 'Fetching DESIGN.md', status: 'pending' },
  { id: 1, name: 'Parsing frontmatter', status: 'pending' },
  { id: 2, name: 'Generating tokens.css', status: 'pending' },
  { id: 3, name: 'Scaffolding primitives', status: 'pending' },
  { id: 4, name: 'Generating preview', status: 'pending' },
  { id: 5, name: 'Validating', status: 'pending' },
];

const statusIcon: Record<WorkflowStageStatus, string> = {
  pending: '○',
  running: '↻',
  done: '✓',
  error: '✗',
};

interface ProgressViewProps {
  sessionId: string;
  creationMode: 'from-prompt' | 'design-md' | 'import-awesome';
  onComplete?: (id: string) => void;
  onError?: (err: Error) => void;
}

export function ProgressView({ sessionId, creationMode, onComplete, onError }: ProgressViewProps) {
  const stages = useRef<WorkflowStage[]>(
    creationMode === 'from-prompt'
      ? PROMPT_STAGES.map((s) => ({ ...s }))
      : MD_STAGES.map((s) => ({ ...s }))
  );
  const [displayStages, setDisplayStages] = useState<WorkflowStage[]>([...stages.current]);
  const [workflowStatus, setWorkflowStatus] = useState<'running' | 'completed' | 'failed'>('running');
  const [error, setError] = useState<string | null>(null);
  const [startTime] = useState(Date.now());
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const url = getWorkflowStreamUrl(sessionId);
    if (!url) return;

    const es = new EventSource(url);
    esRef.current = es;

    es.addEventListener('stage', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data) as { id: number; status: WorkflowStageStatus; detail?: string };
        stages.current = stages.current.map((s) =>
          s.id === data.id ? { ...s, status: data.status, detail: data.detail, startedAt: s.startedAt ?? (data.status === 'running' ? Date.now() : undefined) } : s
        );
        setDisplayStages([...stages.current]);
      } catch { /* ignore malformed */ }
    });

    es.addEventListener('done', () => {
      setWorkflowStatus('completed');
      onComplete?.(sessionId);
      es.close();
    });

    es.addEventListener('error', () => {
      // EventSource auto-reconnects; if it fails we surface an error
      if (es.readyState === EventSource.CLOSED) {
        setError('Connection lost');
        setWorkflowStatus('failed');
        onError?.(new Error('SSE connection lost'));
      }
    });

    return () => { es.close(); esRef.current = null; };
  }, [sessionId, creationMode, onComplete, onError]);

  const handleCancel = async () => {
    try {
      await cancelWorkflow(sessionId);
      setWorkflowStatus('failed');
    } catch { /* ignore */ }
  };

  const handleRetry = () => {
    setError(null);
    setWorkflowStatus('running');
    // Re-run effect by letting the component remount
  };

  if (error) {
    return (
      <Section>
        <SectionTitle>Generation Progress</SectionTitle>
        <Row gap={8} style={{ marginTop: 8 }}>
          <Pill tone="bad">error</Pill>
          <Muted>Connection lost — <a href="#" onClick={(e) => { e.preventDefault(); handleRetry(); }}>retry</a></Muted>
        </Row>
      </Section>
    );
  }

  return (
    <Section>
      <SectionTitle>Generation Progress</SectionTitle>
      <StageList>
        {displayStages.map((stage) => (
          <StageRow key={stage.id} $status={stage.status} title={stage.detail}>
            <StatusIcon $status={stage.status}>{statusIcon[stage.status]}</StatusIcon>
            <StageName>{stage.name}</StageName>
            {stage.startedAt && <Elapsed>{Math.round((Date.now() - stage.startedAt) / 1000)}s</Elapsed>}
          </StageRow>
        ))}
      </StageList>
      <Row gap={8} style={{ marginTop: 12 }}>
        <Btn
          disabled={workflowStatus === 'completed' || workflowStatus === 'failed'}
          onClick={handleCancel}
        >Cancel</Btn>
      </Row>
    </Section>
  );
}
