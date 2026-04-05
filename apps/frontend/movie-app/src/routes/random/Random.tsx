/** @jsxImportSource @emotion/react */
import { css, keyframes } from '@emotion/react';
import { useState, useCallback } from 'react';
import type { Movie } from 'shared';

import { MovieCard } from '../../components/MovieCard';
import { LoadingIndicator } from '../../components/LoadingIndicator';
import { YearRangeBar } from '../../components/YearRangeBar';
import { GenrePicker } from '../../components/GenrePicker';
import { CountryPicker } from '../../components/CountryPicker';
import { RatingSlider } from '../../components/RatingSlider';
import { fetchRandomMovie } from '../../domain/api';
import { theme } from '../../styles/theme';

const MIN_YEAR = 1920;
const MAX_YEAR = new Date().getFullYear();

// ─── Two-column layout ────────────────────────────────────────────
const pageLayout = css`
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: ${theme.spacing.xl};
  align-items: start;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`;

// ─── Left column: filters ─────────────────────────────────────────
const filtersPanel = css`
  position: sticky;
  top: 80px;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.lg};
  background: ${theme.colors.bg.secondary};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  max-height: calc(100vh - 104px);
  overflow-y: auto;

  /* Thin scrollbar for the filters panel */
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${theme.colors.border};
    border-radius: 2px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }

  @media (max-width: 960px) {
    position: static;
    max-height: none;
  }
`;

const filtersTitle = css`
  font-family: ${theme.fonts.heading};
  font-size: 1.05rem;
  color: ${theme.colors.text.primary};
  letter-spacing: 0.02em;
  text-align: center;
`;

const divider = css`
  width: 100%;
  height: 1px;
  background: ${theme.colors.border};
`;

// ─── Right column: result ─────────────────────────────────────────
const resultColumn = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.lg};
  padding-top: ${theme.spacing.sm};
`;

const description = css`
  text-align: center;
  max-width: 600px;
`;

const descTitle = css`
  font-family: ${theme.fonts.heading};
  font-size: 1.8rem;
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.xs};
`;

const descText = css`
  color: ${theme.colors.text.secondary};
  font-size: 0.92rem;
  line-height: 1.5;
`;

const sparkle = keyframes`
  0%, 100% { box-shadow: 0 0 10px ${theme.colors.accent.gold}40; }
  50% { box-shadow: 0 0 25px ${theme.colors.accent.gold}60; }
`;

const surpriseButton = css`
  padding: 14px 36px;
  background: linear-gradient(135deg, ${theme.colors.accent.gold}, ${theme.colors.accent.goldDark});
  color: ${theme.colors.bg.primary};
  border: none;
  border-radius: ${theme.radii.full};
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition: all 0.3s ease;
  animation: ${sparkle} 3s ease-in-out infinite;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px ${theme.colors.accent.gold}50;
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    animation: none;
    transform: none;
  }
`;

const errorText = css`
  color: ${theme.colors.accent.red};
  font-size: 0.9rem;
  padding: ${theme.spacing.md};
  background: ${theme.colors.accent.red}10;
  border: 1px solid ${theme.colors.accent.red}30;
  border-radius: ${theme.radii.md};
  text-align: center;
`;

const movieCardWrapper = css`
  width: 100%;
  display: flex;
  justify-content: center;
`;

export function Random() {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [yearFrom, setYearFrom] = useState(MIN_YEAR);
  const [yearTo, setYearTo] = useState(MAX_YEAR);
  const [genreId, setGenreId] = useState<number | null>(null);
  const [language, setLanguage] = useState<string | null>(null);
  const [ratingMin, setRatingMin] = useState(7.0);

  const handleYearChange = useCallback((from: number, to: number) => {
    setYearFrom(from);
    setYearTo(to);
  }, []);

  const isAllTime = yearFrom === MIN_YEAR && yearTo === MAX_YEAR;
  const isDefaultRating = ratingMin === 7.0;
  const hasFilters = !isAllTime || genreId !== null || language !== null || !isDefaultRating;

  const handleSurpriseMe = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const options: {
        yearFrom?: number;
        yearTo?: number;
        genreId?: number;
        language?: string;
        ratingMin?: number;
      } = {};

      if (!isAllTime) {
        options.yearFrom = yearFrom;
        options.yearTo = yearTo;
      }
      if (genreId !== null) options.genreId = genreId;
      if (language !== null) options.language = language;
      if (!isDefaultRating) options.ratingMin = ratingMin;

      const response = await fetchRandomMovie(hasFilters ? options : undefined);
      setMovie(response.movie);
    } catch (err) {
      setError('No movies found with these filters. Try changing your selections!');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [yearFrom, yearTo, isAllTime, genreId, language, ratingMin, isDefaultRating, hasFilters]);

  return (
    <div css={pageLayout}>
      {/* ── Left: Filters ── */}
      <aside css={filtersPanel}>
        <span css={filtersTitle}>Filters</span>

        <GenrePicker selected={genreId} onChange={setGenreId} />

        <div css={divider} />

        <CountryPicker selected={language} onChange={setLanguage} />

        <div css={divider} />

        <YearRangeBar yearFrom={yearFrom} yearTo={yearTo} onChange={handleYearChange} />

        <div css={divider} />

        <RatingSlider value={ratingMin} onChange={setRatingMin} />
      </aside>

      {/* ── Right: Result ── */}
      <div css={resultColumn}>
        <div css={description}>
          <h2 css={descTitle}>Feeling Lucky?</h2>
          <p css={descText}>
            Pick your filters, then hit the button for a surprise recommendation.
          </p>
        </div>

        <button css={surpriseButton} onClick={handleSurpriseMe} disabled={isLoading}>
          {isLoading ? 'Finding your movie...' : movie ? 'Surprise Me Again!' : 'Surprise Me!'}
        </button>

        {isLoading && <LoadingIndicator text="Picking a gem for you..." />}

        {error && <p css={errorText}>{error}</p>}

        {movie && !isLoading && (
          <div css={movieCardWrapper}>
            <MovieCard movie={movie} />
          </div>
        )}
      </div>
    </div>
  );
}
