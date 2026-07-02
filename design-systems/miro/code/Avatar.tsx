import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Image source URL. When omitted, the gradient fallback is shown. */
  src?: string;
  /** Alt text for the image (required for accessibility when `src` is set). */
  alt?: string;
  /** Initials shown over the gradient fallback when no `src` is provided
   *  (e.g. "JH"). */
  fallback?: string;
  /** Diameter in px. Defaults to 32 to match the Miro author-row pattern. */
  size?: number;
  /** Additional class names for custom styling. */
  className?: string;
}

// ---------------------------------------------------------------------------
// Base style — every visual property binds to a Miro CSS custom property
// ---------------------------------------------------------------------------

const baseStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  borderRadius: '50%',
  overflow: 'hidden',
  fontFamily: 'var(--font-sans)',
  fontWeight: 'var(--font-weight-medium)',
  color: 'var(--miro-on-primary)',
  lineHeight: 1,
  userSelect: 'none',
  boxSizing: 'border-box',
};

// ---------------------------------------------------------------------------
// Avatar component
// ---------------------------------------------------------------------------

/**
 * `Avatar` — circular user avatar for the Miro design system.
 *
 * Renders a circular `<div>` that shows either an image (`src` prop) or a
 * gradient fallback with optional initials (`fallback` prop). The default
 * size is 32 px, matching the author-row avatar in Miro's customer story
 * cards. The gradient uses Miro's neutral steel-to-slate palette via CSS
 * custom properties so it can be overridden per install.
 *
 * Every visual property binds to a Miro design system CSS custom property —
 * no raw hex values, no hardcoded spacing.
 *
 * ```tsx
 * <Avatar src="/portrait.jpg" alt="User name" />
 * <Avatar fallback="JH" />
 * <Avatar size={40} fallback="JD" />
 * ```
 */
export function Avatar({
  src,
  alt = '',
  fallback,
  size = 32,
  className,
  style,
  ...rest
}: AvatarProps) {
  const rootStyle: React.CSSProperties = {
    ...baseStyle,
    width: size,
    height: size,
    ...(!src
      ? {
          background:
            'linear-gradient(135deg, var(--color-avatar-start), var(--color-avatar-end))',
        }
      : {}),
    ...style,
  };

  return (
    <div
      className={className}
      style={rootStyle}
      role={src ? undefined : 'img'}
      aria-label={
        src ? undefined : fallback || alt || undefined
      }
      {...rest}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      ) : fallback ? (
        <span
          style={{
            fontSize: Math.max(10, Math.round(size * 0.4)),
            lineHeight: 1,
          }}
        >
          {fallback}
        </span>
      ) : null}
    </div>
  );
}

Avatar.displayName = 'Avatar';

export default Avatar;
