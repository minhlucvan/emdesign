import React from 'react';
import { Link } from './Link';

export interface TextLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  className?: string;
}

/** Inline coral text link with underline — "View capabilities ->" / "Read the research ->"
 *  appearing in model-comparison cards and body text.
 *  Reuses the Link primitive (text-accent underline) per SKILL.md: never re-author. */
export function TextLink({ className = '', ...props }: TextLinkProps) {
  return <Link className={className} {...props} />;
}
