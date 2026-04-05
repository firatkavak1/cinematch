import { route } from 'server-utils';
import type { FastifyRequest, FastifyReply } from 'fastify';

import { movieService } from '../services/movieService';

export const getRandomMovieHandler = route({
  handler: async (request: FastifyRequest, reply: FastifyReply) => {
    const { yearFrom, yearTo, genreId, language, ratingMin } = request.query as {
      yearFrom?: string;
      yearTo?: string;
      genreId?: string;
      language?: string;
      ratingMin?: string;
    };

    const options: {
      yearFrom?: number;
      yearTo?: number;
      genreId?: number;
      language?: string;
      ratingMin?: number;
    } = {};

    if (yearFrom) options.yearFrom = parseInt(yearFrom, 10);
    if (yearTo) options.yearTo = parseInt(yearTo, 10);
    if (genreId) options.genreId = parseInt(genreId, 10);
    if (language) options.language = language;
    if (ratingMin) options.ratingMin = parseFloat(ratingMin);

    const hasFilters =
      options.yearFrom || options.yearTo || options.genreId || options.language || options.ratingMin;

    const movie = await movieService.getRandomMovie(hasFilters ? options : undefined);

    const genres = movie.genres.map((g) => g.name).join(', ');
    const year = movie.releaseDate?.slice(0, 4) ?? 'N/A';

    return reply.status(200).send({
      movie,
      message: `Here's a ${genres} pick for you: "${movie.title}" (${year})`,
    });
  },
});
