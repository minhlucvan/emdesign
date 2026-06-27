/**
 * StoryCharterRunner — evaluates story-level charters against the live DOM.
 *
 * This runs inside the Storybook preview iframe (or in a Playwright page for
 * the doctor pipeline). It takes an array of StoryCharters and the story root,
 * and returns pass/fail results.
 *
 * The runner uses a throw-to-fail convention: if the charter's `run()` throws,
 * it's a failure with the error message as the finding detail. If it returns
 * normally, it's a pass.
 */

import type { StoryCharter, StoryCharterContext, StoryCharterFinding, StoryCharterResult } from './story-charter.js';
import { buildResult } from './story-charter.js';
import type { RenderSnapshot } from '../rules/rendered.js';
export type { StoryCharter, StoryCharterContext, StoryCharterFinding, StoryCharterResult } from './story-charter.js';
export { buildResult } from './story-charter.js';

// ---------------------------------------------------------------------------
// Context factory
// ---------------------------------------------------------------------------

/**
 * Map of HTML tags to their implicit ARIA roles.
 * Used by getByRole to find elements that don't have explicit role attributes.
 */
const IMPLICIT_ROLES: Record<string, string[]> = {
  button: ['button'],
  a: ['link'],
  'h1': ['heading', 'heading', 'heading', 'heading', 'heading', 'heading'],
  h2: ['heading'],
  h3: ['heading'],
  h4: ['heading'],
  h5: ['heading'],
  h6: ['heading'],
  nav: ['navigation'],
  img: ['img'],
  'input[type=checkbox]': ['checkbox'],
  'input[type=radio]': ['radio'],
  'input[type=text]': ['textbox'],
  'input[type=email]': ['textbox'],
  'input[type=search]': ['searchbox'],
  textarea: ['textbox'],
  select: ['combobox', 'listbox'],
  ul: ['list'],
  ol: ['list'],
  li: ['listitem'],
  table: ['table'],
  form: ['form'],
  header: ['banner'],
  footer: ['contentinfo'],
  main: ['main'],
  aside: ['complementary'],
};

/**
 * Get the implicit role(s) for a given element based on its tag and attributes.
 */
function implicitRoleFor(el: Element): string[] {
  const tag = el.tagName.toLowerCase();
  const roles: string[] = [];

  // Direct tag match
  if (IMPLICIT_ROLES[tag]) {
    roles.push(...IMPLICIT_ROLES[tag]);
  }

  // Special cases
  if (tag === 'a' && !el.hasAttribute('href')) {
    return []; // <a> without href has no implicit role
  }
  if (tag === 'input') {
    const type = (el as HTMLInputElement).type?.toLowerCase() || 'text';
    const key = `input[type=${type}]`;
    if (IMPLICIT_ROLES[key]) {
      roles.push(...IMPLICIT_ROLES[key]);
    }
  }
  if (tag.startsWith('h') && tag.length === 2 && tag[1] >= '1' && tag[1] <= '6') {
    return ['heading']; // all heading levels
  }

  return [...new Set(roles)];
}

/**
 * Build a StoryCharterContext from a container element.
 * Called once per charter evaluation, with the same container.
 */
