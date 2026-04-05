/** @jsxImportSource @emotion/react */
import { css, keyframes } from '@emotion/react';
import type { ChatMessage as ChatMessageType } from 'shared';

import { theme } from '../styles/theme';

import { MovieCard } from './MovieCard';

interface ChatMessageProps {
  message: ChatMessageType;
}

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const messageRow = (isUser: boolean) => css`
  display: flex;
  justify-content: ${isUser ? 'flex-end' : 'flex-start'};
  animation: ${fadeIn} 0.3s ease-out;
  width: 100%;
`;

const bubble = (isUser: boolean) => css`
  max-width: ${isUser ? '70%' : '100%'};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border-radius: ${theme.radii.lg};
  background: ${isUser ? theme.colors.accent.gold + '18' : theme.colors.bg.tertiary};
  border: 1px solid ${isUser ? theme.colors.accent.gold + '30' : theme.colors.border};
  color: ${theme.colors.text.primary};
  font-size: 0.9rem;
  line-height: 1.5;

  @media (max-width: 640px) {
    max-width: ${isUser ? '85%' : '100%'};
  }
`;

const roleLabel = (isUser: boolean) => css`
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 6px;
  color: ${isUser ? theme.colors.accent.gold : theme.colors.accent.blue};
`;

const moviesContainer = css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
  margin-top: ${theme.spacing.md};

  /* Override MovieCard styles when inside chat to prevent double-framing */
  & > div {
    background: transparent;
    border: 1px solid ${theme.colors.border};
    padding: ${theme.spacing.md};
    max-width: 100%;

    &:hover {
      border-color: ${theme.colors.accent.gold}40;
    }
  }
`;

const textContent = css`
  color: ${theme.colors.text.secondary};
`;

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div css={messageRow(isUser)}>
      <div css={bubble(isUser)}>
        <p css={roleLabel(isUser)}>{isUser ? 'You' : 'CineMatch'}</p>
        <p css={textContent}>{message.content}</p>
        {message.movies && message.movies.length > 0 && (
          <div css={moviesContainer}>
            {message.movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
