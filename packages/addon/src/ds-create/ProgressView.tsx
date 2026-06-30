import React, { useEffect, useRef, useState } from 'react';
import { styled } from '@storybook/theming';
import { addons } from '@storybook/manager-api';
import { EVT_CHAT_MODE } from '../channel';
import { api, cancelWorkflow } from '../api';
import { Section, SectionTitle, Row, Muted, Btn, Pill } from '../ui';

const AgentOutput = styled.div({
  maxHeight: 300, overflow: 'auto', marginTop: 12, padding: 8,
  background: '#1a1a1a', color: '#e0e0e0', borderRadius: 6,
  font: '12px/1.5 monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
});

const statusIcon: Record<string, string> = {
  created: '○',
  running: '↻',
  completed: '✓',
  failed: '✗',
};

interface ProgressViewProps {
  sessionId: string;
  creationMode: 'from-prompt' | 'design-md' | 'import-awesome';
  onComplete?: (id: string) => void;
  onError?: (err: Error) => void;
}

export function ProgressView({ sessionId, creationMode, onComplete, onError }: ProgressViewProps) {
  const [agentOutput, setAgentOutput] = useState<string[]>([]);
  const [sessionStatus, setSessionStatus] = useState<string>('running');
  const [sessionPhase, setSessionPhase] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [startTime] = useState(Date.now());
  const agentEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completedRef = useRef(false);

  // Auto-scroll agent output
  useEffect(() => {
    agentEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [agentOutput]);

  // Poll agent manager sessions API for status
  useEffect(() => {
    const poll = async () => {
      try {
        const r = await api.listSessions();
        // Find the session with matching ID in emdesignSessions
        const emSessions = (r as any).emdesignSessions ?? [];
        const match = emSessions.find((s: any) => s.id === sessionId);
        if (!match) return;

        setSessionStatus(match.emdesignStatus || 'running');
        if (match.emdesignPhase) setSessionPhase(match.emdesignPhase);

        // Check for completion
        if (match.emdesignStatus === 'completed' && !completedRef.current) {
          completedRef.current = true;
          if (pollRef.current) clearInterval(pollRef.current);
          onComplete?.(sessionId);
        }
        if (match.emdesignStatus === 'failed' && !completedRef.current) {
          completedRef.current = true;
          if (pollRef.current) clearInterval(pollRef.current);
          const errMsg = match.error || 'Workflow failed';
          setError(errMsg);
          onError?.(new Error(errMsg));
        }
      } catch { /* poll will retry */ }
    };

    poll(); // immediate first call
    pollRef.current = setInterval(poll, 2000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [sessionId, onComplete, onError]);

  // Also stream session logs via the WebSocket / event bus
  // (the agent manager pushes session:log events — captured by ChatSidebar)

  const handleCancel = async () => {
    try {
      await cancelWorkflow(sessionId);
      setSessionStatus('failed');
    } catch { /* ignore */ }
  };

  if (error) {
    return (
      <Section>
        <SectionTitle>Import Progress</SectionTitle>
        <Row gap={8} style={{ marginTop: 8 }}>
          <Pill tone="bad">error</Pill>
          <Muted>{error}</Muted>
        </Row>
      </Section>
    );
  }

  return (
    <Section>
      <SectionTitle>Import Progress</SectionTitle>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', fontSize: 13 }}>
        <span style={{ width: 18, textAlign: 'center', fontSize: 14, color: '#68c' }}>
          {statusIcon[sessionStatus] || '○'}
        </span>
        <span style={{ flex: 1 }}>{sessionPhase || sessionStatus}</span>
        <Muted style={{ fontSize: 11 }}>{Math.round((Date.now() - startTime) / 1000)}s</Muted>
      </div>

      {agentOutput.length > 0 && (
        <AgentOutput>
          {agentOutput.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
          <div ref={agentEndRef} />
        </AgentOutput>
      )}

      <Row gap={8} style={{ marginTop: 12 }}>
        <Btn
          disabled={sessionStatus === 'completed' || sessionStatus === 'failed'}
          onClick={handleCancel}
        >Cancel</Btn>
        <Btn onClick={() => {
          addons.getChannel().emit(EVT_CHAT_MODE, { enabled: true, sessionId });
        }}>View in Chat →</Btn>
      </Row>
    </Section>
  );
}
