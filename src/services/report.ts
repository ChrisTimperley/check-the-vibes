import * as yaml from 'js-yaml';
import { RepositoryReport, PullRequestAnalysis, ScanConfig } from '../types';

export class ReportGenerator {
  generateReport(
    config: ScanConfig,
    pullRequests: PullRequestAnalysis[]
  ): RepositoryReport {
    const summary = this.generateSummary(pullRequests);

    const report: RepositoryReport = {
      repository: {
        owner: config.owner,
        name: config.repo,
        url: `https://github.com/${config.owner}/${config.repo}`,
      },
      analysis: {
        dateRange: {
          from: config.since,
          to: config.until,
        },
        totalPullRequests: pullRequests.length,
        analyzedAt: new Date().toISOString(),
      },
      pullRequests: pullRequests.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
      summary,
    };

    return report;
  }

  generateYaml(report: RepositoryReport): string {
    return yaml.dump(report, {
      indent: 2,
      lineWidth: 120,
      noRefs: true,
    });
  }

  private generateSummary(pullRequests: PullRequestAnalysis[]) {
    if (pullRequests.length === 0) {
      return {
        averageLinesChanged: 0,
        averageFilesChanged: 0,
        averageCommits: 0,
        pullRequestsWithReviews: 0,
        pullRequestsWithComments: 0,
        ciSuccessRate: undefined,
      };
    }

    const totalLines = pullRequests.reduce(
      (sum, pr) => sum + pr.linesChanged.total,
      0
    );
    const totalFiles = pullRequests.reduce(
      (sum, pr) => sum + pr.filesChanged,
      0
    );
    const totalCommits = pullRequests.reduce((sum, pr) => sum + pr.commits, 0);
    const withReviews = pullRequests.filter((pr) => pr.hasReviews).length;
    const withComments = pullRequests.filter((pr) => pr.hasComments).length;

    // Calculate CI success rate (only for PRs that have CI data)
    const prsWithCi = pullRequests.filter(
      (pr) => pr.ciStatus && pr.ciStatus !== 'unknown'
    );
    const ciSuccessRate =
      prsWithCi.length > 0
        ? (prsWithCi.filter((pr) => pr.ciStatus === 'success').length /
            prsWithCi.length) *
          100
        : undefined;

    return {
      averageLinesChanged: Math.round(totalLines / pullRequests.length),
      averageFilesChanged: Math.round(totalFiles / pullRequests.length),
      averageCommits: Math.round(totalCommits / pullRequests.length),
      pullRequestsWithReviews: withReviews,
      pullRequestsWithComments: withComments,
      ciSuccessRate: ciSuccessRate
        ? Math.round(ciSuccessRate * 100) / 100
        : undefined,
    };
  }
}
