/** @jsxImportSource @emotion/react */
import { css, keyframes } from '@emotion/react';
import { useNavigate } from 'react-router-dom';

import { theme } from '../../styles/theme';

const container = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: ${theme.spacing.xl};
  padding: ${theme.spacing.xxl} ${theme.spacing.lg};
  min-height: 60vh;
`;

const glow = keyframes`
  0%, 100% { text-shadow: 0 0 20px ${theme.colors.accent.gold}30; }
  50% { text-shadow: 0 0 40px ${theme.colors.accent.gold}50; }
`;

const title = css`
  font-family: ${theme.fonts.heading};
  font-size: 3.5rem;
  font-weight: 700;
  color: ${theme.colors.accent.gold};
  animation: ${glow} 4s ease-in-out infinite;

  @media (max-width: 640px) {
    font-size: 2.5rem;
  }
`;

const subtitle = css`
  font-size: 1.2rem;
  color: ${theme.colors.text.secondary};
  max-width: 600px;
  line-height: 1.7;

  @media (max-width: 640px) {
    font-size: 1rem;
  }
`;

const buttonGroup = css`
  display: flex;
  gap: ${theme.spacing.lg};
  flex-wrap: wrap;
  justify-content: center;
`;

const primaryButton = css`
  padding: 16px 36px;
  background: linear-gradient(135deg, ${theme.colors.accent.gold}, ${theme.colors.accent.goldDark});
  color: ${theme.colors.bg.primary};
  border: none;
  border-radius: ${theme.radii.full};
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px ${theme.colors.accent.gold}40;
  }
`;

const secondaryButton = css`
  padding: 16px 36px;
  background: transparent;
  color: ${theme.colors.text.primary};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.full};
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: ${theme.colors.accent.gold}60;
    background: ${theme.colors.accent.gold}08;
  }
`;

const featureGrid = css`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${theme.spacing.lg};
  max-width: 700px;
  width: 100%;
  margin-top: ${theme.spacing.lg};

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const featureCard = css`
  padding: ${theme.spacing.lg};
  background: ${theme.colors.bg.card};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  text-align: left;
  transition: all 0.3s ease;

  &:hover {
    border-color: ${theme.colors.accent.gold}30;
    transform: translateY(-2px);
  }
`;

const featureIcon = css`
  font-size: 1.8rem;
  margin-bottom: ${theme.spacing.sm};
`;

const featureTitle = css`
  font-size: 1rem;
  font-weight: 600;
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.xs};
`;

const featureDesc = css`
  font-size: 0.85rem;
  color: ${theme.colors.text.secondary};
  line-height: 1.5;
`;

export function Home() {
  const navigate = useNavigate();

  return (
    <div css={container}>
      <h1 css={title}>CineMatch</h1>
      <p css={subtitle}>
        Your personal movie recommendation engine. Get random high-quality picks or describe exactly
        what you're looking for.
      </p>

      <div css={buttonGroup}>
        <button css={primaryButton} onClick={() => navigate('/random')}>
          Surprise Me
        </button>
        <button css={secondaryButton} onClick={() => navigate('/search')}>
          Search Movies
        </button>
      </div>

      <div css={featureGrid}>
        <div css={featureCard}>
          <div css={featureIcon}>&#127922;</div>
          <h3 css={featureTitle}>Random Picks</h3>
          <p css={featureDesc}>
            High-quality movies from diverse genres. Each click brings a different genre.
          </p>
        </div>
        <div css={featureCard}>
          <div css={featureIcon}>&#128172;</div>
          <h3 css={featureTitle}>Smart Search</h3>
          <p css={featureDesc}>
            Describe what you want: "Italian comedy" or "documentary about space from 2010".
          </p>
        </div>
        <div css={featureCard}>
          <div css={featureIcon}>&#11088;</div>
          <h3 css={featureTitle}>Multi-Platform Ratings</h3>
          <p css={featureDesc}>
            See TMDB, IMDb, Rotten Tomatoes, and Metascore ratings at a glance.
          </p>
        </div>
        <div css={featureCard}>
          <div css={featureIcon}>&#127916;</div>
          <h3 css={featureTitle}>Rich Details</h3>
          <p css={featureDesc}>
            Posters, cast, director, runtime, and more for every recommendation.
          </p>
        </div>
      </div>
    </div>
  );
}
