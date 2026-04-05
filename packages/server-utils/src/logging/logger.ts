import pino from 'pino';

const isDevelopment = process.env.ENVIRONMENT === 'development';

const transport = isDevelopment
  ? {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss',
        ignore: 'pid,hostname',
        levelFirst: true,
      },
    }
  : undefined;

const pinoLog = pino({
  level: 'info',
  formatters: {
    level: (label) => ({ level: label.toUpperCase() }),
  },
  transport,
});

export type LoggerArgs = {
  statusCode?: number;
  url?: string;
  method?: string;
  error?: unknown;
  data?: unknown;
  [key: string]: unknown;
};

const logFactory =
  (logFn: pino.LogFn) =>
  (message: string, args?: LoggerArgs) => {
    if (args) {
      const { error, ...rest } = args;
      const errorData =
        error instanceof Error
          ? { name: error.name, message: error.message, stack: error.stack, cause: error.cause }
          : error;

      return logFn({ ...rest, error: errorData, msg: message });
    }
    return logFn({ msg: message });
  };

export const logger = {
  error: logFactory(pinoLog.error.bind(pinoLog)),
  debug: logFactory(pinoLog.debug.bind(pinoLog)),
  info: logFactory(pinoLog.info.bind(pinoLog)),
  warn: logFactory(pinoLog.warn.bind(pinoLog)),
};

export const getPinoLog = () => pinoLog;
