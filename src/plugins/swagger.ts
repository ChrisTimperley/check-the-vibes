import type { FastifyPluginAsync } from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

export const swaggerPlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(swagger, {
    openapi: {
      openapi: '3.1.0',
      info: {
        title: 'check-the-vibes API',
        description:
          'GitHub repository analysis API for educational assessment',
        version: '0.1.0',
        contact: {
          name: '17-313 Teaching Team',
          url: 'https://github.com/ChrisTimperley/check-the-vibes',
        },
        license: {
          name: 'GPL-3.0',
          url: 'https://www.gnu.org/licenses/gpl-3.0.html',
        },
      },
      servers: [
        {
          url: 'http://localhost:8000',
          description: 'Local development',
        },
      ],
    },
  });

  await fastify.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
    staticCSP: true,
  });
};
