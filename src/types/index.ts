export interface PullRequestAnalysis {
  number: number;
  title: string;
  author: string;
  createdAt: string;
  mergedAt?: string;
  closedAt?: string;
  state: 'open' | 'closed' | 'merged';
  linesChanged: {
    additions: number;
    deletions: number;
    total: number;
  };
  filesChanged: number;
  commits: number;
  reviewCount: number;
  commentCount: number;
  hasReviews: boolean;
  hasComments: boolean;
  reviewers: string[];
  ciStatus?: 'success' | 'failure' | 'pending' | 'unknown';
  linkedIssue: number | null;
  url: string;
}

export interface RepositoryReport {
  repository: {
    owner: string;
    name: string;
    url: string;
  };
  analysis: {
    dateRange: {
      from: string;
      to?: string;
    };
    totalPullRequests: number;
    analyzedAt: string;
  };
  pullRequests: PullRequestAnalysis[];
  summary: {
    averageLinesChanged: number;
    averageFilesChanged: number;
    averageCommits: number;
    pullRequestsWithReviews: number;
    pullRequestsWithComments: number;
    ciSuccessRate?: number;
  };
}

export interface ScanConfig {
  owner: string;
  repo: string;
  token?: string;
  since: string;
  until?: string;
  outputFile?: string;
}
