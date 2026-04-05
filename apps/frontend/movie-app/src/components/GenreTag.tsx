/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import type { Genre } from 'shared';

import { theme } from '../styles/theme';

interface GenreTagProps {
  genre: Genre;
}

const tagStyle = css`
  display: inline-block;
  padding: 4px 12px;
  background: ${theme.colors.bg.elevated};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.full};
  font-size: 0.75rem;
  color: ${theme.colors.text.secondary};
  font-weight: 500;
  letter-spacing: 0.02em;
`;

export function GenreTag({ genre }: GenreTagProps) {
  return <span css={tagStyle}>{genre.name}</span>;
}
