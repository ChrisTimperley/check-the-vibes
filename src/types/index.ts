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

export interface Commit {
  sha: string; // full SHA
  committer: string;
  message: string;
  date: string; // ISO timestamp
  ci_status?: 'pass' | 'fail' | 'pending' | 'unknown' | 'none';
  additions?: number;
  deletions?: number;
}
