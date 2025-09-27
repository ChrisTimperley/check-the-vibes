import type { FastifyPluginAsync } from 'fastify';
import { GitHubService } from '../services/github.js';

export const analyzeRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get(
    '/analyze',
    {
      schema: {
        querystring: { $ref: 'QueryAnalyze' },
        response: {
          200: { $ref: 'AnalyzeResponse' },
          400: { $ref: 'Error' },
          500: { $ref: 'Error' },
        },
      },
    },
    async () => {
      // TODO: This will be implemented in subsequent steps
      throw new Error('Analysis endpoint not yet implemented');
    }
  );

  // Simple commits endpoint for frontend integration
  fastify.get('/commits', async (request, reply) => {
    const { repo, days = 30 } = request.query as {
      repo?: string;
      days?: number;
    };

    if (!repo) {
      return reply.status(400).send({ error: 'repo parameter is required' });
    }

    const [owner, repoName] = repo.split('/');
    if (!owner || !repoName) {
      return reply
        .status(400)
        .send({ error: 'repo must be in format owner/repo' });
    }

    try {
      const github = new GitHubService(process.env.GITHUB_TOKEN);
      const since = new Date();
      since.setDate(since.getDate() - days);

      const commits = await github.getCommitsSince(owner, repoName, since);

      return {
        repo,
        commits,
        window: {
          from: since.toISOString(),
          to: new Date().toISOString(),
        },
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch commits' });
    }
  });
};
