import { Octokit } from '@octokit/rest';
import { PullRequestAnalysis } from '../types';

export class GitHubService {
  private octokit: Octokit;

  constructor(token?: string) {
    this.octokit = new Octokit({
      auth: token,
    });
  }

  async getPullRequestsSince(
    owner: string,
    repo: string,
    since: Date,
    until?: Date
  ): Promise<PullRequestAnalysis[]> {
    const pullRequests: PullRequestAnalysis[] = [];
    let page = 1;
    const perPage = 100;

    let hasMore = true;
    while (hasMore) {
      const response = await this.octokit.pulls.list({
        owner,
        repo,
        state: 'all',
        sort: 'created',
        direction: 'desc',
        per_page: perPage,
        page,
      });

      if (response.data.length === 0) {
        hasMore = false;
        break;
      }

      for (const pr of response.data) {
        const createdAt = new Date(pr.created_at);

        // Stop if we've gone past our date range
        if (createdAt < since) {
          return pullRequests;
        }

        // Skip if it's after our until date (if specified)
        if (until && createdAt > until) {
          continue;
        }

        const analysis = await this.analyzePullRequest(owner, repo, pr.number);
        pullRequests.push(analysis);
      }

      // If we got fewer results than requested, we're on the last page
      if (response.data.length < perPage) {
        hasMore = false;
        break;
      }
      page++;
    }

    return pullRequests;
  }

  async analyzePullRequest(
    owner: string,
    repo: string,
    prNumber: number
  ): Promise<PullRequestAnalysis> {
    const [prData, files, commits, reviews, comments, checkRuns] =
      await Promise.all([
        this.octokit.pulls.get({ owner, repo, pull_number: prNumber }),
        this.octokit.pulls.listFiles({ owner, repo, pull_number: prNumber }),
        this.octokit.pulls.listCommits({ owner, repo, pull_number: prNumber }),
        this.octokit.pulls.listReviews({ owner, repo, pull_number: prNumber }),
        this.octokit.issues.listComments({
          owner,
          repo,
          issue_number: prNumber,
        }),
        this.getCheckRuns(owner, repo, prNumber),
      ]);

    const pr = prData.data;
    const totalAdditions = files.data.reduce(
      (sum, file) => sum + (file.additions || 0),
      0
    );
    const totalDeletions = files.data.reduce(
      (sum, file) => sum + (file.deletions || 0),
      0
    );

    // Determine CI status
    let ciStatus: 'success' | 'failure' | 'pending' | 'unknown' = 'unknown';
    if (checkRuns.length > 0) {
      const hasFailure = checkRuns.some(
        (run) => run.conclusion === 'failure' || run.conclusion === 'cancelled'
      );
      const hasSuccess = checkRuns.some((run) => run.conclusion === 'success');
      const hasPending = checkRuns.some(
        (run) => run.status === 'in_progress' || run.status === 'queued'
      );

      if (hasPending) {
        ciStatus = 'pending';
      } else if (hasFailure) {
        ciStatus = 'failure';
      } else if (hasSuccess) {
        ciStatus = 'success';
      }
    }

    return {
      number: pr.number,
      title: pr.title,
      author: pr.user?.login || 'unknown',
      createdAt: pr.created_at,
      mergedAt: pr.merged_at || undefined,
      closedAt: pr.closed_at || undefined,
      state: pr.merged_at
        ? 'merged'
        : pr.state === 'closed'
          ? 'closed'
          : 'open',
      linesChanged: {
        additions: totalAdditions,
        deletions: totalDeletions,
        total: totalAdditions + totalDeletions,
      },
      filesChanged: files.data.length,
      commits: commits.data.length,
      reviewCount: reviews.data.length,
      commentCount: comments.data.length,
      hasReviews: reviews.data.length > 0,
      hasComments: comments.data.length > 0,
      ciStatus,
      url: pr.html_url,
    };
  }

  private async getCheckRuns(
    owner: string,
    repo: string,
    prNumber: number
  ): Promise<any[]> {
    try {
      const pr = await this.octokit.pulls.get({
        owner,
        repo,
        pull_number: prNumber,
      });

      const checkRuns = await this.octokit.checks.listForRef({
        owner,
        repo,
        ref: pr.data.head.sha,
      });

      return checkRuns.data.check_runs || [];
    } catch {
      console.warn(`Failed to get check runs for PR ${prNumber}`);
      return [];
    }
  }

  async validateRepository(owner: string, repo: string): Promise<boolean> {
    try {
      await this.octokit.repos.get({ owner, repo });
      return true;
    } catch {
      return false;
    }
  }
}
