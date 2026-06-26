import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { addons, types } from '@storybook/manager-api';
import { AddonPanel } from '@storybook/components';
import {
  ADDON_ID, PANEL_ID, DS_TAB_ID, CREATE_TAB_ID, TOOL_ID,
  VIEW_MODE_DS, VIEW_MODE_CREATE,
} from './constants';
import { EVT_CHAT_MODE } from './channel';
import { SystemTab } from './SystemTab';
import { DesignSystemTab } from './DesignSystemTab';
import { CreateWizard } from './CreateWizard';
import { Tool } from './Tool';
import { ChatSidebar } from './sessions/ChatSidebar';

// ── CSS injection for chat mode ─────────────────────────────────────

const CHAT_CSS_ID = 'emdesign-chat-css';

// Only hide the story tree elements — no color/border overrides.
// ChatSidebar inherits all styling from the sidebar container.
const chatCss = `
  .emdesign-chat-active #storybook-explorer-tree,
  .emdesign-chat-active .sidebar-subheading,
  .emdesign-chat-active .sidebar-item,
  .emdesign-chat-active #storybook-explorer-searchfield {
    display: none !important;
  }
  .emdesign-chat-active [class*="sidebar"]::-webkit-scrollbar { width: 6px; }
  .emdesign-chat-active [class*="sidebar"]::-webkit-scrollbar-track { background: transparent; }
  .emdesign-chat-active [class*="sidebar"]::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
  .emdesign-chat-active [class*="sidebar"]::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
`;

function injectChatCSS(enabled: boolean) {
  let style = document.getElementById(CHAT_CSS_ID);
  if (!enabled) {
    document.body.classList.remove('emdesign-chat-active');
    style?.remove();
    return;
  }
  if (!style) {
    style = document.createElement('style');
    style.id = CHAT_CSS_ID;
    style.textContent = chatCss;
    document.head.appendChild(style);
  }
  document.body.classList.add('emdesign-chat-active');
}

// ── Chat Mode Controller ───────────────────────────────────────────

function ChatModeController() {
  const [visible, setVisible] = useState(false);
  const [sidebarEl, setSidebarEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const channel = addons.getChannel();
    const handler = (evt: { enabled: boolean }) => {
      setVisible(evt.enabled);
      injectChatCSS(evt.enabled);
    };
    channel.on(EVT_CHAT_MODE, handler);
    return () => channel.off(EVT_CHAT_MODE, handler);
  }, []);

  useEffect(() => {
    // Find the sidebar container element
    const findSidebar = () => {
      const el = document.querySelector('[class*="sidebar"]') as HTMLElement | null;
      if (el) setSidebarEl(el);
    };
    findSidebar();
    // Retry after a short delay in case the DOM isn't ready
    const t = setTimeout(findSidebar, 500);
    return () => clearTimeout(t);
  }, []);

  if (!visible || !sidebarEl) return null;

  // Portal ChatSidebar into the sidebar container — no custom colors, inherits sidebar CSS
  return createPortal(
    <div style={{ position: 'absolute', inset: 0, zIndex: 100, overflow: 'hidden', display: 'flex', flexDirection: 'column', font: 'inherit' }}>
      <ChatSidebar />
    </div>,
    sidebarEl
  );
}

/**
 * emdesign manager UI:
 *  - TOOL   (toolbar)      → comment · copy · pen tools + Chat toggle + "+ Create" jump
 *  - PANEL  (bottom drawer)→ Emdesign — system/status/logs dashboard (includes Services)
 *  - TAB    System         → browse + edit design systems
 *  - TAB    + Create       → the creation wizard
 *  - CHAT   (portal)       → ChatSidebar rendered into sidebar when chat mode is on
 * Each TAB owns a viewMode + route so it is a top-level surface with its own URL.
 */
const tabRoute = (vm: string) => ({ storyId, refId }: { storyId?: string; refId?: string }) =>
  refId ? `/${vm}/${refId}_${storyId ?? ''}` : `/${vm}/${storyId ?? ''}`;

addons.register(ADDON_ID, () => {
  addons.add(TOOL_ID, {
    type: types.TOOL,
    title: 'emdesign tools',
    match: ({ viewMode }) => viewMode === 'story',
    render: () => <Tool />,
  });

  addons.add(PANEL_ID, {
    type: types.PANEL,
    title: 'Emdesign',
    match: ({ viewMode }) => viewMode === 'story',
    render: ({ active }) => (
      <AddonPanel active={!!active}>
        <SystemTab />
      </AddonPanel>
    ),
  });

  addons.add(DS_TAB_ID, {
    type: types.TAB,
    title: 'System',
    route: tabRoute(VIEW_MODE_DS),
    match: ({ viewMode }) => viewMode === VIEW_MODE_DS,
    render: ({ active }) => (active ? <DesignSystemTab /> : null),
  });

  addons.add(CREATE_TAB_ID, {
    type: types.TAB,
    title: '+ Create',
    route: tabRoute(VIEW_MODE_CREATE),
    match: ({ viewMode }) => viewMode === VIEW_MODE_CREATE,
    render: ({ active }) => (active ? <CreateWizard /> : null),
  });

  // Chat mode controller — renders SessionsTab into sidebar via portal when chat toggled on
  addons.add(`emdesign-chat`, {
    type: types.TOOLEXTRA as any,
    match: () => true,
    render: () => <ChatModeController />,
  } as any);
});
