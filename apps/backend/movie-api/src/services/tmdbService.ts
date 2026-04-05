import axios, { AxiosInstance } from 'axios';
import { ExternalApiError } from 'app-errors';
import { logger } from 'server-utils';
import type { CastMember, Genre, MovieSearchResult } from 'shared';

import { config } from '../env';

interface TmdbMovieResult {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  genre_ids: number[];
  vote_average: number;
  vote_count: number;
  original_language: string;
}

interface TmdbMovieDetails {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  genres: Array<{ id: number; name: string }>;
  runtime: number | null;
  vote_average: number;
  vote_count: number;
  original_language: string;
  tagline: string | null;
  imdb_id: string | null;
}

interface TmdbCredits {
  cast: Array<{
    id: number;
    name: string;
    character: string;
    profile_path: string | null;
    order: number;
  }>;
  crew: Array<{
    id: number;
    name: string;
    job: string;
    department: string;
  }>;
}

interface TmdbGenre {
  id: number;
  name: string;
}

interface TmdbPersonResult {
  id: number;
  name: string;
  known_for_department: string;
  popularity: number;
  known_for: TmdbMovieResult[];
}

interface TmdbPersonCredits {
  cast: Array<{
    id: number;
    title: string;
    overview: string;
    poster_path: string | null;
    release_date: string;
    genre_ids: number[];
    vote_average: number;
    vote_count: number;
    character: string;
    original_language: string;
  }>;
  crew: Array<{
    id: number;
    title: string;
    overview: string;
    poster_path: string | null;
    release_date: string;
    genre_ids: number[];
    vote_average: number;
    vote_count: number;
    job: string;
    department: string;
    original_language: string;
  }>;
}

