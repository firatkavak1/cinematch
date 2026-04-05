/** @jsxImportSource @emotion/react */
import { css, keyframes } from '@emotion/react';
import type { Movie } from 'shared';
import { TMDB_IMAGE_BASE_URL, TMDB_POSTER_SIZES } from 'shared';

import { theme } from '../styles/theme';

import { CastList } from './CastList';
import { GenreTag } from './GenreTag';
import { RatingBadge } from './RatingBadge';

interface MovieCardProps {
  movie: Movie;
}

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const card = css`
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: ${theme.spacing.xl};
  background: ${theme.colors.bg.card};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  padding: ${theme.spacing.xl};
  box-shadow: ${theme.shadows.card};
  animation: ${fadeIn} 0.5s ease-out;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  max-width: 900px;
  width: 100%;
  overflow: hidden;

  &:hover {
    border-color: ${theme.colors.accent.gold}40;
    box-shadow: ${theme.shadows.glow};
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    padding: ${theme.spacing.md};
    gap: ${theme.spacing.md};
  }
`;

const posterContainer = css`
  position: relative;
  border-radius: ${theme.radii.md};
  overflow: hidden;
  aspect-ratio: 2 / 3;
  background: ${theme.colors.bg.tertiary};

  @media (max-width: 640px) {
    max-width: 200px;
    margin: 0 auto;
  }
`;

const posterImage = css`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const posterPlaceholder = css`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.text.muted};
  font-size: 3rem;
`;

const content = css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  min-width: 0;
  overflow: hidden;
`;

const headerSection = css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`;

const titleStyle = css`
  font-family: ${theme.fonts.heading};
  font-size: 1.6rem;
  font-weight: 700;
  color: ${theme.colors.text.primary};
  line-height: 1.2;
  word-wrap: break-word;
  overflow-wrap: break-word;
`;

const metaLine = css`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  color: ${theme.colors.text.secondary};
  font-size: 0.85rem;
`;

const metaDot = css`
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: ${theme.colors.text.muted};
`;

const taglineStyle = css`
  font-style: italic;
  color: ${theme.colors.text.muted};
  font-size: 0.9rem;
  word-wrap: break-word;
  overflow-wrap: break-word;
`;

const overviewStyle = css`
  color: ${theme.colors.text.secondary};
  font-size: 0.9rem;
  line-height: 1.7;
  word-wrap: break-word;
  overflow-wrap: break-word;
`;

const genreContainer = css`
  display: flex;
  gap: ${theme.spacing.sm};
  flex-wrap: wrap;
`;

const sectionLabel = css`
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${theme.colors.text.muted};
  margin-bottom: 4px;
`;

const directorStyle = css`
  color: ${theme.colors.text.secondary};
  font-size: 0.85rem;
  word-wrap: break-word;
  overflow-wrap: break-word;

  span {
    color: ${theme.colors.text.primary};
    font-weight: 500;
  }
`;

const externalLinksContainer = css`
  display: flex;
  gap: ${theme.spacing.sm};
  flex-wrap: wrap;
  margin-top: 4px;
`;

const externalLink = (color: string) => css`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  background: ${color}15;
  border: 1px solid ${color}40;
  border-radius: ${theme.radii.full};
  color: ${color};
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;

  &:hover {
    background: ${color}25;
    border-color: ${color}70;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px ${color}20;
  }
`;

function formatRuntime(minutes: number | null): string {
  if (!minutes) return '';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function toLetterboxdSlug(title: string, releaseDate: string | null): string {
  const slug = title
    .toLowerCase()
    .replace(/['']/g, '')           // remove apostrophes/smart quotes
    .replace(/[&]/g, 'and')         // & → and
    .replace(/[^a-z0-9\s-]/g, '')   // remove non-alphanumeric
    .replace(/\s+/g, '-')           // spaces → hyphens
    .replace(/-+/g, '-')            // collapse multiple hyphens
    .replace(/^-|-$/g, '');         // trim leading/trailing hyphens
  const year = releaseDate?.slice(0, 4);
  return year ? `${slug}-${year}` : slug;
}

export function MovieCard({ movie }: MovieCardProps) {
  const year = movie.releaseDate?.slice(0, 4) ?? 'N/A';
  const runtime = formatRuntime(movie.runtime);

  return (
    <div css={card}>
      <div css={posterContainer}>
        {movie.posterPath ? (
          <img
            css={posterImage}
            src={`${TMDB_IMAGE_BASE_URL}/${TMDB_POSTER_SIZES.large}${movie.posterPath}`}
            alt={movie.title}
            loading="lazy"
          />
        ) : (
          <div css={posterPlaceholder}>?</div>
        )}
      </div>

      <div css={content}>
        <div css={headerSection}>
          <h2 css={titleStyle}>{movie.title}</h2>
          <div css={metaLine}>
            <span>{year}</span>
            {runtime && (
              <>
                <span css={metaDot} />
                <span>{runtime}</span>
              </>
            )}
            {movie.originalLanguage && (
              <>
                <span css={metaDot} />
                <span>{movie.originalLanguage.toUpperCase()}</span>
              </>
            )}
          </div>
          {movie.tagline && <p css={taglineStyle}>"{movie.tagline}"</p>}
        </div>

        <RatingBadge ratings={movie.ratings} />

        <div css={genreContainer}>
          {movie.genres.map((genre) => (
            <GenreTag key={genre.id} genre={genre} />
          ))}
        </div>

        <div>
          <p css={overviewStyle}>{movie.overview}</p>
        </div>

        {movie.director && (
          <p css={directorStyle}>
            Directed by <span>{movie.director}</span>
          </p>
        )}

        {movie.cast.length > 0 && (
          <div>
            <p css={sectionLabel}>Cast</p>
            <CastList cast={movie.cast} />
          </div>
        )}

        <div css={externalLinksContainer}>
          {movie.imdbId && (
            <a
              css={externalLink(theme.colors.rating.imdb)}
              href={`https://www.imdb.com/title/${movie.imdbId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on IMDb &#8599;
            </a>
          )}
          <a
            css={externalLink(theme.colors.rating.letterboxd)}
            href={`https://letterboxd.com/film/${toLetterboxdSlug(movie.title, movie.releaseDate)}/`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on Letterboxd &#8599;
          </a>
        </div>
      </div>
    </div>
  );
}
