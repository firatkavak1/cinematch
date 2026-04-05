import { NoResultsError } from 'app-errors';
import { logger } from 'server-utils';
import type { Genre, Movie, MovieRatings, MovieSearchResult } from 'shared';

import { tmdbService } from './tmdbService';
import { omdbService } from './omdbService';
import { nluEngine, type ParsedQuery } from './nluEngine';

const diverseGenres = [28, 35, 18, 878, 53, 16, 99, 10749, 80, 12, 14, 36, 27, 10402, 37];
let lastUsedGenreIndex = -1;

class MovieService {
  async getRandomMovie(options?: {
    yearFrom?: number;
    yearTo?: number;
    genreId?: number;
    language?: string;
    ratingMin?: number;
  }): Promise<Movie> {
    // Use specified genre or pick a rotating one for diversity
    let genreId: number;
    if (options?.genreId) {
      genreId = options.genreId;
    } else {
      lastUsedGenreIndex = (lastUsedGenreIndex + 1) % diverseGenres.length;
      genreId = diverseGenres[lastUsedGenreIndex];
    }

    // Rating defaults: 7.0 minimum, 500 vote count
    const ratingMin = options?.ratingMin ?? 7.0;
    // Scale vote count requirement down for higher rating thresholds
    const voteCountMin = ratingMin >= 8.0 ? 300 : 500;

    // Build discover params
    const discoverParams: Record<string, unknown> = {
      with_genres: String(genreId),
      'vote_average.gte': ratingMin,
      'vote_count.gte': voteCountMin,
      sort_by: 'vote_average.desc',
      page: 1,
    };

    if (options?.yearFrom) {
      discoverParams['primary_release_date.gte'] = `${options.yearFrom}-01-01`;
    }
    if (options?.yearTo) {
      discoverParams['primary_release_date.lte'] = `${options.yearTo}-12-31`;
    }
    if (options?.language) {
      discoverParams.with_original_language = options.language;
    }

    // Discover high-quality movies from this genre
    const { results, totalPages } = await tmdbService.discoverMovies(discoverParams as never);

    if (results.length === 0) {
      // Retry with relaxed requirements if filters are active
      if (options?.yearFrom || options?.yearTo || options?.language || options?.ratingMin) {
        discoverParams['vote_count.gte'] = 50;
        discoverParams['vote_average.gte'] = Math.max(ratingMin - 1.0, 5.0);
        const retry = await tmdbService.discoverMovies(discoverParams as never);
        if (retry.results.length === 0) {
          throw new NoResultsError({ message: 'No movies found with those filters. Try widening the range or changing filters!' });
        }
        const randomIndex = Math.floor(Math.random() * retry.results.length);
        return this.enrichMovieDetails(retry.results[randomIndex].id);
      }
      throw new NoResultsError({ message: 'No high-quality movies found. Try again!' });
    }

    // If multiple pages, pick a random page for more variety
    let allResults = results;
    if (totalPages > 1) {
      const randomPage = Math.floor(Math.random() * Math.min(totalPages, 20)) + 1;
      if (randomPage !== 1) {
        discoverParams.page = randomPage;
        const pageResults = await tmdbService.discoverMovies(discoverParams as never);
        allResults = pageResults.results;
      }
    }

    // Pick a random movie from results
    const randomIndex = Math.floor(Math.random() * allResults.length);
    const selected = allResults[randomIndex];

    return this.enrichMovieDetails(selected.id);
  }

  /**
   * Main search entry point — uses NLU engine to understand the query
   * and dispatches to one or more TMDB search strategies.
   */
  async searchMovies(query: string): Promise<{ movies: Movie[]; responseHint: string }> {
    const parsed = nluEngine.parse(query);
    logger.info('NLU search dispatch', { intents: parsed.intents, query });

    let candidates: MovieSearchResult[] = [];

    // Run strategies based on intents (in priority order)
    for (const intent of parsed.intents) {
      switch (intent) {
        case 'similar_to_movie':
          candidates = await this.strategySimilarToMovie(parsed);
          break;
        case 'actor_search':
          candidates = await this.strategyPersonSearch(parsed, 'actor');
          break;
        case 'director_search':
          candidates = await this.strategyPersonSearch(parsed, 'director');
          break;
        case 'mood_search':
        case 'theme_search':
        case 'genre_search':
        case 'era_search':
          candidates = await this.strategyDiscover(parsed);
          break;
        case 'general_search':
          candidates = await this.strategyGeneralSearch(parsed, query);
          break;
      }
      if (candidates.length > 0) break;
    }

    // Fallback: try discover if we have any structured data
    if (candidates.length === 0 && (parsed.genres.length > 0 || parsed.keywords.length > 0)) {
      candidates = await this.strategyDiscover(parsed);
    }

    // Fallback: full text search with original query
    if (candidates.length === 0) {
      candidates = await this.strategyTextSearch(query);
    }

    if (candidates.length === 0) {
      throw new NoResultsError({
        message: `I couldn't find any movies matching "${query}". Try rephrasing — for example, mention a genre, mood, actor, or a movie you liked.`,
      });
    }

    // Deduplicate by ID
    const uniqueIds = [...new Set(candidates.map((c) => c.id))];
    const topIds = uniqueIds.slice(0, 8);

    // Enrich all results with full details
    const movies = await Promise.all(topIds.map((id) => this.enrichMovieDetails(id)));
    return { movies, responseHint: parsed.responseHint };
  }

