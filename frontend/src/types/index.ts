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
    median_pr_cycle_time_hours: number;
    stale_items: number;
  };
  contributors: Contributor[];
  pull_requests: PullRequest[];
  direct_pushes?: Commit[];
  project: {
    items: ProjectItem[];
  };
  issues: Issue[];
}

export interface Contributor {
  login: string;
  commits: number;
  prs: number;
  reviews: number;
  issues: number;
  direct_pushes_default: number;
  avatar_url?: string;
  lines_added?: number;
  lines_deleted?: number;
}

export interface PullRequest {
  number: number;
  title: string;
  author: string;
  created_at: string;
  status: 'Open' | 'Closed' | 'Merged' | 'Draft';
  is_draft: boolean;
  is_wip: boolean;
  reviewed: boolean;
  linked_issues: number[];
  files_changed: number;
  additions: number;
  deletions: number;
  size_bucket: 'XS' | 'S' | 'M' | 'L' | 'XL';
  time_to_first_review_minutes: number | null;
  cycle_time_hours: number | null;
  approvals: number;
  reviewers: string[];
  ci_status: 'pass' | 'fail' | 'none';
  url: string;
}

export interface Issue {
  number: number;
  title: string;
  author: string;
  created_at: string;
  closed_at: string | null;
  time_to_first_response_minutes: number | null;
  assignees: string[];
  labels: string[];
  linked_prs: number[];
  // optional number of comments on the issue (frontend display only)
  comments?: number;
  url: string;
}

export interface ProjectItem {
  title: string;
  type: 'Issue' | 'PR' | 'Draft';
  column: string;
  last_activity: string;
  assignees: string[];
  labels: string[];
  linked_artifact: string | null;
  age_days: number;
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
