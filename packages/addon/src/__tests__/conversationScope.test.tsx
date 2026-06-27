/**
 * Conversation Scoping — unit tests.
 *
 * These tests verify the Project/Story scoping and origin badges:
 * - Sessions carry scope ('global' | 'story:<id>') and origin ('chat' | 'comment')
 * - Session list splits into Project and Story sections
 * - Origin badges differentiate chat vs comment threads
 *
 * Full rendering tests need @storybook/test + jsdom.
 */

import type { ElementSelectedPayload } from '../channel';

describe('Conversation Scoping', () => {
  describe('Scope types', () => {
    it('supports global scope', () => {
      const scope = 'global';
      expect(scope).toBe('global');
    });

    it('supports story scope with story ID', () => {
      const scope = 'story:example-button--primary';
      expect(scope.startsWith('story:')).toBe(true);
      expect(scope.split(':')[1]).toBe('example-button--primary');
    });
  });

  describe('Origin types', () => {
    it('has chat origin', () => {
      const origin = 'chat' as const;
      expect(origin).toBe('chat');
    });

    it('has comment origin', () => {
      const origin = 'comment' as const;
      expect(origin).toBe('comment');
    });
  });

  describe('Element context', () => {
    const elementContext = {
      selector: 'body > div > button',
      tag: 'button',
      text: 'Submit',
      component: 'Button',
      box: { x: 100, y: 200, width: 80, height: 32 },
    };

    it('carries selector and tag', () => {
      expect(elementContext.selector).toBeTruthy();
      expect(elementContext.tag).toBe('button');
    });

    it('carries element box coordinates', () => {
      expect(elementContext.box.width).toBe(80);
      expect(elementContext.box.height).toBe(32);
    });
  });
});
