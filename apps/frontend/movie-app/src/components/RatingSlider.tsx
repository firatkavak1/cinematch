/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useCallback, useRef } from 'react';

import { theme } from '../styles/theme';

const MIN_RATING = 5.0;
const MAX_RATING = 9.0;
const STEP = 0.5;

interface RatingSliderProps {
  value: number;
  onChange: (value: number) => void;
}

const wrapper = css`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

const headerRow = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: ${theme.colors.text.secondary};
  font-size: 0.85rem;
`;

const ratingValue = css`
  font-family: ${theme.fonts.heading};
  font-size: 1rem;
  color: ${theme.colors.rating.tmdb};
  font-weight: 600;
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
  left: 0;
  height: 6px;
  background: linear-gradient(90deg, ${theme.colors.rating.tmdb}80, ${theme.colors.rating.tmdb});
  border-radius: ${theme.radii.full};
`;

const thumbStyle = css`
  position: absolute;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: ${theme.colors.rating.tmdb};
  border: 3px solid ${theme.colors.bg.primary};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5), 0 0 12px ${theme.colors.rating.tmdb}30;
  transform: translateX(-50%);
  cursor: grab;
  transition: box-shadow 0.2s ease, transform 0.1s ease;
  z-index: 2;

  &:hover {
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.6), 0 0 20px ${theme.colors.rating.tmdb}50;
    transform: translateX(-50%) scale(1.1);
  }

  &:active {
    cursor: grabbing;
    transform: translateX(-50%) scale(1.15);
  }
`;

const scaleRow = css`
  display: flex;
  justify-content: space-between;
  padding: 0 2px;
`;

const scaleMark = css`
  font-size: 0.65rem;
  color: ${theme.colors.text.muted};
  width: 24px;
  text-align: center;
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
    border-color: ${theme.colors.rating.tmdb};
    color: ${theme.colors.rating.tmdb};
    background: ${theme.colors.bg.elevated};
  }
`;

const presetButtonActive = css`
  padding: 4px 12px;
  font-size: 0.75rem;
  border-radius: ${theme.radii.full};
  border: 1px solid ${theme.colors.rating.tmdb};
  background: ${theme.colors.rating.tmdb}18;
  color: ${theme.colors.rating.tmdb};
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
`;

const PRESETS = [
  { label: 'Any (5+)', value: 5.0 },
  { label: 'Good (6+)', value: 6.0 },
  { label: 'Great (7+)', value: 7.0 },
  { label: 'Excellent (8+)', value: 8.0 },
  { label: 'Masterpiece (8.5+)', value: 8.5 },
];

function ratingToPercent(rating: number): number {
  return ((rating - MIN_RATING) / (MAX_RATING - MIN_RATING)) * 100;
}

function percentToRating(percent: number): number {
  const raw = MIN_RATING + (percent / 100) * (MAX_RATING - MIN_RATING);
  // Snap to nearest STEP
  const snapped = Math.round(raw / STEP) * STEP;
  return Math.max(MIN_RATING, Math.min(MAX_RATING, parseFloat(snapped.toFixed(1))));
}

function getLabel(value: number): string {
  if (value >= 8.5) return 'Masterpiece';
  if (value >= 8.0) return 'Excellent';
  if (value >= 7.0) return 'Great';
  if (value >= 6.0) return 'Good';
  return 'Any';
}

// Build scale marks: 5.0, 5.5, 6.0, ... 9.0
const SCALE_MARKS: number[] = [];
for (let r = MIN_RATING; r <= MAX_RATING; r += STEP) {
  SCALE_MARKS.push(parseFloat(r.toFixed(1)));
}

export function RatingSlider({ value, onChange }: RatingSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const getPercentFromEvent = useCallback((clientX: number): number => {
    if (!trackRef.current) return 0;
    const rect = trackRef.current.getBoundingClientRect();
    const percent = ((clientX - rect.left) / rect.width) * 100;
    return Math.max(0, Math.min(100, percent));
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (e.buttons === 0) return;
      const percent = getPercentFromEvent(e.clientX);
      onChange(percentToRating(percent));
    },
    [onChange, getPercentFromEvent],
  );

  const handleTrackClick = useCallback(
    (e: React.MouseEvent) => {
      const percent = getPercentFromEvent(e.clientX);
      onChange(percentToRating(percent));
    },
    [onChange, getPercentFromEvent],
  );

  const percent = ratingToPercent(value);
  const activePreset = PRESETS.find((p) => p.value === value);

  return (
    <div css={wrapper}>
      <div css={headerRow}>
        <span>Min. TMDB Rating</span>
        <span css={ratingValue}>
          {value.toFixed(1)}+ ({getLabel(value)})
        </span>
      </div>

      <div
        ref={trackRef}
        css={trackContainer}
        onClick={handleTrackClick}
        onPointerMove={handlePointerMove}
      >
        <div css={track} />
        <div css={activeTrack} style={{ width: `${percent}%` }} />
        <div
          css={thumbStyle}
          style={{ left: `${percent}%` }}
          onPointerDown={handlePointerDown}
          role="slider"
          aria-label="Minimum TMDB rating"
          aria-valuemin={MIN_RATING}
          aria-valuemax={MAX_RATING}
          aria-valuenow={value}
          tabIndex={0}
        />
      </div>

      <div css={scaleRow}>
        {SCALE_MARKS.filter((_, i) => i % 2 === 0).map((mark) => (
          <span key={mark} css={scaleMark}>
            {mark.toFixed(1)}
          </span>
        ))}
      </div>

      <div css={presetsRow}>
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            css={activePreset?.value === preset.value ? presetButtonActive : presetButton}
            onClick={() => onChange(preset.value)}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}
