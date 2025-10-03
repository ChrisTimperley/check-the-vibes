# Shared Types

This directory contains TypeScript type definitions that are shared between the backend API and frontend application.

## Purpose

By maintaining a single source of truth for data structures, we ensure:

- **Type Safety**: Frontend and backend always agree on data shapes
- **DRY Principle**: No duplicate type definitions
- **Consistency**: API contracts are automatically enforced
- **Maintainability**: Changes to types only need to be made in one place

## Usage

### Backend

```typescript
import type {
  AnalysisReport,
  PullRequest,
  Issue,
  Commit,
  Contributor,
} from '../shared/types/index.js';
```

### Frontend

```typescript
import type {
  AnalysisReport,
  PullRequest,
  Issue,
  Commit,
  Contributor,
} from '../types';
// (which re-exports from shared)
```

## Available Types

- `AnalysisReport` - Complete analysis response from the API
- `AnalysisSummary` - Summary statistics for the analysis (contributors, PRs, issues)
- `PullRequest` - Pull request data
- `Issue` - Issue data
- `Commit` - Commit data
- `Contributor` - Contributor statistics## Adding New Types

When adding new shared types:

1. Add the interface definition to `shared/types/index.ts`
2. Ensure it matches the JSON schema in `src/schemas/` (if applicable)
3. Run `npm run type-check` to verify compilation
4. Both frontend and backend will automatically have access
