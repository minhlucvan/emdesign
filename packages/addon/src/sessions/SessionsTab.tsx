/**
 * Sessions tab — browse Claude Code sessions and view conversations.
 * Adapted from claude-run (MIT, github.com/nilbuild/claude-run).
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../api';
import { useEventSource } from '../useSessionSSE';
import { BACKEND_URL } from '../constants';
import type { SessionSummary } from '../constants';

// ── Helpers ──────────────────────────────────────────────────────────

function formatTime(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60_000) return 'just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h`;
  return `${Math.floor(diff / 86_400_000)}d`;
}

function sanitizeText(text: string): string {
  return text
    .replace(/<\/?(command-name|system-reminder|local-command-caveat)[^>]*>/gi, '')
    .replace(/Caveat:.*?assume otherwise\./s, '')
    .trim();
}

// ── Session List ─────────────────────────────────────────────────────

function SessionList({
  sessions,
  selectedId,
  onSelect,
  loading,
}: {
  sessions: SessionSummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  loading: boolean;
}) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return sessions;
    const q = search.toLowerCase();
    return sessions.filter(
      (s) =>
        s.display.toLowerCase().includes(q) ||
        s.projectName.toLowerCase().includes(q),
    );
  }, [sessions, search]);

  if (loading) {
    return (
      <div style={{ padding: 20, textAlign: 'center', color: '#888' }}>
        Loading sessions...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '8px 12px', borderBottom: '1px solid #333' }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search sessions..."
          style={{
            width: '100%',
            padding: '6px 8px',
            borderRadius: 4,
            border: '1px solid #444',
            background: '#1a1a2e',
            color: '#ccc',
            fontSize: 12,
          }}
        />
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: 20, textAlign: 'center', color: '#666', fontSize: 12 }}>
            {search ? 'No sessions match' : 'No sessions found'}
          </div>
        ) : (
          filtered.map((s) => (
            <button
              key={s.id}
              onClick={() => onSelect(s.id)}
              style={{
                display: 'block',
                width: '100%',
                padding: '10px 12px',
                textAlign: 'left',
                border: 'none',
                borderBottom: '1px solid #2a2a3e',
                background: selectedId === s.id ? '#2a3a5e' : 'transparent',
                color: '#ccc',
                cursor: 'pointer',
                fontSize: 12,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 10, color: '#888' }}>{s.projectName}</span>
                <span style={{ fontSize: 10, color: '#666' }}>{formatTime(s.timestamp)}</span>
              </div>
              <div style={{ fontSize: 11, lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {s.display}
              </div>
              {s.emdesignStatus && (
                <span style={{
                  display: 'inline-block',
                  marginTop: 4,
                  padding: '1px 6px',
                  borderRadius: 8,
                  fontSize: 9,
                  fontWeight: 600,
                  background: s.emdesignStatus === 'running' ? '#1a6b3c' : s.emdesignStatus === 'completed' ? '#1a4b6b' : '#5a3a1a',
                  color: '#fff',
                }}>
                  {s.emdesignStatus}
                </span>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}

// ── Conversation View ────────────────────────────────────────────────

function ConversationView({ sessionId }: { sessionId: string }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getSessionConversation(sessionId).then((msgs) => {
      setMessages(msgs);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [sessionId]);

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>
        Loading conversation...
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>
        No messages in this session
      </div>
    );
  }

  return (
    <div style={{ padding: 16, margin: '0 auto' }}>
      {messages.map((msg: any, i: number) => (
        <div key={msg.uuid || i} style={{ marginBottom: 16 }}>
          <div style={{
            padding: '2px 8px',
            borderRadius: 4,
            fontSize: 10,
            fontWeight: 600,
            textTransform: 'uppercase',
            color: msg.type === 'user' ? '#8af' : '#8f8',
            marginBottom: 4,
          }}>
            {msg.type}
          </div>
          <div style={{
            padding: '8px 12px',
            borderRadius: 8,
            background: msg.type === 'user' ? '#1a1a3e' : '#1a2a1a',
            fontSize: 13,
            lineHeight: 1.5,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}>
            {renderContent(msg.message?.content)}
          </div>
        </div>
      ))}
    </div>
  );
}

function renderContent(content: any): React.ReactNode {
  if (!content) return null;
  if (typeof content === 'string') return <span>{sanitizeText(content)}</span>;
  if (Array.isArray(content)) {
    return content.map((block: any, i: number) => {
      if (block.type === 'text') return <span key={i}>{sanitizeText(block.text ?? '')}</span>;
      if (block.type === 'tool_use') {
        return (
          <div key={i} style={{ margin: '4px 0', padding: '4px 8px', background: '#222', borderRadius: 4, fontSize: 11 }}>
            <strong style={{ color: '#fa0' }}>{block.name}</strong>
            {block.input ? ` ${JSON.stringify(block.input).slice(0, 200)}` : ''}
          </div>
        );
      }
      if (block.type === 'tool_result') {
        const result = typeof block.content === 'string' ? block.content : JSON.stringify(block.content);
        return (
          <div key={i} style={{ margin: '4px 0', padding: '4px 8px', background: '#1a1a1a', borderRadius: 4, fontSize: 11, color: '#aaa' }}>
            {result?.slice(0, 300)}
          </div>
        );
      }
      if (block.type === 'thinking') {
        return (
          <div key={i} style={{ margin: '4px 0', padding: '4px 8px', background: '#1a1a2a', borderRadius: 4, fontSize: 11, color: '#888', fontStyle: 'italic' }}>
            {block.thinking?.slice(0, 200)}
          </div>
        );
      }
      return null;
    });
  }
  return JSON.stringify(content).slice(0, 500);
}

// ── Main Sessions Tab ────────────────────────────────────────────────

export function SessionsTab() {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [emdesignSessions, setEmdesignSessions] = useState<SessionSummary[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'conversation'>('list');

  // Load initial session list
  useEffect(() => {
    api.listSessions().then((res) => {
      setSessions(res.claudeSessions ?? []);
      setEmdesignSessions(res.emdesignSessions ?? []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // SSE for real-time updates
  const handleSessionsUpdate = useCallback((event: MessageEvent) => {
    try {
      const updates: SessionSummary[] = JSON.parse(event.data);
      setSessions((prev) => {
        const map = new Map(prev.map((s) => [s.id, s]));
        for (const update of updates) map.set(update.id, update);
        return Array.from(map.values()).sort((a, b) => b.timestamp - a.timestamp);
      });
    } catch { /* ignore */ }
  }, []);

  const handleSessionsFull = useCallback((event: MessageEvent) => {
    try {
      const data: SessionSummary[] = JSON.parse(event.data);
      setSessions(data);
      setLoading(false);
    } catch { /* ignore */ }
  }, []);

  useEventSource(`${BACKEND_URL}/api/sessions/stream`, {
    events: [
      { eventName: 'sessions', onMessage: handleSessionsFull },
      { eventName: 'sessionsUpdate', onMessage: handleSessionsUpdate },
    ],
    onError: () => setLoading(false),
  });

  // Merge all sessions
  const allSessions = useMemo(() => {
    const map = new Map<string, SessionSummary>();
    for (const s of sessions) map.set(s.id, s);
    for (const s of emdesignSessions) map.set(s.id, s);
    return Array.from(map.values()).sort((a, b) => b.timestamp - a.timestamp);
  }, [sessions, emdesignSessions]);

  const selected = allSessions.find((s) => s.id === selectedSession);

  if (view === 'conversation' && selectedSession) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '8px 16px', borderBottom: '1px solid #333', gap: 8 }}>
          <button
            onClick={() => { setView('list'); setSelectedSession(null); }}
            style={{ background: 'none', border: '1px solid #444', color: '#ccc', borderRadius: 4, padding: '4px 8px', cursor: 'pointer', fontSize: 11 }}
          >
            ← Back
          </button>
          <span style={{ fontSize: 12, color: '#aaa' }}>{selected?.projectName}</span>
          <span style={{ fontSize: 11, color: '#888' }}>{selected?.display}</span>
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>
          <ConversationView sessionId={selectedSession} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100%', background: '#0d0d1a', color: '#ccc' }}>
      <div style={{ minWidth: 240, maxWidth: '35%', flex: 1.5, borderRight: '1px solid #333', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '10px 12px', borderBottom: '1px solid #333', fontSize: 13, fontWeight: 600 }}>
          Claude Sessions
        </div>
        <SessionList
          sessions={allSessions}
          selectedId={selectedSession}
          onSelect={(id) => { setSelectedSession(id); setView('conversation'); }}
          loading={loading}
        />
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontSize: 13 }}>
        Select a session from the list to view the conversation
      </div>
    </div>
  );
}
