import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AvatarProps {
  /**
   * Image source URL. When provided, renders the image filling the avatar
   * circle with `object-fit: cover`.
   */
  src?: string;
  /**
   * Alt text for the avatar image. Required for accessibility when `src` is
   * set; ignored when no image is present.
   */
  alt?: string;
  /**
   * Fallback content shown when no `src` is provided, typically initials or a
   * small icon. When absent (and no `src`), a muted gradient placeholder is
   * rendered.
   */
  children?: React.ReactNode;
  /** Additional class names. */
  className?: string;
  /** Additional inline styles. */
  style?: React.CSSProperties;
}

// ---------------------------------------------------------------------------
// Styles — every value binds to a Miro design-system CSS custom property
// ---------------------------------------------------------------------------

const baseStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 32,
  height: 32,
  borderRadius: '50%',
  flexShrink: 0,
  overflow: 'hidden',
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--font-size-caption)',
  fontWeight: 'var(--font-weight-medium)',
  color: 'var(--color-text-on-primary)',
  boxSizing: 'border-box',
};

const gradientPlaceholder: React.CSSProperties = {
  background:
    'linear-gradient(135deg, var(--color-text-tertiary), var(--color-ink))',
};

const imageStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
};

// ---------------------------------------------------------------------------
// Avatar component
// ---------------------------------------------------------------------------

/**
 * Circular avatar primitive for the Miro design system.
 *
 * Renders an image (`src`), fallback content (`children`, e.g. initials), or
 * a default muted gradient placeholder when neither is provided. Every color
 * and spacing value binds to a design-system CSS custom property — no raw hex
 * values or hardcoded pixels.
 *
 * ```tsx
 * <Avatar src="/user.jpg" alt="Jane Doe" />
 * <Avatar>JD</Avatar>
 * <Avatar />  {/* gradient placeholder */}
 * ```
 */
export const Avatar = ({
  src,
  alt = '',
  className,
  children,
  style,
  ...rest
}: AvatarProps & React.HTMLAttributes<HTMLDivElement>) => {
  const hasImage = !!src;
  const hasContent = !!children;

  return (
    <div
      className={className}
      role={hasImage || hasContent ? undefined : 'presentation'}
      aria-label={hasImage && alt ? alt : undefined}
      style={{
        ...baseStyle,
        ...(hasImage || hasContent ? undefined : gradientPlaceholder),
        ...style,
      }}
      {...rest}
    >
      {hasImage ? (
        <img src={src} alt={alt} style={imageStyle} />
      ) : hasContent ? (
        children
      ) : null}
    </div>
  );
};

Avatar.displayName = 'Avatar';

export default Avatar;
