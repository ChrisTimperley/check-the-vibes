export const errorSchema = {
  $id: 'Error',
  type: 'object',
  additionalProperties: false,
  properties: {
    code: { type: 'integer' },
    message: { type: 'string' },
    details: { type: 'object' },
  },
  required: ['code', 'message'],
} as const;
