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
