/** @jsxImportSource @emotion/react */
import { css, keyframes } from '@emotion/react';

import { theme } from '../styles/theme';

const pulse = keyframes`
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
`;

const container = css`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background: ${theme.colors.bg.tertiary};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  width: fit-content;
`;

const dot = (delay: number) => css`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${theme.colors.accent.blue};
  animation: ${pulse} 1.4s ease-in-out infinite;
  animation-delay: ${delay}s;
`;

const label = css`
  font-size: 0.75rem;
  color: ${theme.colors.text.muted};
  margin-left: ${theme.spacing.sm};
`;

export function LoadingIndicator({ text = 'Finding movies...' }: { text?: string }) {
  return (
    <div css={container}>
      <div css={dot(0)} />
      <div css={dot(0.2)} />
      <div css={dot(0.4)} />
      <span css={label}>{text}</span>
    </div>
  );
}
