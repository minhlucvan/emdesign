/**
 * Pagination — captured by emdesign.
 * Reusable, design-system-bound component. Edit freely; re-capture to update.
 */
import React from 'react';

export interface PaginationProps {
  total: number;
  page: number;
  onChange?: (page: number) => void;
  siblingCount?: number;
  className?: string;
}

function range(start: number, end: number): (number | 'ellipsis')[] {
  const result: (number | 'ellipsis')[] = [];
  for (let i = start; i <= end; i++) result.push(i);
  return result;
}

function paginate(total: number, page: number, siblings: number): (number | 'ellipsis')[] {
  const totalPages = Math.max(1, total);
  if (totalPages <= 7) return range(1, totalPages);
  const left = Math.max(1, page - siblings);
  const right = Math.min(totalPages, page + siblings);
  const pages: (number | 'ellipsis')[] = [];
  if (left > 2) { pages.push(1, 'ellipsis'); }
  else { for (let i = 1; i < left; i++) pages.push(i); }
  for (let i = left; i <= right; i++) pages.push(i);
  if (right < totalPages - 1) { pages.push('ellipsis', totalPages); }
  else { for (let i = right + 1; i <= totalPages; i++) pages.push(i); }
  return pages;
}

/** Pagination with ellipsis for large page counts. */
export function Pagination({ total, page, onChange, siblingCount = 1, className = '' }: PaginationProps) {
  const pages = paginate(total, page, siblingCount);
  return (
    <nav className={`inline-flex items-center gap-1 ${className}`} aria-label="Pagination">
      <button
        disabled={page <= 1}
        onClick={() => onChange?.(page - 1)}
        className="h-8 px-2 rounded text-[13px] text-text-muted hover:text-text hover:bg-surface-hover disabled:opacity-30 disabled:pointer-events-none transition-colors duration-[120ms]"
      >
        ← Prev
      </button>
      {pages.map((p, i) =>
        p === 'ellipsis' ? (
          <span key={`e${i}`} className="w-8 text-center text-[13px] text-text-muted">...</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange?.(p)}
            className={`w-8 h-8 rounded text-[13px] font-medium transition-colors duration-[120ms] ${
              p === page ? 'bg-accent text-white' : 'text-text-muted hover:text-text hover:bg-surface-hover'
            }`}
          >
            {p}
          </button>
        )
      )}
      <button
        disabled={page >= total}
        onClick={() => onChange?.(page + 1)}
        className="h-8 px-2 rounded text-[13px] text-text-muted hover:text-text hover:bg-surface-hover disabled:opacity-30 disabled:pointer-events-none transition-colors duration-[120ms]"
      >
        Next →
      </button>
    </nav>
  );
}
