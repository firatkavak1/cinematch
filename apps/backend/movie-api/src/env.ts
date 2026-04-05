import 'dotenv/config';

const getEnvValue = (key: string, fallback?: string): string => {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const config = {
  PORT: parseInt(getEnvValue('PORT', '3001'), 10),
  ENVIRONMENT: getEnvValue('ENVIRONMENT', 'development'),
  TMDB_API_KEY: getEnvValue('TMDB_API_KEY'),
  TMDB_READ_ACCESS_TOKEN: getEnvValue('TMDB_READ_ACCESS_TOKEN'),
  TMDB_BASE_URL: getEnvValue('TMDB_BASE_URL', 'https://api.themoviedb.org/3'),
  OMDB_API_KEY: getEnvValue('OMDB_API_KEY', ''),
  OMDB_BASE_URL: getEnvValue('OMDB_BASE_URL', 'https://www.omdbapi.com'),
  get isDevelopment() {
    return this.ENVIRONMENT === 'development';
  },
};
