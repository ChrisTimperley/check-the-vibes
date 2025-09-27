import { Octokit } from '@octokit/rest';
import type { PullRequestAnalysis } from '../types/index.js';

export class GitHubService {
  private octokit: Octokit;
  private readonly abortController: AbortController;

  constructor(token?: string) {
    this.octokit = new Octokit({
      auth: token,
    });
    this.abortController = new AbortController();
  }

  /**
   * Cancel all ongoing operations
   */
  cancel(): void {
    this.abortController.abort();
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

    const [prData, files, commits, reviews, comments, checkRuns, linkedIssue] =
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
        this.getLinkedIssues(owner, repo, prNumber),
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
      linkedIssue,
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
    } catch (error) {
      const enhancedError = new Error(
        `Failed to get check runs for PR ${prNumber}`,
        {
          cause: error,
        }
      );
      console.warn(enhancedError.message, { cause: enhancedError.cause });
      return [];
    }
  }

  private async getLinkedIssues(
    owner: string,
    repo: string,
    prNumber: number
  ): Promise<number | null> {
    try {
      const query = `
        query($owner: String!, $repo: String!, $number: Int!) {
          repository(owner: $owner, name: $repo) {
            pullRequest(number: $number) {
              closingIssuesReferences(first: 1) {
                nodes {
                  number
                }
              }
            }
          }
        }
      `;

      const result: any = await this.octokit.graphql(query, {
        owner,
        repo,
        number: prNumber,
      });

      const closingIssues =
        result.repository.pullRequest.closingIssuesReferences.nodes;
      return closingIssues.length > 0 ? closingIssues[0].number : null;
    } catch (error) {
      const enhancedError = new Error(
        `Failed to get linked issues for PR ${prNumber}`,
        {
          cause: error,
        }
      );
      console.warn(enhancedError.message, { cause: enhancedError.cause });
      return null;
    }
  }

  async validateRepository(owner: string, repo: string): Promise<boolean> {
    try {
      await this.octokit.repos.get({ owner, repo });
      return true;
    } catch (error) {
      const enhancedError = new Error(
        `Failed to validate repository ${owner}/${repo}`,
        {
          cause: error,
        }
      );
      console.warn(enhancedError.message, { cause: enhancedError.cause });
      return false;
    }
  }

  async getCommitsSince(
    owner: string,
    repo: string,
    since: Date,
    until?: Date
  ): Promise<any[]> {
    const commits: any[] = [];
    let page = 1;
    const perPage = 100;

    console.log(`🔍 Fetching commits from ${owner}/${repo}...`);

    let hasMore = true;
    while (hasMore) {
      console.log(`📄 Fetching commit page ${page}...`);

      const response = await this.octokit.repos.listCommits({
        owner,
        repo,
        since: since.toISOString(),
        until: until?.toISOString(),
        per_page: perPage,
        page,
      });

      if (response.data.length === 0) {
        console.log('📄 No more commits found');
        hasMore = false;
        break;
      }

      for (const commit of response.data) {
        // Fetch detailed commit info to get additions/deletions
        let additions = 0;
        let deletions = 0;
        let ciStatus = 'unknown';

        try {
          const commitDetail = await this.octokit.repos.getCommit({
            owner,
            repo,
            ref: commit.sha,
          });
          additions = commitDetail.data.stats?.additions || 0;
          deletions = commitDetail.data.stats?.deletions || 0;
        } catch (error) {
          console.warn(
            `Failed to fetch stats for commit ${commit.sha.slice(0, 7)}:`,
            error
          );
        }

        // Fetch CI status from check runs and status checks
        try {
          const [checkRuns, statusChecks] = await Promise.all([
            this.octokit.checks
              .listForRef({
                owner,
                repo,
                ref: commit.sha,
              })
              .catch(() => ({ data: { check_runs: [] } })),
            this.octokit.repos
              .getCombinedStatusForRef({
                owner,
                repo,
                ref: commit.sha,
              })
              .catch(() => ({ data: { state: 'none' } })),
          ]);

          // Determine CI status based on check runs and status checks
          if (
            checkRuns.data.check_runs &&
            checkRuns.data.check_runs.length > 0
          ) {
            const hasFailure = checkRuns.data.check_runs.some(
              (run) =>
                run.conclusion === 'failure' || run.conclusion === 'cancelled'
            );
            const hasSuccess = checkRuns.data.check_runs.some(
              (run) => run.conclusion === 'success'
            );
            const hasPending = checkRuns.data.check_runs.some(
              (run) => run.status === 'in_progress' || run.status === 'queued'
            );

            if (hasFailure) ciStatus = 'fail';
            else if (hasPending) ciStatus = 'pending';
            else if (hasSuccess) ciStatus = 'pass';
          } else if (
            statusChecks.data.state &&
            statusChecks.data.state !== 'none'
          ) {
            // Fall back to status checks
            switch (statusChecks.data.state) {
              case 'success':
                ciStatus = 'pass';
                break;
              case 'failure':
              case 'error':
                ciStatus = 'fail';
                break;
              case 'pending':
                ciStatus = 'pending';
                break;
              default:
                ciStatus = 'unknown';
            }
          } else {
            ciStatus = 'none';
          }
        } catch (error) {
          console.warn(
            `Failed to fetch CI status for commit ${commit.sha.slice(0, 7)}:`,
            error
          );
          ciStatus = 'unknown';
        }

        commits.push({
          sha: commit.sha,
          committer:
            commit.author?.login || commit.commit.author?.name || 'Unknown',
          message: commit.commit.message,
          date: commit.commit.author?.date || commit.commit.committer?.date,
          additions,
          deletions,
          ci_status: ciStatus,
        });
      }

      if (response.data.length < perPage) {
        console.log(`📄 Reached final page (page ${page})`);
        hasMore = false;
        break;
      }

      page++;
    }

    console.log(`🎉 Found ${commits.length} commits in date range`);
    return commits;
  }
}
