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
  project: {
    items: ProjectItem[];
  };
  issues: Issue[];
  hygiene: HygieneChecks;
  scores: {
    overall: number;
    contributors: number;
    prs: number;
    project: number;
    issues: number;
    hygiene: number;
  };
}

export interface Contributor {
  login: string;
  commits: number;
  prs: number;
  reviews: number;
  issues: number;
  direct_pushes_default: number;
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

export interface HygieneChecks {
  branch_protection: {
    present: boolean;
    required_reviews: number;
    status_checks_required: boolean;
  };
  codeowners: boolean;
  ci_present: boolean;
  issue_templates: boolean;
  pr_template: boolean;
  contributing: boolean;
  code_of_conduct: boolean;
  security: boolean;
  license: boolean;
  readme_quality: {
    has_setup: boolean;
    has_test: boolean;
    badges: string[];
  };
  precommit: boolean;
  editorconfig: boolean;
  releases_recent: boolean;
  conventional_commits_rate: number;
  dependabot: boolean;
}
