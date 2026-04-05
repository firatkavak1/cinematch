export const theme = {
  colors: {
    bg: {
      primary: '#0a0a0f',
      secondary: '#12121a',
      tertiary: '#1a1a28',
      card: '#16161f',
      elevated: '#1e1e2e',
      hover: '#252538',
    },
    text: {
      primary: '#f0f0f5',
      secondary: '#a0a0b8',
      muted: '#6b6b80',
      accent: '#e8c547',
    },
    accent: {
      gold: '#e8c547',
      goldDark: '#c4a535',
      blue: '#4a9eff',
      green: '#4ade80',
      red: '#ef4444',
      purple: '#a78bfa',
    },
    rating: {
      tmdb: '#01d277',
      imdb: '#f5c518',
      rottenTomatoes: '#fa320a',
      meta: '#66cc33',
      letterboxd: '#00e054',
    },
    border: '#2a2a3e',
  },
  fonts: {
    body: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    heading: "'Playfair Display', Georgia, serif",
  },
  radii: {
    sm: '6px',
    md: '10px',
    lg: '16px',
    xl: '24px',
    full: '9999px',
  },
  shadows: {
    card: '0 4px 24px rgba(0, 0, 0, 0.4)',
    elevated: '0 8px 40px rgba(0, 0, 0, 0.5)',
    glow: '0 0 20px rgba(232, 197, 71, 0.15)',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
} as const;

export type Theme = typeof theme;
