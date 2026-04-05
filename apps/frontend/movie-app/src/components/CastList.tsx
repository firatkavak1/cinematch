/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import type { CastMember } from 'shared';
import { TMDB_IMAGE_BASE_URL, TMDB_PROFILE_SIZES } from 'shared';

import { theme } from '../styles/theme';

interface CastListProps {
  cast: CastMember[];
}

const container = css`
  display: flex;
  gap: ${theme.spacing.md};
  overflow-x: auto;
  min-width: 0;
  padding-bottom: ${theme.spacing.sm};

  &::-webkit-scrollbar {
    height: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${theme.colors.border};
    border-radius: 2px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
`;

const castCard = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 80px;
  max-width: 80px;
  width: 80px;
  flex-shrink: 0;
  text-align: center;
`;

const avatarStyle = css`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid ${theme.colors.border};
  margin-bottom: 6px;
  background: ${theme.colors.bg.tertiary};
`;

const placeholderAvatar = css`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 2px solid ${theme.colors.border};
  margin-bottom: 6px;
  background: ${theme.colors.bg.tertiary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: ${theme.colors.text.muted};
`;

const nameStyle = css`
  font-size: 0.7rem;
  font-weight: 600;
  color: ${theme.colors.text.primary};
  line-height: 1.2;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  word-break: break-word;
`;

const characterStyle = css`
  font-size: 0.65rem;
  color: ${theme.colors.text.muted};
  line-height: 1.2;
  margin-top: 2px;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  word-break: break-word;
`;

export function CastList({ cast }: CastListProps) {
  if (cast.length === 0) return null;

  return (
    <div css={container}>
      {cast.map((member) => (
        <div key={member.id} css={castCard}>
          {member.profilePath ? (
            <img
              css={avatarStyle}
              src={`${TMDB_IMAGE_BASE_URL}/${TMDB_PROFILE_SIZES.medium}${member.profilePath}`}
              alt={member.name}
              loading="lazy"
            />
          ) : (
            <div css={placeholderAvatar}>
              {member.name.charAt(0)}
            </div>
          )}
          <span css={nameStyle}>{member.name}</span>
          <span css={characterStyle}>{member.character}</span>
        </div>
      ))}
    </div>
  );
}
