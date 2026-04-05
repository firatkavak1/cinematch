export const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';
export const TMDB_POSTER_SIZES = {
  small: 'w185',
  medium: 'w342',
  large: 'w500',
  original: 'original',
} as const;

export const TMDB_PROFILE_SIZES = {
  small: 'w45',
  medium: 'w185',
  large: 'h632',
} as const;

export const TMDB_BACKDROP_SIZES = {
  small: 'w300',
  medium: 'w780',
  large: 'w1280',
  original: 'original',
} as const;

export enum ApiErrorType {
  UNKNOWN = 'UNKNOWN',
  NOT_FOUND = 'NOT_FOUND',
  BAD_REQUEST = 'BAD_REQUEST',
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',
  RATE_LIMITED = 'RATE_LIMITED',
  NO_RESULTS = 'NO_RESULTS',
}

export const HEALTH_ENDPOINT = '/health';
