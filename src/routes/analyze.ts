import type { FastifyPluginAsync } from 'fastify';
import { CheckTheVibesService } from '../services/check-the-vibes.js';
import { validateAnalyzeQuery } from '../utils/validation.js';

export const analyzeRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/analyze', async (request, reply) => {
    try {
      // Validate and parse query parameters
      const { repo, from, to } = validateAnalyzeQuery(request.query);

      const [owner, repoName] = repo.split('/');
      if (!owner || !repoName) {
        return reply
          .status(400)
          .send({ error: 'Invalid repo format. Expected "owner/repo"' });
      }

      // Perform analysis
      const service = new CheckTheVibesService(process.env.GITHUB_TOKEN);
      const result = await service.analyzeRepository(owner, repoName, from, to);

      return result;
    } catch (error) {
      // Handle validation errors
      if (error instanceof Error && error.message.includes('Invalid')) {
        return reply.status(400).send({ error: error.message });
      }

      // Handle other errors
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to analyze repository' });
    }
  });
};
