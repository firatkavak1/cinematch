/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useState, useCallback, useRef, useEffect } from 'react';

import { theme } from '../styles/theme';

const MIN_YEAR = 1920;
const MAX_YEAR = new Date().getFullYear();

interface YearRangeBarProps {
  yearFrom: number;
  yearTo: number;
  onChange: (from: number, to: number) => void;
}

const wrapper = css`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

const label = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: ${theme.colors.text.secondary};
  font-size: 0.85rem;
`;

const yearDisplay = css`
  font-family: ${theme.fonts.heading};
  font-size: 1rem;
  color: ${theme.colors.accent.gold};
  font-weight: 600;
  min-width: 40px;
  text-align: center;
`;

const trackContainer = css`
  position: relative;
  height: 36px;
  display: flex;
  align-items: center;
  touch-action: none;
  cursor: pointer;
`;

const track = css`
  position: absolute;
  left: 0;
  right: 0;
  height: 6px;
  background: ${theme.colors.bg.tertiary};
  border-radius: ${theme.radii.full};
`;

const activeTrack = css`
  position: absolute;
  height: 6px;
  background: linear-gradient(90deg, ${theme.colors.accent.goldDark}, ${theme.colors.accent.gold});
  border-radius: ${theme.radii.full};
`;

const thumbStyles = css`
  position: absolute;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: ${theme.colors.accent.gold};
  border: 3px solid ${theme.colors.bg.primary};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5), 0 0 12px ${theme.colors.accent.gold}30;
  transform: translateX(-50%);
  cursor: grab;
  transition: box-shadow 0.2s ease, transform 0.1s ease;
  z-index: 2;

  &:hover {
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.6), 0 0 20px ${theme.colors.accent.gold}50;
    transform: translateX(-50%) scale(1.1);
  }

  &:active {
    cursor: grabbing;
    transform: translateX(-50%) scale(1.15);
  }
`;

const presetsRow = css`
  display: flex;
  gap: ${theme.spacing.xs};
  flex-wrap: wrap;
  justify-content: center;
  margin-top: ${theme.spacing.xs};
`;

const presetButton = css`
  padding: 4px 12px;
  font-size: 0.75rem;
  border-radius: ${theme.radii.full};
  border: 1px solid ${theme.colors.border};
  background: ${theme.colors.bg.tertiary};
  color: ${theme.colors.text.secondary};
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    border-color: ${theme.colors.accent.gold};
    color: ${theme.colors.accent.gold};
    background: ${theme.colors.bg.elevated};
  }
`;

const presetButtonActive = css`
  padding: 4px 12px;
  font-size: 0.75rem;
  border-radius: ${theme.radii.full};
  border: 1px solid ${theme.colors.accent.gold};
  background: ${theme.colors.accent.gold}18;
  color: ${theme.colors.accent.gold};
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
`;

const PRESETS = [
  { label: 'All Time', from: MIN_YEAR, to: MAX_YEAR },
  { label: 'Classics', from: 1920, to: 1975 },
  { label: '80s', from: 1980, to: 1989 },
  { label: '90s', from: 1990, to: 1999 },
  { label: '2000s', from: 2000, to: 2009 },
  { label: '2010s', from: 2010, to: 2019 },
  { label: 'Recent', from: 2020, to: MAX_YEAR },
];

function yearToPercent(year: number): number {
  return ((year - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 100;
}

function percentToYear(percent: number): number {
  const year = Math.round(MIN_YEAR + (percent / 100) * (MAX_YEAR - MIN_YEAR));
  return Math.max(MIN_YEAR, Math.min(MAX_YEAR, year));
}

export function YearRangeBar({ yearFrom, yearTo, onChange }: YearRangeBarProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<'from' | 'to' | null>(null);

  const getPercentFromEvent = useCallback((clientX: number): number => {
    if (!trackRef.current) return 0;
    const rect = trackRef.current.getBoundingClientRect();
    const percent = ((clientX - rect.left) / rect.width) * 100;
    return Math.max(0, Math.min(100, percent));
  }, []);

  const handlePointerDown = useCallback(
    (thumb: 'from' | 'to') => (e: React.PointerEvent) => {
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      setDragging(thumb);
    },
    [],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      const percent = getPercentFromEvent(e.clientX);
      const year = percentToYear(percent);

      if (dragging === 'from') {
        onChange(Math.min(year, yearTo - 1), yearTo);
      } else {
        onChange(yearFrom, Math.max(year, yearFrom + 1));
      }
    },
    [dragging, yearFrom, yearTo, onChange, getPercentFromEvent],
  );

  const handlePointerUp = useCallback(() => {
    setDragging(null);
  }, []);

  const handleTrackClick = useCallback(
    (e: React.MouseEvent) => {
      if (dragging) return;
      const percent = getPercentFromEvent(e.clientX);
      const year = percentToYear(percent);
      const fromDist = Math.abs(year - yearFrom);
      const toDist = Math.abs(year - yearTo);
      if (fromDist < toDist) {
        onChange(Math.min(year, yearTo - 1), yearTo);
      } else {
        onChange(yearFrom, Math.max(year, yearFrom + 1));
      }
    },
    [dragging, yearFrom, yearTo, onChange, getPercentFromEvent],
  );

  // Keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Not handling keyboard here — handled per thumb
    };
    return () => {};
  }, []);

  const fromPercent = yearToPercent(yearFrom);
  const toPercent = yearToPercent(yearTo);

  const activePreset = PRESETS.find((p) => p.from === yearFrom && p.to === yearTo);

  return (
    <div css={wrapper}>
      <div css={label}>
        <span css={yearDisplay}>{yearFrom}</span>
        <span>Year Range</span>
        <span css={yearDisplay}>{yearTo}</span>
      </div>

      <div
        ref={trackRef}
        css={trackContainer}
        onClick={handleTrackClick}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div css={track} />
        <div
          css={activeTrack}
          style={{ left: `${fromPercent}%`, width: `${toPercent - fromPercent}%` }}
        />
        <div
          css={thumbStyles}
          style={{ left: `${fromPercent}%` }}
          onPointerDown={handlePointerDown('from')}
          role="slider"
          aria-label="From year"
          aria-valuemin={MIN_YEAR}
          aria-valuemax={MAX_YEAR}
          aria-valuenow={yearFrom}
          tabIndex={0}
        />
        <div
          css={thumbStyles}
          style={{ left: `${toPercent}%` }}
          onPointerDown={handlePointerDown('to')}
          role="slider"
          aria-label="To year"
          aria-valuemin={MIN_YEAR}
          aria-valuemax={MAX_YEAR}
          aria-valuenow={yearTo}
          tabIndex={0}
        />
      </div>

      <div css={presetsRow}>
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            css={activePreset?.label === preset.label ? presetButtonActive : presetButton}
            onClick={() => onChange(preset.from, preset.to)}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}
