import type { FastifyPluginAsync } from 'fastify';

export const testRoutes: FastifyPluginAsync = async (fastify) => {
  // Test endpoint with mock data to demonstrate merge commit detection
  fastify.get('/test-mock-analysis', async (request, reply) => {
    const mockResponse = {
      repo: 'test/repo',
      window: {
        from: '2025-01-01T00:00:00Z',
        to: '2025-01-28T23:59:59Z',
      },
      summary: {
        contributors_active: 2,
        prs_opened: 3,
        issues_opened: 1,
        issues_closed: 1,
        pct_prs_reviewed: 0.8,
      },
      contributors: [
        {
          login: 'developer1',
          commits: 5,
          prs: 2,
          direct_pushes_default: 3,
          avatar_url: 'https://avatars.githubusercontent.com/developer1',
        },
        {
          login: 'developer2',
          commits: 3,
          prs: 1,
          direct_pushes_default: 2,
          avatar_url: 'https://avatars.githubusercontent.com/developer2',
        },
      ],
      pull_requests: [],
      direct_pushes: [
        {
          sha: 'abc123def456',
          committer: 'developer1',
          message: 'Add new feature',
          date: '2025-01-15T10:30:00Z',
          ci_status: 'pass',
          additions: 150,
          deletions: 20,
          is_merge: false, // Regular commit
        },
        {
          sha: 'merge789abc',
          committer: 'developer2',
          message: 'Merge pull request #1 from feature/awesome-feature',
          date: '2025-01-16T14:20:00Z',
          ci_status: 'pass',
          additions: 200,
          deletions: 5,
          is_merge: true, // Merge commit
        },
        {
          sha: 'fix456def789',
          committer: 'developer1',
          message: 'Fix bug in user authentication',
          date: '2025-01-17T09:15:00Z',
          ci_status: 'pass',
          additions: 25,
          deletions: 8,
          is_merge: false, // Regular commit
        },
        {
          sha: 'merge2nd123',
          committer: 'developer2',
          message: 'Merge branch hotfix/critical-security-fix',
          date: '2025-01-18T16:45:00Z',
          ci_status: 'pass',
          additions: 10,
          deletions: 2,
          is_merge: true, // Another merge commit
        },
      ],
      issues: [],
    };

    return reply.send(mockResponse);
  });
};