class TmdbService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.TMDB_BASE_URL,
      headers: {
        Authorization: `Bearer ${config.TMDB_READ_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    });
  }

  async getGenres(): Promise<Genre[]> {
    try {
      const { data } = await this.client.get<{ genres: TmdbGenre[] }>('/genre/movie/list', {
        params: { language: 'en-US' },
      });
      return data.genres;
    } catch (error) {
      throw new ExternalApiError({ message: 'Failed to fetch genres from TMDB', cause: error });
    }
  }

  async discoverMovies(params: {
    with_genres?: string;
    'primary_release_date.gte'?: string;
    'primary_release_date.lte'?: string;
    with_original_language?: string;
    with_keywords?: string;
    'vote_average.gte'?: number;
    'vote_count.gte'?: number;
    sort_by?: string;
    page?: number;
  }): Promise<{ results: MovieSearchResult[]; totalPages: number; totalResults: number }> {
    try {
      const { data } = await this.client.get<{
        results: TmdbMovieResult[];
        total_pages: number;
        total_results: number;
      }>('/discover/movie', {
        params: {
          language: 'en-US',
          include_adult: false,
          ...params,
        },
      });

      return {
        results: data.results.map(this.mapSearchResult),
        totalPages: data.total_pages,
        totalResults: data.total_results,
      };
    } catch (error) {
      throw new ExternalApiError({ message: 'Failed to discover movies from TMDB', cause: error });
    }
  }

  async searchMovies(query: string, page = 1): Promise<{ results: MovieSearchResult[]; totalPages: number }> {
    try {
      const { data } = await this.client.get<{
        results: TmdbMovieResult[];
        total_pages: number;
      }>('/search/movie', {
        params: { query, language: 'en-US', page, include_adult: false },
      });

      return {
        results: data.results.map(this.mapSearchResult),
        totalPages: data.total_pages,
      };
    } catch (error) {
      throw new ExternalApiError({ message: 'Failed to search movies from TMDB', cause: error });
    }
  }

  async getMovieDetails(movieId: number): Promise<TmdbMovieDetails> {
    try {
      const { data } = await this.client.get<TmdbMovieDetails>(`/movie/${movieId}`, {
        params: { language: 'en-US' },
      });
      return data;
    } catch (error) {
      throw new ExternalApiError({ message: `Failed to fetch movie details for ID ${movieId}`, cause: error });
    }
  }

  async getMovieCredits(movieId: number): Promise<{ cast: CastMember[]; director: string | null }> {
    try {
      const { data } = await this.client.get<TmdbCredits>(`/movie/${movieId}/credits`, {
        params: { language: 'en-US' },
      });

      const cast: CastMember[] = data.cast.slice(0, 8).map((member) => ({
        id: member.id,
        name: member.name,
        character: member.character,
        profilePath: member.profile_path,
        order: member.order,
      }));

      const director = data.crew.find((member) => member.job === 'Director')?.name ?? null;

      return { cast, director };
    } catch (error) {
      logger.warn(`Failed to fetch credits for movie ${movieId}`, { error });
      return { cast: [], director: null };
    }
  }

  async searchKeywords(query: string): Promise<Array<{ id: number; name: string }>> {
    try {
      const { data } = await this.client.get<{ results: Array<{ id: number; name: string }> }>('/search/keyword', {
        params: { query },
      });
      return data.results;
    } catch (error) {
      logger.warn(`Failed to search keywords for: ${query}`, { error });
      return [];
    }
  }

  /**
   * Search for people (actors, directors) by name.
   */
  async searchPerson(name: string): Promise<Array<{ id: number; name: string; department: string; popularity: number }>> {
    try {
      const { data } = await this.client.get<{ results: TmdbPersonResult[] }>('/search/person', {
        params: { query: name, language: 'en-US', include_adult: false },
      });
      return data.results.map((p) => ({
        id: p.id,
        name: p.name,
        department: p.known_for_department,
        popularity: p.popularity,
      }));
    } catch (error) {
      logger.warn(`Failed to search person: ${name}`, { error });
      return [];
    }
  }

  /**
   * Get movie credits for a person (as actor or director).
   */
  async getPersonMovieCredits(personId: number): Promise<{
    actedIn: MovieSearchResult[];
    directed: MovieSearchResult[];
  }> {
    try {
      const { data } = await this.client.get<TmdbPersonCredits>(`/person/${personId}/movie_credits`, {
        params: { language: 'en-US' },
      });

      const actedIn: MovieSearchResult[] = data.cast
        .filter((m) => m.vote_count > 50 && m.vote_average > 0)
        .sort((a, b) => b.vote_average * Math.log10(b.vote_count + 1) - a.vote_average * Math.log10(a.vote_count + 1))
        .slice(0, 20)
        .map((m) => ({
          id: m.id,
          title: m.title,
          overview: m.overview,
          posterPath: m.poster_path,
          releaseDate: m.release_date,
          genreIds: m.genre_ids,
          voteAverage: m.vote_average,
          voteCount: m.vote_count,
        }));

      const directed: MovieSearchResult[] = data.crew
        .filter((m) => m.job === 'Director' && m.vote_count > 50)
        .sort((a, b) => b.vote_average * Math.log10(b.vote_count + 1) - a.vote_average * Math.log10(a.vote_count + 1))
        .slice(0, 20)
        .map((m) => ({
          id: m.id,
          title: m.title,
          overview: m.overview,
          posterPath: m.poster_path,
          releaseDate: m.release_date,
          genreIds: m.genre_ids,
          voteAverage: m.vote_average,
          voteCount: m.vote_count,
        }));

      return { actedIn, directed };
    } catch (error) {
      logger.warn(`Failed to fetch person credits for ID ${personId}`, { error });
      return { actedIn: [], directed: [] };
    }
  }

  /**
   * Get movies similar to a given movie.
   */
  async getSimilarMovies(movieId: number): Promise<MovieSearchResult[]> {
    try {
      const { data } = await this.client.get<{ results: TmdbMovieResult[] }>(`/movie/${movieId}/similar`, {
        params: { language: 'en-US', page: 1 },
      });
      return data.results.map(this.mapSearchResult);
    } catch (error) {
      logger.warn(`Failed to get similar movies for ID ${movieId}`, { error });
      return [];
    }
  }

  /**
   * Get TMDB recommendations for a given movie.
   */
  async getMovieRecommendations(movieId: number): Promise<MovieSearchResult[]> {
    try {
      const { data } = await this.client.get<{ results: TmdbMovieResult[] }>(`/movie/${movieId}/recommendations`, {
        params: { language: 'en-US', page: 1 },
      });
      return data.results.map(this.mapSearchResult);
    } catch (error) {
      logger.warn(`Failed to get recommendations for ID ${movieId}`, { error });
      return [];
    }
  }

  private mapSearchResult(movie: TmdbMovieResult): MovieSearchResult {
    return {
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      posterPath: movie.poster_path,
      releaseDate: movie.release_date,
      genreIds: movie.genre_ids,
      voteAverage: movie.vote_average,
      voteCount: movie.vote_count,
    };
  }
}

export const tmdbService = new TmdbService();
