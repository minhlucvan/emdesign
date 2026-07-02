import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ComparisonColumn {
  /** Column header / plan name. */
  header: string;
  /** Whether this column is the featured/popular choice. */
  featured?: boolean;
  /** Cells for each row — rendered in order matching all `rows` or all section rows flattened. */
  cells: React.ReactNode[];
}

export interface ComparisonSection {
  /** Section header label (e.g. "CORE", "INTEGRATIONS", "SECURITY & ADMIN"). */
  label: string;
  /** Row labels within this section. */
  rows: string[];
}

export interface ComparisonTableProps {
  /**
   * Flat row labels — the leftmost column describing each feature row.
   * Mutually exclusive with `sections`; use one or the other.
   */
  rows?: string[];
  /**
   * Section-divided row groups. Each group renders a section header row
   * followed by its feature rows. Mutually exclusive with `rows`.
   */
  sections?: ComparisonSection[];
  /** Column definitions (typically 2–4 plans). */
  columns: ComparisonColumn[];
  /** Additional class names for custom styling. */
  className?: string;
  /** Additional inline styles. */
  style?: React.CSSProperties;
}

// ---------------------------------------------------------------------------
// Style constants — every visual property binds to a semantic CSS custom
// property from the Miro design system.
// ---------------------------------------------------------------------------

const tableOuterStyle: React.CSSProperties = {
  boxSizing: 'border-box',
  width: '100%',
  overflowX: 'auto',
  fontFamily: 'var(--font-sans)',
  WebkitOverflowScrolling: 'touch',
};

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  boxSizing: 'border-box',
};

const headerRowStyle: React.CSSProperties = {
  borderBottom: '2px solid var(--miro-hairline-soft)',
};

const headerCellBase: React.CSSProperties = {
  fontFamily: 'var(--font-family-primary)',
  fontSize: 'var(--font-size-body-sm)',
  fontWeight: 'var(--font-weight-semibold)',
  lineHeight: 1.5,
  color: 'var(--color-text)',
  textAlign: 'center',
  padding: 'var(--space-md) var(--space-sm)',
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
};

const featureCellStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: 14,
  fontWeight: 'var(--font-weight-regular)',
  lineHeight: 1.5,
  color: 'var(--color-text)',
  textAlign: 'left',
  padding: 'var(--space-sm) var(--space-sm)',
  boxSizing: 'border-box',
  borderBottom: '1px solid var(--miro-hairline-soft)',
  whiteSpace: 'nowrap',
};

const valueCellStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: 14,
  fontWeight: 'var(--font-weight-regular)',
  lineHeight: 1.5,
  color: 'var(--color-text)',
  textAlign: 'center',
  padding: 'var(--space-sm) var(--space-sm)',
  boxSizing: 'border-box',
  borderBottom: '1px solid var(--miro-hairline-soft)',
};

const labelCellStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: 14,
  fontWeight: 'var(--font-weight-medium)',
  lineHeight: 1.5,
  color: 'var(--color-text)',
  textAlign: 'left',
  padding: 'var(--space-sm) var(--space-sm)',
  boxSizing: 'border-box',
  borderBottom: '1px solid var(--miro-hairline-soft)',
  whiteSpace: 'nowrap',
};

const featuredHeaderCellStyle: React.CSSProperties = {
  ...headerCellBase,
  color: 'var(--miro-on-primary)',
  backgroundColor: 'var(--miro-primary)',
  borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
};

const featuredValueCellStyle: React.CSSProperties = {
  ...valueCellStyle,
  backgroundColor: 'var(--color-surface)',
};

const featuredLabelCellStyle: React.CSSProperties = {
  ...labelCellStyle,
  backgroundColor: 'var(--color-surface)',
};

const sectionHeaderStyle: React.CSSProperties = {
  fontFamily: 'var(--font-family-primary)',
  fontSize: 'var(--font-size-body-sm)',
  fontWeight: 'var(--font-weight-semibold)',
  lineHeight: 1.5,
  color: 'var(--color-text-heading)',
  textAlign: 'left',
  padding: 'var(--space-sm) var(--space-sm) var(--space-xxs)',
  boxSizing: 'border-box',
  borderBottom: 'none',
};

const sectionDividerCellStyle: React.CSSProperties = {
  height: 'var(--space-xxxs)',
  backgroundColor: 'transparent',
  border: 'none',
  boxSizing: 'border-box',
};

// ---------------------------------------------------------------------------
// ComparisonTable component
// ---------------------------------------------------------------------------

