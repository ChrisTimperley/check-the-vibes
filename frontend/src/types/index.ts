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
  // Repository Security
  branch_protection: {
    present: boolean;
    required_reviews: number;
    status_checks_required: boolean;
    dismiss_stale_reviews: boolean;
    require_code_owner_reviews: boolean;
  };
  codeowners: boolean;
  security_policy: boolean;
  vulnerability_alerts: boolean;
  secret_scanning: boolean;
  dependency_scanning: boolean;

  // Documentation
  readme_quality: {
    has_setup: boolean;
    has_test: boolean;
    has_description: boolean;
    has_badges: boolean;
    badges: string[];
    word_count: number;
  };
  contributing: boolean;
  code_of_conduct: boolean;
  license: boolean;
  changelog: boolean;
  issue_templates: boolean;
  pr_template: boolean;
  wiki_present: boolean;

  // Code Quality
  ci_present: boolean;
  test_coverage: {
    present: boolean;
    percentage: number;
  };
  linting: {
    present: boolean;
    tools: string[];
  };
  formatting: {
    present: boolean;
    tools: string[];
  };
  precommit: boolean;
  editorconfig: boolean;
  gitignore_quality: {
    present: boolean;
    comprehensive: boolean;
  };

  // Dependency Management
  dependabot: boolean;
  security_advisories: boolean;
  package_lock: boolean;
  outdated_dependencies: {
    count: number;
    critical: number;
  };

  // Release Management
  releases_recent: boolean;
  semantic_versioning: boolean;
  release_notes: boolean;
  tags_present: boolean;

  // Development Practices
  conventional_commits_rate: number;
  pr_size_check: {
    average_size: string;
    large_pr_rate: number;
  };
  review_coverage: number;
  merge_strategy: {
    squash_enabled: boolean;
    merge_commits_allowed: boolean;
  };

  // Community Health
  discussions_enabled: boolean;
  projects_used: boolean;
  issue_response_time: {
    average_hours: number;
    sla_met: boolean;
  };
  stale_issue_management: boolean;
}
