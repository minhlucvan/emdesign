import React from 'react';

export interface ResponsiveTableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  /** Column headers (rendered in <thead>). */
  headers?: string[];
  /** Breakpoint rows as [name, width, keyChanges]. */
  rows?: [string, string, string][];
}

const cellStyles =
  'text-left px-4 py-3.5 border-b border-border ' +
  'max-sm:px-2 max-sm:py-2.5';

/** Table capturable at each of 4 breakpoints — uppercase tracked header, hairline separators. */
export function ResponsiveTable({
  headers = ['Name', 'Width', 'Key Changes'],
  rows = [
    ['Mobile', '< 768px', 'Hamburger nav; hero h1 64→32px; hero-art stacks below; feature grids 1-up; pricing 1-up.'],
    ['Tablet', '768–1024px', 'Top nav tightens; feature cards 2-up; connector tiles 3-up; pricing 2-up.'],
    ['Desktop', '1024–1440px', 'Full top-nav; 3-up feature cards; 4-6 up connector tiles; 4-up pricing.'],
    ['Wide', '> 1440px', 'Same as desktop with more breathing room; max content 1200px.'],
  ],
  className = '',
  ...props
}: ResponsiveTableProps) {
  return (
    <table
      className={
        'w-full border-collapse mb-8 text-sm ' +
        'max-sm:text-xs ' +
        className
      }
      {...props}
    >
      <thead>
        <tr>
          {headers.map((h) => (
            <th
              key={h}
              className={
                cellStyles +
                ' text-xs font-medium uppercase tracking-wider text-text'
              }
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map(([name, width, changes]) => (
          <tr key={name}>
            <td className={cellStyles + ' font-medium text-text'}>{name}</td>
            <td className={cellStyles + ' text-text-muted'}>{width}</td>
            <td className={cellStyles + ' text-text-muted'}>{changes}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