/**
 * `ComparisonTable` — grid-style comparison table for plan / pricing / feature
 * comparison in the Miro design system.
 *
 * Renders a `<table>` element with a header row of plan names (the first column
 * is always the feature label) and successive rows for each feature. Supports
 * `sections` (section-divided row groups with a bold header label per group)
 * or flat `rows`. Also supports a `featured` column variant that uses the black
 * ink (`--miro-primary`) header with a subtle surface background for value cells.
 *
 * Cells rendered as `true`/`false` booleans display a checkmark or em-dash
 * automatically. String or ReactElement cells are rendered as-is.
 *
 * Every visual property binds to a Miro design system CSS custom property —
 * no raw hex values, no hardcoded spacing.
 *
 * ```tsx
 * // Flat rows:
 * <ComparisonTable
 *   rows={['Users', 'Boards', 'Integrations', 'Support']}
 *   columns={[
 *     { header: 'Free', cells: ['Up to 3', 'Unlimited', 'Basic', 'Community'] },
 *     { header: 'Starter', cells: ['Up to 10', 'Unlimited', 'Advanced', 'Email'], featured: true },
 *     { header: 'Business', cells: ['Unlimited', 'Unlimited', 'All', 'Priority'] },
 *   ]}
 * />
 *
 * // Section-divided rows:
 * <ComparisonTable
 *   sections={[
 *     {
 *       label: 'CORE',
 *       rows: ['Boards', 'Users', 'Storage'],
 *     },
 *     {
 *       label: 'INTEGRATIONS',
 *       rows: ['Slack', 'Jira', 'Google Drive'],
 *     },
 *   ]}
 *   columns={[
 *     { header: 'Free', cells: [true, 'Up to 3', '1 GB'] },
 *     { header: 'Starter', cells: [true, 'Up to 10', '10 GB'], featured: true },
 *     { header: 'Business', cells: [true, 'Unlimited', '100 GB'] },
 *   ]}
 * />
 * ```
 */
export function ComparisonTable({
  rows,
  sections,
  columns,
  className,
  style,
  ...rest
}: ComparisonTableProps) {
  // Determine the global row offset for cell indexing.
  // When using sections, each section contributes its rows; section header rows
  // do not consume a cell index (they span the full table width).
  const flatRows = sections
    ? sections.flatMap((s) => s.rows)
    : rows ?? [];

  // Build a lookup: sectionIdx → row offset so we know when to inject a
  // section header before a section's rows.
  const sectionOffsets = sections
    ? sections.reduce<{ label: string; start: number }[]>((acc, s, i) => {
        const prevRows = sections
          .slice(0, i)
          .reduce((sum, x) => sum + x.rows.length, 0);
        acc.push({ label: s.label, start: prevRows });
        return acc;
      }, [])
    : [];

  return (
    <div
      className={className}
      style={{
        ...tableOuterStyle,
        ...style,
      }}
      role="region"
      aria-label="Feature comparison table"
      {...rest}
    >
      <table style={tableStyle}>
        {/* ── Header row ─────────────────────────────────────── */}
        <thead>
          <tr style={headerRowStyle}>
            <th
              style={{
                ...headerCellBase,
                textAlign: 'left',
                color: 'var(--color-text-muted)',
                fontWeight: 'var(--font-weight-regular)',
              }}
            >
              &nbsp;
            </th>
            {columns.map((col, colIdx) => (
              <th
                key={colIdx}
                style={{
                  ...(col.featured ? featuredHeaderCellStyle : headerCellBase),
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        {/* ── Body rows ──────────────────────────────────────── */}
        <tbody>
          {flatRows.map((rowLabel, flatIdx) => {
            // Check if this row is the start of a section → inject section header
            const sectionHeader = sectionOffsets.find(
              (s) => s.start === flatIdx,
            );

            return (
              <React.Fragment key={flatIdx}>
                {sectionHeader && (
                  <tr>
                    <td
                      colSpan={columns.length + 1}
                      style={sectionHeaderStyle}
                    >
                      {sectionHeader.label}
                    </td>
                  </tr>
                )}
                <tr>
                  <td style={labelCellStyle}>{rowLabel}</td>
                  {columns.map((col, colIdx) => {
                    const cellContent = col.cells[flatIdx];
                    // Cells rendered as true/false booleans get a checkmark / dash
                    const rendered =
                      typeof cellContent === 'boolean' ? (
                        <span
                          style={{
                            color: cellContent
                              ? 'var(--miro-primary)'
                              : 'var(--color-text-muted)',
                            fontSize: 16,
                            lineHeight: 1,
                          }}
                          aria-label={
                            cellContent ? 'Included' : 'Not included'
                          }
                        >
                          {cellContent ? '✓' : '—'}
                        </span>
                      ) : (
                        cellContent
                      );

                    return (
                      <td
                        key={colIdx}
                        style={{
                          ...(col.featured
                            ? featuredValueCellStyle
                            : valueCellStyle),
                          fontFamily:
                            typeof cellContent === 'string' &&
                            cellContent.length > 20
                              ? 'var(--font-sans)'
                              : undefined,
                        }}
                      >
                        {rendered}
                      </td>
                    );
                  })}
                </tr>
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

ComparisonTable.displayName = 'ComparisonTable';

export default ComparisonTable;