  async getMovieById(movieId: number): Promise<Movie> {
    return this.enrichMovieDetails(movieId);
  }

  async getGenres(): Promise<Genre[]> {
    return tmdbService.getGenres();
  }

  // ─── Search Strategies ──────────────────────────────────────────

  /**
   * Strategy: Find a movie by title, then get similar movies + recommendations.
   */
  private async strategySimilarToMovie(parsed: ParsedQuery): Promise<MovieSearchResult[]> {
    const movieTitle = parsed.similarToMovies[0];
    if (!movieTitle) return [];

    logger.info('Strategy: similar-to-movie', { title: movieTitle });

    // Find the movie by title
    const { results } = await tmdbService.searchMovies(movieTitle);
    if (results.length === 0) return [];

    const baseMovie = results[0];

    // Fetch both similar and recommendations in parallel
    const [similar, recommended] = await Promise.all([
      tmdbService.getSimilarMovies(baseMovie.id),
      tmdbService.getMovieRecommendations(baseMovie.id),
    ]);

    // Merge and sort by quality score
    const merged = [...recommended, ...similar];
    return this.rankAndDeduplicate(merged);
  }

  /**
   * Strategy: Search for a person (actor or director) and get their best movies.
   */
  private async strategyPersonSearch(
    parsed: ParsedQuery,
    role: 'actor' | 'director',
  ): Promise<MovieSearchResult[]> {
    const names = role === 'actor' ? parsed.actorNames : parsed.directorNames;
    if (names.length === 0) return [];

    const name = names[0];
    logger.info(`Strategy: ${role}-search`, { name });

    // Search for the person
    const people = await tmdbService.searchPerson(name);
    if (people.length === 0) {
      // Fallback: try a text search with the person's name
      return [];
    }

    // Pick the most popular match
    const person = people.sort((a, b) => b.popularity - a.popularity)[0];
    const credits = await tmdbService.getPersonMovieCredits(person.id);

    let movies = role === 'director' ? credits.directed : credits.actedIn;

    // Apply genre/year filters if present
    movies = this.applyFilters(movies, parsed);

    return movies.slice(0, 12);
  }

  /**
   * Strategy: Use TMDB discover API with structured filters (genres, keywords, year, language).
   */
  private async strategyDiscover(parsed: ParsedQuery): Promise<MovieSearchResult[]> {
    logger.info('Strategy: discover', {
      genres: parsed.genres,
      keywords: parsed.keywords,
      yearFrom: parsed.yearFrom,
      yearTo: parsed.yearTo,
      language: parsed.language,
    });

    const discoverParams: Record<string, unknown> = {
      'vote_count.gte': 100,
      sort_by: 'vote_average.desc',
    };

    // Genres — use at most 3 to avoid overly narrow results
    if (parsed.genres.length > 0) {
      discoverParams.with_genres = parsed.genres.slice(0, 3).join(',');
    }

    if (parsed.language) {
      discoverParams.with_original_language = parsed.language;
    }

    if (parsed.yearFrom) {
      discoverParams['primary_release_date.gte'] = `${parsed.yearFrom}-01-01`;
    }

    if (parsed.yearTo) {
      discoverParams['primary_release_date.lte'] = `${parsed.yearTo}-12-31`;
    }

    // Resolve theme/topic keywords to TMDB keyword IDs
    if (parsed.keywords.length > 0) {
      const keywordIds = await this.resolveKeywordIds(parsed.keywords);
      if (keywordIds.length > 0) {
        discoverParams.with_keywords = keywordIds.join('|'); // OR logic
      }
    }

    const { results } = await tmdbService.discoverMovies(discoverParams as never);

    // If discover returned too few results and we have keywords, also try
    // a secondary discover without keywords (just genres+year)
    if (results.length < 3 && parsed.keywords.length > 0 && parsed.genres.length > 0) {
      const fallbackParams = { ...discoverParams };
      delete fallbackParams.with_keywords;
      const fallback = await tmdbService.discoverMovies(fallbackParams as never);
      return this.rankAndDeduplicate([...results, ...fallback.results]);
    }

    return results.slice(0, 12);
  }

