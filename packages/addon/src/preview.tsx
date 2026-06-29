import React, { useEffect, useRef, useState } from 'react';
import { addons } from '@storybook/preview-api';
import { EVT_TOOL_MODE, EVT_COMMENT_SUBMIT, EVT_TEXT_SUBMIT, EVT_CHAT_MODE, EVT_PLACE_TRIGGER, type ToolMode, type CommentTarget, type PlaceTriggerPayload, type PlacementMode } from './channel';
import { buildTarget } from './dom-utils';
import { toolRegistry } from './tools/registry';
import type { ToolContext, Pin } from './tools/types';

type Box = { x: number; y: number; width: number; height: number };
type PlaceZone = 'before' | 'after' | 'into' | 'replace' | null;

const ACCENT = '#2563eb';

/**
 * ToolOverlay — thin orchestrator that delegates tool behavior to the
 * tool registry. Tracks activeTool (via EVT_TOOL_MODE), maintains shared
 * state (pins, placeholders, toast), and renders shared chrome.
 */
export function ToolOverlay({ storyId, component }: { storyId?: string; component?: string }) {
  const [mode, setModeState] = useState<ToolMode>('off');
  const [hover, setHover] = useState<DOMRect | null>(null);
  const [hoverEl, setHoverEl] = useState<Element | null>(null);
  const [placeZone, setPlaceZone] = useState<PlaceZone>(null);
  const [composing, setComposing] = useState<{ target: CommentTarget; box: Box } | null>(null);
  const [placing, setPlacing] = useState<{ target: CommentTarget; box: Box; zone: PlacementMode } | null>(null);
  const [text, setText] = useState('');
  const [pins, setPins] = useState<Pin[]>([]);
  const [placeholders, setPlaceholders] = useState<Array<{ id: number; box: Box; description: string; zone: string; status: 'placing' | 'done' | 'error' }>>([]);
  const [toast, setToast] = useState<string | null>(null);
  const modeRef = useRef<ToolMode>('off');
  const composingRef = useRef(false);
  const editingRef = useRef<{ el: HTMLElement; from: string } | null>(null);
  const placingRef = useRef(false);
  const placeholderIdRef = useRef(0);

  const setMode = (m: ToolMode) => {
    modeRef.current = m;
    setModeState(m);
    if (m === 'off') { setHover(null); setPlaceZone(null); setHoverEl(null); composingRef.current = false; setComposing(null); setPlacing(null); setText(''); }
    document.body.style.cursor = m === 'off' ? '' : (m === 'wand' || m === 'place') ? 'copy' : 'crosshair';
  };
  const offAndSync = () => { setMode('off'); addons.getChannel().emit(EVT_TOOL_MODE, { mode: 'off' }); };
  const flash = (msg: string) => { setToast(msg); window.setTimeout(() => setToast(null), 1600); };

  // commit/cancel the inline text edit
  const endEdit = (commit: boolean) => {
    const e = editingRef.current;
    if (!e) return;
    const to = (e.el.textContent ?? '').trim();
    e.el.contentEditable = 'false';
    e.el.style.outline = '';
    if (commit && to && to !== e.from) {
      const target = buildTarget(e.el, document.getElementById('storybook-root') ?? document.body, storyId, component);
      addons.getChannel().emit(EVT_TEXT_SUBMIT, { target, from: e.from, to });
      flash('text edit queued');
    } else if (!commit) {
      e.el.textContent = e.from; // revert
    }
    editingRef.current = null;
    offAndSync();
  };

  // Listen for EVT_TOOL_MODE from the manager panel
  useEffect(() => {
    const channel = addons.getChannel();
    const onMode = (p: { mode: ToolMode }) => setMode(p?.mode ?? 'off');
    channel.on(EVT_TOOL_MODE, onMode);
    return () => { channel.off(EVT_TOOL_MODE, onMode); document.body.style.cursor = ''; };
  }, []);

  // Load stored comment pins when story changes
  useEffect(() => {
    setPins([]);
    setComposing(null);
    editingRef.current = null;
    if (storyId) {
      fetch(`http://localhost:4321/api/comments?storyId=${encodeURIComponent(storyId)}`)
        .then(r => r.json())
        .then(data => {
          if (data.pins?.length) {
            setPins(data.pins.map((p: any) => ({ n: p.n, box: undefined, text: p.text, sessionId: p.sessionId })));
          }
        })
        .catch(() => {});
    }
  }, [storyId]);

  // Build ToolContext for the active tool
  const buildCtx = (): ToolContext => ({
    hoverEl,
    storyId,
    component,
    pins,
    setPins,
    setToast: flash,
    offAndSync,
  });

  // Set up DOM event listeners — delegate to the active tool's registry entry
  useEffect(() => {
    const root = document.getElementById('storybook-root') ?? document.body;
    const busy = () => composingRef.current || !!editingRef.current;

    const onMove = (e: MouseEvent) => {
      if (modeRef.current === 'off' || busy()) return;
      const el = e.target as Element | null;
      if (el && root.contains(el)) {
        setHover(el.getBoundingClientRect());
        setHoverEl(el);
        // Delegate to tool's onMouseMove
        const activeDef = toolRegistry.get(modeRef.current);
        if (activeDef?.onMouseMove) {
          activeDef.onMouseMove(e, buildCtx());
        }
        // Place tool zone detection (orchestrator-managed hover state)
        if (modeRef.current === 'place') {
          const rect = el.getBoundingClientRect();
          const relY = (e.clientY - rect.top) / rect.height;
          if (e.shiftKey) {
            setPlaceZone('replace');
          } else if (relY < 0.25) {
            setPlaceZone('before');
          } else if (relY > 0.75) {
            setPlaceZone('after');
          } else {
            setPlaceZone('into');
          }
        }
      }
    };

    const onClick = (e: MouseEvent) => {
      const m = modeRef.current;
      if (m === 'off' || busy() || placingRef.current) return;
      const el = e.target as Element | null;
      if (!el || !root.contains(el)) return;
      e.preventDefault();
      e.stopPropagation();

      if (m === 'comment') {
        const target = buildTarget(el, root, storyId, component);
        composingRef.current = true;
        setComposing({ target, box: target.box as Box });
        setText('');
      } else if (m === 'place') {
        if (placingRef.current) return;
        const target = buildTarget(el, root, storyId, component);
        const detectedZone: PlacementMode = (placeZone as PlacementMode) || 'after';
        setPlacing({ target, box: target.box as Box, zone: detectedZone });
        placingRef.current = true;
        setText('');
      } else {
        // Delegate to the active tool's onClick
        const activeDef = toolRegistry.get(m);
        if (activeDef?.onClick) {
          activeDef.onClick(e, buildCtx());
        }
      }
    };

    const onEditKey = (e: KeyboardEvent) => {
      if (!editingRef.current) return;
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); endEdit(true); }
      else if (e.key === 'Escape') { e.preventDefault(); endEdit(false); }
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !editingRef.current) {
        if (placingRef.current) cancelPlace();
        else cancel();
      }
    };

    document.addEventListener('mousemove', onMove, true);
    document.addEventListener('click', onClick, true);
    document.addEventListener('keydown', onEditKey, true);
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('mousemove', onMove, true);
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('keydown', onEditKey, true);
      document.removeEventListener('keydown', onKey, true);
    };
  }, [storyId, component, pins, hoverEl, placeZone]);

  const cancel = () => { composingRef.current = false; setComposing(null); setText(''); };
  const cancelPlace = () => { setPlacing(null); setText(''); setPlaceZone(null); setHover(null); modeRef.current = 'off'; placingRef.current = false; setModeState('off'); document.body.style.cursor = ''; addons.getChannel().emit(EVT_TOOL_MODE, { mode: 'off' }); };
  const send = () => {
    if (!composing || !text.trim()) return;
    addons.getChannel().emit(EVT_COMMENT_SUBMIT, { target: composing.target, instruction: text.trim() });
    setPins((p) => [...p, { n: p.length + 1, box: composing.box, text: text.trim() }]);
    cancel();
    offAndSync();
  };
  const sendPlace = () => {
    if (!placing || !text.trim()) return;
    const detectedZone = placing.zone;
    const description = text.trim();
    const placePayload: PlaceTriggerPayload = {
      tag: placing.target.tag || '',
      text: placing.target.text || '',
      selector: placing.target.selector,
      component: component || placing.target.component || '',
      rect: { x: placing.box.x, y: placing.box.y, width: placing.box.width, height: placing.box.height },
      computedStyles: {},
      storyId,
      placementMode: detectedZone,
      selectedComponent: description,
    };

    const phId = ++placeholderIdRef.current;
    setPlaceholders((p) => [...p, { id: phId, box: placing.box, description, zone: detectedZone, status: 'placing' }]);

    addons.getChannel().emit(EVT_PLACE_TRIGGER, placePayload);
    setPins((p) => [...p, { n: p.length + 1, box: placing.box, text: `place ${detectedZone}: ${description}` }]);
    flash(`placing ${detectedZone} <${placing.target.tag}>`);

    setTimeout(() => {
      setPlaceholders((prev) => prev.filter((ph) => ph.id !== phId));
    }, 15000);

    setTimeout(() => cancelPlace(), 0);
  };

  // Render the active tool's overlay via the registry
  const activeDef = mode !== 'off' ? toolRegistry.get(mode) : undefined;
  const activeOverlay = activeDef?.renderOverlay ? activeDef.renderOverlay(buildCtx()) : null;

  const popLeft = composing ? Math.min(composing.box.x, window.innerWidth - 300) : 0;
  const popTop = composing ? Math.min(composing.box.y + composing.box.height + 8, window.innerHeight - 130) : 0;
  const active = mode !== 'off';

  return (
    <>
      {/* Render active tool's overlay (e.g. wand hover highlight) */}
      {activeOverlay}

      {/* Pin badges */}
      {pins.map((p) => (
        <div key={`pin-${p.n}`} onClick={p.sessionId ? () => { addons.getChannel().emit(EVT_CHAT_MODE, { enabled: true, sessionId: p.sessionId }); } : undefined}
          title={p.text}
          style={{ position: 'fixed', top: p.box ? p.box.y - 10 : 10 + (p.n - 1) * 28, left: p.box ? p.box.x - 10 : 10, width: 20, height: 20, borderRadius: 999,
            background: p.sessionId ? '#7c3aed' : ACCENT, color: '#fff', font: '11px/20px sans-serif', textAlign: 'center', zIndex: 99997,
            boxShadow: '0 1px 4px rgba(0,0,0,.4)', cursor: p.sessionId ? 'pointer' : 'default' }}>{p.n}</div>
      ))}

      {/* Placeholder overlays */}
      {placeholders.map((ph) => (
        <div key={`ph-${ph.id}`}
          style={{
            position: 'fixed', top: ph.box.y, left: ph.box.x,
            width: ph.box.width, height: Math.max(ph.box.height, 48),
            zIndex: 99997, pointerEvents: 'none',
            border: '2px dashed #22c55e',
            borderRadius: 8,
            background: 'rgba(34,197,94,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 8,
          }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(0,0,0,0.7)', padding: '6px 12px', borderRadius: 6, fontSize: 12,
          }}>
            <span style={{ display: 'inline-block', width: 14, height: 14, borderRadius: 999, border: '2px solid #22c55e', borderTopColor: 'transparent' }}></span>
            <span style={{ color: '#22c55e', fontWeight: 600 }}>{ph.zone}</span>
            <span style={{ color: '#ccc' }}>{ph.description.slice(0, 40)}</span>
          </div>
        </div>
      ))}

      {/* Toast/hint bar */}
      {(active || toast || placeholders.length > 0) && (
        <div style={{ position: 'fixed', top: 8, left: '50%', transform: 'translateX(-50%)', zIndex: 99999, background: '#111', color: '#fff', font: '12px sans-serif', padding: '5px 10px', borderRadius: 6, pointerEvents: 'none', boxShadow: '0 2px 8px rgba(0,0,0,.4)' }}>
          {toast ?? (composing ? 'emdesign: type your comment' : placing ? `emdesign: describe what to place ${placing.zone}` : placeholders.length > 0 ? `✨ placing ${placeholders.length} component(s)...` : activeDef?.hint ?? '')}
        </div>
      )}

      {/* Element hover highlight for tools without their own renderOverlay */}
      {active && hover && !composing && !editingRef.current && mode !== 'wand' && mode !== 'place' && (
        <div style={{ position: 'fixed', top: hover.top, left: hover.left, width: hover.width, height: hover.height, outline: `2px solid ${ACCENT}`, background: 'rgba(37,99,235,0.12)', zIndex: 99998, pointerEvents: 'none' }} />
      )}

      {/* Place tool hover visuals — zone-specific highlight, guide line, badge */}
      {active && hover && !composing && !editingRef.current && mode === 'place' && placeZone && (
        <>
          <div style={{ position: 'fixed', top: hover.top, left: hover.left, width: hover.width, height: hover.height,
            outline: placeZone === 'replace' ? '2px solid #ef4444' : '2px solid #22c55e',
            background: placeZone === 'replace' ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)',
            zIndex: 99998, pointerEvents: 'none' }} />
          {(placeZone === 'before' || placeZone === 'after') && (
            <div style={{ position: 'fixed',
              top: placeZone === 'before' ? hover.top - 2 : hover.bottom - 2,
              left: hover.left + 4,
              width: hover.width - 8,
              height: 4,
              background: '#22c55e',
              borderRadius: 2,
              boxShadow: '0 0 8px rgba(34,197,94,0.6)',
              zIndex: 99999, pointerEvents: 'none' }} />
          )}
          <div style={{ position: 'fixed',
            top: placeZone === 'before' ? hover.top - 18 : placeZone === 'after' ? hover.bottom + 4 : hover.top + 4,
            left: hover.left + 6,
            fontSize: 11, lineHeight: 1,
            background: placeZone === 'replace' ? '#ef4444' : '#22c55e',
            color: '#fff', padding: '2px 7px', borderRadius: 4, fontWeight: 700,
            zIndex: 99999, pointerEvents: 'none' }}>
            {placeZone === 'before' ? '+ before' : placeZone === 'after' ? '+ after' : placeZone === 'replace' ? '× replace' : '↳ into'}
          </div>
        </>
      )}

      {/* Comment popover */}
      {composing && (
        <>
          <div style={{ position: 'fixed', top: composing.box.y, left: composing.box.x, width: composing.box.width, height: composing.box.height, outline: `2px solid ${ACCENT}`, background: 'rgba(37,99,235,0.12)', zIndex: 99998, pointerEvents: 'none' }} />
          <div style={{ position: 'fixed', top: popTop, left: popLeft, width: 280, zIndex: 100000, background: '#1c1c1f', color: '#fff', border: '1px solid #333', borderRadius: 8, padding: 10, boxShadow: '0 6px 24px rgba(0,0,0,.5)', font: '13px sans-serif' }}>
            <div style={{ opacity: 0.7, fontSize: 11, marginBottom: 6 }}>&lt;{composing.target.tag}&gt; {composing.target.text ? '“' + composing.target.text.slice(0, 32) + '”' : ''}</div>
            <textarea autoFocus value={text} onChange={(e) => setText(e.target.value)} placeholder="what should change here?" rows={3} style={{ width: '100%', boxSizing: 'border-box', background: '#0f0f10', color: '#fff', border: '1px solid #333', borderRadius: 4, padding: 6, font: '13px sans-serif', resize: 'vertical' }} onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) send(); }} />
            <div style={{ display: 'flex', gap: 8, marginTop: 8, justifyContent: 'flex-end' }}>
              <button onClick={cancel} style={{ cursor: 'pointer', background: 'transparent', color: '#aaa', border: '1px solid #444', borderRadius: 4, padding: '4px 10px' }}>Cancel</button>
              <button onClick={send} disabled={!text.trim()} style={{ cursor: 'pointer', background: ACCENT, color: '#fff', border: 0, borderRadius: 4, padding: '4px 12px', opacity: text.trim() ? 1 : 0.5 }}>Send (⌘↵)</button>
            </div>
          </div>
        </>
      )}

      {/* Place popover */}
      {placing && (
        <>
          <div onClick={(e) => { e.stopPropagation(); cancelPlace(); }} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999, background: 'transparent' }} />
          <div style={{ position: 'fixed', top: placing.box.y, left: placing.box.x, width: placing.box.width, height: placing.box.height, outline: '2px solid #22c55e', background: 'rgba(34,197,94,0.10)', zIndex: 100000, pointerEvents: 'none' }} />
          <div style={{ position: 'fixed', top: Math.min(placing.box.y + placing.box.height + 8, window.innerHeight - 130), left: Math.min(placing.box.x, window.innerWidth - 300), width: 300, zIndex: 100001, background: '#1c1c1f', color: '#fff', border: '1px solid #333', borderRadius: 8, padding: 10, boxShadow: '0 6px 24px rgba(0,0,0,.5)', font: '13px sans-serif' }}>
            <div style={{ opacity: 0.7, fontSize: 11, marginBottom: 4 }}>&lt;{placing.target.tag}&gt; {placing.target.text ? `"${placing.target.text.slice(0, 32)}"` : ''} — <span style={{ color: '#22c55e', fontWeight: 700 }}>{placing.zone}</span></div>
            <textarea autoFocus value={text} onChange={(e) => setText(e.target.value)} placeholder={`what component to place ${placing.zone} here? e.g. "a stats card with trend indicator"`} rows={2} style={{ width: '100%', boxSizing: 'border-box', background: '#0f0f10', color: '#fff', border: '1px solid #333', borderRadius: 4, padding: 6, font: '13px sans-serif', resize: 'vertical' }} onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) sendPlace(); }} />
            <div style={{ display: 'flex', gap: 8, marginTop: 8, justifyContent: 'flex-end' }}>
              <button onClick={(e) => { e.stopPropagation(); cancelPlace(); }} style={{ cursor: 'pointer', background: 'transparent', color: '#aaa', border: '1px solid #444', borderRadius: 4, padding: '4px 10px' }}>Cancel</button>
              <button onClick={(e) => { e.stopPropagation(); sendPlace(); }} disabled={!text.trim()} style={{ cursor: 'pointer', background: '#22c55e', color: '#fff', border: 0, borderRadius: 4, padding: '4px 12px', opacity: text.trim() ? 1 : 0.5 }}>Place (⌘↵)</button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

/** Global decorator (registered via previewAnnotations) — mounts the overlay alongside every story. */
export const decorators = [
  (Story: React.ComponentType, context: { id?: string; title?: string }) => (
    <>
      <Story />
      <ToolOverlay storyId={context?.id} component={context?.title?.split('/').pop()} />
    </>
  ),
];