function buildContext(container: HTMLElement, snapshot?: RenderSnapshot): StoryCharterContext {
  return {
    container,
    snapshot,
    getByText(text: string, exact = true): HTMLElement | null {
      const all = container.querySelectorAll('*');
      for (let i = 0; i < all.length; i++) {
        const el = all[i] as HTMLElement;
        const t = el.textContent?.trim();
        if (t === undefined) continue;
        if (exact ? t === text : t.includes(text)) return el;
      }
      return null;
    },
    async getByRole(role: string, options?: { level?: number; timeout?: number }): Promise<HTMLElement | null> {
      const timeout = options?.timeout ?? 2000;
      const started = Date.now();
      while (Date.now() - started < timeout) {
        const all = container.querySelectorAll<HTMLElement>('*');
        for (let i = 0; i < all.length; i++) {
          const el = all[i];

          // Check explicit role attribute
          const explicitRole = el.getAttribute('role');
          if (explicitRole === role) {
            if (options?.level !== undefined) {
              const lvl = el.getAttribute('aria-level');
              if (lvl !== String(options.level)) continue;
            }
            return el;
          }

          // Check implicit role from tag
          const implicitRoles = implicitRoleFor(el);
          if (implicitRoles.includes(role)) {
            if (options?.level !== undefined) {
              // For heading roles, check the heading level from tag
              const tag = el.tagName.toLowerCase();
              if (role === 'heading' && tag.startsWith('h')) {
                const lvl = tag[1];
                if (lvl !== String(options.level)) continue;
              } else {
                const lvl = el.getAttribute('aria-level');
                if (lvl !== String(options.level)) continue;
              }
            }
            return el;
          }
        }
        // Wait a tick before retrying (for async-rendered content)
        await new Promise((r) => setTimeout(r, 50));
      }
      // One more time before giving up — check explicit role
      const fromExplicit = container.querySelector(`[role="${role}"]`) as HTMLElement | null;
      if (fromExplicit) return fromExplicit;
      // Fallback: check by tag for common implicit roles
      if (role === 'button') return container.querySelector('button') as HTMLElement | null;
      if (role === 'heading' && options?.level) return container.querySelector(`h${options.level}`) as HTMLElement | null;
      if (role === 'navigation') return container.querySelector('nav') as HTMLElement | null;
      if (role === 'link') return container.querySelector('a[href]') as HTMLElement | null;
      if (role === 'list') return container.querySelector('ul, ol') as HTMLElement | null;
      return null;
    },
    querySelector(selector: string): HTMLElement | null {
      return container.querySelector(selector) as HTMLElement | null;
    },
    querySelectorAll(selector: string): HTMLElement[] {
      return Array.from(container.querySelectorAll(selector)) as HTMLElement[];
    },
  };
}

// ---------------------------------------------------------------------------
// Single charter evaluation
// ---------------------------------------------------------------------------

/**
 * Evaluate a single charter against the story root.
 * Returns a finding (pass or fail).
 */
export async function evaluateCharter(
  charter: StoryCharter,
  component: string,
  story: string,
  container: HTMLElement,
  snapshot?: RenderSnapshot,
): Promise<StoryCharterFinding> {
  const ctx = buildContext(container, snapshot);
  try {
    await charter.run(ctx);
    return {
      id: `charter/${component}/${charter.name}`,
      component,
      story,
      charterName: charter.name,
      severity: charter.severity,
      pass: true,
      message: `${charter.name}: pass`,
      target: charter.target,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      id: `charter/${component}/${charter.name}`,
      component,
      story,
      charterName: charter.name,
      severity: charter.severity,
      pass: false,
      message: `${charter.name}: ${msg}`,
      target: charter.target,
      fix: msg,
    };
  }
}

// ---------------------------------------------------------------------------
// Batch evaluation
// ---------------------------------------------------------------------------

/**
 * Evaluate multiple charters for a component/story combination.
 *
 * @param charters — the charters to evaluate
 * @param component — component name
 * @param story — story name
 * @param container — the story root DOM element
 * @param snapshot — optional render-probe snapshot data
 * @returns aggregated result with pass/fail counts
 */
export async function evaluateCharters(
  charters: StoryCharter[],
  component: string,
  story: string,
  container: HTMLElement,
  snapshot?: RenderSnapshot,
): Promise<StoryCharterResult> {
  const findings = await Promise.all(
    charters.map((c) => evaluateCharter(c, component, story, container, snapshot)),
  );
  return buildResult(component, story, findings);
}

/**
 * Evaluate charters at both the component and story level.
 *
 * Component-level charters run first, then story-level charters.
 * Results are merged into a single StoryCharterResult.
 *
 * @param componentCharters — charters defined on `meta.charters`
 * @param storyCharters — charters defined on the specific story
 * @param component — component name
 * @param story — story name
 * @param container — the story root DOM element
 * @param snapshot — optional render-probe snapshot data
 */
export async function evaluateAllCharters(
  componentCharters: StoryCharter[] | undefined,
  storyCharters: StoryCharter[] | undefined,
  component: string,
  story: string,
  container: HTMLElement,
  snapshot?: RenderSnapshot,
): Promise<StoryCharterResult> {
  const all: StoryCharter[] = [...(componentCharters ?? []), ...(storyCharters ?? [])];
  return evaluateCharters(all, component, story, container, snapshot);
}
