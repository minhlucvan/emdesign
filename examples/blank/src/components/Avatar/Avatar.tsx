/**
 * Avatar — captured by emdesign.
 * Reusable, design-system-bound component. Edit freely; re-capture to update.
 */
import React from 'react';

type AvatarSize = 'sm' | 'md' | 'lg';

export interface AvatarProps {
  src?: string;
  name: string;
  size?: AvatarSize;
  status?: 'online' | 'offline' | 'away';
  className?: string;
}

const sizeMap: Record<AvatarSize, { dim: string; font: string }> = {
  sm: { dim: 'w-8 h-8', font: 'text-[11px]' },
  md: { dim: 'w-10 h-10', font: 'text-[13px]' },
  lg: { dim: 'w-12 h-12', font: 'text-[15px]' },
};

const statusColors = { online: 'bg-success', offline: 'bg-border', away: 'bg-warn' };

/** Avatar: image or initials, with optional status dot. */
export function Avatar({ src, name, size = 'md', status, className = '' }: AvatarProps) {
  const s = sizeMap[size];
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      {src ? (
        <img src={src} alt={name} className={`${s.dim} rounded-full object-cover bg-surface-hover`} />
      ) : (
        <div className={`${s.dim} rounded-full bg-accent-muted text-accent flex items-center justify-center font-semibold ${s.font}`}>
          {initials}
        </div>
      )}
      {status && (
        <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-surface-raised ${statusColors[status]}`} />
      )}
    </div>
  );
}
