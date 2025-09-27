// Primitive aliases
export const loginSchema = {
  $id: 'Login',
  type: 'string',
  pattern: '^[A-Za-z0-9-]{1,39}$',
} as const;

export const urlSchema = {
  $id: 'URL',
  type: 'string',
  format: 'uri',
} as const;

export const labelSchema = {
  $id: 'Label',
  type: 'string',
  minLength: 1,
  maxLength: 100,
} as const;

export const sizeBucketSchema = {
  $id: 'SizeBucket',
  type: 'string',
  enum: ['XS', 'S', 'M', 'L', 'XL'],
} as const;

export const prStatusSchema = {
  $id: 'PRStatus',
  type: 'string',
  enum: ['Open', 'Closed', 'Merged', 'Draft', 'WIP'],
} as const;

export const ciStatusSchema = {
  $id: 'CIStatus',
  type: 'string',
  enum: ['success', 'failure', 'pending', 'unknown', 'none'],
} as const;
