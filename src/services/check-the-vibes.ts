import { GitHubService } from './github.js';
import type {
  AnalysisReport,
  AnalysisSummary,
  Contributor,
  PullRequest,
  Commit,
} from '../../shared/types/index.js';
import type { PullRequestAnalysis } from '../types/index.js';

/**
 * Service for analyzing GitHub repositories and generating metrics
 */
export class CheckTheVibesService {
  private github: GitHubService;

  constructor(githubToken?: string) {
    this.github = new GitHubService(githubToken);
  }

  /**
   * Analyze a GitHub repository for the given time window
   */
  async analyzeRepository(
    owner: string,
    repo: string,
    from: Date,
    to: Date
  ): Promise<AnalysisReport> {
    const [pullRequests, commits, issues] = await Promise.all([
      this.github.getPullRequestsSince(owner, repo, from, to),
      this.github.fetchCommitsForDefaultBranch(owner, repo, from, to),
      this.github.getIssuesSince(owner, repo, from, to),
    ]);

    // Aggregate contributor data
    const contributors = this.aggregateContributors(pullRequests, commits);

    // Calculate summary metrics
    const summary: AnalysisSummary = {
      contributors_active: contributors.length,
      prs_opened: pullRequests.length,
      issues_opened: issues.filter((i) => !i.is_closed).length,
      issues_closed: issues.filter((i) => i.is_closed).length,
      pct_prs_reviewed: this.calculateReviewPercentage(pullRequests),
    };

    return {
      repo: `${owner}/${repo}`,
      window: {
        from: from.toISOString(),
        to: to.toISOString(),
      },
      summary,
      contributors,
      pull_requests: this.transformPullRequests(pullRequests),
      commits: commits,
      issues,
    };
  }

  /**
   * Aggregate contributor statistics from PRs and commits
   */
  private aggregateContributors(
    pullRequests: PullRequestAnalysis[],
    commits: Commit[]
  ): Contributor[] {
    const contribMap = new Map<
      string,
      {
        login: string;
        commits: number;
        prs: number;
      }
    >();

    // FIXME: we would like to count ALL commits across all branches here
    // Count commits by committer
    for (const c of commits) {
      const login = (c.committer as string) || 'unknown';
      if (!contribMap.has(login)) {
        contribMap.set(login, { login, commits: 0, prs: 0 });
      }
      contribMap.get(login)!.commits += 1;
    }

    // Count PRs by author
    for (const pr of pullRequests) {
      const login = pr.author || 'unknown';
      if (!contribMap.has(login)) {
        contribMap.set(login, { login, commits: 0, prs: 0 });
      }
      contribMap.get(login)!.prs += 1;
    }

    // Exclude bot authors
    for (const login of contribMap.keys()) {
      if (login.endsWith('[bot]')) {
        contribMap.delete(login);
      }
    }

    // Build contributors array with avatar URLs
    return Array.from(contribMap.values()).map((c) => ({
      login: c.login,
      commits: c.commits,
      prs: c.prs,
      avatar_url: `https://avatars.githubusercontent.com/${c.login}`,
    }));
  }

  /**
   * Transform GitHub service PR analysis to API response format
   */
  private transformPullRequests(
    pullRequests: PullRequestAnalysis[]
  ): PullRequest[] {
    return pullRequests.map((p) => ({
      number: p.number,
      title: p.title,
      author: p.author,
      created_at: p.createdAt,
      closed_at: p.closedAt,
      merged_at: p.mergedAt,
      status:
        p.state === 'merged'
          ? 'Merged'
          : p.state === 'closed'
            ? 'Closed'
            : 'Open',
      linked_issues: p.linkedIssue ? [p.linkedIssue] : [],
      additions: p.linesChanged.additions,
      deletions: p.linesChanged.deletions,
      reviewers: p.reviewers || [],
      ci_status: p.ciStatus || 'unknown',
      url: p.url,
      comments: p.commentCount || 0,
    }));
  }

  /**
   * Calculate percentage of PRs that have reviews
   */
  private calculateReviewPercentage(
    pullRequests: PullRequestAnalysis[]
  ): number {
    if (pullRequests.length === 0) return 0;
    const reviewed = pullRequests.filter((p) => p.hasReviews).length;
    return reviewed / pullRequests.length;
  }

  /**
   * Cancel all ongoing operations
   */
  cancel(): void {
    this.github.cancel();
  }
}
