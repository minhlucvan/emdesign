import React from 'react';

export interface ConnectorTileProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Single-letter logo or icon element. */
  logo: React.ReactNode;
  /** Tile heading (e.g. "Google Drive"). */
  title: string;
  /** One-line description. */
  description: string;
  className?: string;
}

/** Connector tile — cream card with hairline border, logo badge, heading, and muted caption.
 *  Used in the connector-grid section for integrations like Google Drive, Slack, Notion, etc. */
export function ConnectorTile({
  logo,
  title,
  description,
  className = '',
  ...props
}: ConnectorTileProps) {
  return (
    <div
      className={
        'bg-surface border border-border rounded-lg p-5 ' +
        className
      }
      {...props}
    >
      <div className="w-9 h-9 bg-surface-raised rounded flex items-center justify-center mb-3 text-lg">
        {logo}
      </div>
      <h5 className="text-sm font-medium text-text mb-1">{title}</h5>
      <p className="text-xs text-text-muted leading-normal">{description}</p>
    </div>
  );
}
