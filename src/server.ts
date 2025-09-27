#!/usr/bin/env node

import Fastify from 'fastify';
import dotenv from 'dotenv';
import { healthRoutes } from './routes/health.js';
import { analyzeRoutes } from './routes/analyze.js';
import { swaggerPlugin } from './plugins/swagger.js';

// Load environment variables
dotenv.config();

const server = Fastify({
  logger: {
    level: 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
      },
    },
  },
});

// Global error handler
server.setErrorHandler(async (error, _request, reply) => {
  server.log.error(error);

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV !== 'production';

  return reply.status(error.statusCode || 500).send({
    code: error.statusCode || 500,
    message: isDevelopment ? error.message : 'Internal server error',
  });
});

// Register plugins
await server.register(swaggerPlugin);

// Register routes
await server.register(healthRoutes);
await server.register(analyzeRoutes);

// Start server
const start = async (): Promise<void> => {
  try {
    const port = parseInt(process.env.PORT || '8000', 10);
    const host = process.env.HOST || '0.0.0.0';

    await server.listen({ port, host });

    console.log('🚀 Server running on http://localhost:8000');
    console.log('📚 API docs: http://localhost:8000/docs');
    console.log('❤️  Health check: http://localhost:8000/healthz');
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

// Handle graceful shutdown
const shutdown = async (): Promise<void> => {
  try {
    await server.close();
    console.log('👋 Server shut down gracefully');
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start the server
if (import.meta.url === `file://${process.argv[1]}`) {
  start();
}

export { server };
