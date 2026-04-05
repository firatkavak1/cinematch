import Fastify, { FastifyPluginAsync } from 'fastify';
import cors from '@fastify/cors';
import { HEALTH_ENDPOINT } from 'shared';

import { getPinoLog } from '../logging/logger';

import { defaultFastifyErrorHandler } from './fastifyErrorHandler';

interface IFastifyInstance {
  appRouter: FastifyPluginAsync;
  basePath: string;
  port: number;
}

export const getFastifyInstance = ({ appRouter, basePath, port }: IFastifyInstance) => {
  const app = Fastify({
    pluginTimeout: 30000,
    disableRequestLogging: true,
    logger: getPinoLog(),
  })
    .setErrorHandler(defaultFastifyErrorHandler)
    .register(cors, {
      origin: true,
      credentials: true,
    })
    .get(HEALTH_ENDPOINT, async (_, reply) => {
      return reply.status(200).send({ status: 'OK' });
    });

  app.register(appRouter, { prefix: basePath });

  return app;
};
