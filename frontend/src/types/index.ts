export interface AnalysisReport {
  repo: string;
  window: {
    from: string;
    to: string;
  };
  summary: {
    contributors_active: number;
    prs_opened: number;
    issues_opened: number;
    issues_closed: number;
    pct_prs_reviewed: number;
  };
  contributors: Contributor[];
  pull_requests: PullRequest[];
  commits?: Commit[];
  issues: Issue[];
}

export interface Contributor {
  login: string;
  commits: number;
  prs: number;
  direct_pushes_default: number;
  avatar_url?: string;
}

export interface PullRequest {
  number: number;
  title: string;
  author: string;
  created_at: string;
  closed_at?: string;
  merged_at?: string;
  status: 'Open' | 'Closed' | 'Merged' | 'Draft';
  linked_issues: number[];
  additions: number;
  deletions: number;
  reviewers: string[];
  ci_status: 'success' | 'failure' | 'pending' | 'unknown' | 'none';
  url: string;
  comments?: number;
}

export interface Issue {
  number: number;
  title: string;
  author: string;
  created_at: string;
  closed_at: string | null;
  is_closed: boolean;
  time_to_first_response_minutes: number | null;
  time_to_close_hours?: number | null;
  assignees: string[];
  labels: string[];
  linked_prs: number[];
  comments?: number;
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
