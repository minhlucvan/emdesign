import React from 'react';

export interface DisplayScaleProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Additional CSS classes. */
  className?: string;
}

interface SizeEntry {
  label: string;
  metrics: string;
  fontNote?: string;
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  tracking: string;
  sample: string;
}

const displaySizes: SizeEntry[] = [
  {
    label: 'display-xl',
    metrics: '64px / 400 / 1.05 / -1.5px',
    fontNote: 'Copernicus serif',
    fontSize: 'var(--text-display-xl)',
    fontWeight: '400',
    lineHeight: '1.05',
    tracking: '-1.5px',
    sample: 'Meet your thinking partner',
  },
  {
    label: 'display-lg',
    metrics: '48px / 400 / 1.1 / -1px',
    fontSize: 'var(--text-display-lg)',
    fontWeight: '400',
    lineHeight: '1.1',
    tracking: '-1px',
    sample: 'For the curious, the careful, the brilliant',
  },
  {
    label: 'display-md',
    metrics: '36px / 400 / 1.15 / -0.5px',
    fontSize: 'var(--text-display-md)',
    fontWeight: '400',
    lineHeight: '1.15',
    tracking: '-0.5px',
    sample: 'Build with Claude',
  },
  {
    label: 'display-sm',
    metrics: '28px / 400 / 1.2 / -0.3px',
    fontSize: 'var(--text-display-sm)',
    fontWeight: '400',
    lineHeight: '1.2',
    tracking: '-0.3px',
    sample: 'Pricing for every team',
  },
];

/** Display typography scale — renders each display size (xl, lg, md, sm)
 *  as a row with its name, metrics, and a sample sentence in the serif
 *  display font. Uses --font-display (Copernicus/Tiempos) at weight 400
 *  with negative tracking. */
export function DisplayScale({ className = '', ...props }: DisplayScaleProps) {
  return (
    <div className={className} {...props}>
      {displaySizes.map((entry) => (
        <div
          key={entry.label}
          className="grid grid-cols-[320px_1fr] gap-8 items-baseline py-5 border-b border-border last:border-b-0"
        >
          <div className="text-xs text-text-muted leading-relaxed">
            <strong className="block text-text font-medium text-sm mb-1">
              {entry.label}
            </strong>
            {entry.metrics}
            {entry.fontNote && (
              <>
                <br />
                {entry.fontNote}
              </>
            )}
          </div>
          <div
            className="text-text font-[var(--font-display)]"
            style={{
              fontSize: entry.fontSize,
              fontWeight: entry.fontWeight,
              lineHeight: entry.lineHeight,
              letterSpacing: entry.tracking,
            }}
          >
            {entry.sample}
          </div>
        </div>
      ))}
    </div>
  );
}
