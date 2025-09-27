export const analyzeResponseSchema = {
  $id: 'AnalyzeResponse',
  type: 'object',
  description:
    'Complete analysis report for a GitHub repository within a time window',
  additionalProperties: false,
  properties: {
    repo: {
      type: 'string',
      pattern: '^[^/]+/[^/]+$',
    },
    window: {
      type: 'object',
      additionalProperties: false,
      properties: {
        from: { type: 'string', format: 'date-time' },
        to: { type: 'string', format: 'date-time' },
      },
      required: ['from', 'to'],
    },
    summary: {
      type: 'object',
      additionalProperties: false,
      properties: {
        contributors_active: { type: 'integer', minimum: 0 },
        prs_opened: { type: 'integer', minimum: 0 },
        issues_opened: { type: 'integer', minimum: 0 },
        issues_closed: { type: 'integer', minimum: 0 },
        pct_prs_reviewed: { type: 'number', minimum: 0, maximum: 1 },
        pct_prs_linked_to_issues: { type: 'number', minimum: 0, maximum: 1 },
        median_pr_cycle_time_hours: { type: 'number', minimum: 0 },
        stale_items: { type: 'integer', minimum: 0 },
      },
      required: [
        'contributors_active',
        'prs_opened',
        'issues_opened',
        'issues_closed',
        'pct_prs_reviewed',
        'median_pr_cycle_time_hours',
        'stale_items',
      ],
    },
    contributors: {
      type: 'array',
      items: { $ref: 'Contributor' },
      default: [],
    },
    pull_requests: {
      type: 'array',
      items: { $ref: 'PullRequest' },
      default: [],
    },
    project: {
      type: 'object',
      additionalProperties: false,
      properties: {
        items: {
          type: 'array',
          items: { $ref: 'ProjectItem' },
          default: [],
        },
      },
      required: ['items'],
    },
    issues: {
      type: 'array',
      items: { $ref: 'Issue' },
      default: [],
    },
    hygiene: {
      $ref: 'Hygiene',
    },
    scores: {
      $ref: 'Scores',
    },
  },
  required: [
    'repo',
    'window',
    'summary',
    'contributors',
    'pull_requests',
    'project',
    'issues',
    'hygiene',
  ],
} as const;

export const contributorSchema = {
  $id: 'Contributor',
  type: 'object',
  additionalProperties: false,
  properties: {
    login: { $ref: 'Login' },
    commits: { type: 'integer', minimum: 0 },
    prs: { type: 'integer', minimum: 0 },
    reviews: { type: 'integer', minimum: 0 },
    issues: { type: 'integer', minimum: 0 },
    lines_added: { type: 'integer', minimum: 0 },
    lines_deleted: { type: 'integer', minimum: 0 },
    direct_pushes_default: { type: 'integer', minimum: 0 },
  },
  required: [
    'login',
    'commits',
    'prs',
    'reviews',
    'issues',
    'direct_pushes_default',
  ],
} as const;

export const pullRequestSchema = {
  $id: 'PullRequest',
  type: 'object',
  additionalProperties: false,
  properties: {
    number: { type: 'integer', minimum: 1 },
    title: { type: 'string' },
    author: { $ref: 'Login' },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' },
    closed_at: { type: 'string', format: 'date-time' },
    merged_at: { type: 'string', format: 'date-time' },
    status: { $ref: 'PRStatus' },
    is_draft: { type: 'boolean' },
    is_wip: { type: 'boolean' },
    reviewed: { type: 'boolean' },
    linked_issues: {
      type: 'array',
      items: { type: 'integer', minimum: 1 },
      default: [],
    },
    files_changed: { type: 'integer', minimum: 0 },
    additions: { type: 'integer', minimum: 0 },
    deletions: { type: 'integer', minimum: 0 },
    size_bucket: { $ref: 'SizeBucket' },
    time_to_first_review_minutes: { type: 'number', minimum: 0 },
    cycle_time_hours: { type: 'number', minimum: 0 },
    approvals: { type: 'integer', minimum: 0 },
    reviewers: {
      type: 'array',
      items: { $ref: 'Login' },
      default: [],
    },
    ci_status: { $ref: 'CIStatus' },
    url: { $ref: 'URL' },
  },
  required: [
    'number',
    'title',
    'author',
    'created_at',
    'status',
    'reviewed',
    'files_changed',
    'additions',
    'deletions',
    'size_bucket',
    'url',
  ],
} as const;

