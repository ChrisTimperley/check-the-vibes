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
      },
      required: [
        'contributors_active',
        'prs_opened',
        'issues_opened',
        'issues_closed',
        'pct_prs_reviewed',
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
    issues: {
      type: 'array',
      items: { $ref: 'Issue' },
      default: [],
    },
    commits: {
      type: 'array',
      items: { $ref: 'Commit' },
      default: [],
    },
  },
  required: [
    'repo',
    'window',
    'summary',
    'contributors',
    'pull_requests',
    'issues',
  ],
} as const;

export const contributorSchema = {
  $id: 'Contributor',
  type: 'object',
  additionalProperties: false,
  properties: {
    login: { $ref: 'Login' },
    avatar_url: { type: 'string', format: 'uri' },
    commits: { type: 'integer', minimum: 0 },
    prs: { type: 'integer', minimum: 0 },
  },
  required: ['login', 'commits', 'prs'],
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
    closed_at: { type: 'string', format: 'date-time' },
    merged_at: { type: 'string', format: 'date-time' },
    status: { $ref: 'PRStatus' },
    linked_issues: {
      type: 'array',
      items: { type: 'integer', minimum: 1 },
      default: [],
    },
    additions: { type: 'integer', minimum: 0 },
    deletions: { type: 'integer', minimum: 0 },
    reviewers: {
      type: 'array',
      items: { $ref: 'Login' },
      default: [],
    },
    ci_status: { $ref: 'CIStatus' },
    url: { $ref: 'URL' },
    comments: { type: 'integer', minimum: 0 },
  },
  required: [
    'number',
    'title',
    'author',
    'created_at',
    'status',
    'additions',
    'deletions',
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
    comments: { type: 'integer', minimum: 0 },
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

export const commitSchema = {
  $id: 'Commit',
  type: 'object',
  additionalProperties: false,
  properties: {
    sha: { type: 'string' },
    committer: { type: 'string' },
    message: { type: 'string' },
    date: { type: 'string', format: 'date-time' },
    ci_status: { $ref: 'CIStatus' },
    additions: { type: 'integer', minimum: 0 },
    deletions: { type: 'integer', minimum: 0 },
  },
  required: ['sha', 'committer', 'message', 'date'],
} as const;
