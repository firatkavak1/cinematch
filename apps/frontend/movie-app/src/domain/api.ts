import axios from 'axios';
import type { RandomMovieResponse, SearchResponse, MovieDetailsResponse, GenreListResponse } from 'shared';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

export async function fetchRandomMovie(options?: {
  yearFrom?: number;
  yearTo?: number;
  genreId?: number;
  language?: string;
  ratingMin?: number;
}): Promise<RandomMovieResponse> {
  const params: Record<string, string | number> = {};
  if (options?.yearFrom) params.yearFrom = options.yearFrom;
  if (options?.yearTo) params.yearTo = options.yearTo;
  if (options?.genreId) params.genreId = options.genreId;
  if (options?.language) params.language = options.language;
  if (options?.ratingMin) params.ratingMin = options.ratingMin;
  const { data } = await apiClient.get<RandomMovieResponse>('/movies/random', { params });
  return data;
}

export async function searchMovies(query: string): Promise<SearchResponse> {
  const { data } = await apiClient.post<SearchResponse>('/movies/search', { query });
  return data;
}

export async function fetchMovieDetails(movieId: number): Promise<MovieDetailsResponse> {
  const { data } = await apiClient.get<MovieDetailsResponse>(`/movies/${movieId}`);
  return data;
}

export async function fetchGenres(): Promise<GenreListResponse> {
  const { data } = await apiClient.get<GenreListResponse>('/genres');
  return data;
}
