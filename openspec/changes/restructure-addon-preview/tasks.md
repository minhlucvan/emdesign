## 1. Foundation — directory structure + ToolDefinition interface

- [ ] 1.1 Create `src/tools/`, `src/dom-utils/`, `src/services/` directories and add barrel `index.ts` files
- [ ] 1.2 Define the `ToolDefinition` interface in `src/tools/types.ts` — `mode`, `hint`, `onActivate`, `onDeactivate`, `onMouseMove`, `onClick`, `onKeyDown`, `renderOverlay`
- [ ] 1.3 Define the `ToolContext` type — the data passed from the orchestrator to tool handlers (hoverEl, storyId, component, pins/setters)

## 2. DOM utilities — extract pure functions from preview.tsx

- [ ] 2.1 Extract `cssPath(el, root)` into `src/dom-utils/cssPath.ts` with unit test
- [ ] 2.2 Extract `buildTarget(el, root, storyId?, component?)` into `src/dom-utils/buildTarget.ts` with unit test
- [ ] 2.3 Extract `describe(target)` into `src/dom-utils/describe.ts` with unit test
- [ ] 2.4 Extract `collectComputedStyles(el)` into `src/dom-utils/computedStyles.ts` with unit test
- [ ] 2.5 Export all dom-utils from `src/dom-utils/index.ts`

## 3. Tool extraction — extract all 6 tools into modules

- [ ] 3.1 Extract comment tool — `src/tools/comment/index.ts` — popover state, EVT_COMMENT_SUBMIT emission, pin creation
- [ ] 3.2 Extract copy tool — `src/tools/copy/index.ts` — clipboard write, EVT_COPIED emission, pin creation
- [ ] 3.3 Extract reference tool — `src/tools/reference/index.ts` — computed styles collection, EVT_ELEMENT_SELECTED emission, data-emdesign-component resolution
- [ ] 3.4 Extract text edit tool — `src/tools/text-edit/index.ts` — contentEditable management, Enter/Esc handling, EVT_TEXT_SUBMIT emission
- [ ] 3.5 Extract wand tool — `src/tools/wand/index.ts` — hover w/ purple highlight + wand icon, computed styles, Shift+click vision flag, EVT_WAND_TRIGGER emission
- [ ] 3.6 Extract place tool — `src/tools/place/index.ts` — zone detection (before/after/into/replace), guide line + badge rendering, placeholder overlay, EVT_PLACE_TRIGGER emission

## 4. Backend service — extract API orchestration from Tool.tsx

- [ ] 4.1 Create `src/services/toolBackend.ts` with `handleCommentSubmit`, `handleTextSubmit`, `handleWandTrigger`, `handlePlaceTrigger` — each creates session, submits intent, handles errors silently
- [ ] 4.2 Add unit tests for `toolBackend.ts` — mock `api`, verify session creation + intent submission for each tool type
- [ ] 4.3 Refactor `Tool.tsx` to import and call `toolBackend` functions instead of calling `api` directly and remove direct `api` imports

## 5. Chat CSS service — extract from ChatModeController

- [ ] 5.1 Create `src/services/chatCssService.ts` with `buildChatCSS(isDark)` and `injectChatCSS(enabled)` — pure functions, no React dependency
- [ ] 5.2 Add unit tests for `chatCssService.ts` — verify CSS string output for dark/light themes, verify style element DOM side effects
- [ ] 5.3 Refactor `ChatModeController.tsx` to use the extracted service — remove inline CSS logic, keep portal mounting and toggle state

## 6. Orchestrator — rewrite ToolOverlay as thin orchestrator

- [ ] 6.1 Create `src/tools/registry.ts` — a map of mode → ToolDefinition, populated by importing all 6 tool modules
- [ ] 6.2 Rewrite `ToolOverlay` in `preview.tsx` to use the registry — track `activeTool`, fan out events to the active tool only, delegate overlay rendering to each tool's `renderOverlay`
- [ ] 6.3 Keep shared state (pins, placeholders, toast) in the orchestrator; tools receive setters via `ToolContext`
- [ ] 6.4 Verify all 6 tool modes work identically to the current implementation

## 7. Cleanup and verification

- [ ] 7.1 Remove unused code paths from the old `preview.tsx` after extraction (the original file becomes the orchestrator)
- [ ] 7.2 Run `npm test` in `packages/addon/` — confirm all existing tests pass
- [ ] 7.3 Add integration test for the orchestrator — register mock tools, simulate click events, verify correct delegation
- [ ] 7.4 Verify no type errors: `npx tsc --noEmit` in `packages/addon/`
