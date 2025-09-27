import type { FastifyPluginAsync } from 'fastify';

export const healthRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get(
    '/healthz',
    {
      schema: {
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              timestamp: { type: 'string' },
              version: { type: 'string' },
            },
          },
        },
      },
    },
    async () => {
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '0.1.0',
      };
    }
  );
};
