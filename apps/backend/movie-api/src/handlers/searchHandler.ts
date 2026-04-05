import { BadRequestError } from 'app-errors';
import { route } from 'server-utils';
import type { FastifyRequest, FastifyReply } from 'fastify';

import { movieService } from '../services/movieService';

export const searchMoviesHandler = route({
  handler: async (request: FastifyRequest, reply: FastifyReply) => {
    const { query } = request.body as { query?: string };

    if (!query || query.trim().length === 0) {
      throw new BadRequestError({ message: 'Search query is required' });
    }

    const { movies, responseHint } = await movieService.searchMovies(query.trim());

    const count = movies.length;
    let message: string;

    if (count === 1) {
      message = `Here's a great match for ${responseHint}:`;
    } else if (count <= 3) {
      message = `I found ${count} solid picks for ${responseHint}:`;
    } else {
      message = `Here are ${count} recommendations for ${responseHint} — enjoy browsing!`;
    }

    return reply.status(200).send({ movies, message });
  },
});
