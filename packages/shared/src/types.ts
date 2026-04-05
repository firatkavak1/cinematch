export interface Movie {
  id: number;
  title: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string;
  genres: Genre[];
  runtime: number | null;
  ratings: MovieRatings;
  cast: CastMember[];
  director: string | null;
  originalLanguage: string;
  tagline: string | null;
  imdbId: string | null;
}

export interface Genre {
  id: number;
  name: string;
}

export interface MovieRatings {
  tmdb: {
    score: number;
    voteCount: number;
  };
  imdb: {
    score: string | null;
    votes: string | null;
  };
  rottenTomatoes: {
    score: string | null;
  };
  metascore: string | null;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profilePath: string | null;
  order: number;
}

export interface MovieSearchResult {
  id: number;
  title: string;
  overview: string;
  posterPath: string | null;
  releaseDate: string;
  genreIds: number[];
  voteAverage: number;
  voteCount: number;
}

export interface SearchRequest {
  query: string;
}

export interface SearchResponse {
  movies: Movie[];
  message: string;
}

export interface RandomMovieResponse {
  movie: Movie;
  message: string;
}

export interface MovieDetailsResponse {
  movie: Movie;
}

export interface GenreListResponse {
  genres: Genre[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  movies?: Movie[];
  timestamp: number;
}
