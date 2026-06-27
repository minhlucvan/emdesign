/**
 * Dropdown — captured by emdesign.
 * Reusable, design-system-bound component. Edit freely; re-capture to update.
 */
import React, { useRef, useState, useEffect } from 'react';

interface DropdownItem {
  label: string;
  value: string;
  icon?: string;
  disabled?: boolean;
  divider?: boolean;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  onSelect?: (value: string) => void;
  align?: 'start' | 'end';
  className?: string;
}

/** Dropdown menu triggered by click. */
export function Dropdown({ trigger, items, onSelect, align = 'start', className = '' }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className={`relative inline-flex ${className}`}>
      <button onClick={() => setOpen(!open)} className="focus:outline-none">{trigger}</button>
      {open && (
        <div className={`absolute top-full mt-1 z-50 min-w-[160px] bg-surface-raised border border-border rounded shadow-raised py-1 ${
          align === 'end' ? 'right-0' : 'left-0'
        }`}>
          {items.map((item, i) => (
            item.divider ? (
              <div key={i} className="h-px bg-border my-1" />
            ) : (
              <button
                key={i}
                disabled={item.disabled}
                onClick={() => { onSelect?.(item.value); setOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-1.5 text-[13px] text-left transition-colors duration-[120ms] ${
                  item.disabled ? 'opacity-45 pointer-events-none' : 'text-text hover:bg-surface-hover'
                }`}
              >
                {item.icon && <span className="w-4 text-center">{item.icon}</span>}
                {item.label}
              </button>
            )
          ))}
        </div>
      )}
    </div>
  );
}
