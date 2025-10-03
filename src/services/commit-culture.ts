import { GitHubService } from './github.js';
import type {
  AnalysisReport,
  AnalysisSummary,
  Contributor,
  PullRequest,
  Commit,
} from '../../shared/types/index.js';

/**
 * Service for analyzing GitHub repositories and generating metrics
 */
export class CommitCultureService {
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
    const [pullRequests, commits, issues, allBranchesCommitCounts, branches] =
      await Promise.all([
        this.github.getPullRequestsSince(owner, repo, from, to),
        this.github.fetchCommitsForDefaultBranch(owner, repo, from, to),
        this.github.getIssuesSince(owner, repo, from, to),
        this.github.getCommitCountsAcrossBranches(owner, repo, from, to),
        this.github.fetchBranches(owner, repo, from, to),
      ]);

    // Aggregate contributor data
    const contributors = this.aggregateContributors(
      pullRequests,
      commits,
      allBranchesCommitCounts
    );

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
      pull_requests: pullRequests,
      commits: commits,
      issues,
      branches,
    };
  }

  /**
   * Aggregate contributor statistics from PRs and commits
   */
  private aggregateContributors(
    pullRequests: PullRequest[],
    commits: Commit[],
    allBranchesCommitCounts: Map<string, number>
  ): Contributor[] {
    const contribMap = new Map<
      string,
      {
        login: string;
        commits: number;
        commits_all_branches: number;
        prs: number;
      }
    >();

    // Count commits to default branch by committer
    for (const c of commits) {
      const login = (c.committer as string) || 'unknown';
      if (!contribMap.has(login)) {
        contribMap.set(login, {
          login,
          commits: 0,
          commits_all_branches: 0,
          prs: 0,
        });
      }
      contribMap.get(login)!.commits += 1;
    }

    // Add commit counts across all branches
    for (const [login, count] of allBranchesCommitCounts.entries()) {
      if (!contribMap.has(login)) {
        contribMap.set(login, {
          login,
          commits: 0,
          commits_all_branches: count,
          prs: 0,
        });
      } else {
        contribMap.get(login)!.commits_all_branches = count;
      }
    }

    // Count PRs by author
    for (const pr of pullRequests) {
      const login = pr.author || 'unknown';
      if (!contribMap.has(login)) {
        contribMap.set(login, {
          login,
          commits: 0,
          commits_all_branches: 0,
          prs: 0,
        });
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
      commits_all_branches: c.commits_all_branches,
      prs: c.prs,
      avatar_url: `https://avatars.githubusercontent.com/${c.login}`,
    }));
  }

  /**
   * Calculate percentage of PRs that have reviews
   */
  private calculateReviewPercentage(pullRequests: PullRequest[]): number {
    if (pullRequests.length === 0) return 0;
    const reviewed = pullRequests.filter((p) => p.reviewers.length > 0).length;
    return reviewed / pullRequests.length;
  }

  /**
   * Cancel all ongoing operations
   */
  cancel(): void {
    this.github.cancel();
  }
}
