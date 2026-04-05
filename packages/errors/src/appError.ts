import { ApiErrorType } from 'shared';

export abstract class AppError extends Error {
  abstract name: string;

  readonly type: ApiErrorType;
  readonly payload: unknown;
  readonly statusCode: number;

  constructor({
    message,
    cause,
    type = ApiErrorType.UNKNOWN,
    payload,
    statusCode = 500,
  }: {
    message: string;
    cause?: unknown;
    type?: ApiErrorType;
    payload?: unknown;
    statusCode?: number;
  }) {
    super(message, { cause });
    this.type = type;
    this.payload = payload;
    this.statusCode = statusCode;
  }
}

export class BadRequestError extends AppError {
  name = 'BadRequestError';

  constructor({ message, type = ApiErrorType.BAD_REQUEST }: { message: string; type?: ApiErrorType }) {
    super({ message, type, statusCode: 400, cause: message });
  }
}

export class NotFoundError extends AppError {
  name = 'NotFoundError';

  constructor({ message, cause }: { message: string; cause?: unknown }) {
    super({ message, cause, type: ApiErrorType.NOT_FOUND, statusCode: 404 });
  }
}

export class ExternalApiError extends AppError {
  name = 'ExternalApiError';

  constructor({ message, cause, payload }: { message: string; cause?: unknown; payload?: unknown }) {
    super({ message, cause, payload, type: ApiErrorType.EXTERNAL_API_ERROR, statusCode: 502 });
  }
}

export class NoResultsError extends AppError {
  name = 'NoResultsError';

  constructor({ message }: { message: string }) {
    super({ message, type: ApiErrorType.NO_RESULTS, statusCode: 404 });
  }
}

export class RateLimitError extends AppError {
  name = 'RateLimitError';

  constructor({ message }: { message: string }) {
    super({ message, type: ApiErrorType.RATE_LIMITED, statusCode: 429 });
  }
}
