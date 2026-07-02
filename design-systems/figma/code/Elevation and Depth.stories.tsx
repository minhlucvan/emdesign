import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Heading, Text, Stack } from './index';

/* ------------------------------------------------------------------ */
/*  Elevation data                                                     */
/* ------------------------------------------------------------------ */

interface ElevationEntry {
  name: string;
  cardStyle: React.CSSProperties;
}

const elevationLevels: ElevationEntry[] = [
  {
    name: 'Level 0 — flat',
    cardStyle: {
      boxShadow: 'none',
      border: '1px solid var(--color-border-soft)',
    },
  },
  {
    name: 'Level 1 — hairline',
    cardStyle: {
      border: '1px solid var(--color-border)',
    },
  },
  {
    name: 'Level 2 — soft',
    cardStyle: {
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
    },
  },
  {
    name: 'Level 3 — modal',
    cardStyle: {
      boxShadow: '0 12px 32px rgba(0, 0, 0, 0.18)',
    },
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const ElevationSection: React.FC = () => {
  const baseCardStyle: React.CSSProperties = {
    backgroundColor: 'var(--color-surface)',
    borderRadius: 'var(--rounded-lg)',
    padding: 'var(--spacing-xl)',
    height: '140px',
    display: 'flex',
    alignItems: 'flex-end',
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    fontWeight: 'var(--font-weight-caption)',
    lineHeight: '1.0',
    letterSpacing: 'var(--letter-spacing-caption)',
    textTransform: 'uppercase',
    opacity: 0.85,
    fontFeatureSettings: '"kern"',
  };

  return (
    <section
      style={{
        padding: 'var(--spacing-section) var(--spacing-xl)',
        fontFeatureSettings: '"kern"',
      }}
    >
      <Stack gap="md" style={{ marginBottom: 'var(--spacing-xl)' }}>
        <Text variant="caption">09 — Elevation & Depth</Text>
        <Heading level={2}>Elevation</Heading>
      </Stack>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 'var(--spacing-lg)',
          backgroundColor: 'var(--color-surface-soft)',
          borderRadius: 'var(--rounded-lg)',
          padding: 'var(--spacing-xxl)',
        }}
      >
        {elevationLevels.map((elevation) => (
          <div
            key={elevation.name}
            style={{
              ...baseCardStyle,
              ...elevation.cardStyle,
            }}
          >
            {elevation.name}
          </div>
        ))}
      </div>
    </section>
  );
};

ElevationSection.displayName = 'ElevationSection';

/* ------------------------------------------------------------------ */
/*  Storybook export                                                   */
/* ------------------------------------------------------------------ */

const meta: Meta<typeof ElevationSection> = {
  title: 'Design System/figma/Elevation and Depth',
  component: ElevationSection,
};

export default meta;
type Story = StoryObj<typeof ElevationSection>;

export const Default: Story = {};
