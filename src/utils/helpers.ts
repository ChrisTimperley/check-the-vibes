import fs from 'fs';
import path from 'path';

export function parseDate(dateString: string): Date {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new Error(
      `Invalid date format: ${dateString}. Use YYYY-MM-DD format.`
    );
  }
  return date;
}

export function validateDateRange(since: Date, until?: Date): void {
  const now = new Date();

  if (since > now) {
    throw new Error('Start date cannot be in the future');
  }

  if (until && until > now) {
    throw new Error('End date cannot be in the future');
  }

  if (until && since > until) {
    throw new Error('Start date must be before end date');
  }
}

export async function writeReportToFile(
  content: string,
  outputPath: string
): Promise<void> {
  const dir = path.dirname(outputPath);

  // Create directory if it doesn't exist
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(outputPath, content, 'utf-8');
}

export function getDefaultOutputPath(owner: string, repo: string): string {
  const timestamp = new Date().toISOString().split('T')[0];
  return `reports/${owner}-${repo}-${timestamp}.yaml`;
}

export function formatDuration(start: Date, end: Date): string {
  const durationMs = end.getTime() - start.getTime();
  const seconds = Math.floor(durationMs / 1000);

  if (seconds < 60) {
    return `${seconds}s`;
  } else if (seconds < 3600) {
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }
}

/**
 * Extracts the first linked issue number from a PR body.
 * Supports various formats like "closes #123", "fixes #456", "resolves #789", 
 * "closes https://github.com/owner/repo/issues/123", etc.
 * 
 * @param body The PR body text
 * @returns The issue number if found, null otherwise
 */
export function extractLinkedIssue(body: string | null): number | null {
  if (!body) {
    return null;
  }

  // Pattern to match various issue linking formats:
  // - "closes #123", "fixes #456", "resolves #789" (case insensitive)
  // - "closes https://github.com/owner/repo/issues/123"
  // - "close #123", "fix #456", "resolve #789" (singular forms)
  const patterns = [
    // Match "closes/fixes/resolves #number" format
    /(?:closes?|fixes?|resolves?)\s+#(\d+)/i,
    // Match "closes/fixes/resolves https://github.com/.../issues/number" format
    /(?:closes?|fixes?|resolves?)\s+https:\/\/github\.com\/[^/]+\/[^/]+\/issues\/(\d+)/i
  ];

  for (const pattern of patterns) {
    const match = body.match(pattern);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
  }

  return null;
}
