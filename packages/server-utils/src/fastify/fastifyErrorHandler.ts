import { isAxiosError } from 'axios';
import { AppError, BadRequestError, NotFoundError, NoResultsError } from 'app-errors';
import { ApiErrorType } from 'shared';
import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';

import { logger } from '../logging/logger';

export const defaultFastifyErrorHandler = (error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
  try {
    const appError = error as unknown as AppError;
    const logObject = {
      url: request?.url,
      method: request?.method,
      statusCode: appError.statusCode ?? 500,
      error,
    };

    if (error instanceof NotFoundError || error instanceof BadRequestError || error instanceof NoResultsError) {
      logger.warn(error.message, logObject);
    } else {
      logger.error(error.message, logObject);
    }
  } catch (loggingError) {
    logger.error('Error while logging the error', { error: loggingError });
    logger.error(error.message, { error });
  }

  if (error instanceof AppError) {
    const payload = (error as AppError).payload;
    return reply.status(error.statusCode).send({
      errorType: error.type,
      message: error.message,
      ...(payload ? { payload } : {}),
    });
  }

  if (isAxiosError(error)) {
    return reply.status(error.response?.status ?? 500).send({
      errorType: ApiErrorType.EXTERNAL_API_ERROR,
      statusCode: error.response?.status,
      message: error.message,
    });
  }

  if (error.code === 'FST_ERR_VALIDATION') {
    return reply.status(error.statusCode ?? 400).send({
      errorType: ApiErrorType.BAD_REQUEST,
      message: error.message,
    });
  }

  return reply.status(error.statusCode ?? 500).send({
    errorType: ApiErrorType.UNKNOWN,
    message: error.message ?? 'Internal Server Error',
  });
};
