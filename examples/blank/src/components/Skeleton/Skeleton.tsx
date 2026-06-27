/**
 * Skeleton — captured by emdesign.
 * Reusable, design-system-bound component. Edit freely; re-capture to update.
 */
import React from 'react';

type SkeletonVariant = 'text' | 'card' | 'avatar' | 'table' | 'chart';

export interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: string;
  height?: string;
  count?: number;
  className?: string;
}

const variants: Record<SkeletonVariant, { width: string; height: string; className: string }> = {
  text: { width: '100%', height: '14px', className: 'rounded' },
  card: { width: '100%', height: '120px', className: 'rounded' },
  avatar: { width: '40px', height: '40px', className: 'rounded-full' },
  table: { width: '100%', height: '32px', className: 'rounded' },
  chart: { width: '100%', height: '200px', className: 'rounded' },
};

/** Skeleton loading placeholder. Pulse animation for loading states. */
export function Skeleton({ variant = 'text', width, height, count = 1, className = '' }: SkeletonProps) {
  const v = variants[variant];
  const items = Array.from({ length: count });
  return (
    <>
      {items.map((_, i) => (
        <div
          key={i}
          className={`bg-surface-hover animate-pulse ${v.className} ${className}`}
          style={{ width: width ?? v.width, height: height ?? v.height }}
        />
      ))}
    </>
  );
}
