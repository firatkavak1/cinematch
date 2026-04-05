import 'dotenv/config';

import { getFastifyInstance, logger } from 'server-utils';

import { BASE_PATH } from './constants';
import { config } from './env';
import appRouter from './routes';

const fastifyInstance = getFastifyInstance({
  appRouter,
  port: config.PORT,
  basePath: BASE_PATH,
});

const start = async () => {
  try {
    await fastifyInstance.listen({ port: config.PORT, host: '0.0.0.0' });
    logger.info(`Movie API server started on port ${config.PORT}`);
    logger.info(`Environment: ${config.ENVIRONMENT}`);
  } catch (error) {
    logger.error('Error starting movie-api', { error });
    process.exit(1);
  }
};

start();
