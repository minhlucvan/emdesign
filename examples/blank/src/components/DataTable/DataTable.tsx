/**
 * DataTable — captured by emdesign.
 * Reusable, design-system-bound component. Edit freely; re-capture to update.
 */
import React from 'react';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
}

export interface DataTableProps {
  columns: Column[];
  rows: Record<string, unknown>[];
  onSort?: (key: string) => void;
  sortKey?: string;
  sortDir?: 'asc' | 'desc';
}

/** Dashboard data table: sortable columns, alternating rows, hover states. */
export function DataTable({ columns, rows, onSort, sortKey, sortDir }: DataTableProps) {
  return (
    <div className="bg-surface-raised border border-border rounded overflow-hidden">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border bg-surface">
            {columns.map((col) => (
              <th
                key={col.key}
                className={
                  'text-left text-[12px] font-semibold uppercase tracking-[0.04em] text-text-muted px-3 py-2.5 ' +
                  (col.sortable ? 'cursor-pointer hover:text-text select-none' : '') +
                  (col.width ? ` ${col.width}` : '')
                }
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
              className={
                'border-b border-border last:border-b-0 ' +
                (i % 2 === 0 ? 'bg-surface-raised' : 'bg-surface') +
                ' hover:bg-surface-hover transition-[background-color] duration-[120ms]'
              }
            >
              {columns.map((col) => (
                <td key={col.key} className="px-3 py-2.5 text-[13px] text-text">
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
