## Why

The emdesign addon currently has separate tools — comment, live-edit-text, and conversation chat — that operate in isolation. Each tool lacks rich context about what the user is looking at (viewport, component, file, story), and the AI has no persistent awareness of the session or the design surface. To evolve from a collection of tools into an **AI-native design engineering IDE** — like Cursor for code, Figma/v0 for design — the chat must become the central interface, with every action carrying full context and every conversation being persisted, scoped, and actionable.

## What Changes

- **Chat becomes the primary interface**: The sidebar chat moves from a secondary panel to the main interaction surface. All tools (comments, live-edit, capture, lint, vision) are accessible through or alongside the chat.
- **Rich conversation context**: Every message includes the current viewport, component name, story ID, file paths, and design system state. The AI knows exactly what the user is looking at.
- **Per-story and global conversations**: Users can have conversations scoped to a specific story/component, or global conversations about the project. Context is loaded from the scoped target.
- **Component wrapper harness**: A Storybook decorator wraps each component with a context provider that exposes token bindings, prop metadata, error boundaries, and render state to the AI — making every component self-describing.
- **Live edit with AI**: The existing text-edit tool becomes an AI-assisted edit flow: point at an element, describe the change in natural language, and the AI applies it.
- **Design surface awareness**: The AI can see the full composition tree, responsive breakpoints, token usage, and accessibility state of the current view.

## Capabilities

### New Capabilities
- `chat-as-primary-interface`: Replace the current tool-driven panel with a conversation-first IDE layout. Chat is the main column; tools are invoked through it or sit alongside it.
- `rich-conversation-context`: Every chat message is enriched with viewport, component, story, file paths, DS tokens, and render state. Context is loaded automatically based on what the user is viewing.
- `conversation-scoping`: Conversations can be global (project-wide) or scoped to a specific story/component. Scoped conversations auto-load that target's context.
- `component-context-harness`: A Storybook decorator/provider that wraps every component with metadata: prop types, token bindings, error boundary, render snapshot, and AI-accessible DOM description.
- `ai-assisted-live-edit`: The live-edit-text tool becomes an AI-assisted flow — click an element, describe what to change in chat, the AI applies the edit and re-verifies.
- `design-surface-api`: A backend service that exposes the current composition tree, responsive breakpoints, token usage, and accessibility state for the AI to consume.

### Modified Capabilities
- *(none — no existing specs to modify)*

## Impact

- **`packages/addon/`**: Major rework of the manager UI layout (SystemTab, ChartersTab, ChatSidebar). The chat becomes the primary surface; tools are accessible from within it.
- **`packages/chat-ui/`**: New components for IDE-like layout (split panes, context sidebar, tool invocation). MessageList and TypingIndicator extended for rich context display.
- **`packages/backend/`**: New endpoints for conversation persistence, context resolution, component harness metadata, and design surface queries.
- **`packages/dsr/`**: New `ComponentContext` type for the harness provider. Extensions to `RenderSnapshot` for AI-consumable descriptions.
- **`apps/workspace/templates/`**: Template updated to include the component context harness decorator in new projects.
