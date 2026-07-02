import React from 'react';
import { DisplayHeading } from '@ds/DisplayHeading';
import { Button } from '@ds/Button';
import { CodeBlock } from '@ds/CodeBlock';

export interface OverviewHeroProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

/** Hero section for the Claude landing page — two-column grid with display heading,
 *  body text, CTA buttons, and a terminal code-block mockup. Collapses to single
 *  column <=1024px and hides the code art.
 *
 *  Matches reference: .hero grid (1.1fr/0.9fr), 64px gap, padded 96/48px,
 *  body text at 18px, heading at 64px/1.05/-1.5px EB Garamond. */
export function OverviewHero({ className = '', ...props }: OverviewHeroProps) {
  return (
    <div
      className={className}
      style={{
        padding: '96px 48px',
        background: 'var(--color-surface)',
        display: 'grid',
        gridTemplateColumns: '1.1fr 0.9fr',
        gap: '64px',
        alignItems: 'center',
        maxWidth: '1280px',
        margin: '0 auto',
      }}
      {...props}
    >
      {/* Left column: heading + body + CTA buttons */}
      <div style={{ maxWidth: '720px' }}>
        <DisplayHeading style={{ textAlign: 'left', margin: '0 0 24px' }}>
          Design System Analysis of Claude
        </DisplayHeading>
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '18px',
            color: 'var(--color-body)',
            maxWidth: '540px',
            margin: '0 0 32px',
            lineHeight: '1.55',
            textAlign: 'left',
          }}
        >
          Anthropic's warm-canvas editorial interface. Cream + coral + dark
          navy as the trinity. Slab-serif display headlines, humanist sans body,
          and dark code-mockup cards as product chrome.
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
          <Button variant="primary">Try Claude</Button>
          <Button variant="secondary">Read the docs</Button>
        </div>
      </div>

      {/* Right column: terminal code-block mockup */}
      <div>
        <CodeBlock>
          <span style={{ color: '#8e8b82' }}>
            # Generate a thoughtful response
          </span>
          {'\n'}
          <span style={{ color: '#c898b9' }}>from</span> anthropic{' '}
          <span style={{ color: '#c898b9' }}>import</span> Anthropic
          {'\n\n'}
          client = Anthropic(){'\n'}
          message = client.messages.create({'\n'}
          {'    '}model=<span style={{ color: '#d4a37c' }}>"claude-opus-4"</span>,{'\n'}
          {'    '}max_tokens=<span style={{ color: '#87b8c4' }}>1024</span>,{'\n'}
          {'    '}messages=[{'{'}{'\n'}
          {'        '}
          <span style={{ color: '#d4a37c' }}>"role"</span>:{' '}
          <span style={{ color: '#d4a37c' }}>"user"</span>,{'\n'}
          {'        '}
          <span style={{ color: '#d4a37c' }}>"content"</span>:{' '}
          <span style={{ color: '#d4a37c' }}>"Hello, Claude"</span>
          {'\n'}
          {'    '}{'}'}]{'\n'}
          )
        </CodeBlock>
      </div>
    </div>
  );
}