  /**
   * Strategy: General search — tries text search, keyword search, and discover
   * with whatever we could extract.
   */
  private async strategyGeneralSearch(parsed: ParsedQuery, originalQuery: string): Promise<MovieSearchResult[]> {
    logger.info('Strategy: general-search', { searchText: parsed.searchText, originalQuery });

    const searches: Promise<MovieSearchResult[]>[] = [];

    // Try text search with cleaned search text
    if (parsed.searchText) {
      searches.push(
        tmdbService.searchMovies(parsed.searchText).then((r) => r.results.filter((m) => m.voteAverage >= 5.0)),
      );
    }

    // Try text search with original query
    searches.push(
      tmdbService.searchMovies(originalQuery).then((r) => r.results.filter((m) => m.voteAverage >= 5.0)),
    );

    // If we have any keywords, try a keyword-based discover
    if (parsed.keywords.length > 0) {
      searches.push(this.keywordDiscover(parsed.keywords));
    }

    const allResults = await Promise.all(searches);
    const merged = allResults.flat();

    return this.rankAndDeduplicate(merged);
  }

  /**
   * Strategy: Simple text search fallback.
   */
  private async strategyTextSearch(query: string): Promise<MovieSearchResult[]> {
    logger.info('Strategy: text-search fallback', { query });
    const { results } = await tmdbService.searchMovies(query);
    return results.slice(0, 8);
  }

  // ─── Helper Methods ──────────────────────────────────────────────

  /**
   * Resolve keyword strings to TMDB keyword IDs.
   */
  private async resolveKeywordIds(keywords: string[]): Promise<number[]> {
    const ids: number[] = [];
    // Search for up to 5 keywords to avoid excessive API calls
    const toSearch = keywords.slice(0, 5);

    const results = await Promise.all(toSearch.map((kw) => tmdbService.searchKeywords(kw)));

    for (const kwResults of results) {
      if (kwResults.length > 0) {
        ids.push(kwResults[0].id);
      }
    }

    return ids;
  }

  /**
   * Discover movies using keyword IDs.
   */
  private async keywordDiscover(keywords: string[]): Promise<MovieSearchResult[]> {
    const keywordIds = await this.resolveKeywordIds(keywords);
    if (keywordIds.length === 0) return [];

    const { results } = await tmdbService.discoverMovies({
      with_keywords: keywordIds.join('|'),
      'vote_count.gte': 50,
      sort_by: 'vote_average.desc',
    } as never);

    return results;
  }

  /**
   * Apply genre/year/language filters to a list of results.
   */
  private applyFilters(movies: MovieSearchResult[], parsed: ParsedQuery): MovieSearchResult[] {
    let filtered = movies;

    if (parsed.genres.length > 0) {
      filtered = filtered.filter((m) => m.genreIds.some((gid) => parsed.genres.includes(gid)));
    }

    if (parsed.yearFrom) {
      filtered = filtered.filter((m) => {
        const year = parseInt(m.releaseDate?.slice(0, 4), 10);
        return !isNaN(year) && year >= (parsed.yearFrom ?? 0);
      });
    }

    if (parsed.yearTo) {
      filtered = filtered.filter((m) => {
        const year = parseInt(m.releaseDate?.slice(0, 4), 10);
        return !isNaN(year) && year <= (parsed.yearTo ?? 9999);
      });
    }

    // If filters eliminated everything, return original unfiltered
    return filtered.length > 0 ? filtered : movies;
  }

  /**
   * Deduplicate and rank results by quality score.
   */
  private rankAndDeduplicate(movies: MovieSearchResult[]): MovieSearchResult[] {
    const seen = new Set<number>();
    const unique: MovieSearchResult[] = [];

    for (const movie of movies) {
      if (!seen.has(movie.id)) {
        seen.add(movie.id);
        unique.push(movie);
      }
    }

    // Rank by quality: vote_average * log10(vote_count + 1) for weighted score
    return unique
      .sort((a, b) => {
        const scoreA = a.voteAverage * Math.log10(a.voteCount + 1);
        const scoreB = b.voteAverage * Math.log10(b.voteCount + 1);
        return scoreB - scoreA;
      })
      .slice(0, 12);
  }

  private async enrichMovieDetails(movieId: number): Promise<Movie> {
    const [details, credits] = await Promise.all([
      tmdbService.getMovieDetails(movieId),
      tmdbService.getMovieCredits(movieId),
    ]);

    // Get external ratings if IMDB ID is available
    const externalRatings = details.imdb_id ? await omdbService.getExternalRatings(details.imdb_id) : null;

    const ratings: MovieRatings = {
      tmdb: {
        score: details.vote_average,
        voteCount: details.vote_count,
      },
      imdb: externalRatings?.imdb ?? { score: null, votes: null },
      rottenTomatoes: externalRatings?.rottenTomatoes ?? { score: null },
      metascore: externalRatings?.metascore ?? null,
    };

    return {
      id: details.id,
      title: details.title,
      overview: details.overview,
      posterPath: details.poster_path,
      backdropPath: details.backdrop_path,
      releaseDate: details.release_date,
      genres: details.genres,
      runtime: details.runtime,
      ratings,
      cast: credits.cast,
      director: credits.director,
      originalLanguage: details.original_language,
      tagline: details.tagline,
      imdbId: details.imdb_id ?? null,
    };
  }
}

export const movieService = new MovieService();
