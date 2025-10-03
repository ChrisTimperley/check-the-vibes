/**
 * Simple validation utilities for API requests
 */

export interface AnalyzeQueryParams {
  repo: string;
  from: Date;
  to: Date;
}

/**
 * Validate and parse the analyze endpoint query parameters
 */
export function validateAnalyzeQuery(query: any): AnalyzeQueryParams {
  const { repo, from, to } = query;

  // Validate repo format
  if (!repo || typeof repo !== 'string') {
    throw new Error('Missing required parameter: repo');
  }

  const parts = repo.split('/');
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new Error('Invalid repo format. Expected "owner/repo"');
  }

  // Validate from date
  if (!from || typeof from !== 'string') {
    throw new Error('Missing required parameter: from');
  }

  const fromDate = new Date(from);
  if (isNaN(fromDate.getTime())) {
    throw new Error('Invalid date format for "from" parameter');
  }

  // Validate to date (optional, defaults to now)
  let toDate = new Date();
  if (to && typeof to === 'string') {
    toDate = new Date(to);
    if (isNaN(toDate.getTime())) {
      throw new Error('Invalid date format for "to" parameter');
    }
  }

  // Validate date range
  if (fromDate > toDate) {
    throw new Error('"from" date must be before "to" date');
  }

  return {
    repo,
    from: fromDate,
    to: toDate,
  };
}
