import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Heading, Text, Stack } from './index';

/* ------------------------------------------------------------------ */
/*  Elevation data                                                     */
/* ------------------------------------------------------------------ */

interface ElevationEntry {
  name: string;
  level: string;
  description: string;
  cardStyle: React.CSSProperties;
}

const elevationLevels: ElevationEntry[] = [
  {
    name: 'Flat',
    level: 'Level 0',
    description: 'No shadow, no border',
    cardStyle: {
      backgroundColor: 'var(--color-surface-soft)',
      border: 'none',
      boxShadow: 'none',
    },
  },
  {
    name: 'Hairline',
    level: 'Level 1',
    description: '1px hairline border',
    cardStyle: {
      backgroundColor: 'var(--color-canvas)',
      border: '1px solid var(--color-hairline)',
      boxShadow: 'none',
    },
  },
  {
    name: 'Soft Shadow',
    level: 'Level 2',
    description: '0 4px 16px rgba(0,0,0,0.06)',
    cardStyle: {
      backgroundColor: 'var(--color-canvas)',
      border: '1px solid var(--color-hairline)',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
    },
  },
  {
    name: 'Modal',
    level: 'Level 3',
    description: '0 16px 48px rgba(0,0,0,0.18)',
    cardStyle: {
      backgroundColor: 'var(--color-canvas)',
      border: '1px solid var(--color-hairline)',
      boxShadow: '0 16px 48px rgba(0, 0, 0, 0.18)',
    },
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const ElevationSection: React.FC = () => {
  return (
    <div
      style={{
        padding: 'var(--spacing-section) var(--spacing-xl)',
        fontFeatureSettings: '"kern"',
      }}
    >
      <Stack gap="section">
        {/* --- Section header --- */}
        <Stack gap="md">
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--font-size-eyebrow)',
              fontWeight: 'var(--font-weight-eyebrow)',
              lineHeight: 'var(--line-height-eyebrow)',
              letterSpacing: 'var(--letter-spacing-eyebrow)',
              textTransform: 'uppercase',
              color: 'var(--color-ink)',
              fontFeatureSettings: '"kern"',
            }}
          >
            09 — Elevation & Depth
          </span>
          <Heading level={2}>Elevation & Depth</Heading>
          <Text
            variant="body"
            style={{ maxWidth: '640px' }}
          >
            Figma's marketing system is intentionally shadow-light — color
            blocks substitute for traditional elevation. The four levels below
            define the complete spatial vocabulary, from flat surfaces to
            modal overlays.
          </Text>
        </Stack>

        {/* --- Elevation card grid --- */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 'var(--spacing-lg)',
          }}
        >
          {elevationLevels.map((elevation) => (
            <div
              key={elevation.name}
              style={{
                ...elevation.cardStyle,
                borderRadius: 'var(--rounded-lg)',
                padding: 'var(--spacing-lg)',
                height: '140px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                fontFamily: 'var(--font-sans)',
                fontFeatureSettings: '"kern"',
              }}
            >
              <Stack gap="xxs">
                <Text variant="caption" as="div">
                  {elevation.name}
                </Text>
                <Text
                  variant="caption"
                  as="div"
                  style={{
                    color: 'var(--color-border)',
                    lineHeight: '1.0',
                  }}
                >
                  {elevation.level}
                </Text>
              </Stack>
            </div>
          ))}
        </div>
      </Stack>
    </div>
  );
};

ElevationSection.displayName = 'ElevationSection';

/* ------------------------------------------------------------------ */
/*  Storybook export                                                   */
/* ------------------------------------------------------------------ */

const meta: Meta<typeof ElevationSection> = {
  title: 'Design System/figma/Elevation',
  component: ElevationSection,
};

export default meta;
type Story = StoryObj<typeof ElevationSection>;

export const Default: Story = {};
