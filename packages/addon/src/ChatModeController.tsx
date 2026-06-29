/**
 * ChatModeController — manages the chat sidebar toggle and panel.
 *
 * When chat is active, hides the story tree and preview panel, and renders
 * the ChatSidebar as an overlay in the sidebar container. A toggle button
 * is always portaled into the sidebar header.
 * Mounted from Tool.tsx (the toolbar component) since Storybook 8.x TOOLEXTRA
 * doesn't reliably render its children.
 */
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { addons } from '@storybook/manager-api';
import { EVT_CHAT_MODE } from './channel';
import { ChatSidebar } from './sessions/ChatSidebar';
import { injectChatCSS } from './services/chatCssService';

// ── Toggle button style ────────────────────────────────────────────

const toggleBtnStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 26,
  height: 26,
  borderRadius: 4,
  border: 'none',
  background: 'transparent',
  color: 'inherit',
  cursor: 'pointer',
  flexShrink: 0,
  marginLeft: 'auto',
  fontSize: 14,
  lineHeight: 1,
};

// ── Component ──────────────────────────────────────────────────────

export function ChatModeController() {
  const [visible, setVisible] = useState(false);
  const [contentEl, setContentEl] = useState<HTMLElement | null>(null);
  const [headerEl, setHeaderEl] = useState<HTMLElement | null>(null);
  const [pendingSessionId, setPendingSessionId] = useState<string | null>(null);

  // Listen for chat mode toggle (sessionId optionally embedded)
  useEffect(() => {
    const channel = addons.getChannel();
    const handler = (evt: { enabled: boolean; sessionId?: string }) => {
      setVisible(evt.enabled);
      if (evt.sessionId) setPendingSessionId(evt.sessionId);
      injectChatCSS(evt.enabled);
    };
    channel.on(EVT_CHAT_MODE, handler);
    return () => {
      channel.off(EVT_CHAT_MODE, handler);
      if (visible) injectChatCSS(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  useEffect(() => {
    const findElements = () => {
      // Target the inner content wrapper (below header) so chat flows naturally
      const content = document.querySelector('[class*="sidebar"] [data-radix-scroll-area-content] > div') as HTMLElement | null;
      if (content) setContentEl(content);
      const header = document.querySelector('.sidebar-header') as HTMLElement | null;
      if (header) setHeaderEl(header);
    };
    findElements();
    const t = setTimeout(findElements, 500);
    return () => clearTimeout(t);
  }, []);

  const toggleChat = () => {
    const next = !visible;
    // Only emit the event — the handler manages state + CSS
    const channel = addons.getChannel();
    channel.emit(EVT_CHAT_MODE, { enabled: next });
  };

  return (
    <>
      {/* Always-portaled toggle button into sidebar header */}
      {headerEl && createPortal(
        <button onClick={toggleChat}
          title={visible ? 'Close chat panel' : 'Open chat panel'}
          style={toggleBtnStyle}>
          {visible ? '✕' : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          )}
        </button>,
        headerEl
      )}
      {/* Chat panel portaled into the sidebar content area (below header, natural flow) */}
      {visible && contentEl && createPortal(
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', width: '100%', paddingTop: 16, margin: 0 }}>
          <ChatSidebar onClose={toggleChat} defaultSessionId={pendingSessionId} />
        </div>,
        contentEl
      )}
      {/* Clear pending session after passing it to ChatSidebar */}
      {pendingSessionId && setPendingSessionId(null)}
    </>
  );
}
