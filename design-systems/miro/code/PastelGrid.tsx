import React from 'react';
import { PastelCard, type PastelCardVariant } from './PastelCard';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PastelGridItem {
  /** Card color variant. Defaults to 'yellow'. */
  variant?: PastelCardVariant;
  /** Badge/tag label displayed at the top of the card (e.g. "Templates"). */
  tag: string;
  /** Card heading text. */
  title: string;
  /** Card description text. */
  description: string;
}

export interface PastelGridProps {
  /** Additional class names for custom styling. */
  className?: string;
  /** Array of pastel card items to render in the grid. */
  items: PastelGridItem[];
}

// ---------------------------------------------------------------------------
// Base grid styles — every visual property binds to a Miro CSS custom property
// ---------------------------------------------------------------------------

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: 'var(--space-md)',
  boxSizing: 'border-box',
};

// ---------------------------------------------------------------------------
// PastelGrid component
// ---------------------------------------------------------------------------

/**
 * `PastelGrid` — responsive grid of pastel feature cards for the Miro design
 * system.
 *
 * Renders a CSS grid of `<PastelCard>` components using the brand's sticky-note
 * palette (yellow, coral, teal, rose). Every visual property binds to a Miro
 * design system CSS custom property — no raw hex values, no hardcoded spacing.
 *
 * ```tsx
 * <PastelGrid
 *   items={[
 *     { variant: 'yellow', tag: 'Yellow', title: 'AI Workflows', description: 'Build out workflows that actually reduce workload.' },
 *     { variant: 'coral',  tag: 'Templates', title: 'Templates', description: 'Get started with thousands of templates ready to use.' },
 *     { variant: 'teal',   tag: 'Boards', title: 'Sidebars', description: 'Track AI-built tasks with sidebars that consolidate context.' },
 *     { variant: 'rose',   tag: 'Spaces', title: 'Spaces', description: 'Connect your company knowledge to speed up the work.' },
 *   ]}
 * />
 * ```
 */
export function PastelGrid({
  className,
  items,
  ...rest
}: PastelGridProps & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={className}
      style={gridStyle}
      {...rest}
    >
      {items.map((item, index) => (
        <PastelCard
          key={index}
          variant={item.variant}
          tag={item.tag}
          title={item.title}
          description={item.description}
        />
      ))}
    </div>
  );
}

PastelGrid.displayName = 'PastelGrid';

export default PastelGrid;
