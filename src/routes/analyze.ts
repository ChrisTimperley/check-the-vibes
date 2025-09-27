import type { FastifyPluginAsync } from 'fastify';
import { GitHubService } from '../services/github.js';

export const analyzeRoutes: FastifyPluginAsync = async (fastify) => {
  // Helper: aggregate contributors from PRs and commits
  const aggregateContributors = (pullRequests: any[], commits: any[]) => {
    const contribMap = new Map<
      string,
      {
        login: string;
        commits: number;
        prs: number;
        reviews: number;
        issues: number;
        direct_pushes_default: number;
      }
    >();

    for (const c of commits) {
      const committer =
        (c.committer && c.committer.login) ||
        c.committer ||
        c.author ||
        c.commit?.author?.name;
      const login =
        typeof committer === 'string'
          ? committer
          : (committer && committer.login) || 'unknown';
      if (!contribMap.has(login)) {
        contribMap.set(login, {
          login,
          commits: 0,
          prs: 0,
          reviews: 0,
          issues: 0,
          direct_pushes_default: 0,
        });
      }
      contribMap.get(login)!.commits += 1;
      contribMap.get(login)!.direct_pushes_default += 1;
    }

    for (const pr of pullRequests) {
      const login = pr.author || 'unknown';
      if (!contribMap.has(login)) {
        contribMap.set(login, {
          login,
          commits: 0,
          prs: 0,
          reviews: 0,
          issues: 0,
          direct_pushes_default: 0,
        });
      }
      const entry = contribMap.get(login)!;
      entry.prs += 1;
      entry.reviews += pr.reviewCount || 0;
    }

    const contributors = Array.from(contribMap.values()).map((c) => ({
      login: c.login,
      commits: c.commits,
      prs: c.prs,
      reviews: c.reviews,
      issues: c.issues,
      lines_added: 0,
      lines_deleted: 0,
      direct_pushes_default: c.direct_pushes_default,
      avatar_url: `https://avatars.githubusercontent.com/${c.login}`,
    }));

    return contributors;
  };

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
    async (request, reply) => {
      const { repo, from, to } = request.query as {
        repo: string;
        from: string;
        to?: string;
      };

      if (!repo || !from) {
        return reply.status(400).send({ error: 'repo and from are required' });
      }

      const [owner, repoName] = repo.split('/');
      if (!owner || !repoName) {
        return reply
          .status(400)
          .send({ error: 'repo must be in format owner/repo' });
      }

      try {
        const github = new GitHubService(process.env.GITHUB_TOKEN);
        const since = new Date(from);
        const until = to ? new Date(to) : new Date();

        // Fetch PRs and commits in parallel
        const [pullRequests, commits] = await Promise.all([
          github.getPullRequestsSince(owner, repoName, since, until),
          github.getCommitsSince(owner, repoName, since, until),
        ]);

        // Basic aggregation for contributors
        const contribMap = new Map<
          string,
          {
            login: string;
            commits: number;
            prs: number;
            reviews: number;
            issues: number;
            direct_pushes_default: number;
          }
        >();

        // Count commits by committer (commits array contains committer/committer.login or committer name)
        for (const c of commits) {
          const committer =
            (c.committer && c.committer.login) ||
            c.committer ||
            c.author ||
            c.commit?.author?.name;
          const login =
            typeof committer === 'string'
              ? committer
              : (committer && committer.login) || 'unknown';
          if (!contribMap.has(login)) {
            contribMap.set(login, {
              login,
              commits: 0,
              prs: 0,
              reviews: 0,
              issues: 0,
              direct_pushes_default: 0,
            });
          }
          contribMap.get(login)!.commits += 1;
          // For now treat all commits returned as direct pushes
          contribMap.get(login)!.direct_pushes_default += 1;
        }

        // Count PRs and reviews from analyzed pullRequests
        for (const pr of pullRequests) {
          const login = pr.author || 'unknown';
          if (!contribMap.has(login)) {
            contribMap.set(login, {
              login,
              commits: 0,
              prs: 0,
              reviews: 0,
              issues: 0,
              direct_pushes_default: 0,
            });
          }
          const entry = contribMap.get(login)!;
          entry.prs += 1;
          entry.reviews += pr.reviewCount || 0;
        }

        // Build contributors array with avatar URLs
        const contributors = Array.from(contribMap.values()).map((c) => ({
          login: c.login,
          commits: c.commits,
          prs: c.prs,
          reviews: c.reviews,
          issues: c.issues,
          lines_added: 0,
          lines_deleted: 0,
          direct_pushes_default: c.direct_pushes_default,
          avatar_url: `https://avatars.githubusercontent.com/${c.login}`,
        }));

        const response = {
          repo: `${owner}/${repoName}`,
          window: {
            from: since.toISOString(),
            to: until.toISOString(),
          },
          summary: {
            contributors_active: contributors.length,
            prs_opened: pullRequests.length,
            issues_opened: 0,
            issues_closed: 0,
            pct_prs_reviewed: pullRequests.length
              ? pullRequests.filter((p) => p.hasReviews).length /
                pullRequests.length
              : 0,
            median_pr_cycle_time_hours: 0,
            stale_items: 0,
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
            is_draft: false,
            is_wip: false,
            reviewed: p.hasReviews,
            linked_issues: p.linkedIssue ? [p.linkedIssue] : [],
            files_changed: p.filesChanged,
            additions: p.linesChanged.additions,
            deletions: p.linesChanged.deletions,
            size_bucket: 'M',
            time_to_first_review_minutes: 0,
            cycle_time_hours: 0,
            approvals: 0,
            reviewers: p.reviewers || [],
            ci_status: p.ciStatus || 'unknown',
            url: p.url,
            comments: p.commentCount || 0,
          })),
          direct_pushes: commits.map((c) => ({
            sha: c.sha,
            committer:
              c.committer?.login || c.committer || c.author || 'unknown',
            message: c.commit?.message || c.message || 'No message',
            date:
              c.commit?.committer?.date ||
              c.commit?.author?.date ||
              new Date().toISOString(),
            ci_status: 'unknown',
            additions: 0,
            deletions: 0,
          })),
          project: { items: [] },
          issues: [],
        };

        return response;
      } catch (error) {
        fastify.log.error(error);
        return reply
          .status(500)
          .send({ error: 'Failed to analyze repository' });
      }
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

  // Contributors-only endpoint
  fastify.get('/contributors', async (request, reply) => {
    const { repo, from, to } = request.query as {
      repo?: string;
      from?: string;
      to?: string;
    };

    if (!repo || !from) {
      return reply.status(400).send({ error: 'repo and from are required' });
    }

    const [owner, repoName] = repo.split('/');
    if (!owner || !repoName) {
      return reply
        .status(400)
        .send({ error: 'repo must be in format owner/repo' });
    }

    try {
      const github = new GitHubService(process.env.GITHUB_TOKEN);
      const since = new Date(from);
      const until = to ? new Date(to) : new Date();

      const [pullRequests, commits] = await Promise.all([
        github.getPullRequestsSince(owner, repoName, since, until),
        github.getCommitsSince(owner, repoName, since, until),
      ]);

      const contributors = aggregateContributors(pullRequests, commits);

      return {
        repo: `${owner}/${repoName}`,
        window: { from: since.toISOString(), to: until.toISOString() },
        summary: { contributors_active: contributors.length },
        contributors,
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch contributors' });
    }
  });
};
