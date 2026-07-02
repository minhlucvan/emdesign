import React from 'react';

export interface FooterCreditProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Additional className for the credit container. */
  className?: string;
}

/** Footer credit bar — sits at the bottom of the dark footer band.
 *  Renders a "Maintained by <team-link>" line with a hairline top separator.
 *  Matches the .footer-credit section from the Claude design reference.
 *  Children may be provided to customise the credit text and links. */
export function FooterCredit({ className = '', children, ...props }: FooterCreditProps) {
  return (
    <div
      className={
        'mt-12 pt-6 border-t border-border ' +
        'text-text-muted text-sm leading-[1.4] ' +
        className
      }
      {...props}
    >
      {children || (
        <>
          Maintained by{' '}
          <a
            href="https://github.com/VoltAgent/voltagent"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold no-underline text-inherit"
          >
            <img
              src="https://github.com/VoltAgent.png?size=32"
              alt="VoltAgent"
              width={14}
              height={14}
              className="rounded-sm inline-block align-[-2px] mr-1"
            />
            VoltAgent
          </a>{' '}
          team
        </>
      )}
    </div>
  );
}
