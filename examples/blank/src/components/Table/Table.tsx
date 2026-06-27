/**
 * Table — captured by emdesign.
 * Reusable, design-system-bound component. Edit freely; re-capture to update.
 */
import React from 'react';

interface Column { key: string; label: string; sortable?: boolean; width?: string; render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode; }

export interface TableProps {
  columns: Column[];
  rows: Record<string, unknown>[];
  sortKey?: string;
  sortDir?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  onRowClick?: (row: Record<string, unknown>, index: number) => void;
  variant?: 'default' | 'striped' | 'dense';
  className?: string;
}

const rowStyles = {
  default: '',
  striped: (i: number) => i % 2 === 0 ? '' : 'bg-surface',
  dense: 'text-[12px]',
};

/** Data table with sortable columns, row hover, and multiple variants. */
export function Table({ columns, rows, sortKey, sortDir, onSort, onRowClick, variant = 'striped', className = '' }: TableProps) {
  return (
    <div className={`overflow-x-auto border border-border rounded bg-surface-raised ${className}`}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border bg-surface">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`text-left text-[12px] font-semibold uppercase tracking-[0.04em] text-text-muted px-3 py-2.5 ${
                  col.sortable ? 'cursor-pointer hover:text-text select-none' : ''
                } ${col.width ?? ''}`}
                onClick={() => col.sortable && onSort?.(col.key)}
              >
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  {col.sortable && sortKey === col.key && (
                    <span className="text-accent text-[10px]">{sortDir === 'asc' ? '▲' : '▼'}</span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              onClick={() => onRowClick?.(row, i)}
              className={`border-b border-border last:border-b-0 hover:bg-surface-hover transition-[background-color] duration-[120ms] ${
                typeof rowStyles[variant] === 'function' ? rowStyles[variant](i) : rowStyles[variant]
              } ${onRowClick ? 'cursor-pointer' : ''}`}
            >
              {columns.map((col) => (
                <td key={col.key} className={`px-3 py-2.5 text-[13px] text-text ${variant === 'dense' ? 'py-1.5' : ''}`}>
                  {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
