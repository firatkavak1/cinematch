/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import type { MovieRatings } from 'shared';

import { theme } from '../styles/theme';

interface RatingBadgeProps {
  ratings: MovieRatings;
}

const ratingContainer = css`
  display: flex;
  gap: ${theme.spacing.md};
  flex-wrap: wrap;
  align-items: center;
`;

const badge = (bgColor: string) => css`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: ${bgColor}20;
  border: 1px solid ${bgColor}40;
  border-radius: ${theme.radii.full};
  font-size: 0.8rem;
  font-weight: 600;
  color: ${theme.colors.text.primary};
  white-space: nowrap;
`;

const scoreStyle = (color: string) => css`
  color: ${color};
  font-weight: 700;
`;

const labelStyle = css`
  color: ${theme.colors.text.secondary};
  font-weight: 400;
  font-size: 0.7rem;
`;

export function RatingBadge({ ratings }: RatingBadgeProps) {
  return (
    <div css={ratingContainer}>
      {/* TMDB */}
      <div css={badge(theme.colors.rating.tmdb)}>
        <span css={labelStyle}>TMDB</span>
        <span css={scoreStyle(theme.colors.rating.tmdb)}>
          {ratings.tmdb.score.toFixed(1)}
        </span>
      </div>

      {/* IMDb */}
      {ratings.imdb.score && (
        <div css={badge(theme.colors.rating.imdb)}>
          <span css={labelStyle}>IMDb</span>
          <span css={scoreStyle(theme.colors.rating.imdb)}>{ratings.imdb.score}</span>
        </div>
      )}

      {/* Rotten Tomatoes */}
      {ratings.rottenTomatoes.score && (
        <div css={badge(theme.colors.rating.rottenTomatoes)}>
          <span css={labelStyle}>RT</span>
          <span css={scoreStyle(theme.colors.rating.rottenTomatoes)}>
            {ratings.rottenTomatoes.score}
          </span>
        </div>
      )}

      {/* Metascore */}
      {ratings.metascore && (
        <div css={badge(theme.colors.rating.meta)}>
          <span css={labelStyle}>Meta</span>
          <span css={scoreStyle(theme.colors.rating.meta)}>{ratings.metascore}</span>
        </div>
      )}
    </div>
  );
}
