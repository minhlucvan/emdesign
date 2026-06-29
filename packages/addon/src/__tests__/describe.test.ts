/**
 * describe — unit tests.
 *
 * Tests for the describeElement(target) function that produces a human-readable
 * + machine-readable descriptor string for an element target.
 */

import { describe as describeElement } from '../dom-utils/describe';

// ── Tests ──────────────────────────────────────────────────────────────

describe('describe', () => {
  it('includes all populated fields: selector, tag, text, classes, box', () => {
    const target = {
      selector: 'div > button.primary',
      tag: 'button',
      text: 'Submit',
      classes: 'btn primary',
      box: { x: 100, y: 200, width: 80, height: 32 },
    };
    const output = describeElement(target);
    expect(output).toContain('selector: div > button.primary');
    expect(output).toContain('tag: <button>');
    expect(output).toContain('text: "Submit"');
    expect(output).toContain('classes: "btn primary"');
    expect(output).toContain('box: 100,200 80×32');
  });

  it('includes component and storyId when present', () => {
    const target = {
      selector: 'div > span',
      tag: 'span',
      component: 'MyComponent',
      storyId: 'my-component--default',
      text: 'Hello',
    };
    const output = describeElement(target);
    expect(output).toContain('component: MyComponent');
    expect(output).toContain('story: my-component--default');
  });

  it('omits empty fields — component and storyId not shown when absent', () => {
    const target = {
      selector: 'div',
      tag: 'div',
      text: 'alone',
    };
    const output = describeElement(target);
    expect(output).not.toContain('component:');
    expect(output).not.toContain('story:');
  });

  it('omits box line when box is undefined', () => {
    const target = {
      selector: 'div',
      tag: 'div',
      text: 'no box',
    };
    const output = describeElement(target);
    expect(output).not.toContain('box:');
  });

  it('omits classes line when classes is undefined', () => {
    const target = {
      selector: 'div',
      tag: 'div',
      text: 'no classes',
    };
    const output = describeElement(target);
    expect(output).not.toContain('classes:');
  });

  it('omits text line when text is empty', () => {
    const target = {
      selector: 'div',
      tag: 'div',
      text: '',
    };
    const output = describeElement(target);
    expect(output).not.toContain('text:');
  });

  it('appends JSON block at the end of output', () => {
    const target = {
      selector: 'div > button',
      tag: 'button',
      text: 'Click',
      classes: 'btn',
    };
    const output = describeElement(target);
    const lines = output.split('\n');
    // Last line should contain JSON
    const lastLine = lines[lines.length - 1];
    expect(lastLine).toMatch(/^\{.*\}$/);
    // There should be a "---" separator before JSON
    expect(output).toContain('\n---\n');
  });

  it('handles minimal target — only tag and selector present', () => {
    const target = {
      selector: 'span',
      tag: 'span',
    };
    const output = describeElement(target);
    expect(output).toContain('emdesign element');
    expect(output).toContain('selector: span');
    expect(output).toContain('tag: <span>');
    // No optional fields
    expect(output).not.toContain('component:');
    expect(output).not.toContain('story:');
    expect(output).not.toContain('text:');
    expect(output).not.toContain('classes:');
    expect(output).not.toContain('box:');
    // Still ends with JSON
    expect(output).toMatch(/\n---\n\{.*\}$/);
  });

  it('starts with "emdesign element" header', () => {
    const target = { selector: 'div', tag: 'div' };
    expect(describeElement(target)).toMatch(/^emdesign element/);
  });
});
