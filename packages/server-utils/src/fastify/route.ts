import type { FastifyInstance, FastifyReply, FastifyRequest, RouteOptions } from 'fastify';

export type Handler = (request: FastifyRequest, reply: FastifyReply) => Promise<unknown>;

export const routes = (fastify: FastifyInstance, list: Array<(fastify: FastifyInstance) => void>) =>
  list.forEach((fn) => fn(fastify));

export function route({
  schema,
  handler,
}: {
  schema?: RouteOptions['schema'];
  handler: Handler;
}) {
  return (method: 'GET' | 'POST' | 'PUT' | 'DELETE', url: string) => (fastify: FastifyInstance) => {
    fastify.route({
      method,
      url,
      schema,
      handler,
    } as RouteOptions);
  };
}
