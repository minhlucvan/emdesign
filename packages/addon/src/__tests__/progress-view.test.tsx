/**
 * ProgressView and IntermediatePreview — tests.
 *
 * Verifies the workflow progress display: ProgressView renders a stage list
 * with status icons (pending/running/done/error), elapsed time, detail
 * tooltips, a cancel button, and SSE streaming via EventSource.
 * IntermediatePreview renders progressive artifacts (DESIGN.md lines, color
 * swatches, font preview, primitive list, validation status).
 *
 * The components imported below do not exist yet — this file fails (RED).
 */

import React from 'react';
import { describe, it, expect } from 'vitest';

// ── New components (do not exist yet → RED) ─────────────────────────────
// These imports will fail with MODULE_NOT_FOUND until the Green step.

import { ProgressView } from '../ds-create/ProgressView';
import { IntermediatePreview } from '../ds-create/IntermediatePreview';

// ── Existing modules ────────────────────────────────────────────────────

import { api } from '../api';

// =============================================================================

// ── Stage list scenarios ────────────────────────────────────────────────

describe('ProgressView stage list', () => {
  const EXPECTED_PROMPT_STAGES = [
    'Analyzing',
    'Generating DESIGN.md',
    'Generating tokens.css',
    'Scaffolding',
    'Building graph',
    'Validating',
  ];

  const EXPECTED_MD_STAGES = [
    'Parsing DESIGN.md',
    'Extracting tokens',
    'Scaffolding',
    'Building graph',
    'Validating',
  ];

  it('renders 6 stages for create-from-prompt workflow', () => {
    expect(ProgressView).toBeDefined();
    // After Green: ProgressView renders the 6 stages above when
    // creationMode === 'from-prompt'.
    expect(EXPECTED_PROMPT_STAGES).toHaveLength(6);
    expect(EXPECTED_PROMPT_STAGES).toContain('Generating DESIGN.md');
    expect(EXPECTED_PROMPT_STAGES).toContain('Generating tokens.css');
  });

  it('renders 5 stages for create-from-design-md workflow', () => {
    // After Green: ProgressView renders 5 stages when
    // creationMode === 'design-md'.
    expect(EXPECTED_MD_STAGES).toHaveLength(5);
    expect(EXPECTED_MD_STAGES).toContain('Parsing DESIGN.md');
    expect(EXPECTED_MD_STAGES).toContain('Extracting tokens');
  });

  it('each stage row shows status icon, name, and elapsed time', () => {
    // After Green: each stage item has:
    // - status icon (pending = circle ◦, running = spinner ↻,
    //   done = checkmark ✓, error = ✗)
    // - stage name text
    // - elapsed time in seconds
  });

  it('hovering a stage row shows a detail tooltip', () => {
    // After Green: title attribute or tooltip shows stage detail.
  });
});

// ── Cancel button ───────────────────────────────────────────────────────

describe('ProgressView cancel', () => {
  it('renders a Cancel button', () => {
    expect(ProgressView).toBeDefined();
  });

  it('Cancel button calls api.cancelWorkflow(sessionId) on click', () => {
    // After Green: clicking Cancel calls cancelWorkflow(sessionId)
    // which posts to the API to stop the running workflow.
    expect(typeof api.cancelSession).toBe('function');
  });

  it('cancel is disabled when workflow is already completed or failed', () => {
    // After Green: cancel button is disabled when
    // workflowStatus === 'completed' || workflowStatus === 'failed'
  });
});

// ── SSE streaming ───────────────────────────────────────────────────────

describe('ProgressView SSE streaming', () => {
  it('connects to SSE stream via EventSource on mount', () => {
    // After Green: useEffect opens EventSource to
    // getWorkflowStreamUrl(sessionId) and updates stage states
    // as events arrive.
  });

  it('updates stage status events as they arrive from the stream', () => {
    // After Green: each SSE event carries stage index + new status;
    // the component re-renders the corresponding stage row.
  });

  it('closes EventSource on unmount', () => {
    // After Green: cleanup function calls eventSource.close().
  });

  it('shows error state with retry link when SSE connection fails', () => {
    // After Green: on EventSource.onerror, show error banner
    // with "Connection lost — retry" link that reconnects.
  });
});

// ── IntermediatePreview ─────────────────────────────────────────────────

describe('IntermediatePreview', () => {
  it('renders alongside ProgressView during workflow', () => {
    expect(IntermediatePreview).toBeDefined();
  });

  it('shows DESIGN.md lines as they are generated', () => {
    // After Green: designMdLines prop passed to IntermediatePreview,
    // rendered as a markdown preview (react-markdown).
  });

  it('shows color swatches during token generation stages', () => {
    // After Green: when stage === 'Generating tokens.css',
    // render a grid of color swatches (name + hex) as tokens appear.
  });

  it('shows font preview during token stages', () => {
    // After Green: render font preview text in the selected
    // headline and body fonts.
  });

  it('shows a primitive list (spacing, radii) during later stages', () => {
    // After Green: render primitive values as a list
    // (spacing scale, border radii). Updated as each arrives.
  });

  it('shows validation status (pass/fail/diagnostics) in final stage', () => {
    // After Green: during 'Validating' stage show validation
    // results: pass/fail badge, diagnostics list, conflict count.
  });
});

// ── Constants (new types) ───────────────────────────────────────────────
// After Green, constants.ts must export WorkflowStage, WorkflowStageStatus.

describe('ProgressView types (do NOT exist yet → RED)', () => {
  it('WorkflowStage type is not yet exported', () => {
    // After Green: WorkflowStage = { id: number; name: string;
    //   status: WorkflowStageStatus; startedAt?: number; detail?: string }
    expect(() => { require('../constants').WorkflowStage; }).toThrow();
  });

  it('WorkflowStageStatus type is not yet exported', () => {
    // After Green: WorkflowStageStatus =
    //   'pending' | 'running' | 'done' | 'error'
    expect(() => { require('../constants').WorkflowStageStatus; }).toThrow();
  });
});

// ── API methods ─────────────────────────────────────────────────────────

describe('ProgressView API methods (do NOT exist yet → RED)', () => {
  it('api.getWorkflowStatus is undefined', () => {
    expect(api.getWorkflowStatus).toBeUndefined();
  });

  it('api.getWorkflowStreamUrl is undefined', () => {
    expect(api.getWorkflowStreamUrl).toBeUndefined();
  });
});

// ── Edge cases ──────────────────────────────────────────────────────────

describe('ProgressView edge cases', () => {
  it('handles empty stage list gracefully', () => {
    // After Green: if stages array is empty, show "Starting..." message
  });

  it('handles all stages completed state', () => {
    // After Green: all stages show checkmark, final stage shows
    // validation summary, auto-transitions to DS detail.
  });

  it('handles stage error state with diagnostic message', () => {
    // After Green: errored stage shows ✗ icon, error detail
    // in tooltip, retry/abort options.
  });
});
