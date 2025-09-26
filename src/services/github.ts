import { Octokit } from '@octokit/rest';
import { PullRequestAnalysis } from '../types';
import { extractLinkedIssue } from '../utils/helpers';

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
    let totalProcessed = 0;

    console.log(`🔍 Fetching pull requests from ${owner}/${repo}...`);

    let hasMore = true;
    while (hasMore) {
      console.log(
        `📄 Fetching page ${page} (up to ${perPage} PRs per page)...`
      );

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
        console.log('📄 No more pull requests found');
        hasMore = false;
        break;
      }

      console.log(
        `📋 Processing ${response.data.length} pull requests from page ${page}...`
      );

      for (const pr of response.data) {
        const createdAt = new Date(pr.created_at);

        // Stop if we've gone past our date range
        if (createdAt < since) {
          console.log(
            `⏹️  Reached PRs older than ${since.toISOString().split('T')[0]}, stopping scan`
          );
          return pullRequests;
        }

        // Skip if it's after our until date (if specified)
        if (until && createdAt > until) {
          continue;
        }

        totalProcessed++;
        console.log(
          `🔄 Analyzing PR #${pr.number}: "${pr.title}" (${totalProcessed} processed so far)`
        );

        const analysis = await this.analyzePullRequest(owner, repo, pr.number);
        pullRequests.push(analysis);
      }

      // If we got fewer results than requested, we're on the last page
      if (response.data.length < perPage) {
        console.log(`📄 Reached final page (page ${page})`);
        hasMore = false;
        break;
      }

      console.log(`📄 Completed page ${page}, moving to next page...`);
      page++;
    }

    console.log(
      `🎉 Completed scanning! Found ${pullRequests.length} pull requests in date range`
    );
    return pullRequests;
  }

  async analyzePullRequest(
    owner: string,
    repo: string,
    prNumber: number
  ): Promise<PullRequestAnalysis> {
    console.log(`  📊 Fetching detailed data for PR #${prNumber}...`);

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

    console.log(`  ✅ Completed analysis for PR #${prNumber}`);

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
      linkedIssue: extractLinkedIssue(pr.body),
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
