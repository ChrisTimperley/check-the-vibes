import type { FastifyPluginAsync } from 'fastify';
import { GitHubService } from '../services/github.js';
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

      const github = new GitHubService(process.env.GITHUB_TOKEN);

      // Fetch PRs, commits, and issues in parallel
      const [pullRequests, commits, issues] = await Promise.all([
        github.getPullRequestsSince(owner, repoName, from, to),
        github.fetchCommitsForDefaultBranch(owner, repoName, from, to),
        github.getIssuesSince(owner, repoName, from, to),
      ]);

      // Basic aggregation for contributors
      const contribMap = new Map<
        string,
        {
          login: string;
          commits: number;
          prs: number;
        }
      >();

      // FIXME we would like to count ALL commits across all branches here
      // Count commits by committer (commits array contains simplified Commit objects)
      for (const c of commits) {
        const login = (c.committer as string) || 'unknown';
        if (!contribMap.has(login)) {
          contribMap.set(login, {
            login,
            commits: 0,
            prs: 0,
          });
        }
        contribMap.get(login)!.commits += 1;
      }

      // Count PRs from analyzed pullRequests
      for (const pr of pullRequests) {
        const login = pr.author || 'unknown';
        if (!contribMap.has(login)) {
          contribMap.set(login, {
            login,
            commits: 0,
            prs: 0,
          });
        }
        const entry = contribMap.get(login)!;
        entry.prs += 1;
      }

      // Build contributors array with avatar URLs
      const contributors = Array.from(contribMap.values()).map((c) => ({
        login: c.login,
        commits: c.commits,
        prs: c.prs,
        avatar_url: `https://avatars.githubusercontent.com/${c.login}`,
      }));

      const response = {
        repo: `${owner}/${repoName}`,
        window: {
          from: from.toISOString(),
          to: to.toISOString(),
        },
        summary: {
          contributors_active: contributors.length,
          prs_opened: pullRequests.length,
          issues_opened: issues.filter((i) => !i.is_closed).length,
          issues_closed: issues.filter((i) => i.is_closed).length,
          pct_prs_reviewed: pullRequests.length
            ? pullRequests.filter((p) => p.hasReviews).length /
              pullRequests.length
            : 0,
        },
        contributors,
        pull_requests: pullRequests.map((p) => ({
          number: p.number,
          title: p.title,
          author: p.author,
          created_at: p.createdAt,
          closed_at: p.closedAt,
          merged_at: p.mergedAt,
          status: p.state,
          linked_issues: p.linkedIssue ? [p.linkedIssue] : [],
          additions: p.linesChanged.additions,
          deletions: p.linesChanged.deletions,
          reviewers: p.reviewers || [],
          ci_status: p.ciStatus || 'unknown',
          url: p.url,
          comments: p.commentCount || 0,
        })),
        commits: commits.map((c) => ({
          sha: c.sha,
          committer: c.committer || 'unknown',
          message: c.message || 'No message',
          date: c.date || new Date().toISOString(),
          ci_status: c.ci_status || 'unknown',
          additions: c.additions || 0,
          deletions: c.deletions || 0,
        })),
        issues: issues,
      };

      return response;
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
