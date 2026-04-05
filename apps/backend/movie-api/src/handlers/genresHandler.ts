import { route } from 'server-utils';
import type { FastifyRequest, FastifyReply } from 'fastify';

import { movieService } from '../services/movieService';

export const getGenresHandler = route({
  handler: async (_request: FastifyRequest, reply: FastifyReply) => {
    const genres = await movieService.getGenres();
    return reply.status(200).send({ genres });
  },
});
