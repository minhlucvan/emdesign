import React from 'react';

export interface CodeWindowProps extends React.HTMLAttributes<HTMLDivElement> {
  filename?: string;
}

/** Dark code-window card with a filename header and a <pre> code block.
 *  Used for code-mockup cards in product sections (e.g. refactor.py · agent). */
export function CodeWindow({ filename = '', className = '', children, ...props }: CodeWindowProps) {
  return (
    <div
      className={
        'bg-[var(--color-surface-dark)] rounded-[var(--radius-lg)] p-6 text-[var(--color-on-dark)] ' +
        className
      }
      {...props}
    >
      {filename && (
        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/10">
          <span className="font-[var(--font-mono)] text-xs text-[var(--color-on-dark-soft)]">
            {filename}
          </span>
        </div>
      )}
      <pre
        className={
          'bg-[var(--color-surface-dark-soft)] rounded-[var(--radius-sm)] p-4 ' +
          'font-[var(--font-mono)] text-[13px] leading-[1.7] overflow-x-auto'
        }
      >
        {children}
      </pre>
    </div>
  );
}