export const issueSchema = {
  $id: 'Issue',
  type: 'object',
  additionalProperties: false,
  properties: {
    number: { type: 'integer', minimum: 1 },
    title: { type: 'string' },
    author: { $ref: 'Login' },
    created_at: { type: 'string', format: 'date-time' },
    closed_at: { type: 'string', format: 'date-time' },
    is_closed: { type: 'boolean' },
    time_to_first_response_minutes: { type: 'number', minimum: 0 },
    time_to_close_hours: { type: 'number', minimum: 0 },
    assignees: {
      type: 'array',
      items: { $ref: 'Login' },
      default: [],
    },
    labels: {
      type: 'array',
      items: { $ref: 'Label' },
      default: [],
    },
    linked_prs: {
      type: 'array',
      items: { type: 'integer', minimum: 1 },
      default: [],
    },
    url: { $ref: 'URL' },
  },
  required: [
    'number',
    'title',
    'author',
    'created_at',
    'is_closed',
    'assignees',
    'labels',
    'linked_prs',
    'url',
  ],
} as const;

export const projectItemSchema = {
  $id: 'ProjectItem',
  type: 'object',
  additionalProperties: false,
  properties: {
    title: { type: 'string' },
    type: { type: 'string', enum: ['Issue', 'PR', 'Draft'] },
    column: { type: 'string', description: 'Projects v2 status/column name' },
    last_activity: { type: 'string', format: 'date-time' },
    assignees: {
      type: 'array',
      items: { $ref: 'Login' },
      default: [],
    },
    labels: {
      type: 'array',
      items: { $ref: 'Label' },
      default: [],
    },
    linked_artifact: { $ref: 'URL' },
    age_days: { type: 'number', minimum: 0 },
  },
  required: ['title', 'type', 'column', 'last_activity', 'assignees', 'labels'],
} as const;

export const hygieneSchema = {
  $id: 'Hygiene',
  type: 'object',
  additionalProperties: false,
  properties: {
    branch_protection: {
      type: 'object',
      additionalProperties: false,
      properties: {
        present: { type: 'boolean' },
        required_reviews: { type: 'integer', minimum: 0 },
        status_checks_required: { type: 'boolean' },
        enforce_admins: { type: 'boolean' },
        allow_force_pushes: { type: 'boolean' },
      },
      required: ['present'],
    },
    codeowners: { type: 'boolean' },
    ci_present: { type: 'boolean' },
    issue_templates: { type: 'boolean' },
    pr_template: { type: 'boolean' },
    contributing: { type: 'boolean' },
    code_of_conduct: { type: 'boolean' },
    security: { type: 'boolean' },
    license: { type: 'boolean' },
    readme_quality: {
      type: 'object',
      additionalProperties: false,
      properties: {
        has_setup: { type: 'boolean' },
        has_test: { type: 'boolean' },
        badges: {
          type: 'array',
          items: { type: 'string' },
          default: [],
        },
      },
      required: ['has_setup', 'has_test'],
    },
    precommit: { type: 'boolean' },
    editorconfig: { type: 'boolean' },
    releases_recent: { type: 'boolean' },
    conventional_commits_rate: { type: 'number', minimum: 0, maximum: 1 },
    dependabot: { type: 'boolean' },
  },
  required: ['branch_protection', 'codeowners', 'ci_present', 'license'],
} as const;

export const scoresSchema = {
  $id: 'Scores',
  type: 'object',
  additionalProperties: false,
  properties: {
    overall: { type: 'integer', minimum: 0, maximum: 100 },
    contributors: { type: 'integer', minimum: 0, maximum: 100 },
    prs: { type: 'integer', minimum: 0, maximum: 100 },
    project: { type: 'integer', minimum: 0, maximum: 100 },
    issues: { type: 'integer', minimum: 0, maximum: 100 },
    hygiene: { type: 'integer', minimum: 0, maximum: 100 },
  },
  required: ['overall'],
} as const;
