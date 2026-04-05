import { NotFoundError } from 'app-errors';
import { route } from 'server-utils';
import type { FastifyRequest, FastifyReply } from 'fastify';

import { movieService } from '../services/movieService';

export const getMovieDetailsHandler = route({
  handler: async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const movieId = parseInt(id, 10);

    if (isNaN(movieId)) {
      throw new NotFoundError({ message: 'Invalid movie ID' });
    }

    const movie = await movieService.getMovieById(movieId);

    return reply.status(200).send({ movie });
  },
});
