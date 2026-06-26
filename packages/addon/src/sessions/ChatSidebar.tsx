/**
 * ChatSidebar — shadcn-chatbot-kit styled. Messages fill available space.
 */
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { injectShadcnVars, css, MessageList, useAutoScroll } from '@emdesign/chat-ui';
import type { Message } from '@emdesign/chat-ui';
import { api } from '../api';
import { BACKEND_URL } from '../constants';
import type { SessionSummary } from '../constants';

let varsInjected = false;

function formatTime(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60_000) return 'now';
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

function extractText(content: any): string {
  if (!content) return '';
  if (typeof content === 'string') return sanitizeText(content);
  if (Array.isArray(content)) {
    return content
      .filter((b: any) => b.type === 'text')
      .map((b: any) => sanitizeText(b.text ?? ''))
      .join('\n');
  }
  return '';
}

/**
 * Process Claude conversation messages sequentially.
 * Groups consecutive tool-only messages into a single collapsible "tool group".
 */
function processMessages(rawMessages: any[]): Message[] {
  const result: Message[] = [];
  const pendingTools: any[] = []; // tool_use waiting for tool_result
  let pendingToolGroup: Message | null = null; // accumulating tool-only messages

  function flushToolGroup() {
    if (!pendingToolGroup) return;
    const calls = pendingToolGroup.toolCalls || [];
    if (!calls.length) { pendingToolGroup = null; return; }
    const hasResults = calls.some((t: any) => t.state === 'result');
    if (hasResults) result.push(pendingToolGroup);
    pendingToolGroup = null;
  }

  for (const raw of rawMessages) {
    if (raw.type !== 'user' && raw.type !== 'assistant') continue;
    const isUser = raw.type === 'user';
    const blocks = raw.message?.content;

    let text = '';
    let reasoning: string | undefined;
    let hasText = false;

    if (typeof blocks === 'string') {
      text = sanitizeText(blocks);
      hasText = !!text;
    } else if (Array.isArray(blocks)) {
      for (const block of blocks) {
        if (block.type === 'text' && block.text?.trim()) {
          text += (text ? '\n\n' : '') + sanitizeText(block.text);
          hasText = true;
        } else if (block.type === 'thinking' && block.thinking?.trim()) {
          reasoning = block.thinking;
        } else if (block.type === 'tool_use') {
          pendingTools.push({ state: 'call', toolName: block.name || 'unknown', result: block.input || {} });
        } else if (block.type === 'tool_result') {
          const content = typeof block.content === 'string'
            ? block.content
            : Array.isArray(block.content)
              ? block.content.map((c: any) => typeof c === 'string' ? c : c.text || '').join('\n')
              : '';
          const pending = pendingTools.find(t => t.state === 'call');
          if (pending) {
            pending.state = 'result';
            pending.result = { output: content.trim().slice(0, 500) };
          }
        }
      }
    }

    // Collect completed tools
    const completed = pendingTools.filter(t => t.state === 'result');
    pendingTools.splice(0, pendingTools.length, ...pendingTools.filter(t => t.state !== 'result'));

    // Helper: accumulate tool results into the pending tool group
    const accumulateTools = () => {
      const toolCalls = [
        ...completed.map(t => ({ state: 'result' as const, toolName: t.toolName, result: t.result })),
        ...pendingTools.filter(t => t.state === 'call').map(t => ({ state: 'call' as const, toolName: t.toolName, result: t.result })),
      ];
      if (toolCalls.length === 0) return;
      if (!pendingToolGroup) {
        pendingToolGroup = {
          id: `tg-${Date.now()}-${Math.random()}`,
          role: 'assistant', content: '',
          createdAt: raw.timestamp ? new Date(raw.timestamp) : undefined,
          toolCalls: [],
        };
      }
      for (const tc of toolCalls) pendingToolGroup.toolCalls!.push(tc);
    };

    // User messages: flush tool group, create message (skip empty tool-result-only)
    if (isUser) {
      accumulateTools(); // save any completed tools before skipping
      flushToolGroup();
      if (hasText) {
        result.push({
          id: raw.uuid || `u-${Date.now()}-${Math.random()}`,
          role: 'user', content: text,
          createdAt: raw.timestamp ? new Date(raw.timestamp) : undefined,
        });
      }
      continue;
    }

    // Tool-only assistant message: accumulate into tool group
    if (!hasText) {
      accumulateTools();
      continue;
    }

    // Has text: flush tool group, create message with any completed tools
    flushToolGroup();
    const msg: Message = {
      id: raw.uuid || `a-${Date.now()}-${Math.random()}`,
      role: 'assistant',
      content: text,
      createdAt: raw.timestamp ? new Date(raw.timestamp) : undefined,
      reasoning,
    };
    if (completed.length > 0) {
      msg.toolCalls = completed.map(t => ({
        state: 'result' as const,
        toolName: t.toolName,
        result: t.result,
      }));
    }
    result.push(msg);
  }

  flushToolGroup();

  // Post-process: merge consecutive tool-only messages into one group
  const merged: Message[] = [];
  let toolAccumulator: Message | null = null;
  for (const msg of result) {
    if (!msg.content && msg.toolCalls?.length && msg.role === 'assistant') {
      // Tool-only message — merge
      if (!toolAccumulator) {
        toolAccumulator = { ...msg, toolCalls: [...(msg.toolCalls || [])] };
      } else {
        toolAccumulator.toolCalls = [...(toolAccumulator.toolCalls || []), ...(msg.toolCalls || [])];
      }
    } else {
      if (toolAccumulator) {
        merged.push(toolAccumulator);
        toolAccumulator = null;
      }
      merged.push(msg);
    }
  }
  if (toolAccumulator) merged.push(toolAccumulator);

  return merged;
}

