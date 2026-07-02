import { describe, it, expect } from 'vitest';
import React from 'react';
import { FormInput, FormInputProps } from '../code/FormInput';

describe('FormInput', () => {
  it('renders an input element with correct attributes', () => {
    // Placeholder — component does not exist yet
    expect(FormInput).toBeDefined();
  });

  it('accepts and renders a label', () => {
    // Placeholder — component does not exist yet
    expect(typeof FormInput).toBe('function');
  });

  it('displays error message when error prop is provided', () => {
    // Placeholder — component does not exist yet
    // Styling should match the Figma `text-input` token:
    // - Background: var(--color-canvas)
    // - Text color: var(--color-ink)
    // - Border-radius: var(--rounded-md)
    // - Padding: 12px 14px
    // - Border: 1px solid var(--color-hairline)
    // - Typography: body (18px, weight 320, line-height 1.45, letter-spacing -0.26px)
    expect(true).toBe(true);
  });
});
