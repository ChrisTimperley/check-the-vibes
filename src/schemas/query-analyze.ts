export const queryAnalyzeSchema = {
  $id: 'QueryAnalyze',
  type: 'object',
  required: ['repo', 'from', 'to'],
  properties: {
    repo: { type: 'string', pattern: '^[^/]+/[^/]+$' },
    from: { type: 'string', format: 'date-time' },
    to: { type: 'string', format: 'date-time' },
    tz: { type: 'string' },
  },
} as const;
