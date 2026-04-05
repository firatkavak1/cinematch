import type { FastifyInstance } from 'fastify';
import { routes } from 'server-utils';

import { getGenresHandler } from './handlers/genresHandler';
import { getMovieDetailsHandler } from './handlers/movieDetailsHandler';
import { getRandomMovieHandler } from './handlers/randomHandler';
import { searchMoviesHandler } from './handlers/searchHandler';

const appRouter = async (fastify: FastifyInstance): Promise<void> => {
  return routes(fastify, [
    getRandomMovieHandler('GET', '/movies/random'),
    searchMoviesHandler('POST', '/movies/search'),
    getMovieDetailsHandler('GET', '/movies/:id'),
    getGenresHandler('GET', '/genres'),
  ]);
};

export default appRouter;