// ── Styles ─────────────────────────────────────────────────────────

const rootStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', color: css('--foreground'), background: css('--background') };
const S = {
  border: { borderBottom: `1px solid ${css('--border')}` },
  muted: { color: css('--muted-foreground') },
  input: {
    width: '100%', padding: '5px 8px', borderRadius: 'var(--radius)', fontSize: 11,
    border: `1px solid ${css('--input')}`, background: css('--background'),
    color: css('--foreground'), outline: 'none', boxSizing: 'border-box' as const,
  },
  header: {
    display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px',
    borderBottom: `1px solid ${css('--border')}`, fontSize: 10, fontWeight: 700,
    textTransform: 'uppercase' as const, letterSpacing: '0.05em', color: css('--muted-foreground'), flexShrink: 0 as const,
  },
};

export function ChatSidebar() {
  if (!varsInjected) { injectShadcnVars(); varsInjected = true; }

  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [emSessions, setEmSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [files, setFiles] = useState<File[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([
      api.listSessions(),
      api.getHealth().catch(() => null),
    ]).then(([r, health]) => {
      const root = health?.paths?.root ?? '';
      // Only show sessions belonging to this project workspace
      const allRaw = r.claudeSessions ?? [];
      const filtered = root ? allRaw.filter((s: any) => s.project && s.project.startsWith(root)) : allRaw;
      setSessions(filtered);
      setEmSessions(r.emdesignSessions ?? []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!activeSessionId) { setMessages([]); return; }
    setMsgLoading(true);
    api.getSessionConversation(activeSessionId).then((raw: any) => {
      const converted = processMessages(raw as any[]);
      setMessages(converted);
      setMsgLoading(false);
    }).catch(() => setMsgLoading(false));
  }, [activeSessionId]);

  const allSessions = useMemo(() => {
    const map = new Map<string, SessionSummary>();
    for (const s of sessions) map.set(s.id, s);
    for (const s of emSessions) map.set(s.id, s);
    return Array.from(map.values()).sort((a, b) => b.timestamp - a.timestamp);
  }, [sessions, emSessions]);

  const filtered = useMemo(() => {
    if (!search.trim()) return allSessions;
    const q = search.toLowerCase();
    return allSessions.filter(s => s.display.toLowerCase().includes(q) || s.projectName.toLowerCase().includes(q));
  }, [allSessions, search]);

  const activeSession = activeSessionId ? allSessions.find(s => s.id === activeSessionId) : null;

  const uploadFiles = useCallback(async (fileList: File[]): Promise<string[]> => {
    const paths: string[] = [];
    for (const file of fileList) {
      const form = new FormData();
      form.append('file', file);
      try {
        const res = await fetch(`${BACKEND_URL}/api/upload`, { method: 'POST', body: form });
        const data = await res.json();
        if (data.ok) paths.push(data.path);
      } catch (e) {
        console.error('Upload failed:', file.name, e);
      }
    }
    return paths;
  }, []);

  // Send message → stream response from Claude via SSE
  const handleSend = useCallback(async () => {
    if ((!input.trim() && !files?.length) || sending) return;
    const text = input.trim();
    const currentFiles = files;
    setInput('');
    setSending(true);

    // Add user message
    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', content: text || '(file upload)', createdAt: new Date() };
    setMessages(prev => [...prev, userMsg]);

    // Add placeholder assistant message for streaming
    const asstId = `a-${Date.now()}`;
    setMessages(prev => [...prev, { id: asstId, role: 'assistant', content: '', createdAt: new Date() }]);

    try {
      let extra = '';
      if (currentFiles?.length) {
        const paths = await uploadFiles(currentFiles);
        if (paths.length) extra = `\n\nAttached:\n${paths.map(p => `- ${p}`).join('\n')}`;
      }
      setFiles(null);

      const res = await fetch(`${BACKEND_URL}/api/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text + extra }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const reader = res.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';
      let assistantText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === 'text') {
              assistantText += data.text;
              setMessages(prev => prev.map(m => m.id === asstId ? { ...m, content: assistantText } : m));
            } else if (data.type === 'error') {
              setMessages(prev => prev.map(m => m.id === asstId ? { ...m, content: `Error: ${data.error}` } : m));
            }
          } catch { /* skip */ }
        }
      }

      if (!assistantText) {
        setMessages(prev => prev.map(m => m.id === asstId ? { ...m, content: '(no response)' } : m));
      }
    } catch (e) {
      setMessages(prev => prev.map(m =>
        m.id === asstId ? { ...m, content: `Error: ${(e as Error).message}` } : m
      ));
    }
    setSending(false);
  }, [input, files, sending, uploadFiles]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value), []);

  // Auto-scroll for message area
  const { containerRef: msgRef, handleScroll: msgScroll } = useAutoScroll([messages, msgLoading, activeSessionId]);
  const { containerRef: listRef, handleScroll: listScroll } = useAutoScroll([filtered]);

  if (loading) return <div className="emdesign-chat-root" style={{ ...rootStyle, padding: 20, textAlign: 'center', fontSize: 12, ...S.muted }}>Loading...</div>;

  return (
    <div className="emdesign-chat-root" style={rootStyle}>

      {/* ── Header ── */}
      <div style={S.header}>
        {activeSession ? (
          <>
            <button onClick={() => setActiveSessionId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 12, ...S.muted }}>←</button>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, textTransform: 'none', fontWeight: 400 }}>{activeSession.display}</span>
          </>
        ) : (
          <>Sessions</>
        )}
      </div>

      {/* ── Session list ── */}
      {!activeSession ? (
        <>
          <div style={{ padding: '4px 8px', ...S.border }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter sessions..." style={S.input} />
          </div>
          <div ref={listRef} onScroll={listScroll} className="emdesign-scroll" style={{ flex: 1, overflow: 'auto' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', fontSize: 12, ...S.muted }}>{search ? 'No matches' : 'No sessions'}</div>
            ) : (
              filtered.slice(0, 50).map(s => (
                <button key={s.id} onClick={() => setActiveSessionId(s.id)}
                  style={{ display: 'flex', alignItems: 'center', width: '100%', textAlign: 'left', padding: '10px 12px', border: 'none', ...S.border, background: 'transparent', color: 'inherit', cursor: 'pointer', gap: 8 }}>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: css('--foreground'), overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.4 }}>{s.display}</div>
                  </div>
                  <span style={{ fontSize: 10, color: css('--muted-foreground'), opacity: 0.5, whiteSpace: 'nowrap', flexShrink: 0 }}>{formatTime(s.timestamp)}</span>
                </button>
              ))
            )}
          </div>
        </>
      ) : (
        /* ── Conversation view ── */
        <>
          <div ref={msgRef} onScroll={msgScroll} className="emdesign-scroll" style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
            {msgLoading ? (
              <div style={{ padding: 20, textAlign: 'center', fontSize: 12, ...S.muted }}>Loading...</div>
            ) : messages.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', fontSize: 12, ...S.muted }}>No messages in this session</div>
            ) : (
              <MessageList messages={messages} isTyping={sending} />
            )}
          </div>

          {/* ── Input ── */}
          <div style={{ padding: '6px 8px', borderTop: `1px solid ${css('--border')}`, flexShrink: 0 }}>
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
              <input ref={fileInputRef} type="file" multiple onChange={(e) => { if (e.target.files) setFiles(Array.from(e.target.files)); e.target.value = ''; }} style={{ display: 'none' }} />
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 6 }}>
                <textarea value={input} onChange={handleInputChange}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="Type a message..." rows={1}
                  style={{
                    flex: 1, resize: 'none', padding: '7px 10px', borderRadius: 'var(--radius)',
                    border: `1px solid ${css('--input')}`, background: css('--background'),
                    color: css('--foreground'), fontSize: 12, lineHeight: 1.4, fontFamily: 'inherit',
                    outline: 'none', maxHeight: 80, overflow: 'auto',
                  }} />
                <button type="button" onClick={() => fileInputRef.current?.click()} title="Attach file"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: 'var(--radius)', border: `1px solid ${css('--border')}`, background: 'transparent', color: css('--muted-foreground'), cursor: 'pointer', flexShrink: 0 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                </button>
                {sending ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: 'var(--radius)', background: css('--muted'), flexShrink: 0 }}>
                    <span style={{ fontSize: 9, ...S.muted }}>...</span>
                  </div>
                ) : (
                  <button type="submit" disabled={!input.trim() && !files?.length}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: 'var(--radius)', border: 'none', flexShrink: 0,
                      background: input.trim() || files?.length ? css('--primary') : css('--muted'),
                      color: input.trim() || files?.length ? css('--primary-foreground') : css('--muted-foreground'),
                      cursor: input.trim() || files?.length ? 'pointer' : 'default', opacity: input.trim() || files?.length ? 1 : 0.5 }}>
                    ↑
                  </button>
                )}
              </div>
              {files && files.length > 0 && (
                <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                  {files.map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '1px 5px', borderRadius: 'var(--radius)', background: css('--muted'), fontSize: 9, color: css('--foreground') }}>
                      <span style={{ maxWidth: 70, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                      <button type="button" onClick={() => setFiles(prev => prev ? prev.filter((_, j) => j !== i) : null)} style={{ background: 'none', border: 'none', color: css('--muted-foreground'), cursor: 'pointer', padding: 0, fontSize: 10 }}>✕</button>
                    </div>
                  ))}
                </div>
              )}
            </form>
          </div>
        </>
      )}
    </div>
  );
}
