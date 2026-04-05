/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useEffect, useState } from 'react';
import type { Genre } from 'shared';

import { fetchGenres } from '../domain/api';
import { theme } from '../styles/theme';

interface GenrePickerProps {
  selected: number | null;
  onChange: (genreId: number | null) => void;
}

const wrapper = css`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

const heading = css`
  text-align: center;
  color: ${theme.colors.text.secondary};
  font-size: 0.85rem;
`;

const grid = css`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
`;

const chipBase = css`
  padding: 5px 14px;
  font-size: 0.78rem;
  font-weight: 500;
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

const chipActive = css`
  padding: 5px 14px;
  font-size: 0.78rem;
  font-weight: 600;
  border-radius: ${theme.radii.full};
  border: 1px solid ${theme.colors.accent.gold};
  background: ${theme.colors.accent.gold}18;
  color: ${theme.colors.accent.gold};
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
`;

const chipAll = css`
  padding: 5px 14px;
  font-size: 0.78rem;
  font-weight: 500;
  border-radius: ${theme.radii.full};
  border: 1px solid ${theme.colors.border};
  background: ${theme.colors.bg.tertiary};
  color: ${theme.colors.text.secondary};
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  font-style: italic;

  &:hover {
    border-color: ${theme.colors.accent.gold};
    color: ${theme.colors.accent.gold};
    background: ${theme.colors.bg.elevated};
  }
`;

const chipAllActive = css`
  padding: 5px 14px;
  font-size: 0.78rem;
  font-weight: 600;
  border-radius: ${theme.radii.full};
  border: 1px solid ${theme.colors.accent.gold};
  background: ${theme.colors.accent.gold}18;
  color: ${theme.colors.accent.gold};
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  font-style: italic;
`;

export function GenrePicker({ selected, onChange }: GenrePickerProps) {
  const [genres, setGenres] = useState<Genre[]>([]);

  useEffect(() => {
    fetchGenres()
      .then((res) => setGenres(res.genres))
      .catch(() => {});
  }, []);

  if (genres.length === 0) return null;

  return (
    <div css={wrapper}>
      <span css={heading}>Genre</span>
      <div css={grid}>
        <button
          css={selected === null ? chipAllActive : chipAll}
          onClick={() => onChange(null)}
        >
          Any Genre
        </button>
        {genres.map((genre) => (
          <button
            key={genre.id}
            css={selected === genre.id ? chipActive : chipBase}
            onClick={() => onChange(selected === genre.id ? null : genre.id)}
          >
            {genre.name}
          </button>
        ))}
      </div>
    </div>
  );
}
