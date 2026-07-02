import React from 'react';

export interface ColorSwatchProps {
  /** Display name of the color (e.g. "primary (coral)"). */
  name: string;
  /** Hex value shown in the color bar (e.g. "#cc785c"). */
  hex: string;
  /** Semantic role description (e.g. "All primary CTAs and full-bleed callout cards."). */
  role: string;
  className?: string;
}

/** Color swatch: colored bar with name, hex, and semantic role metadata. */
export function ColorSwatch({ name, hex, role, className = '' }: ColorSwatchProps) {
  return (
    <div className={`border border-border rounded-lg overflow-hidden bg-surface ${className}`}>
      <div className="h-20" style={{ backgroundColor: hex }} />
      <div className="px-3.5 py-3">
        <div className="text-xs font-medium text-text mb-1">{name}</div>
        <div className="text-xs font-mono text-text-muted mb-1.5">{hex}</div>
        <div className="text-xs text-text leading-normal">{role}</div>
      </div>
    </div>
  );
}
