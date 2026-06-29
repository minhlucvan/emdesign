import React, { useCallback, useRef, useState } from 'react';
import { styled } from '@storybook/theming';
import { SectionCard } from './SectionCard';
import type { DesignSystemFull, RefinementScope } from '../constants';

const SliderRow = styled.div(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  marginBottom: 8,
}));

const SliderLabel = styled.div(({ theme }) => ({
  font: `600 11px ${theme.typography.fonts.base}`,
  color: theme.textMutedColor,
  minWidth: 80,
}));

const SliderControl = styled.input({
  flex: 1,
  height: 20,
  cursor: 'pointer',
  accentColor: 'var(--color-secondary, #1ea7fd)',
});

const SliderValue = styled.div(({ theme }) => ({
  font: `11px ${theme.typography.fonts.mono}`,
  color: theme.color.defaultText,
  minWidth: 40,
  textAlign: 'right',
}));

const EmptyState = styled.div(({ theme }) => ({
  font: `12px ${theme.typography.fonts.base}`,
  color: theme.textMutedColor,
  fontStyle: 'italic',
}));

function useDebouncedCallback(fn: (value: string) => void, delay: number) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  return useCallback(
    (value: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => fn(value), delay);
    },
    [fn, delay],
  );
}

const SPACE_UNIT_SLIDER = { min: 2, max: 16, step: 2 };
const RADIUS_SLIDER = { min: 0, max: 24, step: 2 };

export interface SpacingCardProps {
  system: DesignSystemFull;
  scope?: RefinementScope;
  onAction?: (payload: { scope: RefinementScope; instruction?: string }) => void;
  refinementStatus?: 'idle' | 'refining' | 'queued' | 'success' | 'error';
}

export function SpacingCard({ system, scope = 'spacing', onAction, refinementStatus }: SpacingCardProps) {
  const dimensionTokens = system.tokens.filter((t) => t.kind === 'dimension');
  const spaceToken = dimensionTokens.find((t) => t.role === 'space-unit');
  const radiusTokens = dimensionTokens.filter((t) => t.role.startsWith('radius-'));

  const [spaceVal, setSpaceVal] = useState(spaceToken ? parseInt(spaceToken.value, 10) : 8);
  const [radiusSm, setRadiusSm] = useState(
    () => parseInt(radiusTokens.find((t) => t.role === 'radius-sm')?.value || '4', 10),
  );
  const [radiusMd, setRadiusMd] = useState(
    () => parseInt(radiusTokens.find((t) => t.role === 'radius-md')?.value || '8', 10),
  );
  const [radiusLg, setRadiusLg] = useState(
    () => parseInt(radiusTokens.find((t) => t.role === 'radius-lg')?.value || '16', 10),
  );

  if (dimensionTokens.length === 0) {
    return (
      <SectionCard title="Spacing & Shape" scope={scope} defaultCollapsed={true} onAction={onAction} refinementStatus={refinementStatus}>
        <EmptyState>No spacing tokens</EmptyState>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Spacing & Shape" scope={scope} defaultCollapsed={true} onAction={onAction} refinementStatus={refinementStatus}>
      <SliderRow>
        <SliderLabel>Space unit</SliderLabel>
        <SliderControl
          type="range"
          min={SPACE_UNIT_SLIDER.min}
          max={SPACE_UNIT_SLIDER.max}
          step={SPACE_UNIT_SLIDER.step}
          value={spaceVal}
          onChange={(e) => setSpaceVal(Number(e.target.value))}
        />
        <SliderValue>{spaceVal}px</SliderValue>
      </SliderRow>
      {radiusTokens.length > 0 && (
        <>
          <SliderRow>
            <SliderLabel>Radius sm</SliderLabel>
            <SliderControl
              type="range"
              min={RADIUS_SLIDER.min}
              max={RADIUS_SLIDER.max}
              step={RADIUS_SLIDER.step}
              value={radiusSm}
              onChange={(e) => setRadiusSm(Number(e.target.value))}
            />
            <SliderValue>{radiusSm}px</SliderValue>
          </SliderRow>
          <SliderRow>
            <SliderLabel>Radius md</SliderLabel>
            <SliderControl
              type="range"
              min={RADIUS_SLIDER.min}
              max={RADIUS_SLIDER.max}
              step={RADIUS_SLIDER.step}
              value={radiusMd}
              onChange={(e) => setRadiusMd(Number(e.target.value))}
            />
            <SliderValue>{radiusMd}px</SliderValue>
          </SliderRow>
          <SliderRow>
            <SliderLabel>Radius lg</SliderLabel>
            <SliderControl
              type="range"
              min={RADIUS_SLIDER.min}
              max={RADIUS_SLIDER.max}
              step={RADIUS_SLIDER.step}
              value={radiusLg}
              onChange={(e) => setRadiusLg(Number(e.target.value))}
            />
            <SliderValue>{radiusLg}px</SliderValue>
          </SliderRow>
        </>
      )}
      {radiusTokens.length === 0 && (
        <EmptyState>No radius tokens</EmptyState>
      )}
    </SectionCard>
  );
}
