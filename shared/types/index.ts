/**
 * Shared type definitions for check-the-vibes
 * These types are used by both the backend API and frontend application
 * to ensure type consistency across the full stack.
 */

export interface AnalysisSummary {
  contributors_active: number;
  prs_opened: number;
  issues_opened: number;
  issues_closed: number;
  pct_prs_reviewed: number;
}

export interface AnalysisReport {
  repo: string;
  window: {
    from: string;
    to: string;
  };
  summary: AnalysisSummary;
  contributors: Contributor[];
  pull_requests: PullRequest[];
  commits?: Commit[];
  issues: Issue[];
}

export interface Contributor {
  login: string;
  commits: number;
  prs: number;
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
  pr?: number; // associated PR number, if any
  ci_status?: 'pass' | 'fail' | 'pending' | 'unknown' | 'none';
  additions?: number;
  deletions?: number;
}
